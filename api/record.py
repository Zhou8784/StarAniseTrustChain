# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from database.db import get_db

router = APIRouter()


@router.get("/list")
async def get_list(limit: int = 50, offset: int = 0):
    """获取历史记录列表"""
    with get_db() as conn:
        rows = conn.execute('''
            SELECT batch_id, timestamp, total_count, good_rate, mildew_rate,
                   quality_level, blockchain_status, qrcode_url, trace_code
            FROM detect_records ORDER BY id DESC LIMIT ? OFFSET ?
        ''', (limit, offset)).fetchall()
    
    return [dict(row) for row in rows]


@router.get("/count")
async def get_count():
    """获取记录总数"""
    with get_db() as conn:
        row = conn.execute('SELECT COUNT(*) FROM detect_records').fetchone()
    return {"count": row[0]}


@router.get("/{batch_id}")
async def get_record(batch_id: str):
    """查询单条记录"""
    with get_db() as conn:
        row = conn.execute('SELECT * FROM detect_records WHERE batch_id = ?', (batch_id,)).fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    return {
        "batch_id": row["batch_id"],
        "timestamp": row["timestamp"],
        "total_count": row["total_count"],
        "good_count": row["good_count"],
        "broken_count": row["broken_count"],
        "impurity_count": row["impurity_count"],
        "mildew_count": row["mildew_count"],
        "good_rate": row["good_rate"],
        "broken_rate": row["broken_rate"],
        "impurity_rate": row["impurity_rate"],
        "mildew_rate": row["mildew_rate"],
        "quality_level": row["quality_level"],
        "blockchain_tx_hash": row["blockchain_tx_hash"],
        "blockchain_status": row["blockchain_status"],
        "qrcode_url": row["qrcode_url"],
        "trace_code": row["trace_code"],
        "image_path": row["image_path"]
    }

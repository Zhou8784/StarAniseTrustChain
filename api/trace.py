# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException
from database.db import get_db
from services.blockchain import blockchain_service

router = APIRouter()


@router.get("/{trace_code}")
async def trace_product(trace_code: str):
    with get_db() as conn:
        row = conn.execute('SELECT * FROM detect_records WHERE trace_code = ?', (trace_code,)).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="溯源码不存在")

    chain_info = {}
    if row["blockchain_tx_hash"]:
        chain_info = blockchain_service.query(row["blockchain_tx_hash"])

    return {
        "batch_id": row["batch_id"],
        "trace_code": row["trace_code"],
        "timestamp": row["timestamp"],
        "quality_level": row["quality_level"],
        "good_rate": row["good_rate"],
        "broken_rate": row["broken_rate"],
        "impurity_rate": row["impurity_rate"],
        "mildew_rate": row["mildew_rate"],
        "image_path": row["image_path"],
        "qrcode_url": row["qrcode_url"],
        "blockchain_tx_hash": row["blockchain_tx_hash"],
        "blockchain_status": row["blockchain_status"],
        "blockchain_verified": chain_info.get("verified", False),
        "block_height": chain_info.get("block_height")
    }

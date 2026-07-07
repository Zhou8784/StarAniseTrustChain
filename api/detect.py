# -*- coding: utf-8 -*-
from fastapi import APIRouter, HTTPException, UploadFile, File
import cv2
import uuid
from datetime import datetime
from config.settings import UPLOAD_DIR

router = APIRouter()


@router.post("/upload")
async def upload_detect(file: UploadFile = File(...)):
    """上传图片检测"""
    from services.detector import detector
    from services.blockchain import blockchain_service
    from services.qrcode import generate_qrcode
    from database.db import get_db

    batch_id = f"BJ{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4]}"
    timestamp = datetime.now().isoformat()

    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{batch_id}.{ext}"
    filepath = UPLOAD_DIR / filename
    content = await file.read()
    with open(filepath, 'wb') as f:
        f.write(content)

    img = cv2.imread(str(filepath))
    if img is None:
        raise HTTPException(status_code=400, detail="图片无效")

    result = detector.predict(img)
    if result is None:
        return {"success": False, "error": "未检测到目标", "batch_id": batch_id}

    total = result['total']
    good_rate = round(result['good'] / total * 100, 1)
    broken_rate = round(result['broken'] / total * 100, 1)
    impurity_rate = round(result['impurity'] / total * 100, 1)
    mildew_rate = round(result['mildew'] / total * 100, 1)
    level = detector.calculate_quality_level(good_rate, broken_rate, impurity_rate, mildew_rate)

    image_hash = detector.generate_hash(batch_id, timestamp, good_rate, mildew_rate)
    trace_code = f"TRACE{batch_id[2:]}"

    chain_result = blockchain_service.upload({
        "batch_id": batch_id,
        "image_hash": image_hash,
        "good_rate": good_rate,
        "mildew_rate": mildew_rate,
        "quality_level": level,
        "timestamp": timestamp
    })
    tx_hash = chain_result.get("tx_hash", "")
    blockchain_status = "confirmed" if chain_result.get("success") else "failed"

    qrcode_url = generate_qrcode(trace_code, batch_id)

    with get_db() as conn:
        conn.execute('''
            INSERT INTO detect_records (
                batch_id, timestamp, total_count, good_count, broken_count,
                impurity_count, mildew_count, good_rate, broken_rate,
                impurity_rate, mildew_rate, quality_level, image_hash,
                blockchain_tx_hash, blockchain_status, image_path, qrcode_url, trace_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            batch_id, timestamp, total,
            result['good'], result['broken'], result['impurity'], result['mildew'],
            good_rate, broken_rate, impurity_rate, mildew_rate,
            level, image_hash,
            tx_hash, blockchain_status,
            str(filepath), qrcode_url, trace_code
        ))
        conn.commit()

    return {
        "success": True,
        "batch_id": batch_id,
        "total_count": total,
        "good_count": result['good'],
        "broken_count": result['broken'],
        "impurity_count": result['impurity'],
        "mildew_count": result['mildew'],
        "good_rate": good_rate,
        "broken_rate": broken_rate,
        "impurity_rate": impurity_rate,
        "mildew_rate": mildew_rate,
        "quality_level": level,
        "blockchain_tx_hash": tx_hash,
        "blockchain_status": blockchain_status,
        "qrcode_url": qrcode_url,
        "trace_code": trace_code,
        "image_path": str(filepath)
    }


@router.get("/latest")
async def get_latest():
    """获取最新检测结果（从数据库读取）"""
    from database.db import get_db
    
    with get_db() as conn:
        row = conn.execute('''
            SELECT * FROM detect_records ORDER BY id DESC LIMIT 1
        ''').fetchone()
    
    if not row:
        return {"success": False, "message": "暂无检测结果"}
    
    return {
        "success": True,
        "data": {
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
    }


@router.get("/status")
async def get_status():
    """获取系统状态"""
    from services.camera import camera
    from services.autodetect import auto_detect
    from services.detector import detector

    return {
        "camera": {"ready": camera.is_ready(), "error": camera.get_error()},
        "detector": {"ready": detector.is_ready()},
        "auto_detect": {"running": auto_detect._running, "total": auto_detect._detected_count}
    }

# -*- coding: utf-8 -*-
import threading
import time
import cv2
import uuid
from datetime import datetime
from typing import Optional, Dict
import logging
from config.settings import AUTO_DETECT_INTERVAL, UPLOAD_DIR

logger = logging.getLogger(__name__)


class AutoDetectService:
    def __init__(self):
        self._running = False
        self._thread = None
        self._last_result = None
        self._detected_count = 0
        self._error = None

    def start(self):
        if self._running:
            return

        from services.camera import camera
        from services.detector import detector

        if not camera.is_ready():
            if not camera.start():
                self._error = camera.get_error() or "相机启动失败"
                logger.error(f"❌ {self._error}")
                return

        if not detector.is_ready():
            self._error = "推理器未就绪"
            logger.error(f"❌ {self._error}")
            return

        self._running = True
        self._thread = threading.Thread(target=self._detect_loop, daemon=True)
        self._thread.start()
        logger.info("🔄 自动检测已启动")

    def _detect_loop(self):
        from services.camera import camera
        from services.detector import detector
        from services.blockchain import blockchain_service
        from services.qrcode import generate_qrcode
        from database.db import get_db

        while self._running:
            try:
                frame = camera.get_frame()
                if frame is None:
                    time.sleep(0.5)
                    continue

                result = detector.predict(frame)
                if result is None:
                    time.sleep(0.5)
                    continue

                total = result['total']
                good_rate = round(result['good'] / total * 100, 1)
                broken_rate = round(result['broken'] / total * 100, 1)
                impurity_rate = round(result['impurity'] / total * 100, 1)
                mildew_rate = round(result['mildew'] / total * 100, 1)
                level = detector.calculate_quality_level(
                    good_rate, broken_rate, impurity_rate, mildew_rate
                )

                batch_id = f"BJ{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:4]}"
                timestamp = datetime.now().isoformat()

                filename = f"{batch_id}.jpg"
                filepath = UPLOAD_DIR / filename
                cv2.imwrite(str(filepath), frame)

                image_hash = detector.generate_hash(batch_id, timestamp, good_rate, mildew_rate)
                trace_code = f"TRACE{batch_id[2:]}"

                try:
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
                except Exception as e:
                    logger.error(f"上链失败: {e}")
                    tx_hash = ""
                    blockchain_status = "failed"

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

                self._last_result = {
                    "batch_id": batch_id,
                    "timestamp": timestamp,
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

                self._detected_count += 1
                logger.info(f"✅ [{batch_id}] 检测完成: 良品率={good_rate}%, 等级={level}")

                time.sleep(AUTO_DETECT_INTERVAL)

            except Exception as e:
                logger.error(f"自动检测错误: {e}")
                time.sleep(1)

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=3)
        logger.info("⏹️ 自动检测已停止")

    def get_last_result(self) -> Optional[Dict]:
        return self._last_result

    def get_stats(self) -> Dict:
        return {
            "total_detections": self._detected_count,
            "last_result": self._last_result,
            "is_running": self._running,
            "error": self._error
        }


auto_detect = AutoDetectService()

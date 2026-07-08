#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import logging
import sys
from config.settings import LOG_DIR

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / "app.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api import detect, record, trace
from database.db import init_db
from services.camera import camera
from services.autodetect import auto_detect
from config.settings import UPLOAD_DIR, QRCODE_DIR

# ========== 导入传送带模块 ==========
try:
    from motor_control import conveyor
    CONVEYOR_ENABLED = True
    logger.info("✅ 传送带模块加载成功")
except ImportError as e:
    CONVEYOR_ENABLED = False
    logger.warning(f"⚠️ 传送带模块未加载: {e}")
except Exception as e:
    CONVEYOR_ENABLED = False
    logger.error(f"❌ 传送带初始化失败: {e}")

app = FastAPI(title="八角品质检测系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
app.mount("/static/qrcodes", StaticFiles(directory=str(QRCODE_DIR)), name="qrcodes")

app.include_router(detect.router, prefix="/api/detect", tags=["检测"])
app.include_router(record.router, prefix="/api/record", tags=["记录"])
app.include_router(trace.router, prefix="/api/trace", tags=["溯源"])


@app.on_event("startup")
async def startup():
    logger.info("=" * 50)
    logger.info("🚀 启动八角品质检测系统")
    logger.info("=" * 50)

    init_db()

    if not camera.start():
        logger.error(f"❌ 相机启动失败: {camera.get_error()}")
        logger.warning("⚠️ 自动检测将无法工作")
    else:
        auto_detect.start()

    # 传送带
    if CONVEYOR_ENABLED:
        logger.info("✅ 传送带已自动运行")
    else:
        logger.warning("⚠️ 传送带未启用")

    logger.info(f"📡 API: http://0.0.0.0:8000")
    logger.info(f"📚 Docs: http://0.0.0.0:8000/docs")
    logger.info("=" * 50)


@app.on_event("shutdown")
async def shutdown():
    logger.info("🛑 服务正在关闭...")
    auto_detect.stop()
    camera.stop()
    
    if CONVEYOR_ENABLED:
        try:
            conveyor.cleanup()
            logger.info("✅ 传送带已停止")
        except Exception as e:
            logger.error(f"传送带停止失败: {e}")


@app.get("/")
async def root():
    return {"service": "八角品质检测系统", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health():
    from services.camera import camera
    from services.autodetect import auto_detect
    from services.detector import detector

    return {
        "status": "healthy",
        "camera": {"ready": camera.is_ready(), "error": camera.get_error()},
        "detector": {"ready": detector.is_ready()},
        "auto_detect": {"running": auto_detect._running, "total": auto_detect._detected_count},
        "conveyor": {"enabled": CONVEYOR_ENABLED, "running": CONVEYOR_ENABLED}
    }


if __name__ == "__main__":
    import uvicorn
    from config.settings import API_HOST, API_PORT
    uvicorn.run(app, host=API_HOST, port=API_PORT)

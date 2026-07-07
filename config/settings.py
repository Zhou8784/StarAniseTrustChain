# -*- coding: utf-8 -*-
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

DATABASE_PATH = BASE_DIR / "star_anise.db"
UPLOAD_DIR = BASE_DIR / "uploads"
QRCODE_DIR = BASE_DIR / "static" / "qrcodes"
LOG_DIR = BASE_DIR / "logs"

for d in [UPLOAD_DIR, QRCODE_DIR, LOG_DIR]:
    d.mkdir(parents=True, exist_ok=True)

API_HOST = "0.0.0.0"
API_PORT = 8000

MODEL_PATH = "/userdata/best_monkey_bayese_640x640_nv12.bin"
CONF_THRES = 0.3
INPUT_SIZE = 640
CLASS_NAMES = ['broken', 'good', 'impurity', 'mildew']

ROS_IMAGE_TOPIC = "/image_left_raw"

AUTO_DETECT_INTERVAL = 3

FRONTEND_BASE_URL = "http://localhost:8080"

BLOCKCHAIN_ENABLED = False
BLOCKCHAIN_API = "http://blockchain-node:8545/api/v1/upload"

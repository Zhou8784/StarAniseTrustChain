# -*- coding: utf-8 -*-
import qrcode
from config.settings import QRCODE_DIR, FRONTEND_BASE_URL
import logging

logger = logging.getLogger(__name__)


def generate_qrcode(trace_code: str, batch_id: str) -> str:
    qr_url = f"{FRONTEND_BASE_URL}/pages/traceability/traceability?code={trace_code}"

    qr = qrcode.QRCode(
        version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=1,
    )
    qr.add_data(qr_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    filename = f"{trace_code}.png"
    filepath = QRCODE_DIR / filename
    img.save(filepath)

    logger.info(f"✅ 二维码生成: {filename}")
    return f"/static/qrcodes/{filename}"

# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional


class DetectResult(BaseModel):
    batch_id: str
    timestamp: str
    total_count: int
    good_count: int
    broken_count: int
    impurity_count: int
    mildew_count: int
    good_rate: float
    broken_rate: float
    impurity_rate: float
    mildew_rate: float
    quality_level: str
    image_hash: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None
    blockchain_status: Optional[str] = "pending"
    image_path: Optional[str] = None
    qrcode_url: Optional[str] = None
    trace_code: Optional[str] = None

    def to_frontend(self) -> dict:
        return {
            "batchNumber": self.batch_id,
            "reportTime": self.timestamp,
            "totalCount": self.total_count,
            "goodCount": self.good_count,
            "brokenCount": self.broken_count,
            "impurityCount": self.impurity_count,
            "mildewCount": self.mildew_count,
            "goodRate": f"{self.good_rate}%",
            "brokenRate": f"{self.broken_rate}%",
            "impurityRate": f"{self.impurity_rate}%",
            "mildewRate": f"{self.mildew_rate}%",
            "grade": self.quality_level,
            "blockchainStatus": self.blockchain_status,
            "qrcode": self.qrcode_url,
            "detectImage": self.image_path,
            "traceCode": self.trace_code
        }

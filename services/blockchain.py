# -*- coding: utf-8 -*-
import logging
import requests
from typing import Dict
from config.settings import BLOCKCHAIN_ENABLED, BLOCKCHAIN_API

logger = logging.getLogger(__name__)


class BlockchainService:
    def __init__(self):
        self.enabled = BLOCKCHAIN_ENABLED
        if not self.enabled:
            logger.warning("⚠️ 区块链服务未启用")

    def upload(self, data: Dict) -> Dict:
        if not self.enabled:
            return {"success": False, "tx_hash": "", "error": "区块链服务未启用"}

        try:
            response = requests.post(BLOCKCHAIN_API, json=data, timeout=10)
            response.raise_for_status()
            result = response.json()
            logger.info(f"✅ 上链成功: tx={result.get('tx_hash', '')[:16]}...")
            return {
                "success": True,
                "tx_hash": result.get("tx_hash", ""),
                "block_height": result.get("block_height")
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ 上链网络错误: {e}")
            return {"success": False, "tx_hash": "", "error": str(e)}
        except Exception as e:
            logger.error(f"❌ 上链失败: {e}")
            return {"success": False, "tx_hash": "", "error": str(e)}

    def query(self, tx_hash: str) -> Dict:
        if not self.enabled or not tx_hash:
            return {"verified": False, "error": "服务未启用或无交易哈希"}

        try:
            response = requests.get(f"{BLOCKCHAIN_API}/query/{tx_hash}", timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"查询失败: {e}")
            return {"verified": False, "error": str(e)}


blockchain_service = BlockchainService()

# -*- coding: utf-8 -*-
import sqlite3
from contextlib import contextmanager
from config.settings import DATABASE_PATH
import logging

logger = logging.getLogger(__name__)


@contextmanager
def get_db():
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS detect_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                batch_id TEXT UNIQUE NOT NULL,
                timestamp TEXT NOT NULL,
                total_count INTEGER DEFAULT 0,
                good_count INTEGER DEFAULT 0,
                broken_count INTEGER DEFAULT 0,
                impurity_count INTEGER DEFAULT 0,
                mildew_count INTEGER DEFAULT 0,
                good_rate REAL DEFAULT 0,
                broken_rate REAL DEFAULT 0,
                impurity_rate REAL DEFAULT 0,
                mildew_rate REAL DEFAULT 0,
                quality_level TEXT,
                image_hash TEXT,
                blockchain_tx_hash TEXT,
                blockchain_status TEXT DEFAULT 'pending',
                image_path TEXT,
                qrcode_url TEXT,
                trace_code TEXT UNIQUE,
                created_at TEXT DEFAULT (datetime('now', 'localtime'))
            )
        ''')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_batch_id ON detect_records(batch_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_trace_code ON detect_records(trace_code)')
        logger.info("✅ 数据库初始化完成")

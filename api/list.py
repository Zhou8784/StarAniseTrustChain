# -*- coding: utf-8 -*-
from fastapi import APIRouter
from database.db import get_connection

router = APIRouter()

@router.get("/")
async def get_detect_list(limit: int = 50):
    conn = get_connection()
    c = conn.cursor()
    c.execute('''
        SELECT batch_id, timestamp, good_rate, mildew_rate, quality_level 
        FROM detect_records ORDER BY id DESC LIMIT ?
    ''', (limit,))
    rows = c.fetchall()
    conn.close()
    return [{'batch_id': r[0], 'timestamp': r[1], 'good_rate': r[2], 
             'mildew_rate': r[3], 'quality_level': r[4]} for r in rows]

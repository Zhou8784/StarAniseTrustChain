# -*- coding: utf-8 -*-
import hashlib

def generate_image_hash(batch_id, timestamp, good_rate, mildew_rate):
    text = f"{batch_id}{timestamp}{good_rate}{mildew_rate}"
    return hashlib.sha256(text.encode()).hexdigest()

def generate_tx_hash(image_hash):
    return f"0x{image_hash[:16]}"

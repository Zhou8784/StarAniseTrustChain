# -*- coding: utf-8 -*-
"""
GS130WI 双目摄像头驱动
支持实时采集左右目图像
"""

import cv2
import numpy as np
import time
import threading
from datetime import datetime

class GS130WICamera:
    """双目摄像头类"""
    
    def __init__(self, width=640, height=640, fps=15):
        self.width = width
        self.height = height
        self.fps = fps
        self._running = False
        self._frame_left = None
        self._frame_right = None
        self._lock = threading.Lock()
        self._thread = None
        
    def open(self):
        """打开摄像头（使用 GStreamer 或 V4L2）"""
        # 方式1: 使用 GStreamer（RDK X5 默认）
        # gst_str = f"v4l2src device=/dev/video0 ! videoconvert ! videoscale ! video/x-raw,width={self.width},height={self.height},framerate={self.fps}/1 ! appsink"
        # self.cap = cv2.VideoCapture(gst_str, cv2.CAP_GSTREAMER)
        
        # 方式2: 直接使用 V4L2
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
        self.cap.set(cv2.CAP_PROP_FPS, self.fps)
        
        if not self.cap.isOpened():
            print("❌ 摄像头打开失败")
            return False
        
        print(f"✅ 摄像头打开成功 ({self.width}x{self.height}@{self.fps}fps)")
        return True
    
    def start(self):
        """启动采集线程"""
        if self._running:
            return
        if not self.open():
            return
        
        self._running = True
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()
        print("✅ 摄像头采集已启动")
    
    def _capture_loop(self):
        """采集循环"""
        while self._running:
            ret, frame = self.cap.read()
            if ret:
                with self._lock:
                    # 模拟双目：将单帧拆分为左右（实际双目需要两个通道）
                    # 这里把图像左半边当左目，右半边当右目
                    h, w = frame.shape[:2]
                    half = w // 2
                    self._frame_left = frame[:, :half]
                    self._frame_right = frame[:, half:]
                    
                    # 如果不需要双目，直接用全图
                    # self._frame_left = frame
                    # self._frame_right = frame
            else:
                print("⚠️ 摄像头读取失败")
                time.sleep(0.1)
    
    def get_left(self):
        """获取左目图像"""
        with self._lock:
            if self._frame_left is not None:
                return self._frame_left.copy()
            return None
    
    def get_right(self):
        """获取右目图像"""
        with self._lock:
            if self._frame_right is not None:
                return self._frame_right.copy()
            return None
    
    def get_frame(self):
        """获取左目图像（兼容单目接口）"""
        return self.get_left()
    
    def stop(self):
        """停止采集"""
        self._running = False
        if self._thread:
            self._thread.join(timeout=2)
        if self.cap:
            self.cap.release()
        print("✅ 摄像头已停止")
    
    def __del__(self):
        self.stop()

# 测试代码
if __name__ == "__main__":
    cam = GS130WICamera(width=640, height=640)
    cam.start()
    
    for i in range(10):
        img = cam.get_frame()
        if img is not None:
            cv2.imwrite(f"test_{i}.jpg", img)
            print(f"✅ 保存图片 test_{i}.jpg")
        time.sleep(0.5)
    
    cam.stop()

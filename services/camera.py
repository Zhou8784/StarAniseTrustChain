# -*- coding: utf-8 -*-
import threading
import time
import cv2
import numpy as np
from typing import Optional
import logging
from config.settings import ROS_IMAGE_TOPIC

logger = logging.getLogger(__name__)


class ROS2CameraService:
    def __init__(self):
        self._frame = None
        self._lock = threading.Lock()
        self._running = False
        self._thread = None
        self._ready = False
        self._error = None
        self._ros_node = None

    def start(self) -> bool:
        if self._running:
            return True

        try:
            import rclpy
            from rclpy.node import Node
            from sensor_msgs.msg import Image

            class CameraNode(Node):
                def __init__(self, frame_callback):
                    super().__init__('star_anise_camera')
                    self.frame_callback = frame_callback
                    self.sub = self.create_subscription(
                        Image, ROS_IMAGE_TOPIC, self.image_callback, 10
                    )
                    logger.info(f"✅ 订阅ROS话题: {ROS_IMAGE_TOPIC}")

                def image_callback(self, msg):
                    try:
                        # 手动解码 nv12 格式
                        height = msg.height
                        width = msg.width
                        data = np.frombuffer(msg.data, dtype=np.uint8)
                        
                        # nv12: Y 平面 (height * width) + UV 交错平面 (height/2 * width)
                        y_size = height * width
                        y_plane = data[:y_size].reshape(height, width)
                        uv_plane = data[y_size:].reshape(height // 2, width // 2, 2)
                        
                        # 上采样 UV 平面到原始尺寸
                        u_plane = cv2.resize(uv_plane[:, :, 0], (width, height))
                        v_plane = cv2.resize(uv_plane[:, :, 1], (width, height))
                        
                        # 组合 YUV
                        yuv = np.stack([y_plane, u_plane, v_plane], axis=2)
                        
                        # YUV 转 BGR
                        bgr_image = cv2.cvtColor(yuv.astype(np.uint8), cv2.COLOR_YUV2BGR)
                        self.frame_callback(bgr_image)
                    except Exception as e:
                        # 静默处理，不打印警告
                        pass

            try:
                rclpy.init()
            except Exception:
                pass

            self._ros_node = CameraNode(self._on_frame)
            self._running = True

            self._thread = threading.Thread(target=self._spin_loop, daemon=True)
            self._thread.start()

            logger.info("⏳ 等待相机图像...")
            for i in range(50):
                if self._ready:
                    logger.info("✅ 相机就绪")
                    return True
                time.sleep(0.1)

            self._error = "等待图像超时"
            logger.error(f"❌ {self._error}")
            return False

        except ImportError as e:
            self._error = f"ROS2未安装: {e}"
            logger.error(f"❌ {self._error}")
            return False
        except Exception as e:
            self._error = f"相机启动失败: {e}"
            logger.error(f"❌ {self._error}")
            return False

    def _spin_loop(self):
        import rclpy
        while self._running:
            try:
                rclpy.spin_once(self._ros_node, timeout_sec=0.01)
            except Exception:
                pass

    def _on_frame(self, cv_image: np.ndarray):
        if cv_image is None:
            return
        with self._lock:
            self._frame = cv_image
            self._ready = True

    def get_frame(self) -> Optional[np.ndarray]:
        if not self._ready:
            return None
        with self._lock:
            return self._frame.copy() if self._frame is not None else None

    def is_ready(self) -> bool:
        return self._ready

    def get_error(self) -> Optional[str]:
        return self._error

    def stop(self):
        self._running = False
        if self._thread:
            self._thread.join(timeout=2)
        if self._ros_node:
            try:
                self._ros_node.destroy_node()
                import rclpy
                rclpy.shutdown()
            except:
                pass
        logger.info("✅ 相机服务已停止")


camera = ROS2CameraService()

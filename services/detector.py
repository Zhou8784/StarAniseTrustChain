# -*- coding: utf-8 -*-
import cv2
import numpy as np
import hashlib
import logging
from typing import Optional, Dict
from config.settings import MODEL_PATH, CONF_THRES, INPUT_SIZE, CLASS_NAMES

logger = logging.getLogger(__name__)


class StarAniseDetector:
    def __init__(self):
        self._loaded = False
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            import hbm_runtime
            self.model = hbm_runtime.HB_HBMRuntime(MODEL_PATH)
            self.model_name = self.model.model_names[0]
            self.input_name = self.model.input_names[self.model_name][0]
            self.output_name = '580'
            self.size = INPUT_SIZE
            self.class_names = CLASS_NAMES
            self.conf_thres = CONF_THRES
            self._loaded = True
            logger.info(f"✅ BPU模型加载成功: {MODEL_PATH}")
        except ImportError:
            logger.error("❌ hbm_runtime未安装")
            self._loaded = False
        except Exception as e:
            logger.error(f"❌ 模型加载失败: {e}")
            self._loaded = False

    def is_ready(self) -> bool:
        return self._loaded

    def predict(self, image: np.ndarray) -> Optional[Dict]:
        if image is None or not self._loaded:
            return None

        try:
            img_resized = cv2.resize(image, (self.size, self.size))
            img_input = img_resized.transpose(2, 0, 1).reshape(1, 3, self.size, self.size)

            inputs = {self.model_name: {self.input_name: img_input.astype(np.uint8)}}
            outputs = self.model.run(inputs)[self.model_name]
            raw = outputs[self.output_name].squeeze()

            # Softmax
            exp_raw = np.exp(raw - np.max(raw, axis=2, keepdims=True))
            softmax = exp_raw / np.sum(exp_raw, axis=2, keepdims=True)

            class_map = np.argmax(softmax, axis=2)
            confidence_map = np.max(softmax, axis=2)

            # 只统计置信度 > 阈值的像素
            counts = {name: 0 for name in self.class_names}
            for i, name in enumerate(self.class_names):
                mask = (class_map == i) & (confidence_map > self.conf_thres)
                counts[name] = int(np.sum(mask))

            total = sum(counts.values())

            # 如果总数太少，认为没有目标
            if total < 100:
                logger.warning(f"检测到的像素太少 ({total})，可能没有目标")
                return None

            logger.info(f"检测结果: good={counts['good']}, broken={counts['broken']}, "
                       f"impurity={counts['impurity']}, mildew={counts['mildew']}")

            return {
                'total': total,
                'good': counts.get('good', 0),
                'broken': counts.get('broken', 0),
                'impurity': counts.get('impurity', 0),
                'mildew': counts.get('mildew', 0)
            }

        except Exception as e:
            logger.error(f"推理错误: {e}")
            return None

    @staticmethod
    def calculate_quality_level(good_rate: float, broken_rate: float,
                                impurity_rate: float, mildew_rate: float) -> str:
        if good_rate >= 90 and broken_rate < 5 and impurity_rate < 3 and mildew_rate < 5:
            return '一级品'
        elif good_rate >= 80 and broken_rate < 10 and impurity_rate < 5 and mildew_rate < 10:
            return '二级品'
        elif good_rate >= 60 and broken_rate < 20 and impurity_rate < 10 and mildew_rate < 20:
            return '三级品'
        else:
            return '等外品'

    @staticmethod
    def generate_hash(batch_id: str, timestamp: str, good_rate: float, mildew_rate: float) -> str:
        text = f"{batch_id}{timestamp}{good_rate}{mildew_rate}"
        return hashlib.sha256(text.encode()).hexdigest()


detector = StarAniseDetector()

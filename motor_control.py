#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# motor_control.py - 传送带电机控制模块（软件 PWM）

import Hobot.GPIO as GPIO
import threading
import time
import logging

logger = logging.getLogger(__name__)

# ============================================================
#  引脚定义（物理引脚号）
# ============================================================

DIR_AIN1_PIN = 15   # GPI022 → TB6612 AIN1 (Pin 15)
DIR_AIN2_PIN = 16   # GPI023 → TB6612 AIN2 (Pin 16)
PWM_PIN = 22        # GPI022 → TB6612 PWMA (Pin 22) - 软件 PWM

# ============================================================
#  传送带参数
# ============================================================

SPEED = 30
DIRECTION = "forward"

# ============================================================
#  传送带控制类
# ============================================================

class ConveyorMotor:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self._running = False
        self._pwm_thread = None
        self._lock = threading.Lock()
        self.current_speed = 0
        self.current_direction = "stop"
        self._initialized = False
        
        self._setup_gpio()
        self._initialized = True
        logger.info("✅ 传送带电机控制初始化完成（软件 PWM）")
    
    def _setup_gpio(self):
        try:
            GPIO.setmode(GPIO.BOARD)
            GPIO.setwarnings(False)
            
            GPIO.setup(DIR_AIN1_PIN, GPIO.OUT)
            GPIO.setup(DIR_AIN2_PIN, GPIO.OUT)
            GPIO.setup(PWM_PIN, GPIO.OUT)
            
            GPIO.output(DIR_AIN1_PIN, GPIO.LOW)
            GPIO.output(DIR_AIN2_PIN, GPIO.LOW)
            GPIO.output(PWM_PIN, GPIO.LOW)
            
            self._running = True
            self._pwm_thread = threading.Thread(target=self._pwm_loop, daemon=True)
            self._pwm_thread.start()
            
            self.set_motor(DIRECTION, SPEED)
            
        except Exception as e:
            logger.error(f"❌ GPIO 初始化失败: {e}")
            raise
    
    def _pwm_loop(self):
        while self._running:
            speed = self.current_speed
            if speed > 0 and self.current_direction != "stop":
                GPIO.output(PWM_PIN, GPIO.HIGH)
                time.sleep(speed / 5000.0)
                GPIO.output(PWM_PIN, GPIO.LOW)
                time.sleep((100 - speed) / 5000.0)
            else:
                GPIO.output(PWM_PIN, GPIO.LOW)
                time.sleep(0.01)
    
    def set_motor(self, direction: str, speed: int):
        with self._lock:
            speed = max(0, min(100, speed))
            
            if direction == "forward":
                GPIO.output(DIR_AIN1_PIN, GPIO.HIGH)
                GPIO.output(DIR_AIN2_PIN, GPIO.LOW)
                logger.info(f"传送带正转 | 速度: {speed}%")
            elif direction == "backward":
                GPIO.output(DIR_AIN1_PIN, GPIO.LOW)
                GPIO.output(DIR_AIN2_PIN, GPIO.HIGH)
                logger.info(f"传送带反转 | 速度: {speed}%")
            elif direction == "stop":
                GPIO.output(DIR_AIN1_PIN, GPIO.LOW)
                GPIO.output(DIR_AIN2_PIN, GPIO.LOW)
                speed = 0
                logger.info("传送带停止")
            else:
                raise ValueError("direction 必须是 'forward', 'backward', 'stop'")
            
            self.current_speed = speed
            self.current_direction = direction
    
    def stop(self):
        self.set_motor("stop", 0)
    
    def cleanup(self):
        self._running = False
        if self._pwm_thread:
            self._pwm_thread.join(timeout=1)
        GPIO.output(PWM_PIN, GPIO.LOW)
        GPIO.cleanup()
        logger.info("✅ GPIO 已释放")


# ========== 全局单例（放在 if __name__ 外面） ==========
conveyor = ConveyorMotor()

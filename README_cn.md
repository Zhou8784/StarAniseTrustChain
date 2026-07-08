# 八角品质AI视觉检测与溯源系统 🍃🔍

> 基于地瓜机器人 RDK X5 的边缘 AI 视觉检测与区块链溯源系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-RDK%20X5-green)](https://developer.d-robotics.cc/)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![WeChat](https://img.shields.io/badge/Platform-WeChat%20MiniProgram-brightgreen)](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## 📖 项目简介

本项目针对八角农产品在流通过程中“以次充好”、品质认定依赖人工感官、全程追溯难等行业痛点，基于地瓜机器人 **RDK X5** 开发平台，设计并实现了一套集 **AI视觉检测**、**多特征融合分析** 与 **轻量级区块链溯源** 于一体的嵌入式智能系统。

系统通过 **GS130WI 双目摄像头** 采集八角图像与深度信息，利用 **YOLO26** 模型实时检测外观缺陷（霉变、破损、杂质等），并提取颜色、纹理与深度特征，通过轻量级 **MLP 回归网络** 预测八角的内在品质（挥发油含量、水分、莽草酸）。检测结果通过 **哈希链机制** 与 **SHA256 算法** 写入本地 SQLite 数据库，实现数据的不可篡改存证。用户可通过微信小程序（`bajiao-wx`）拍照上传，实时获取品质报告并追溯“田间到货架”的全链路信息。

## ✨ 核心功能

- **🔍 外观缺陷实时检测**：使用针对 RDK X5 BPU 硬件加速深度优化的 YOLO26 模型 (`yolo26n_bayese_640x640_nv12.bin`)，毫秒级识别正常果、霉变、破损及杂质。
- **📊 内在品质无损预测**：融合 RGB 图像颜色、纹理特征与双目深度图的物理特征，预测八角的水分、挥发油和莽草酸含量。
- **⛓️ 本地防篡改存证**：不依赖昂贵的公链，使用本地 SQLite (`star_anise.db`) 结合哈希链与 SHA256 生成 `txHash` 和 `blockHeight`，实现边缘端数据可信存证。
- **📱 微信小程序端联动**：通过 `Flask` 后端 (`app.py`) 提供统一 API，实现微信小程序一键拍照、上传、检测、报告生成与二维码溯源。

## 🛠️ 系统架构

- **边缘计算硬件**：地瓜机器人 RDK X5（10 TOPS BPU 算力）
- **感知设备**：RDK GS130WI 双目摄像头 (MIPI CSI 接口)
- **算法模型**：YOLO26 目标检测 (BPU 量化) + 轻量级 MLP 回归
- **后台服务**：Python Flask 框架 (`app.py` + `api/` + `services/`)
- **应用端**：微信小程序 (`bajiao-wx/`)
- **数据存储**：SQLite 哈希链数据库 (`star_anise.db`)

## 📂 目录结构说明

```text
StarAniseTrustChain/
├── api/                           # Flask 后端接口路由定义
├── bajiao-wx/                     # 微信小程序源码目录
├── camera/                        # 双目摄像头与深度图采集驱动脚本
├── config/                        # 全局配置文件 (API地址、数据库配置等)
├── database/                      # 数据库初始化与管理
├── logs/                          # 系统运行日志
├── services/                      # 核心业务逻辑 (YOLO推理、特征提取、区块链存证)
├── app.py                         # Flask 主入口，启动后端服务
├── best_monkey_bayese_640x640_nv12.bin # 最佳 YOLO 模型 BPU 部署文件
├── motor_control.py               # (如有) 电机/动作执行控制脚本
├── requirements.txt               # Python 依赖库列表
├── solver.bin                     # 模型推理配置/辅助二进制文件
├── star_anise.db                  # 区块链存证本地数据库 (SQLite)
├── star_anise.db.bak              # 数据库备份
└── yolo26n_bayese_640x640_nv12.bin # 基础 YOLO 模型 BPU 量化部署文件

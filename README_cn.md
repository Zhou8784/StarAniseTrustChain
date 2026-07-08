# 智角云链 —— 基于RDK X5的八角品质智能检测与可信溯源系统 🍃🔗

> 面向八角产业的“边缘智能检测 + 区块链可信存证 + 微信小程序溯源”一体化解决方案

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-RDK%20X5-green)](https://developer.d-robotics.cc/)
[![Language](https://img.shields.io/badge/language-Python%203.10%2B-blue)](https://www.python.org/)
[![Model](https://img.shields.io/badge/model-YOLO26-brightgreen)](https://github.com/ultralytics/ultralytics)

## 📖 项目简介

八角作为我国重要的特色经济作物，在食品加工及医药化工领域具有广泛应用。针对传统八角检测依赖人工经验、效率低、标准不一以及品质溯源困难等问题，本项目设计并实现了一套基于 **RDK X5** 边缘计算平台的八角品质智能检测与可信溯源系统。

系统以地瓜机器人 RDK X5 为核心边缘计算节点，搭载 **GS130WI 立体相机** 采集样本图像。在边缘端部署 **YOLO26** 模型，自动识别正常果、破碎果、杂质和霉变果，并计算完整果占比、破损率、杂质率等品质指标，自动生成品质等级。同时，引入**区块链存证机制**，对检测信息进行哈希加密与链上存储，确保数据不可篡改。最终，通过**微信小程序**赋予每个产品唯一的溯源码，实现“一物一码、全流程可查”。

## ✨ 核心功能

- **🔍 YOLO26 外观品质检测**：毫秒级实时检测，精准识别正常果、破碎果、杂质与霉变果四类目标。
- **📊 智能品质分级与报告生成**：自动计算关键指标，生成综合评分与 AI 分析结论，形成标准化检测报告。
- **⛓️ 区块链可信存证**：对检测时间、批次号、品质等级等关键数据进行 SHA-256 哈希加密，生成交易哈希（`tx_hash`）实现防篡改存证。
- **📱 微信小程序溯源交互**：通过扫码或输入批次号，一键查询检测报告、品质指标、区块链存证信息及产品来源。
- **⚙️ 自动化检测流水线**：通过 GPIO/PWM 输出 30% 占空比信号驱动 TB6612 电机模块与传送带，实现自动化匀速上料。

## 🛠️ 系统架构

### 1. 硬件架构
系统采用轻量化多层水平堆叠结构，由上至下分为三个物理层：
- **顶层（感知与控制层）**：搭载 RDK X5 开发板、GS130WI 立体相机、TB6612 驱动模块与主动散热风扇。
- **中间层（物理隔离与走线层）**：隔离顶层与底层，实现 FPC 排线与控制线的垂直贯穿走线。
- **底层（执行与传动层）**：包含直流减速电机与绿色传送带，配合 30% 占空比驱动，实现八角样本的平稳传输。

### 2. 软件架构
采用“边缘端 AI 检测 + 数据通信与轻量存证 + 微信小程序”三层架构：
- **边缘层**：RDK X5（YOLO26 推理 + Flask 服务 + 数据哈希加密）
- **通信层**：HTTP POST 请求将结构化数据提交至本地服务模块，并通过 `tx_hash` 返回存证凭证。
- **应用层**：微信小程序（扫码、请求数据、解析 JSON、渲染报告）。

## 🚀 快速开始

### 1. 硬件环境准备
- 主控板：地瓜机器人 **RDK X5**（已烧录系统）
- 摄像头：**GS130WI 立体相机**（排线连接至 CAM0/CAM1 MIPI 接口）
- 电机驱动：**TB6612 模块**（连接 RDK X5 GPIO 与 PWM 引脚）
- 电源：5V 直流稳压电源（为开发板、摄像头与驱动模块供电）

### 2. 边缘端后端部署
```bash
# 进入项目根目录
cd StarAniseTrustChain

# 安装 Python 依赖
pip3 install -r requirements.txt

# 运行 Flask 后端服务（默认 5000 端口）
python3 app.py
## 🛠️ 系统架构

- **边缘计算硬件**：地瓜机器人 RDK X5（10 TOPS BPU 算力）
- **感知设备**：RDK GS130WI 双目摄像头 (MIPI CSI 接口)
- **算法模型**：YOLO26 目标检测 
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

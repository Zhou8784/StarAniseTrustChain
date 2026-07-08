### `README.md`

```markdown
# Star Anise AI Quality Inspection & Traceability System 🍃🔍

> An embedded AI vision detection and local blockchain traceability system powered by the D-Robotics RDK X5 platform.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-RDK%20X5-green)](https://developer.d-robotics.cc/)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![WeChat](https://img.shields.io/badge/Platform-WeChat%20MiniProgram-brightgreen)](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## 📖 Introduction

This project addresses the critical issues in the star anise industry, such as inconsistent quality assessment relying solely on human senses, and the lack of a transparent supply chain traceability system. Built upon the **D-Robotics RDK X5** edge computing platform, we designed an embedded intelligent system that integrates **AI vision inspection**, **multi-modal feature fusion analysis**, and a **local hash-chain anti-tampering mechanism**.

The system utilizes the **GS130WI stereo camera** to capture RGB images and depth data. We deploy **YOLO26** models to detect external defects (mold, damage, impurities) in real-time. By fusing color, texture, and depth features, a lightweight **MLP regression network** predicts internal quality indicators such as volatile oil, moisture, and shikimic acid content. All inspection results are secured via a local **SHA256 hash-chain** and stored in a SQLite database to ensure data integrity. Users can upload photos via a WeChat Mini Program (`bajiao-wx`) and instantly receive inspection reports and traceability information.

## ✨ Features

- **🔍 Real-time Defect Detection**: Utilizes BPU-optimized YOLO26 models (`yolo26n_bayese_640x640_nv12.bin`) for rapid identification of good, moldy, broken, and impure star anise fruits.
- **📊 Internal Quality Prediction**: Fuses RGB color, texture features, and physical depth data from the binocular camera to estimate moisture, volatile oil, and shikimic acid levels.
- **⛓️ Local Anti-Tampering Record**: Implements a lightweight hash-chain in local SQLite (`star_anise.db`) to generate `txHash` and `blockHeight`, ensuring data trustworthiness without expensive public blockchain nodes.
- **📱 WeChat Mini Program Integration**: Powered by a Python Flask backend (`app.py`) providing RESTful APIs, enabling one-click photo capture, detection, report generation, and QR code traceability via WeChat.

## 🛠️ System Architecture

- **Edge Device**: D-Robotics RDK X5 (10 TOPS BPU)
- **Sensor**: RDK GS130WI Stereo Camera (MIPI CSI)
- **AI Models**: YOLO26 Object Detection (BPU INT8 Quantized) + MLP Regression
- **Backend Service**: Python Flask Framework (`app.py` + `api/` + `services/`)
- **Client**: WeChat Mini Program (`bajiao-wx/`)
- **Data Storage**: SQLite Hash-Chain Database (`star_anise.db`)

## 📂 Project Structure

```text
StarAniseTrustChain/
├── api/                           # Flask API route definitions
├── bajiao-wx/                     # WeChat Mini Program source code
├── camera/                        # Stereo camera and depth capture drivers
├── config/                        # Global configuration (API, DB, etc.)
├── database/                      # Database initialization
├── logs/                          # System log files
├── services/                      # Core business logic (Inference, Feature Extraction, BlockChain)
├── app.py                         # Flask Main entry point (Backend server)
├── best_monkey_bayese_640x640_nv12.bin # Best YOLO BPU deployment model
├── motor_control.py               # (Optional) Motor/actuator control script
├── requirements.txt               # Python dependencies
├── solver.bin                     # Auxiliary model inference binary
├── star_anise.db                  # Local SQLite anti-tampering database
├── star_anise.db.bak              # Database backup
└── yolo26n_bayese_640x640_nv12.bin # Base YOLO BPU deployment model

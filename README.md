### `README.md`

```markdown
# Star Anise AI Quality Inspection & Traceability System 🍃🔍

> An embedded AI vision detection and local blockchain traceability system powered by the D-Robotics RDK X5 platform.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-RDK%20X5-green)](https://developer.d-robotics.cc/)
[![Python](https://img.shields.io/badge/python-3.10%2B-blue)](https://www.python.org/)
[![WeChat](https://img.shields.io/badge/Platform-WeChat%20MiniProgram-brightgreen)](https://developers.weixin.qq.com/miniprogram/dev/framework/)


## 📖 Introduction

Star anise is a vital economic crop in China, widely used in food processing and pharmaceuticals. To address the industry challenges of inefficient manual inspection, inconsistent grading standards, and lack of reliable traceability, this project develops a smart detection and traceability system based on the **RDK X5** edge computing platform.

Utilizing the D-Robotics RDK X5 as the core edge node and a **GS130WI stereo camera** for image acquisition, the system deploys a **YOLO26** model to automatically identify good, broken, impure, and moldy star anise fruits. It calculates key quality metrics (intact rate, damage rate, etc.) and generates standardized quality reports. To ensure trust, a **blockchain storage mechanism** is introduced: it encrypts inspection data via SHA-256 and stores the hashes on-chain, preventing tampering. Finally, a **WeChat Mini Program** provides a unique traceability QR code for every batch, enabling full-lifecycle traceability.

## ✨ Core Features

- **🔍 YOLO26 Defect Detection**: Real-time, millisecond-level recognition of intact, broken, moldy, and impure fruits.
- **📊 Smart Grading & Report Generation**: Automatically calculates key indicators, generates comprehensive scores, and provides AI analytical conclusions.
- **⛓️ Blockchain Trusted Storage**: Encrypts key data (timestamp, batch ID, grade) via SHA-256, generating a transaction hash (`tx_hash`) for tamper-proof storage.
- **📱 WeChat Mini Program Interface**: Scan the QR code or enter the batch ID to instantly view inspection reports, quality metrics, blockchain proofs, and origin info.
- **⚙️ Automated Conveyor Belt System**: Uses 30% duty cycle PWM signals via GPIO to drive the TB6612 motor module and conveyor belt for smooth, automated sample feeding.

## 🛠️ System Architecture

### 1. Hardware Architecture
A lightweight, multi-layer horizontal stack design (Top → Middle → Bottom):
- **Top Layer (Perception & Control)**: RDK X5 board, GS130WI stereo camera, TB6612 driver module, and active cooling fan.
- **Middle Layer (Physical Isolation & Routing)**: Separates top and bottom layers, routing FPC cables and control lines vertically.
- **Bottom Layer (Actuation & Transmission)**: Contains a DC gear motor and a green conveyor belt driven at a 30% PWM duty cycle for stable sample feeding.

### 2. Software Architecture
A three-layer design: Edge AI + Lightweight Data Communication + WeChat Mini Program.
- **Edge Layer**: RDK X5 (YOLO26 inference + Flask API + Data Hashing).
- **Communication Layer**: Uses HTTP POST requests to transmit structured data and retrieves the on-chain proof (`tx_hash`).
- **Application Layer**: WeChat Mini Program (QR scanner, API calls, JSON rendering, report generation).

## 🚀 Quick Start

### 1. Hardware Setup
- **Board**: D-Robotics **RDK X5** (Pre-flashed with OS).
- **Camera**: **GS130WI Stereo Camera** (Connect to CAM0/CAM1 MIPI interfaces).
- **Motor Driver**: **TB6612** (Connect to GPIO & PWM pins).
- **Power**: 5V DC power supply for the board, camera, and driver.

### 2. Backend Deployment on Edge
```bash
# Enter project directory
cd StarAniseTrustChain

# Install Python dependencies
pip3 install -r requirements.txt

# Run the Flask backend (Default port 5000)
python3 app.py

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

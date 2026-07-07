/**
 * 项目全局配置
 * 所有接口地址、系统名称等统一管理
 */

// ==============================
// 当前运行环境
// ==============================
var ENV = "development";
// development：开发环境（RDK X5）
// production ：正式环境（NodeHub / 云服务器）

// ==============================
// 接口地址
// ==============================
var API_CONFIG = {
  development: {
    BASE_URL: "http://192.168.124.232:8000"
  },
  production: {
    BASE_URL: "https://api.xxx.com"
  }
};

// ==============================
// 当前接口地址
// ==============================
var BASE_URL = API_CONFIG[ENV].BASE_URL;

// ==============================
// 系统配置
// ==============================
var SYSTEM = {
  APP_NAME: "八角品质检测系统",
  VERSION: "1.0.0",
  COMPANY: ""
};

// ==============================
// 导出
// ==============================
module.exports = {
  ENV: ENV,
  BASE_URL: BASE_URL,
  SYSTEM: SYSTEM
};
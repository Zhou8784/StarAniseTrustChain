/**
 * ============================================================
 * api.js
 * 全局接口地址管理
 * 全项目唯一 API 定义
 * ============================================================
 */

var BASE_URL = "http://192.168.124.232:8000";

var API = {
  /**
   * AI检测
   */
  DETECT: BASE_URL + "/api/detect/upload",

  /**
   * 获取最新检测结果
   */
  LATEST: BASE_URL + "/api/detect/latest",

  /**
   * 系统状态
   */
  STATUS: BASE_URL + "/api/detect/status",

  /**
   * 历史记录列表
   */
  HISTORY_LIST: BASE_URL + "/api/record/list",

  /**
   * 单条记录
   */
  RECORD: BASE_URL + "/api/record",

  /**
   * 溯源查询
   */
  TRACE: BASE_URL + "/api/trace",

  /**
   * 健康检查
   */
  HEALTH: BASE_URL + "/health"
};

module.exports = API;
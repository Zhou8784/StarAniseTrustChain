/**
 * ============================================================
 * historyService.js
 * 历史记录业务服务
 * 全项目唯一历史记录管理入口
 * ============================================================
 */

const storage = require("../utils/storage");

/**
 * 获取全部历史记录
 * @returns {Array}
 */
function getHistory() {
  const history = storage.getHistory();
  console.log('📊 getHistory 返回:', history.length, '条记录');
  return history;
}

/**
 * 保存历史记录
 * @param {Object} report
 * @returns {Array}
 */
function saveHistory(report) {
  console.log('📊 saveHistory 接收到的 report:', JSON.stringify(report, null, 2));
  console.log('📊 traceCode:', report.traceCode);
  console.log('📊 qrcode:', report.qrcode);
  
  return storage.saveHistory(report);
}

/**
 * 根据ID获取历史记录
 * @param {String} id
 * @returns {Object|null}
 */
function getHistoryById(id) {
  const history = storage.getHistory();
  const result = history.find(item => item.id === id) || null;
  console.log('📊 getHistoryById:', id, '找到:', result ? '是' : '否');
  return result;
}

/**
 * 删除一条历史记录
 * @param {String} id
 * @returns {Array}
 */
function deleteHistory(id) {
  const history = storage.getHistory();
  const newHistory = history.filter(item => item.id !== id);
  return storage.replaceHistory(newHistory);
}

/**
 * 清空历史记录
 * @returns {Boolean}
 */
function clearHistory() {
  return storage.clearHistory();
}

module.exports = {
  getHistory,
  saveHistory,
  getHistoryById,
  deleteHistory,
  clearHistory
};
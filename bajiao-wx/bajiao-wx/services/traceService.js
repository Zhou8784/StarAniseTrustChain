/**
 * ============================================================
 * traceService.js
 * 产品溯源业务服务
 * 全项目唯一溯源入口
 * ============================================================
 */

const historyService = require("./historyService");
const blockchainService = require("./blockchainService");
const Trace = require("../utils/trace");
const { BLOCKCHAIN_STATUS } = require("../utils/constants");

/**
 * 根据 Trace ID 获取完整溯源信息
 * @param {String} traceId
 * @returns {Promise<Object>}
 */
async function getTrace(traceId) {
  if (!traceId) {
    return Trace.createEmptyTraceData();
  }

  /**
   * 查询历史记录（通过 batchNumber 或 id 匹配）
   */
  const history = historyService.getHistory();

  // 使用 batchNumber 匹配 traceId
  const report = history.find(
    item => item.batchNumber === traceId || item.id === traceId
  );

  if (!report) {
    return Trace.createEmptyTraceData();
  }

  let blockchain = {};

  /**
   * 如果报告已上链，查询区块链信息
   */
  if (report.blockchainStatus === BLOCKCHAIN_STATUS.SUCCESS) {
    try {
      blockchain = await blockchainService.queryBlock({
        traceId
      });
    } catch (error) {
      console.error("Trace Query Error:", error);
    }
  }

  /**
   * 返回统一 TraceData
   */
  return Trace.createTraceData(report, blockchain);
}

/**
 * 根据二维码查询
 * @param {String} qrCode
 * @returns {Promise<Object>}
 */
async function getTraceByQRCode(qrCode) {
  return getTrace(qrCode);
}

module.exports = {
  getTrace,
  getTraceByQRCode
};
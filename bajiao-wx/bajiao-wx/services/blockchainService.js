/**
 * ============================================================
 * blockchainService.js
 * 区块链业务服务
 * 全项目唯一上链入口
 * ============================================================
 */

const request = require("../utils/request");
const blockchain = require("../utils/blockchain");
const storage = require("../utils/storage");          
const API = require("../utils/api");
const { BLOCKCHAIN_STATUS } = require("../utils/constants");

/**
 * 提交检测报告上链
 * @param {Object} report
 * @returns {Promise<Object>}
 */
async function uploadReport(report) {
  // 创建区块对象
  const block = blockchain.createBlock(report);

  try {
    /**
     * Flask
     * POST /blockchain/upload
     */
    const result = await request.post(
      API.BLOCKCHAIN.UPLOAD,
      block
    );

    // 区块链信息
    const blockchainInfo = {
      blockchainStatus: BLOCKCHAIN_STATUS.SUCCESS,
      traceId: result.traceId || block.traceId,
      blockHash: result.blockHash || "",
      previousHash: result.previousHash || "",
      blockHeight: result.blockHeight || "",
      txHash: result.txHash || ""
    };

    const updatedReport = {
      ...report,
      ...blockchainInfo
    };

    // 上链成功后保存最新报告
    storage.saveReport(updatedReport);

    return updatedReport;
  } catch (error) {
    console.error("Blockchain Upload Error:", error);
    return {
      ...report,
      blockchainStatus: BLOCKCHAIN_STATUS.FAILED
    };
  }
}

/**
 * 获取最新检测报告
 * @returns {Object|null}
 */
function getLatestReport() {
  return storage.getReport();
}

/**
 * 查询区块信息
 * @param {Object} params
 * @returns {Promise<Object>}
 */
async function queryBlock(params = {}) {
  return request.get(
    API.BLOCKCHAIN.QUERY,
    params
  );
}

module.exports = {
  uploadReport,
  getLatestReport,   
  queryBlock
};
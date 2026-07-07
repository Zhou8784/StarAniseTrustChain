/**
 * ============================================================
 * trace.js
 * TraceData 数据模型（唯一溯源数据模型）
 * ============================================================
 */

const { BLOCKCHAIN_STATUS } = require("./constants");

/**
 * 创建空 TraceData
 */
function createEmptyTraceData() {

  return {

    traceId: "",

    report: null,

    blockchain: {

      blockchainStatus: BLOCKCHAIN_STATUS.PENDING,

      blockHeight: "",

      blockHash: "",

      previousHash: "",

      txHash: "",

      verifyStatus: "未知"

    }

  };

}

/**
 * 创建统一 TraceData
 * @param {Object} report
 * @param {Object} blockchain
 * @returns {Object}
 */
function createTraceData(report = {}, blockchain = {}) {

  const empty = createEmptyTraceData();

  return {

    ...empty,

    traceId:

      report.traceId ||

      blockchain.traceId ||

      "",

    report,

    blockchain: {

      ...empty.blockchain,

      ...blockchain

    }

  };

}

module.exports = {

  createEmptyTraceData,

  createTraceData

};
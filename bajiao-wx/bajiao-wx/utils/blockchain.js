/**
 * ============================================================
 * blockchain.js
 * 区块链工具类
 * 全项目唯一区块链工具
 * ============================================================
 */

/**
 * 创建区块对象
 * @param {Object} report
 * @returns {Object}
 */
function createBlock(report = {}) {

  return {

    traceId: createTraceId(),

    previousHash: "",

    currentHash: "",

    timestamp: new Date().toISOString(),

    data: report

  };

}

/**
 * 创建溯源码
 * @returns {String}
 */
function createTraceId() {

  return "TRACE-" + Date.now();

}

/**
 * 判断区块是否合法
 * @param {Object} block
 * @returns {Boolean}
 */
function validateBlock(block) {

  if (!block) {

    return false;

  }

  if (!block.traceId) {

    return false;

  }

  if (!block.timestamp) {

    return false;

  }

  if (!block.data) {

    return false;

  }

  return true;

}

/**
 * 更新区块Hash
 * Flask返回Hash以后调用
 */
function updateHash(block, hash) {

  return {

    ...block,

    currentHash: hash

  };

}

/**
 * 判断Hash是否合法
 */
function validateHash(hash) {

  if (!hash) {

    return false;

  }

  return typeof hash === "string";

}

module.exports = {

  createBlock,

  createTraceId,

  validateBlock,

  updateHash,

  validateHash

};
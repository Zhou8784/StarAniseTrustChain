/**
 * ============================================================
 * report.js
 * Report 数据模型（全项目唯一数据模型）
 * ============================================================
 */

const { BLOCKCHAIN_STATUS } = require("./constants");

/**
 * 格式化时间为北京时间
 * @param {String} isoString - ISO 格式时间字符串
 * @returns {String} 格式化的时间 (YYYY-MM-DD HH:mm:ss)
 */
function formatBeijingTime(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // 转换为北京时间 (UTC+8)
    const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
    const year = beijingTime.getUTCFullYear();
    const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getUTCDate()).padStart(2, '0');
    const hours = String(beijingTime.getUTCHours()).padStart(2, '0');
    const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return isoString || '';
  }
}

/**
 * 获取当前时间字符串（北京时间）
 */
function getCurrentTime() {
  return formatBeijingTime(new Date().toISOString());
}

/**
 * 创建空 Report
 */
function createEmptyReport() {
  return {
    id: "",
    batchNumber: "",
    status: "waiting",
    createTime: "",
    updateTime: "",
    reportTime: "",
    imagePath: "",
    imageUrl: "",
    grade: "",
    score: 0,
    goodRate: "0%",
    brokenRate: "0%",
    impurityRate: "0%",
    mildewRate: "0%",
    totalCount: 0,
    goodCount: 0,
    brokenCount: 0,
    impurityCount: 0,
    mildewCount: 0,
    aiConclusion: "",
    origin: "",
    detectLocation: "",
    device: "",
    model: "",
    camera: "",
    blockchainStatus: BLOCKCHAIN_STATUS.PENDING,
    blockHeight: "",
    txHash: "",
    blockHash: "",
    qrcodeUrl: "",
    remark: ""
  };
}

/**
 * 创建统一 Report
 * @param {Object} data
 * @returns {Object}
 */
function createReport(data = {}) {
  const now = getCurrentTime();
  
  // 处理霉变率
  const mildewRate = data.mildewRate !== undefined ? data.mildewRate : data.moldRate;
  const mildewRateDisplay = typeof mildewRate === 'number' ? mildewRate + '%' : (mildewRate || "0%");

  // 格式化时间
  const reportTime = data.reportTime || data.timestamp || now;
  const formattedTime = formatBeijingTime(reportTime);

  return {
    ...createEmptyReport(),
    ...data,
    id: data.id || String(Date.now()),
    batchNumber: data.batchNumber || ("BK" + Date.now()),
    createTime: data.createTime || now,
    updateTime: data.updateTime || now,
    reportTime: formattedTime,  
    timestamp: formattedTime,   
    mildewRate: mildewRateDisplay,
    mildewCount: data.mildewCount || data.moldCount || 0,
    moldRate: mildewRateDisplay,
    moldCount: data.mildewCount || data.moldCount || 0
  };
}

/**
 * 判断是否为合法 Report
 */
function isReport(report) {
  if (!report) return false;
  if (typeof report !== "object") return false;
  return !!report.id;
}

/**
 * 更新 Report
 */
function updateReport(oldReport = {}, newData = {}) {
  return createReport({
    ...oldReport,
    ...newData,
    updateTime: getCurrentTime()
  });
}

module.exports = {
  createEmptyReport,
  createReport,
  updateReport,
  isReport,
  formatBeijingTime
};
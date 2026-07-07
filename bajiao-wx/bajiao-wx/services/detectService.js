/**
 * ============================================================
 * detectService.js
 * AI检测业务服务 - 对接后端
 * ============================================================
 */

const Report = require("../utils/report");
const {
  DETECT_STATUS,
  BLOCKCHAIN_STATUS
} = require("../utils/constants");

const historyService = require("./historyService");
const blockchainService = require("./blockchainService");

// ========== 后端地址 ==========
const BASE_URL = "http://192.168.124.232:8000";

console.log('🔧 detectService 加载中...');
console.log('📡 BASE_URL:', BASE_URL);

/**
 * 转换图片/二维码路径为完整 URL
 */
function getFullImageUrl(path) {
  if (!path) return '';
  
  // 如果已经是完整 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 如果以 /static 开头，拼接到 BASE_URL
  if (path.startsWith('/static')) {
    return BASE_URL + path;
  }
  
  // 如果以 /uploads 开头，拼接到 BASE_URL
  if (path.startsWith('/uploads')) {
    return BASE_URL + path;
  }
  // 如果路径包含 /uploads/，提取文件名
  if (path.includes('/uploads/')) {
    const fileName = path.split('/uploads/').pop();
    // 如果文件名包含 ?，去除时间戳参数
    const cleanFileName = fileName.split('?')[0];
    return BASE_URL + '/uploads/' + cleanFileName;
  }
  
  // 如果是本地路径（以 /root 开头），提取文件名
  if (path.startsWith('/root/')) {
    const fileName = path.split('/').pop();
    const cleanFileName = fileName.split('?')[0];
    if (cleanFileName && cleanFileName.includes('.')) {
      return BASE_URL + '/uploads/' + cleanFileName;
    }
    return BASE_URL + '/uploads/' + path;
  }
  
  // 其他情况：提取文件名
  const fileName = path.split('/').pop();
  const cleanFileName = fileName.split('?')[0];
  if (cleanFileName && cleanFileName.includes('.')) {
    return BASE_URL + '/uploads/' + cleanFileName;
  }
  
  return BASE_URL + '/' + path;
}

/**
 * 执行 AI 检测（上传图片）
 */
async function detect(imagePath) {
  if (!imagePath) {
    throw new Error("imagePath不能为空");
  }

  try {
    const result = await new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${BASE_URL}/api/detect/upload`,
        filePath: imagePath,
        name: "file",
        success(res) {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (e) {
            reject(new Error("解析响应失败"));
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });

    if (!result.success) {
      return Report.createReport({
        imagePath,
        status: DETECT_STATUS.FAILED,
        blockchainStatus: BLOCKCHAIN_STATUS.PENDING,
        error: result.error || "检测失败"
      });
    }

    const imageUrl = getFullImageUrl(result.image_path);
    const qrcodeUrl = getFullImageUrl(result.qrcode_url);

    let report = Report.createReport({
      id: result.batch_id,
      batchNumber: result.batch_id,
      reportTime: result.timestamp || new Date().toISOString(),
      totalCount: result.total_count || 0,
      goodCount: result.good_count || 0,
      brokenCount: result.broken_count || 0,
      impurityCount: result.impurity_count || 0,
      mildewCount: result.mildew_count || 0,
      goodRate: result.good_rate || 0,
      brokenRate: result.broken_rate || 0,
      impurityRate: result.impurity_rate || 0,
      mildewRate: result.mildew_rate || 0,
      grade: result.quality_level || "未知",
      blockchainStatus: result.blockchain_status || BLOCKCHAIN_STATUS.PENDING,
      blockchainTxHash: result.blockchain_tx_hash || "",
      qrcode: qrcodeUrl,
      traceCode: result.trace_code || "",
      imagePath: imageUrl,
      status: DETECT_STATUS.COMPLETED
    });

    historyService.saveHistory(report);
    return report;

  } catch (error) {
    console.error("Detect Error:", error);
    return Report.createReport({
      imagePath,
      status: DETECT_STATUS.FAILED,
      blockchainStatus: BLOCKCHAIN_STATUS.PENDING,
      error: error.message || "检测失败"
    });
  }
}

function getLatestReport() {
  const report = blockchainService.getLatestReport?.() || historyService.getHistory?.()?.[0];
  return report || null;
}

function getReport() {
  return getLatestReport();
}

/**
 * 从服务器获取最新检测结果
 */
async function getLatestFromServer() {
  try {
    console.log('📡 请求最新检测结果...');
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/detect/latest`,
        method: "GET",
        success(res) {
          console.log('📡 响应状态:', res.statusCode);
          if (res.statusCode === 200 && res.data.success) {
            resolve(res.data.data);
          } else {
            resolve(null);
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });
    
    if (result) {
      const imageUrl = getFullImageUrl(result.image_path);
      const qrcodeUrl = getFullImageUrl(result.qrcode_url);
      
      console.log('📡 图片URL:', imageUrl);
      console.log('📡 二维码URL:', qrcodeUrl);
      
      return Report.createReport({
        id: result.batch_id,
        batchNumber: result.batch_id,
        reportTime: result.timestamp || new Date().toISOString(),
        totalCount: result.total_count || 0,
        goodCount: result.good_count || 0,
        brokenCount: result.broken_count || 0,
        impurityCount: result.impurity_count || 0,
        mildewCount: result.mildew_count || 0,
        goodRate: result.good_rate || 0,
        brokenRate: result.broken_rate || 0,
        impurityRate: result.impurity_rate || 0,
        mildewRate: result.mildew_rate || 0,
        grade: result.quality_level || "未知",
        blockchainStatus: result.blockchain_status || "pending",
        blockchainTxHash: result.blockchain_tx_hash || "",
        qrcode: qrcodeUrl,
        traceCode: result.trace_code || "",
        imagePath: imageUrl,
        status: "completed"
      });
    }
    return null;
  } catch (error) {
    console.error("获取最新检测结果失败:", error);
    return null;
  }
}

async function getReportById(batchId) {
  try {
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/record/${batchId}`,
        method: "GET",
        success(res) {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error("未找到该报告"));
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });

    const imageUrl = getFullImageUrl(result.image_path);
    const qrcodeUrl = getFullImageUrl(result.qrcode_url);

    return Report.createReport({
      id: result.batch_id,
      batchNumber: result.batch_id,
      reportTime: result.timestamp,
      totalCount: result.total_count,
      goodCount: result.good_count,
      brokenCount: result.broken_count,
      impurityCount: result.impurity_count,
      mildewCount: result.mildew_count,
      goodRate: result.good_rate,
      brokenRate: result.broken_rate,
      impurityRate: result.impurity_rate,
      mildewRate: result.mildew_rate,
      grade: result.quality_level,
      blockchainStatus: result.blockchain_status,
      blockchainTxHash: result.blockchain_tx_hash,
      qrcode: qrcodeUrl,
      traceCode: result.trace_code,
      imagePath: imageUrl,
      status: DETECT_STATUS.COMPLETED
    });
  } catch (error) {
    console.error("获取报告失败:", error);
    return null;
  }
}

async function getHistory(limit = 50) {
  try {
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/record/list?limit=${limit}`,
        method: "GET",
        success(res) {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            resolve([]);
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });

    return result.map(item => ({
      id: item.batch_id,
      batchNumber: item.batch_id,
      reportTime: item.timestamp,
      goodRate: item.good_rate,
      mildewRate: item.mildew_rate,
      grade: item.quality_level,
      blockchainStatus: item.blockchain_status || '未上链',
      qrcode: getFullImageUrl(item.qrcode_url),
      traceCode: item.trace_code
    }));
  } catch (error) {
    console.error("获取历史记录失败:", error);
    return [];
  }
}

async function trace(traceCode) {
  try {
    const history = wx.getStorageSync('chain_history') || [];
    const record = history.find(item => 
      item.traceCode === traceCode || 
      item.id === traceCode ||
      item.batchNumber === traceCode
    );
    
    if (record && record.report) {
      const report = { ...record.report };
      report.imagePath = getFullImageUrl(report.imagePath);
      report.qrcode = getFullImageUrl(report.qrcode);
      return report;
    }
    
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/trace/${traceCode}`,
        method: "GET",
        success(res) {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error("未找到该溯源码"));
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });
    
    if (result) {
      result.imagePath = getFullImageUrl(result.image_path);
      result.qrcode = getFullImageUrl(result.qrcode_url);
    }
    return result;
  } catch (error) {
    console.error("溯源查询失败:", error);
    throw error;
  }
}

async function uploadToBlockchain(batchId) {
  try {
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/api/blockchain/upload`,
        method: "POST",
        data: { batch_id: batchId },
        success(res) {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error('上链请求失败'));
          }
        },
        fail(err) {
          reject(err);
        }
      });
    });
    return result;
  } catch (error) {
    console.error('上链失败:', error);
    throw error;
  }
}

module.exports = {
  detect: detect,
  getLatestReport: getLatestReport,
  getReport: getReport,
  getLatestFromServer: getLatestFromServer,
  getReportById: getReportById,
  getHistory: getHistory,
  trace: trace,
  uploadToBlockchain: uploadToBlockchain
};
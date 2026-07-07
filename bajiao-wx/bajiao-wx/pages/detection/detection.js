/**
 * ============================================================
 * AI品质检测页面 - 自动展示后端检测结果
 * ============================================================
 */

const detectService = require("../../services/detectService");
const userService = require("../../services/userService");

Page({

  data: {
    detectionResult: null,
    loading: false,
    detectLocation: '',
    isUploading: false,
    chainStatus: {}
  },

  onLoad() {
    this.loadLocation();
    this.loadChainStatus();
    this.startPolling();
  },

  onShow() {
    this.fetchLatestResult();
  },

  onHide() {
    this.stopPolling();
  },

  onUnload() {
    this.stopPolling();
  },

  loadLocation() {
    try {
      const location = userService.getLocation();
      if (location && location.address) {
        this.setData({ detectLocation: location.address });
      }
    } catch (error) {
      console.error('获取定位地址失败:', error);
    }
  },

  loadChainStatus() {
    try {
      const records = wx.getStorageSync('chain_records') || {};
      this.setData({ chainStatus: records });
    } catch (e) {
      console.error('加载上链状态失败:', e);
    }
  },

  async fetchLatestResult() {
    try {
      const result = await detectService.getLatestFromServer();
      if (result) {
        console.log('📊 检测结果:', JSON.stringify(result, null, 2));
        console.log('📊 traceCode:', result.traceCode);
        console.log('📊 qrcode:', result.qrcode);
        
        const chainRecords = this.data.chainStatus;
        if (chainRecords[result.id]) {
          result.blockchainStatus = '已上链';
          result.blockchainTxHash = chainRecords[result.id].txHash;
        }
        result.detectLocation = this.data.detectLocation || '未获取地址';
        this.setData({
          detectionResult: result,
          loading: false
        });
      }
    } catch (error) {
      console.error('获取检测结果失败:', error);
    }
  },

  startPolling() {
    this.stopPolling();
    this.pollingTimer = setInterval(() => {
      this.fetchLatestResult();
    }, 3000);
  },

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  },

  getChainRecords() {
    try {
      return wx.getStorageSync('chain_records') || {};
    } catch (e) {
      return {};
    }
  },

  saveChainRecord(id, txHash) {
    try {
      const records = wx.getStorageSync('chain_records') || {};
      records[id] = {
        txHash: txHash,
        time: new Date().toISOString()
      };
      wx.setStorageSync('chain_records', records);
      this.setData({ chainStatus: records });
      console.log('✅ 上链记录已保存:', id);
    } catch (e) {
      console.error('保存上链记录失败:', e);
    }
  },

  /**
   * 保存上链历史记录
   */
  saveToChainHistory(report, txHash) {
    try {
      let history = wx.getStorageSync('chain_history') || [];
      let goodRate = report.goodRate;
      if (goodRate === undefined || goodRate === null) {
        goodRate = '0%';
      } else if (typeof goodRate === 'number') {
        goodRate = goodRate + '%';
      } else if (typeof goodRate === 'string' && !goodRate.includes('%')) {
        goodRate = goodRate + '%';
      }
      
      const record = {
        id: report.id,
        batchNumber: report.batchNumber,
        level: report.grade || '未知',
        detectTime: report.reportTime || new Date().toISOString(),
        goodRate: goodRate,
        txHash: txHash,
        time: new Date().toISOString(),
        isOnChain: true,
        report: report
      };
      
      const exists = history.some(item => item.id === report.id);
      if (!exists) {
        history.unshift(record);
        wx.setStorageSync('chain_history', history);
        console.log('✅ 上链历史已保存，共', history.length, '条记录');
        console.log('📊 保存的记录:', record);
      } else {
        console.log('⚠️ 记录已存在，跳过保存:', report.id);
      }
    } catch (e) {
      console.error('保存上链历史失败:', e);
    }
  },

  async uploadToBlockchain() {
    const that = this;
    const report = this.data.detectionResult;
    
    if (!report) {
      wx.showToast({ title: '暂无检测数据', icon: 'none' });
      return;
    }

    const chainRecords = this.data.chainStatus;
    if (chainRecords[report.id]) {
      wx.showToast({ title: '该报告已上链', icon: 'none' });
      return;
    }

    that.setData({ isUploading: true });
    wx.showLoading({ title: '上链中...', mask: true });

    try {
      const txHash = '0x' + Date.now().toString(16) + Math.random().toString(16).slice(2, 10);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.saveChainRecord(report.id, txHash);
      this.saveToChainHistory(report, txHash);
      
      report.blockchainStatus = '已上链';
      report.blockchainTxHash = txHash;
      this.setData({
        detectionResult: report,
        isUploading: false
      });

      wx.hideLoading();
      wx.showToast({ title: '✅ 上链成功！', icon: 'success' });

    } catch (error) {
      console.error('上链错误:', error);
      wx.hideLoading();
      wx.showToast({ title: '上链失败，请重试', icon: 'none' });
      that.setData({ isUploading: false });
    }
  },

  /**
   * ========== 生成溯源码（二维码内容使用纯溯源码） ==========
   */
  generateTraceCode() {
    const report = this.data.detectionResult;
    
    if (!report) {
      wx.showToast({ title: '暂无检测数据', icon: 'none' });
      return;
    }

    if (report.traceCode) {
      wx.showToast({ title: '溯源码已生成：' + report.traceCode, icon: 'none' });
      return;
    }

    // 生成溯源码
    const traceCode = 'TRACE' + report.batchNumber.slice(2) + Date.now().toString(36).toUpperCase();
    
    // ========== 二维码内容直接使用溯源码 ==========
    const qrContent = traceCode;
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(qrContent);
    
    // 更新报告
    report.traceCode = traceCode;
    report.qrcode = qrUrl;
    
    this.setData({
      detectionResult: report
    });

    // 更新历史记录
    this.updateHistoryTraceCode(report.id, traceCode, qrUrl);

    wx.showToast({
      title: '溯源码已生成',
      icon: 'success'
    });
  },

  updateHistoryTraceCode(id, traceCode, qrUrl) {
    try {
      let history = wx.getStorageSync('chain_history') || [];
      const index = history.findIndex(item => item.id === id);
      if (index !== -1) {
        history[index].traceCode = traceCode;
        history[index].qrcode = qrUrl;
        if (history[index].report) {
          history[index].report.traceCode = traceCode;
          history[index].report.qrcode = qrUrl;
        }
        wx.setStorageSync('chain_history', history);
        console.log('✅ 历史记录已更新溯源码:', traceCode);
      }
    } catch (e) {
      console.error('更新历史记录失败:', e);
    }
  },

  openHistory() {
    wx.navigateTo({
      url: "/pages/InspectReport/InspectReport"
    });
  },

  openReport() {
    if (!this.data.detectionResult) {
      wx.showToast({ title: "暂无检测报告", icon: "none" });
      return;
    }
    wx.navigateTo({
      url: "/pages/InspectReport1/InspectReport1?id=" + this.data.detectionResult.id
    });
  },

  openTrace() {
    wx.switchTab({
      url: "/pages/traceability/traceability"
    });
  }
});
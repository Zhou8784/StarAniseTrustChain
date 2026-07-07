/**
 * ============================================================
 * InspectReport1（检测报告详情页）
 * ============================================================
 */

Page({
  data: {
    hasData: false,
    report: {},
    batchNumber: '',
    reportTime: '',
    timestamp: Date.now(),
    detectionResult: {
      grade: '',
      goodRate: '0%',
      brokenRate: '0%',
      impurityRate: '0%',
      moldRate: '0%',
      totalCount: 0,
      goodCount: 0,
      brokenCount: 0,
      impurityCount: 0,
      moldCount: 0,
      blockchainStatus: '',
      imagePath: '',
      qrcodeUrl: '',
      qrcode: '',
      txHash: '',
      detectLocation: '',
      origin: '',
      device: 'RDK X5',
      model: 'YOLO26',
      camera: 'GS130WI',
      traceCode: ''
    }
  },

  onLoad(options) {
    const id = options.id;
    const dataStr = options.data;

    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }

    this.setData({ timestamp: Date.now() });

    if (dataStr) {
      try {
        const reportData = JSON.parse(decodeURIComponent(dataStr));
        this.processReportData(reportData, id);
        return;
      } catch (e) {
        console.error('解析数据失败:', e);
      }
    }

    this.loadFromStorage(id);
  },

  /**
   * 格式化百分号
   */
  formatRate(value) {
    if (value === undefined || value === null) return '0%';
    if (typeof value === 'string' && value.includes('%')) return value;
    if (typeof value === 'number') return value + '%';
    return String(value) + '%';
  },

  /**
   * 处理报告数据
   */
  processReportData(reportData, id) {
    const BASE_URL = 'http://192.168.124.232:8000';
    
    // ========== 从本地存储读取真实的 txHash ==========
    let txHash = reportData.blockchainTxHash || reportData.txHash || '待生成';
    
    // 如果 reportData 中没有，从本地 chain_records 读取
    if (txHash === '待生成' || !txHash) {
      try {
        const chainRecords = wx.getStorageSync('chain_records') || {};
        const recordId = reportData.id || id;
        if (chainRecords[recordId]) {
          txHash = chainRecords[recordId].txHash || '待生成';
          console.log('📊 从本地读取 txHash:', txHash);
        }
      } catch (e) {
        console.error('读取本地 txHash 失败:', e);
      }
    }
    
    // 处理图片路径
    let imagePath = reportData.imagePath || '';
    if (imagePath && !imagePath.startsWith('http')) {
      if (imagePath.includes('/uploads/')) {
        const fileName = imagePath.split('/uploads/').pop();
        imagePath = BASE_URL + '/uploads/' + fileName;
      } else {
        const fileName = imagePath.split('/').pop();
        if (fileName && fileName.includes('.')) {
          imagePath = BASE_URL + '/uploads/' + fileName;
        }
      }
    }
    
    // 处理二维码路径
    let qrcodeUrl = reportData.qrcode || reportData.qrcodeUrl || '';
    if (qrcodeUrl && !qrcodeUrl.startsWith('http')) {
      if (qrcodeUrl.startsWith('/')) {
        qrcodeUrl = BASE_URL + qrcodeUrl;
      } else {
        qrcodeUrl = BASE_URL + '/' + qrcodeUrl;
      }
    }

    if (imagePath) {
      imagePath = imagePath + '?t=' + Date.now();
    }
    if (qrcodeUrl) {
      qrcodeUrl = qrcodeUrl + '?t=' + Date.now();
    }

    const detectionResult = {
      grade: reportData.grade || reportData.level || '未知',
      goodRate: this.formatRate(reportData.goodRate),
      brokenRate: this.formatRate(reportData.brokenRate),
      impurityRate: this.formatRate(reportData.impurityRate),
      moldRate: this.formatRate(reportData.mildewRate),
      totalCount: reportData.totalCount || 0,
      goodCount: reportData.goodCount || 0,
      brokenCount: reportData.brokenCount || 0,
      impurityCount: reportData.impurityCount || 0,
      moldCount: reportData.mildewCount || 0,
      blockchainStatus: reportData.blockchainStatus || '已上链',
      imagePath: imagePath,
      qrcodeUrl: qrcodeUrl,
      qrcode: qrcodeUrl,
      txHash: txHash,
      detectLocation: reportData.detectLocation || '未获取地址',
      origin: reportData.origin || '广西玉林',
      device: reportData.device || 'RDK X5',
      model: reportData.model || 'YOLO26',
      camera: reportData.camera || 'GS130WI',
      traceCode: reportData.traceCode || ''
    };

    console.log('📊 最终 txHash:', txHash);

    this.setData({
      hasData: true,
      report: reportData,
      batchNumber: reportData.batchNumber || id,
      reportTime: reportData.reportTime || '未知时间',
      timestamp: Date.now(),
      detectionResult: detectionResult
    });
  },

  /**
   * 从本地存储获取报告数据
   */
  loadFromStorage(id) {
    try {
      const history = wx.getStorageSync('chain_history') || [];
      const record = history.find(item => item.id === id);
      
      if (record && record.report) {
        this.processReportData(record.report, id);
      } else {
        wx.showToast({ title: '未找到该报告', icon: 'none' });
        this.setData({ hasData: false });
      }
    } catch (e) {
      console.error('加载报告失败:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onImageLoad(e) {
    console.log('✅ 图片加载成功');
  },

  onImageError(e) {
    console.log('❌ 图片加载失败:', e);
    this.setData({ timestamp: Date.now() });
  },

  previewQRCode() {
    const qrUrl = this.data.detectionResult.qrcode || this.data.detectionResult.qrcodeUrl;
    if (!qrUrl) {
      wx.showToast({ title: '暂无二维码', icon: 'none' });
      return;
    }
    wx.previewImage({
      urls: [qrUrl]
    });
  },

  previewDetectImage() {
    if (!this.data.detectionResult.imagePath) return;
    wx.previewImage({
      urls: [this.data.detectionResult.imagePath]
    });
  },

  onShareAppMessage() {
    return {
      title: '八角品质检测报告',
      path: '/pages/InspectReport1/InspectReport1?id=' + this.data.batchNumber
    };
  }
});
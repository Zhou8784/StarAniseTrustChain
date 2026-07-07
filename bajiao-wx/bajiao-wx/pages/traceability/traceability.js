// pages/traceability/traceability.js

Page({

  data: {
    batchNumber: '',
    showCard: false,
    traceResult: null,
    loading: false
  },

  onScanTap() {
    const that = this;
    
    wx.scanCode({
      success: async (res) => {
        let code = res.result;
        console.log('📷 扫码结果:', code);
        
        if (code.includes('?code=')) {
          code = code.split('?code=')[1];
        }
        if (code.includes('&')) {
          code = code.split('&')[0];
        }
        code = code.trim();
        console.log('📷 查询 code:', code);
        
        that.setData({ loading: true });
        wx.showLoading({ title: '查询中...', mask: true });
        
        try {
          const history = wx.getStorageSync('chain_history') || [];
          console.log('📋 历史记录数:', history.length);
          
          history.forEach((item, i) => {
            const tc = item.traceCode || (item.report && item.report.traceCode) || '无';
            console.log(`  ${i}: traceCode=${tc}`);
          });
          
          const record = history.find(item => {
            const tc = item.traceCode || (item.report && item.report.traceCode);
            return tc === code;
          });
          
          if (record) {
            console.log('✅ 找到记录');
            const traceData = record.report || record;
            const BASE_URL = 'http://192.168.124.232:8000';
            
            // ========== 从本地存储读取 txHash ==========
            let txHash = traceData.blockchainTxHash || traceData.txHash || '待生成';
            if (txHash === '待生成' || !txHash) {
              try {
                const chainRecords = wx.getStorageSync('chain_records') || {};
                const recordId = traceData.id || record.id;
                if (chainRecords[recordId]) {
                  txHash = chainRecords[recordId].txHash || '待生成';
                  console.log('📊 从本地读取 txHash:', txHash);
                }
              } catch (e) {
                console.error('读取本地 txHash 失败:', e);
              }
            }
            
            let imagePath = traceData.imagePath || '';
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
            
            let qrcode = traceData.qrcode || '';
            if (qrcode && !qrcode.startsWith('http')) {
              if (qrcode.startsWith('/')) {
                qrcode = BASE_URL + qrcode;
              } else {
                qrcode = BASE_URL + '/' + qrcode;
              }
            }
            
            const fullReport = {
              id: traceData.id || record.id,
              batchNumber: traceData.batchNumber || code,
              grade: traceData.grade || traceData.level || '未知',
              goodRate: traceData.goodRate || 0,
              brokenRate: traceData.brokenRate || 0,
              impurityRate: traceData.impurityRate || 0,
              mildewRate: traceData.mildewRate || 0,
              totalCount: traceData.totalCount || 0,
              goodCount: traceData.goodCount || 0,
              brokenCount: traceData.brokenCount || 0,
              impurityCount: traceData.impurityCount || 0,
              mildewCount: traceData.mildewCount || 0,
              reportTime: traceData.reportTime || traceData.detectTime || '未知时间',
              imagePath: imagePath,
              qrcode: qrcode,
              traceCode: traceData.traceCode || code,
              blockchainTxHash: txHash,
              blockchainStatus: traceData.blockchainStatus || '已上链',
              detectLocation: traceData.detectLocation || '未获取地址',
              origin: traceData.origin || '广西玉林',
              device: traceData.device || 'RDK X5',
              model: traceData.model || 'YOLO26',
              camera: traceData.camera || 'GS130WI'
            };
            
            const formattedData = {
              batchNumber: fullReport.batchNumber,
              level: fullReport.grade,
              goodRate: fullReport.goodRate,
              brokenRate: fullReport.brokenRate,
              impurityRate: fullReport.impurityRate,
              mildewRate: fullReport.mildewRate,
              detectTime: fullReport.reportTime,
              imagePath: imagePath,
              blockchainStatus: '已上链',
              txHash: txHash,
              traceCode: fullReport.traceCode,
              qrcode: qrcode,
              origin: fullReport.origin,
              detectLocation: fullReport.detectLocation,
              conclusion: that.getConclusion(fullReport.grade),
              fullReport: fullReport
            };
            
            that.setData({
              batchNumber: code,
              traceResult: formattedData,
              showCard: true,
              loading: false
            });
            
            wx.hideLoading();
            wx.showToast({ title: '查询成功', icon: 'success' });
            
          } else {
            console.log('❌ 未找到:', code);
            wx.hideLoading();
            wx.showToast({ title: '未找到该溯源码', icon: 'none' });
            that.setData({ showCard: false, loading: false });
          }
          
        } catch (error) {
          console.error('查询失败:', error);
          wx.hideLoading();
          wx.showToast({ title: '查询失败，请重试', icon: 'none' });
          that.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.log('扫码取消:', err);
        if (err.errMsg !== 'scanCode:fail cancel') {
          wx.showToast({ title: '扫码失败', icon: 'none' });
        }
      }
    });
  },

  getConclusion(level) {
    const map = {
      '一级品': '该批次八角品质优良，建议优先销售或用于高端产品加工。',
      '二级品': '该批次八角品质良好，符合一般市场流通标准。',
      '三级品': '该批次八角品质一般，建议用于深加工或低价市场。',
      '等外品': '该批次八角品质较差，建议降价处理或用于提取八角油。'
    };
    return map[level] || '该批次八角已完成AI品质检测，数据已上链存证。';
  },

  onCardTap() {
    const traceResult = this.data.traceResult;
    if (!traceResult || !traceResult.batchNumber) {
      wx.showToast({ title: '暂无报告', icon: 'none' });
      return;
    }
    
    const reportData = traceResult.fullReport || {
      id: traceResult.batchNumber,
      batchNumber: traceResult.batchNumber,
      grade: traceResult.level,
      goodRate: traceResult.goodRate,
      brokenRate: traceResult.brokenRate,
      impurityRate: traceResult.impurityRate,
      mildewRate: traceResult.mildewRate,
      reportTime: traceResult.detectTime,
      imagePath: traceResult.imagePath,
      qrcode: traceResult.qrcode,
      traceCode: traceResult.traceCode,
      blockchainTxHash: traceResult.txHash,
      blockchainStatus: traceResult.blockchainStatus,
      detectLocation: traceResult.detectLocation,
      origin: traceResult.origin,
      device: traceResult.device || 'RDK X5',
      model: traceResult.model || 'YOLO26',
      camera: traceResult.camera || 'GS130WI'
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(reportData));
    const batchId = traceResult.batchNumber;
    
    wx.navigateTo({
      url: '/pages/InspectReport1/InspectReport1?id=' + batchId + '&data=' + encodedData
    });
  }
});
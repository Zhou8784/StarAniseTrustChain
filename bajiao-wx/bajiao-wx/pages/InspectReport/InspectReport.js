/**
 * ============================================================
 * InspectReport（历史记录页面）
 * 显示已上链的记录列表
 * ============================================================
 */

Page({

  data: {
    reportList: [],
    loading: false
  },

  onShow() {
    this.loadHistory();
  },

  /**
   * 加载上链历史记录
   */
  loadHistory() {
    this.setData({ loading: true });

    try {
      const history = wx.getStorageSync('chain_history') || [];

      const formattedList = history.map(item => ({
        id: item.id,
        batchNumber: item.batchNumber,
        level: item.level || '未知',
        detectTime: item.detectTime || '未知时间',
        goodRate: item.goodRate || '0%',
        isOnChain: true,
        txHash: item.txHash || '',
        report: item.report || {}
      }));

      this.setData({
        reportList: formattedList,
        loading: false
      });

    } catch (error) {
      console.error("Load History Error:", error);
      this.setData({
        reportList: [],
        loading: false
      });
    }
  },

  /**
   * 点击查看详情 - 传递完整数据
   */
  goDetail(e) {
    const item = e.currentTarget.dataset.item;
    if (!item || !item.id) {
      wx.showToast({ title: "数据异常", icon: "none" });
      return;
    }
    
    // 将完整报告数据转为 JSON 字符串传递
    const reportData = encodeURIComponent(JSON.stringify(item.report || {}));
    
    wx.navigateTo({
      url: `/pages/InspectReport1/InspectReport1?id=${item.id}&data=${reportData}`
    });
  }
});
// pages/my/my.js
const mapService = require('../../services/map');
const userService = require('../../services/userService');
const detectService = require('../../services/detectService');

Page({
  data: {
    userInfo: null,
    stats: {
      totalDetection: 0,
      firstGradeRate: '0',
      chainRecords: 0
    },
    address: '点击获取位置',
    latitude: '',
    longitude: ''
  },

  onLoad(options) {
    this.fetchUserStats();
  },

  onShow() {
    this.fetchUserStats();
  },

  /**
   * 获取用户统计数据
   */
  async fetchUserStats() {
    try {
      // 1. 检测批次 = 从后端获取所有检测记录总数
      const history = await detectService.getHistory(1000);
      const totalDetection = history.length;
      
      // 2. 上链记录 = 从本地存储获取上链历史
      const chainHistory = wx.getStorageSync('chain_history') || [];
      const chainRecords = chainHistory.length;
      
      // 3. 一级品率 = 上链记录中"一级品"的比例
      let firstGradeCount = 0;
      chainHistory.forEach(item => {
        if (item.level === '一级品') {
          firstGradeCount++;
        }
      });
      const firstGradeRate = chainRecords > 0 
        ? Math.round((firstGradeCount / chainRecords) * 100) 
        : 0;
      
      this.setData({
        stats: {
          totalDetection: totalDetection,
          firstGradeRate: firstGradeRate,
          chainRecords: chainRecords
        }
      });
      
      console.log('✅ 统计数据已更新:');
      console.log('  检测批次(总):', totalDetection);
      console.log('  上链记录:', chainRecords);
      console.log('  一级品数(上链中):', firstGradeCount);
      console.log('  一级品率:', firstGradeRate + '%');
      
    } catch (error) {
      console.error('获取统计数据失败:', error);
      // 如果后端获取失败，从本地读取
      this.fetchLocalStats();
    }
  },

  /**
   * 从本地获取统计数据（备用）
   */
  fetchLocalStats() {
    try {
      const chainHistory = wx.getStorageSync('chain_history') || [];
      const totalDetection = chainHistory.length;
      const chainRecords = chainHistory.length;
      
      let firstGradeCount = 0;
      chainHistory.forEach(item => {
        if (item.level === '一级品') {
          firstGradeCount++;
        }
      });
      const firstGradeRate = chainRecords > 0 
        ? Math.round((firstGradeCount / chainRecords) * 100) 
        : 0;
      
      this.setData({
        stats: {
          totalDetection: totalDetection,
          firstGradeRate: firstGradeRate,
          chainRecords: chainRecords
        }
      });
    } catch (e) {
      console.error('获取本地统计数据失败:', e);
    }
  },

  /**
   * 获取用户定位
   */
  getUserLocation() {
    const that = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that.getLocationAndConvert();
            },
            fail() {
              wx.showModal({
                title: '需要位置权限',
                content: '请授权后获取您的位置信息',
                confirmText: '去设置',
                success(modalRes) {
                  if (modalRes.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          that.getLocationAndConvert();
        }
      },
      fail(err) {
        console.error('检查授权失败:', err);
        that.setData({ address: '获取定位失败' });
      }
    });
  },

  /**
   * 获取经纬度并转换为中文地址
   */
  getLocationAndConvert() {
    const that = this;
    wx.showLoading({ title: '定位中...' });

    mapService.getCurrentLocation()
      .then((location) => {
        const { latitude, longitude } = location;
        console.log('获取到坐标:', latitude, longitude);

        return mapService.reverseGeocode(latitude, longitude)
          .then((result) => {
            const address = result.address;
            that.setData({
              address: address,
              latitude: latitude,
              longitude: longitude
            });
            userService.saveLocation({ address: address });
          });
      })
      .catch((err) => {
        console.error('定位失败:', err);
        that.setData({ address: '定位失败，请检查手机GPS和网络' });
        wx.showToast({ title: '定位失败', icon: 'none' });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },

  /**
   * 点击地址刷新定位
   */
  refreshLocation() {
    this.getUserLocation();
  },

  onUserInfoTap() {
    console.log('点击个人信息');
  },

  onHistoryDetectionTap() {
    wx.navigateTo({
      url: '/pages/InspectReport/InspectReport'
    });
  },

  onTraceabilityTap() {
    wx.switchTab({
      url: '/pages/traceability/traceability'
    });
  },

  onBlockchainTap() {
    wx.navigateTo({
      url: '/pages/BlockchainHistory/BlockchainHistory'
    });
  },

  goPage(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url,
      fail(err) {
        console.log(err);
        wx.showToast({
          title: '页面不存在',
          icon: 'none'
        });
      }
    });
  }
});
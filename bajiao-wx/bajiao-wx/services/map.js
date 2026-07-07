/**
 * ============================================================
 * services/map.js
 * 腾讯地图服务封装
 * 全项目唯一地图 API 调用入口
 * ============================================================
 */

// 腾讯地图 API 配置
const MAP_CONFIG = {
  BASE_URL: 'https://apis.map.qq.com/ws/geocoder/v1/',
  KEY: 'NUYBZ-NU4EZ-VNRXH-7H2W7-IUSCQ-VRFIN'
};

/**
 * 获取当前地理位置（封装 wx.getLocation）
 * @param {Object} options 可选参数，如 { type: 'gcj02' }
 * @returns {Promise<{ latitude, longitude }>}
 */
function getCurrentLocation(options = { type: 'gcj02' }) {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: options.type || 'gcj02',
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        reject(err);
      }
    });
  });
}

/**
 * 逆地理编码：根据经纬度获取中文地址
 * @param {Number} latitude  纬度
 * @param {Number} longitude 经度
 * @returns {Promise} 返回 { address, ...其他字段 }
 */
function reverseGeocode(latitude, longitude) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: MAP_CONFIG.BASE_URL,
      data: {
        location: latitude + ',' + longitude,
        key: MAP_CONFIG.KEY,
        output: 'json'
      },
      success: (res) => {
        console.log('逆地理编码响应:', res.data);
        if (res.data && res.data.status === 0 && res.data.result) {
          const address = res.data.result.address || 
                          res.data.result.formatted_addresses?.recommend || 
                          '地址解析成功';
          resolve({
            address: address,
            rawData: res.data
          });
        } else {
          const status = res.data ? res.data.status : '未知';
          reject({
            code: status,
            message: '解析失败(code:' + status + ')'
          });
        }
      },
      fail: (err) => {
        console.error('腾讯地图API请求失败:', err);
        reject({
          code: -1,
          message: '网络请求失败，请检查网络',
          err: err
        });
      }
    });
  });
}

module.exports = {
  getCurrentLocation,  // 新增
  reverseGeocode,
  MAP_CONFIG
};
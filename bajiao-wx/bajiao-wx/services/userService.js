/**
 * ============================================================
 * services/userService.js
 * 用户信息业务服务
 * 全项目唯一用户数据管理入口
 * ============================================================
 */

const storage = require("../utils/storage");

const USER_LOCATION_KEY = "userLocation";

/**
 * 保存用户位置
 * @param {Object} location { address, latitude?, longitude? }
 * @returns {Boolean}
 */
function saveLocation(location) {
  return storage.set(USER_LOCATION_KEY, location);
}

/**
 * 获取用户位置
 * @returns {Object|null}
 */
function getLocation() {
  return storage.get(USER_LOCATION_KEY);
}

module.exports = {
  saveLocation,
  getLocation
};
/**
 * ============================================================
 * request.js
 * 全局网络请求工具
 * 全项目唯一 HTTP 请求入口
 * ============================================================
 */

const { BASE_URL } = require("./config");
const {
  REQUEST_METHOD,
  CONTENT_TYPE,
  HTTP_STATUS
} = require("./constants");

/**
 * 通用请求
 * @param {Object} options
 * @returns {Promise<Object>}
 */
function request(options = {}) {

  return new Promise((resolve, reject) => {

    wx.showLoading({

      title: "加载中",

      mask: true

    });

    wx.request({

      url: BASE_URL + options.url,

      method: options.method || REQUEST_METHOD.GET,

      data: options.data || {},

      header: {

        "content-type":

          options.contentType ||

          CONTENT_TYPE.JSON,

        ...(options.header || {})

      },

      timeout: options.timeout || 15000,

      success(res) {

        if (res.statusCode === HTTP_STATUS.SUCCESS) {

          resolve(res.data);

        } else {

          wx.showToast({

            title: "服务器异常",

            icon: "none"

          });

          reject(res);

        }

      },

      fail(error) {

        wx.showToast({

          title: "网络连接失败",

          icon: "none"

        });

        reject(error);

      },

      complete() {

        wx.hideLoading();

      }

    });

  });

}

/**
 * GET 请求
 * @param {String} url
 * @param {Object} data
 */
function get(url, data = {}) {

  return request({

    url,

    method: REQUEST_METHOD.GET,

    data

  });

}

/**
 * POST 请求
 * @param {String} url
 * @param {Object} data
 */
function post(url, data = {}) {

  return request({

    url,

    method: REQUEST_METHOD.POST,

    data

  });

}

/**
 * 上传图片
 * @param {String} url
 * @param {String} filePath
 * @param {String} name
 */
function upload(url, filePath, name = "image") {

  return new Promise((resolve, reject) => {

    wx.showLoading({

      title: "上传中",

      mask: true

    });

    wx.uploadFile({

      url: BASE_URL + url,

      filePath,

      name,

      success(res) {

        try {

          resolve(JSON.parse(res.data));

        } catch (error) {

          reject(error);

        }

      },

      fail(error) {

        wx.showToast({

          title: "上传失败",

          icon: "none"

        });

        reject(error);

      },

      complete() {

        wx.hideLoading();

      }

    });

  });

}

module.exports = {

  request,

  get,

  post,

  upload

}

;
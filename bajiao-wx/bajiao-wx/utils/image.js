/**
 * ============================================================
 * image.js
 * 图片工具类
 * 全项目唯一图片处理入口
 * ============================================================
 */

/**
 * 选择图片（拍照/相册）
 * @returns {Promise<String>}
 */
function chooseImage() {

  return new Promise((resolve, reject) => {

    wx.chooseMedia({

      count: 1,

      mediaType: ["image"],

      sourceType: ["camera", "album"],

      success(res) {

        resolve(res.tempFiles[0].tempFilePath);

      },

      fail(err) {

        reject(err);

      }

    });

  });

}

/**
 * 获取图片信息
 * @param {String} imagePath
 * @returns {Promise<Object>}
 */
function getImageInfo(imagePath) {

  return new Promise((resolve, reject) => {

    wx.getImageInfo({

      src: imagePath,

      success(res) {

        resolve(res);

      },

      fail(err) {

        reject(err);

      }

    });

  });

}

/**
 * 压缩图片
 * @param {String} imagePath
 * @param {Number} quality
 * @returns {Promise<String>}
 */
function compressImage(imagePath, quality = 80) {

  return new Promise((resolve, reject) => {

    wx.compressImage({

      src: imagePath,

      quality,

      success(res) {

        resolve(res.tempFilePath);

      },

      fail(err) {

        reject(err);

      }

    });

  });

}

/**
 * 检查图片是否合法
 * @param {String} imagePath
 * @returns {Promise<Boolean>}
 */
async function validateImage(imagePath) {

  if (!imagePath) {

    return false;

  }

  try {

    const info = await getImageInfo(imagePath);

    return !!info.width && !!info.height;

  } catch (e) {

    return false;

  }

}

module.exports = {

  chooseImage,

  getImageInfo,

  compressImage,

  validateImage

};
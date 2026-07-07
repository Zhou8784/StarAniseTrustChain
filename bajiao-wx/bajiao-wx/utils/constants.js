/**
 * ============================================================
 * constants.js
 * 全局常量定义
 * 全项目唯一常量入口
 * ============================================================
 */

/**
 * 检测状态
 */
const DETECT_STATUS = {

  PENDING: "pending",

  COMPLETED: "completed",

  FAILED: "failed"

};

/**
 * 区块链状态
 */
const BLOCKCHAIN_STATUS = {

  PENDING: "未上链",

  SUCCESS: "已上链",

  FAILED: "上链失败"

};

/**
 * HTTP 请求方式
 */
const REQUEST_METHOD = {

  GET: "GET",

  POST: "POST",

  PUT: "PUT",

  DELETE: "DELETE"

};

/**
 * Content-Type
 */
const CONTENT_TYPE = {

  JSON: "application/json",

  FORM_DATA: "multipart/form-data"

};

/**
 * HTTP 状态码
 */
const HTTP_STATUS = {

  SUCCESS: 200,

  BAD_REQUEST: 400,

  UNAUTHORIZED: 401,

  NOT_FOUND: 404,

  SERVER_ERROR: 500

};

/**
 * 默认值
 */
const DEFAULT_VALUE = {

  EMPTY: "",

  ZERO: 0,

  NULL: null

};

module.exports = {

  DETECT_STATUS,

  BLOCKCHAIN_STATUS,

  REQUEST_METHOD,

  CONTENT_TYPE,

  HTTP_STATUS,

  DEFAULT_VALUE

};
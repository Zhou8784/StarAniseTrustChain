/**
 * ============================================================
 * storage.js
 * 全局统一数据存储层（唯一数据访问层）
 * ============================================================
 */

const Report = require("./report")

const STORAGE_KEY = {

  REPORT: "REPORT",

  HISTORY: "HISTORY",

  USER: "USER"

}

/* ============================================================
 * 基础操作
 * ============================================================
 */

function set(key, value) {

  try {

    wx.setStorageSync(key, value)

    return true

  } catch (e) {

    console.error("Storage Set Error:", e)

    return false

  }

}

function get(key, defaultValue = null) {

  try {

    const value = wx.getStorageSync(key)

    return value || defaultValue

  } catch (e) {

    console.error("Storage Get Error:", e)

    return defaultValue

  }

}

function remove(key) {

  try {

    wx.removeStorageSync(key)

    return true

  } catch (e) {

    console.error(e)

    return false

  }

}

function clear() {

  try {

    wx.clearStorageSync()

    return true

  } catch (e) {

    console.error(e)

    return false

  }

}

/* ============================================================
 * Report
 * ============================================================
 */

function saveReport(report) {

  const data = Report.createReport(report)

  replaceReport(data)

  return data

}

function replaceReport(report) {

  set(

    STORAGE_KEY.REPORT,

    report

  )

  return report

}

function getReport() {

  return get(

    STORAGE_KEY.REPORT,

    Report.createEmptyReport()

  )

}

function removeReport() {

  return remove(

    STORAGE_KEY.REPORT

  )

}

/* ============================================================
 * History
 * ============================================================
 */

function saveHistory(report) {

  const history = getHistory()

  history.unshift(

    Report.createReport(report)

  )

  replaceHistory(history)

  return history

}

function replaceHistory(history = []) {

  set(

    STORAGE_KEY.HISTORY,

    history

  )

  return history

}

function getHistory() {

  return get(

    STORAGE_KEY.HISTORY,

    []

  )

}

function clearHistory() {

  return remove(

    STORAGE_KEY.HISTORY

  )

}

/* ============================================================
 * User
 * ============================================================
 */

function saveUser(user) {

  replaceUser(user)

  return user

}

function replaceUser(user) {

  set(

    STORAGE_KEY.USER,

    user

  )

  return user

}

function getUser() {

  return get(

    STORAGE_KEY.USER,

    {}

  )

}

function removeUser() {

  return remove(

    STORAGE_KEY.USER

  )

}

module.exports = {

  /* 基础 */

  set,

  get,

  remove,

  clear,

  /* Report */

  saveReport,

  replaceReport,

  getReport,

  removeReport,

  /* History */

  saveHistory,

  replaceHistory,

  getHistory,

  clearHistory,

  /* User */

  saveUser,

  replaceUser,

  getUser,

  removeUser

}
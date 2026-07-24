// import E8 from '../project.config.js'
const E8 = getApp().globalData

const DEV_MODE = false

const logLevel = Object.freeze({
  info: 'info',
  error: 'error'
})

const MAX_SIZE = 20

const pool = {

  __logs__: [],

  size: function () {
    return this.__logs__.length
  },

  info: function (msg) {
    if (DEV_MODE) {
      logDebug('info', msg)
      return
    }

    const pool$logs = this.__logs__
    pool$logs.push({
      date: now(), msg, level: logLevel.info
    })

    if (pool$logs.length >= MAX_SIZE) {
      this.persist()
    }
  },

  error: function ({ method, errorMsg, user, api }) {
    if (DEV_MODE) {
      logDebug('error', `method: ${method}, errorMsg: ${errorMsg}`)
    }

    const pool$logs = this.__logs__
    pool$logs.push({
      date: now(),
      level: logLevel.error,
      user: user,
      msg: JSON.stringify({ method, errorMsg, api })
    })

    if (pool$logs.length >= MAX_SIZE) {
      this.persist()
    }
  },

  persist: function () {
    const { brand = '', model = '', version = '', system = '', platform = '', SDKVersion = '' } = wx.getSystemInfoSync()

    const pool$logs = this.__logs__.splice(0, MAX_SIZE).map(e => {
      return Object.assign(e, {
        brand, model, system, platform,
        wx_version: version,
        sdk_version: SDKVersion,
        app: E8.app_name
      })
    })
    for (let i = 0; i < pool$logs.length; i++) {
      wx.request({
        url: 'https://www.boudata.com/tss/xdata/wx_log',
        header: { "content-type": "application/x-www-form-urlencoded" },
        method: 'POST',
        data: pool$logs[i]
      })
    }
  }
}

function now() {
  const now = new Date()
  return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
}

function logDebug(logType, msg) {
  console.log(`[${logType}]: ${msg} (${now()})`)
}

export default pool
/**
 * @description
 * 提示框
 * 
 * @param {String} content - 提示框显示的内容
 * @param {Object} confirm - 点击确定按钮执行的方法 (nullable)
 * @param {Object} cancel - 点击取消按钮执行的方法 (nullable)
 * 
 * @example
 * notice('msg', () => { doConfirm() }, () => { doCancel() })
 * notice(
 *   'msg',
 *   { text: '是', handler: () => { doConfirm() } },
 *   { text: '否', handler: () => { doCancel() } }
 * )
 */
const notice = function (content, confirm, cancel) {
  var confirm$handler, cancel$handler,
      confirm$text = '确定', cancel$text = '取消'

  if (typeof confirm === 'function') {
    confirm$handler = confirm
  } else if (typeof confirm === 'object') {
    confirm$handler = confirm.handler
    confirm$text = confirm.text
  } else {

  }

  if (typeof cancel === 'function') {
    cancel$handler = cancel
  } else if (typeof cancel === 'object') {
    cancel$handler = cancel.handler
    cancel$text = cancel.text
  } else {

  }

  wx.showModal({
    title: '提示',
    content: content,
    showCancel: typeof cancel !== 'undefined',
    confirmText: confirm$text,
    cancelText: cancel$text,
    success: res => {
      if (res.confirm) {
        confirm$handler && confirm$handler()
        return
      }
      if (res.cancel) {
        cancel$handler && cancel$handler()
        return
      }
    }
  })
}

/**
 * @description
 * 错误提示框
 * 
 * @param {String} content - 提示框现实的内容 (nullable)
 */
const error = function (content) {
  if (typeof content === 'undefined') {
    wx.showToast({
      title: '出错了',
      image: '/images/icon-error.png',
      mask: true
    })
    return
  }
  wx.showModal({
    title: '出错了',
    content: content,
    showCancel: false,
    success: res => {
    }
  })
}

module.exports = { notice, error }
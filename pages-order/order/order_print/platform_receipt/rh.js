/**
 * 生成指定区域内水平居中的 CPCL 文本指令。
 *
 * @param {string|number} data 文本内容
 * @param {number} font CPCL 字体编号
 * @param {number} x 区域起始横坐标
 * @param {number} y 文本纵坐标
 * @param {number} width 区域宽度
 * @param {number} mag 字体放大倍数
 * @returns {string} CPCL 文本指令
 */
function dataCenter(data, font, x, y, width, mag = 1) {
  const fontWidth = font === 1 ? 24 : (font === 4 ? 32 : (font === 3 ? 20 : 16))
  let textWidth = 0
  String(data || '').split('').forEach(item => {
    textWidth += /[\u4e00-\u9fa5]/.test(item) ? fontWidth * mag : fontWidth * mag / 2
  })
  const textX = Math.max(x, Math.round(x + (width - textWidth) / 2))
  return `TEXT ${font} 0 ${textX} ${y} ${data || ''}\r\n`
}

/**
 * 生成融辉物流 75mm * 90mm 平台回单的 CPCL 打印数据。
 *
 * @param {Array<Object>} data 订单打印数据
 * @returns {Array<string>} 每张回单对应的 CPCL 指令
 */
export const printData = (data) => {
  const allData = []

  data.forEach(orderData => {
    const platformData = orderData.platform_info || {}
    const backTip = platformData.back_tip || '回'
    const receiptCode = platformData.BC_r_code || ''
    const orderDate = platformData.order_date || orderData.order_date
    const sendSite = platformData.sendSite || ''
    const sendSiteTwo = orderData.customer_name || ''
    const destName = platformData.destName || ''
    const destNameTwo = orderData.receive_man || ''
    const billCode = platformData.billCode || ''
    const amount = orderData.amount2 || platformData.amount2 || (orderData.amount ? `${orderData.amount}件` : '')
    const weightValue = orderData.weight || platformData.weight || ''
    const weight = weightValue && !/kg$/i.test(String(weightValue)) ? `${weightValue}KG` : weightValue

    allData.push(
      "! 0 200 200 708 1\r\n" +
      "PAGE-WIDTH 600\r\n" +
      "LINE 0 188 596 188 1\r\n" +
      "SETMAG 2 2\r\n" +
      `TEXT 3 0 110 206 ${sendSite}\r\n` +
      `TEXT 3 0 110 350 ${destName}\r\n` +
      "LINE 92 188 92 460 1\r\n" +
      "TEXT 3 0 26 214 寄\r\n" +
      "TEXT 3 0 26 268 件\r\n" +
      `TEXT 3 0 110 262 ${sendSiteTwo}\r\n` +
      "LINE 0 332 596 332 1\r\n" +
      "TEXT 3 0 26 358 派\r\n" +
      "TEXT 3 0 26 412 件\r\n" +
      `TEXT 3 0 110 406 ${destNameTwo}\r\n` +
      "LINE 0 460 596 460 1\r\n" +
      dataCenter(billCode, 3, 16, 513, 559, 2) +
      "LINE 0 592 596 592 1\r\n" +
      "LINE 300 592 300 708 1\r\n" +
      dataCenter(amount, 3, 0, 632, 300, 2) +
      dataCenter(weight, 3, 300, 632, 300, 2) +
      "SETMAG 1 1\r\n" +
      "BOX 0 54 600 708 1\r\n" +
      dataCenter(backTip, 4, 504, 0, 60) +
      "INVERSE-LINE 504 0 552 0 48\r\n" +
      (receiptCode ? 'BT 7 0 5\r\n' +
        `BARCODE 128 2 1 65 30 63 ${receiptCode}\r\n` +
        'BT OFF\r\n' : '') +
      `TEXT 3 0 17 161 录单时间：${orderDate}\r\n` +
      "FORM \r\n" +
      "PRINT \r\n"
    )
  })

  return allData
}
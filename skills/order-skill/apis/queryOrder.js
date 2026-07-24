//const tss = require("../../../utils/tss.js")
async function queryOrder({
  orderNo
}) {
  // return {
  //   isError: false,
  //   content: [{
  //     type: 'text',
  //     text: "已为您查询到订单信息"
  //   }],
  //   structuredContent: {}
  // }
  wx.request({
    url: `https://tms.boudata.com/tss/tms/order/anon/scanBackOrder?scanCode=${orderNo}`,
    success: res => {
      console.log("返回数据", res)
      if (res.statusCode === 200) {
        if (res.data.code == "0") {
          console.log("成功",res.data.data[0])
          return {
            isError: false,
            content: [{
              type: 'text',
              text: "已为您查询到订单信息"
            }],
            structuredContent: res.data.data[0]
          }
        }
      } else {
        return {
          isError: true,
          content: [{
            type: 'text',
            text: "订单查询失败，请稍后再试。"
          }]
        }
      }
    }
  })
}
export {
  queryOrder
}
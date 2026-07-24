
const defaulGridtList = (Pages = {}) => [
    { name: '批量下单', url: Pages.order_preorder, icon: 'scan' },
  { name: '扫码接单', url: Pages.order_accept, icon: 'scan' },
  { name: '扫码查单', url: Pages.order_query_route, icon: 'scan' },
  { name: '扫码打单', icon: 'scan', url: Pages.order_scan_print },
  { name: '我的订单', url: Pages.order_list, icon: 'form', app: 'eff' },
  { name: '我的订单', url: Pages.order_list, icon: 'form', app: 'e8_prod' },
  { name: '邀请客户录单', url: Pages.qrcode, icon: 'qr_code' },
  { name: '充值', url: Pages.topup, icon: 'pay', app: 'eff' },
  { name: '续期', url: Pages.renew, icon: 'pay', app: 'e8_prod' },
  // { name: '审批流', url: Pages.workflow, icon: 'post', color: '#5c96ec', app: 'e8_prod' }
  // { name: '报表', url: `${Pages.web}?type=reports`, icon: 'apps', color: '#e6833e' },
  // { name: '工作流', url: '', icon: 'squarecheck', color: '#e6833e' },
  // { name: '新手教程', url: Pages.learning, icon: 'video', color: '#e54d42' },
  // { name: '问题反馈', url: '', icon: 'question', color: '#5c96ec' },
]

const defaultMenuList = (Pages = {}) => [
  { name: '快速录单', code: '录单', icon: 'text', url: Pages.order },
  { name: '扫码查单', code: '查单', icon: 'scan', url: Pages.order_query_route },
  { name: '扫码录单', code: '扫码', icon: 'scan', url: Pages.order_scan },
]

// 获取配置的list
function getGridList(Pages) {
  let list = wx.getStorageSync('gridList')
  list ? list.forEach(item => item.url = Pages[item.url]) : ''
  return list.length ? list : defaulGridtList(Pages)
}

function getMenuList(Pages) {
  let list = wx.getStorageSync('menuList')
  return list ? list : defaultMenuList(Pages)
}

export {
  getGridList, getMenuList
}
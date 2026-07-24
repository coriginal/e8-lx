

const typeObj = {
  '中转': {
    addr: 'receive_addr', confirm_title:'确认已经完成此次运输？',top_btn: {
      "地图": { icon: 'i-location', class: 'op_btn3', bindtap: 'changeModal', useIfList: true },
      // "批量打印": { icon: 'i-punch', class: 'op_btn3', bindtap: 'batchPrint' },
      "显示已操作": {type:'switch', class: 'op_btn3 last_op_btn', bindtap: 'changeShow', useShow: true }
    },
    bottom_btn: {
      "运输完成": { class: 'op_btn1', bindtap: 'truckArrive' }
    }
  },
  '直送': {
    addr: 'receive_addr', confirm_title: '确认已到达最终目的地？', top_btn: {
      "地图": { icon: 'i-location', class: 'op_btn3', bindtap: 'changeModal', useIfList: true },
      // "批量打印": { icon: 'i-punch',class: 'op_btn3', bindtap: 'batchPrint' },
      "显示已操作": { type: 'switch', class: 'op_btn3 last_op_btn', bindtap: 'changeShow', useShow: true }
    },
    // bottom_btn: {
    //   "已到达": { class: 'op_btn1 last_op_btn', bindtap: 'truckArrive' }
    // } 
  },
  '整车': {
    addr: 'receive_addr', confirm_title: '确认已到达最终目的地？',top_btn: {
      "地图": { icon: 'i-location', class: 'op_btn3', bindtap: 'changeModal', useIfList: true },
      // "批量打印": { icon: 'i-punch',class: 'op_btn3', bindtap: 'batchPrint' },
      "显示已操作": {type:'switch', class: 'op_btn3 last_op_btn', bindtap: 'changeShow', useShow: true }
    },
    // bottom_btn: {
    //   "已到达": { class: 'op_btn1 last_op_btn', bindtap: 'truckArrive' }
    // } 
    }
}
const flexObj = {
  '中转': { num: '票数：', amount: '件数：', volume: '体积：', weight: '重量：'},
  '整车': { num: '票数：', amount: '件数：', volume: '体积：', weight: '重量：' }
}
const flexTagObj = {
  'start': { 'settle_type': { color: 'red', value: '现付', title: '现付' } },
  'end': { 'rcode_type': { title: '回单', color: 'cyan' }, 'upstairs_type': { title: '上楼', color: 'green' }, 'settle_type': { color: 'red', value: '到付', title: '到付' }, 'arrive_pay': { title: '到付', color: 'geekblue' }, 'cod': { title: '代收货款', color: 'red' } }
}

module.exports = {
  flexObj,
  typeObj,
  flexTagObj
}
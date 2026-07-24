
const typeObj = {
  '提货': {   
    status_code: 203,
    top_btn: {
      // 打印: { class: 'op_btn', bindtap: 'print' },
      "异常提报": { class: 'text-abnormal', bindtap: 'report_abnormal' },
      "查看更多": { class: 'text-more', bindtap: 'viewOrder' },
      
    },
    bottom_btn: {
      "确认取件": { class: 'done_btn', bindtap: 'pickorder' }
    },
    other_top_btn: {
      // 打印: { class: 'op_btn', bindtap: 'print', data: ['id'] },
      "查看更多": { class: 'text-more', bindtap: 'viewOrder', data: ['id'] }
    }
  },
  '派送': {
    status_code: 624,
    top_btn: {
      // 打印: { class: 'op_btn', bindtap: 'print' },
      "异常提报": { class: 'text-abnormal', bindtap: 'report_abnormal' },
      "查看更多": { class: 'text-more', bindtap: 'viewOrder' },
    },
    bottom_btn: {
      "确认签收": { class: 'done_btn', bindtap: 'signorder' }
    },
    other_top_btn: {
      // 打印: { class: 'op_btn', bindtap: 'print', data: ['id'] },
      "查看更多": { class: 'text-more', bindtap: 'viewOrder', data: ['id'] }
    }
  },
  '直送':{
    status_code:624,
    top_btn: {
      // 打印: { class: 'op_btn', bindtap: 'print' },
      "异常提报": { class: 'text-abnormal', bindtap: 'report_abnormal' },
      "查看更多": { class: 'op_btn', bindtap: 'viewOrder' },
      
    },
    other_top_btn: {
      // 打印: { class: 'op_btn', bindtap: 'print', data: ['id'] },
      "查看更多": { class: 'op_btn', bindtap: 'viewOrder', data: ['id'] }
    },
    bottom_btn: {
      "确认取件": { class: 'done_btn done_btn_left', bindtap: 'pickorder' },
      "确认签收": { class: 'done_btn done_btn_right', bindtap: 'signorder' }
    }
  }
}

const orderList = [
  { id: 1, code: '00000000', tag: '急', cargo: '纸巾', customer_name: '华美大佬', send_addr: '浙江省杭州市江干区寄件地址录单地址笔记哦啊长', status: '新建', remark: '我是0号备注', weight: '23', amount: 9, volume: '98', settle_type: '现付', rcode_type: '纸质回单', arrive_pay: '400', upstairs_type: '大件上楼', cod: '400' },
  { id: 2, code: '11111111', customer_name: '信息电子', send_addr: '浙江省杭州市江干区寄件地址录单地址', status: '新建', weight: '23', amount: 9, volume: '98' },
  { id: 3, code: '22222222', customer_name: '部署科技', send_addr: '浙江省杭州市江干区寄件地址录单地址', status: '新建', remark: '我是2号备注', weight: '23', amount: 9, volume: '98' },
  { id: 4, code: '33333333', tag: '需确认件数', customer_name: '名字很长的客户', send_addr: '浙江省杭州市江干区寄件地址录单地址', status: '新建', weight: '23', amount: 9, volume: '98' },
  { id: 5, code: '44444444', customer_name: '小新', send_addr: '浙江省杭州市江干区寄件地址录单地址', status: '新建', weight: '23', amount: 9, volume: '98' },
  { id: 6, code: '55555555', customer_name: '打针', send_addr: '杭州华美科创园', status: '新建', remark: '我是5号备注特别长的备注特别长的备注特别长的备注特别长的备注特别长的备注特别长的备注特别长的备注', weight: '23', amount: 9, volume: '98' },
];
const flexObj = {
  '提货': { cargo: '', amount: '件', volume: '方', weight: '千克', type: '' },
  '派送': { cargo: '', amount: '件', volume: '方', weight: '千克' },
  '直送': { cargo: '', amount: '件', volume: '方', weight: '千克' }
}
const flexTagObj = {
  '提货': { 'settle_type': { color: 'red', value: '现付' } },
  '派送': { 'settle_type': { color: 'red', value: '到付' }, 'arrive_pay': { title: '到付款', color: 'geekblue' },'rcode_type': { title: '', color: 'cyan' }, 'upstairs_type': { title: '', color: 'green' },  'cod': { title: '代收货款', color: 'red' } },
  '直送': { 'settle_type': { color: 'red'}, 'arrive_pay': { title: '到付款', color: 'geekblue' }, 'rcode_type': { title: '', color: 'cyan' }, 'upstairs_type': { title: '', color: 'green' }, 'cod': { title: '代收货款', color: 'red' } }
}

module.exports = {
  orderList,
  flexObj,
  typeObj,
  flexTagObj
}
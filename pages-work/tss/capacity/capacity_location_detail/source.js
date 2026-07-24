
const typeObj = {
  'start': {
    title: 'send_site',
    addr_col:'send_addr',
    addr_pic:'../../../../images/send.png',
    status_code: 203,
    top_btn: {
      "地图": {icon:'i-location', class: 'op_btn2', bindtap: 'changeModal', useIfList: true },
      // "批量操作": {icon: 'i-punch', class: 'op_btn3', bindtap: 'batchTodo'},
      "显示已取": {type:'switch', class: 'op_btn2 last_op_btn', bindtap: 'changeShow', useShow: true }
    },
    bottom_btn: {
      "到达仓库": { class: 'op_btn1', bindtap: 'pickTruckArrive' }
    },
    batch_btn: {
      "批量打印": { class: 'op_btn2', bindtap: 'batchPrint' },
      "批量移除": { class: 'op_btn2 middle_op_btn', bindtap: 'batchRemove' ,if_op: true},
      "批量取件": { class: 'op_btn2 last_op_btn', bindtap: 'batchPick' }
    }
  },
  'end': { 
    title: 'receive_site',
    addr_col: 'receive_addr',
    addr_pic: '../../../../images/receive.png',
    status_code: 624,
    top_btn: {
      "地图": { icon: 'i-location', class: 'op_btn2', bindtap: 'changeModal', useIfList: true },
      // "批量操作": { icon: 'i-punch', class: 'op_btn3', bindtap: 'batchTodo' },
      "显示已送": { type: 'switch', class: 'op_btn2 last_op_btn', bindtap: 'changeShow', useShow: true }
    }
    ,bottom_btn: {
      "全部派送完成": { class: 'op_btn1', bindtap: 'batchSign' }
    }
    ,batch_btn: {
      "批量打印": { class: 'op_btn2', bindtap: 'batchPrint' },
      "批量移除": { class: 'op_btn2 middle_op_btn', bindtap: 'batchRemove', if_op: true },
      "批量派送": { class: 'op_btn2 last_op_btn', bindtap: 'batchSign' }
    }
    }
}
const orderList = [
  { id: 1, code: '00000000', tag: '急', cargo: '纸巾', customer_name: '华美大佬', send_addr: '浙江省杭州市江干区寄件地址录单地址笔记哦啊长', status: '新建', remark: '我是0号备注', weight: '23', amount: 9, volume: '98', settle_type: '现付', rcode_type: '纸质回单', arrive_pay: '400', upstairs_type: '大件上楼', cod:'400'},
  { id: 2, code: '11111111', customer_name: '信息电子', send_addr: '浙江省杭州市江干区寄件地址录单地址', status: '新建',  weight: '23', amount: 9, volume: '98' },
  { id: 3, code: '22222222', customer_name: '部署科技',send_addr: '浙江省杭州市江干区寄件地址录单地址', status: '新建', remark: '我是2号备注', weight: '23', amount: 9, volume: '98' },
  { id: 4, code: '33333333', tag:'需确认件数',customer_name: '名字很长的客户',send_addr: '浙江省杭州市江干区寄件地址录单地址', status: '新建', weight: '23', amount: 9, volume: '98' },
  { id: 5, code: '44444444', customer_name: '小新',send_addr: '浙江省杭州市江干区寄件地址录单地址', status: '新建', weight: '23', amount: 9, volume: '98' },
  { id: 6, code: '55555555', customer_name: '打针',send_addr: '杭州华美科创园', status: '新建', remark: '我是5号备注特别长的备注特别长的备注特别长的备注特别长的备注特别长的备注特别长的备注特别长的备注', weight: '23', amount: 9, volume: '98' },
];
const flexTagObj = {
  'start': { 'settle_type': { color: 'red', value: '现付',title:'现付' }},
  'end': { 'rcode_type': { title: '回单', color: 'cyan' }, 'upstairs_type': { title: '上楼', color: 'green' }, 'settle_type': { color: 'red', value: '到付',title:'到付'},'arrive_pay':{title:'到付',color:'geekblue'},'cod':{title:'代收货款',color:'red'} }
}

module.exports = {
  orderList,
  typeObj,
  flexTagObj
}
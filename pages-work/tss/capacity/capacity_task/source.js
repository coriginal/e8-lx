const TaskStatusColor = {
  '待接单': 'green',
  '已接单': 'cyan',
  '已出发': 'blue',
  '已到达': 'green',
  '完成': 'gold'
}
const typeObj ={
  '中转': { color: 'green', name: '转', head_name: 'line_name', url:'../capacity_location/index'},
  '提货': { color: 'cyan', name: '提', head_name: 'area', url: '../capacity_detail/index'},
  '派送': { color: 'gold', name: '派', head_name: 'area', url: '../capacity_detail/index'},
  '直送': { color: 'red', name: '直', head_name: 'line_name', url: '../capacity_location/index' },
  '整车': { color: 'pink', name: '整', head_name: 'line_name', url: '../capacity_location/index'}
}
const taskList = [
  { id: 1, code: '00000000', type: '提货', status: '待接单', remark: '我是0号备注', line: '杭州-上海', num: 4, amount: 9, area1: '江干区', plan_arrive_time: '2019-09-09 12:00:00', plan_depart_time: '2019-09-08 13:13:13'},
        {id: 2, code: '111111111', type: '干线', status:
      '已出发', remark: '我是1号备注', line: '杭州-北京', num: 20, ps: 9, plan_arrive_time: '2019-09-09 12:00:00',plan_depart_time:'2019-09-08 13:13:13'
  }
    ];
const tableObj = {
  '中转': { num: '票数：', plan_depart_time:'时效：' },
  // '中转': { num: '订单数量：', plan_depart_time: '计划出发时间', plan_arrive_time: '计划到达时间' },
  '提货': { num: '票数：' },
  '派送': { num: '票数：' },
  '直送': { num: '票数：' },
  '整车': { num: '票数：', plan_depart_time: '时效：' },
      };
const flexObj = {
  '中转': { amount: '件', weight: 'KG', volume: '方', plate_num: '' },
  '提货': { amount: '件', weight: 'KG', volume: '方', plate_num: '' },
  '派送': { amount: '件', weight: 'KG', volume: '方', plate_num: '' },
  '直送': { amount: '件', weight: 'KG', volume: '方', plate_num: '' },
  '整车': { amount: '件', weight: 'KG', volume: '方', plate_num: '' },
      };

module.exports = {
  TaskStatusColor,
  taskList,
  tableObj,
  flexObj,
  typeObj
}
const _APP = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
import {
  $wuxDialog
} from '../../../../components/index'
import {
  formatDate
} from '../../../../utils/util.js'

Page({

  data: {
    statusColor: require('../capacity_task/source.js').TaskStatusColor,
    tableObj: require('../capacity_task/source.js').tableObj,
    flexObj: require('../capacity_task/source.js').flexObj,
    typeObj: require('../capacity_task/source.js').typeObj,
    tabs: [{
        title: '待接单',
        code: 'tab1',
        params: {
          "status": "待接单",
          "create_from": formatDate(new Date(new Date() - 7 * 24 * 1000 * 60 * 60), 'yyyy-MM-dd')
        },
        count: ''
      },
      {
        title: '进行中',
        code: 'tab2',
        params: {
          "tasking": true,
          // "create_from": formatDate(new Date(new Date() - 7 * 24 * 1000 * 60 * 60), 'yyyy-MM-dd')
        },
        count: ''
      },
      {
        title: '已完成',
        code: 'tab3',
        params: {
          "status": "已到达",
          // "create_from": formatDate(new Date(new Date() - 7 * 24 * 1000 * 60 * 60), 'yyyy-MM-dd')
        },
        count: ''
      },
    ],
    tab_current:'tab1',
    rows:10,
    page:1,
    taskList:[],
    TaskStatusColor:{
      '待接单': 'green',
      '已接单': 'cyan',
      '已出发': 'blue',
      '已到达': 'green',
      '完成': 'gold'
    }
  },

  onLoad: function (options) {
    console.log(options)
    let params = this.data.tabs[0].params
    // if (JSON.parse(options._data || "[]")) {
      this.setData({
        sub_orders: JSON.parse(options._data || "[]"),
        if_op:options.if_op
      })
    // }
    this.queryTaskList(params)
    let { from_page } = options
    this.setData({
      from_page
    })
  },
  onReady(){
    lc.addListener('back_task_version', this.__wxWebviewId__.toString(), res => {
      console.log(res)
      this.data.taskList.forEach((i,v)=>{
        if(i.id == res.id){
          this.setData({
            [`taskList[${v}].version`]:res.version
          })
        }
      })
    })
  },
  queryTaskList(params = {}) {
    params.page = this.data.page
    params.rows = this.data.rows
    console.log(params)
    tss.query({
      url: tss.url('sql') + 'task',
      params,
      completion: res => {
        console.log(res)
        wx.hideLoading()
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
        }
        this.setData({
          taskList: [...this.data.taskList,...res.data.rows.map(item => this.dealData(item))]
        })
      }
    })
  },
  onChangeTabs({ detail }) {
    this.setData({
      tab_current: detail.key,
      page:1,
      taskList:[]
    })
    console.log(detail)
    let params = this.data.tabs.find(i => i.code == detail.key).params

    this.queryTaskList({
      ...this.data.q_params,
      ...params
    })
  },
  dealData(data) {
    return {
      ...data,
      plan_depart_time: `${data.plan_depart_time ? formatDate(data.plan_depart_time, 'MM-dd hh:mm') : '出发'} ～ ${data.plan_arrive_time ? formatDate(data.plan_arrive_time, 'MM-dd hh:mm') : '到达'}`,
      // plan_depart_time: formatDate(data.plan_depart_time, 'MM-dd hh:mm'),
      carInfo: `${data.driver || ''} ${data.plate_num || ''}`,
      cargoInfo: `${data.amount || ''} 件 / ${Math.round(data.weight * 100) / 100 || ''} kg / ${data.volume || ''} m³`
    }
  },
  sendMessageAgain(e) {
    let {
      id: share_task_id,
      code: share_task_code
    } = e.currentTarget.dataset
    this.setData({
      share_task_id
    })
    $wuxDialog().open({
      resetOnClose: true,
      title: `任务单号：${share_task_code}`,
      content: '是否再次通知给司机',
      buttons: [{
          text: '取消'
        },
        {
          text: '确定',
          type: 'primary',
          openType: 'share'
        },
      ],
    })
  },
  onShareAppMessage() {
    return {
      title: '运营给您调度了新的订单！',
      // imageUrl: this.data.shareImage,
      path: `${Pages.redirect}?pid=40&params=${JSON.stringify({task_id:this.data.share_task_id})}`
    }
  },
  goDetail(e) {
    const dataset = e.currentTarget.dataset;
    const task_id = dataset.id;
    wx.navigateTo({
      url: `${Pages.arrange}?page_from=task&task_id=${task_id}`,
    })
  },
  onReachBottom(){
    this.data.page ++ 
    let params = this.data.tabs.find(i => i.code == this.data.tab_current).params
    this.queryTaskList({
      ...this.data.q_params,...params
    })
  },
  querySubOrders(task_id) {
    return new Promise(completion=>{
      tss.query({
        // url: tss.url('sql') + 'tms_sub_code',
        // params: { task_id },
        url: tss.url('') + `/tms/task/${task_id}/subOrder2`,
        completion
      })
    })
  },
  doTask(e){
    const { id: taskId } = e.currentTarget
    let { code:task_code } = e.currentTarget.dataset
    let params = this.data.taskList.find(item => taskId == item.id)
    this.querySubOrders(taskId)
    .then(res=>{
      if(res.failed){
        wx.showModal({ content: `获取运输单详情失败。${res.errorMsg}`,showCancel:false})
        return
      }
      let task_sub_orders = res.data
      params.sub_orders = JSON.stringify([...task_sub_orders, ...this.data.sub_orders].map(i => ({ id: i.id })))
      console.log(params)
      tss.post({
        url: tss.url('') + '/tms/task',
        params,
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.showModal({ content: res.errorMsg })
            return
          }
          // wx.redirectTo({ url: Pages.task })
          this.setData({ sub_orders:[] })
          wx.showToast({ title: '调度成功', icon: 'none', duration: 3000 })
          task_code ? this.data.created_task_code = task_code:''
          // this.sendMessageAgain(taskId,()=>{
          //   lc.emitEvent('task_arrange', { msg:'success' })
          //   setTimeout(()=>{ wx.navigateBack() },1000)
          // })
          $wuxDialog().open({
            resetOnClose: true,
            title: `任务单号：${task_code}`,
            content: '是否再次通知给司机',
            buttons: [{
                text: '返回',
                onTap:() => wx.navigateBack()
              },
              {
                text: '确定',
                type: 'primary',
                openType: 'share'
              },
            ],
          })
          // this.queryTaskList(this.data.q_params)
        }
      })
    })
  },
  taskFeeConfirm(e){
    const { item } = e.currentTarget.dataset
    const { ...task } = item
    wx.navigateTo({
      url: `${Pages.task_feeinfo_total}?origin=task&task=${JSON.stringify(task)}`,
    })
  }
})
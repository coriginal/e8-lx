const _App = getApp().globalData
const lc = require('../../../../utils/listenerCenter.js')
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')

Component({
  externalClasses: ['udf_btn_class'],
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    type:{
      type:String,
      value:''
    },
    task_id:{
      type:Number,
      value:''
    },
    order_id:{
      type:Number,
      value:''
    },
    task_type:{
      type:String,
      value:''
    },
    timestamp:{
      type:Number,
      value:''
    },
    recordid:{
      type:Number,
      value:''
    }
  },

  data: {
    list: [],
  //     { id: 2, text: '车子装不下', out_task: true },
  // { id: 3, text: '客户不在家', out_task: true },
  // { id: 1, text: '客户取消订单', out_task: true, cancel_order: true },
  // { id: 7, text: '货物破损' },
  // { id: 6, text: '其他', out_task: false }
    abnormal_id:'',
    reason:'',
    show: false
  },

  lifetimes: {
    // 获取从各个页面返回的订单信息
    attached: function () {
      lc.addListener('orderInfo', this.__wxWebviewId__.toString(), res => {
        
      })
    },
    ready() {
      //如果是客户则进行查询 如果非客户则开启客户选择列表
      console.log('ready')
    },
    detached: function () {
      console.log('detached')
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    showAbnormal(e){
      tss.query({
        url: tss.url('sql') + 'abnormal_define',
        params: { type: this.data.task_type},
        completion: res => {
          if (res.failed) {
            alert.notice('获取数据失败。' + (res.errorMsg || ''))
            return
          }
          console.log(res.data)
          this.setData({
            list:res.data,
            show: true
          })
        }
      })
    },
    hideModal(e) {
      this.setData({
        show: false
      })
    },
    addattach(e) {
      console.log(e, e.detail._tempID)
      this.setData({
        timestamp: e.detail._tempID
      })
    },
    // 获取当前页填写的表单信息
    reasonInput(e){
      this.data.reason = e.detail.value
    },
    radioChange: function (e) {
      this.setData({
        abnormal_id:e.detail.value
      })
    },
    reportAbnormal(e){
      const ab_id = this.data.abnormal_id
      if (ab_id){
        tms.saveWithAddr({
          url: tss.url('tms') + '/task/report_abnormal',
          params: { type: this.data.type, task_id: this.data.task_id, order_id: this.data.order_id, abnormal_id: ab_id, reason: this.data.reason,tempid:this.data.timestamp},
          completion: res => {
            console.log(res)
            if (res.errorMsg) {
              alert.notice(res.errorMsg)
            }
            else {
                wx.showToast({
                  title: '异常提报成功'
                })
                this.setData({
                  attachURLs:[],
                  show: false
                })
              this.triggerEvent('report', res.data)
            }
          }
        })
      }
      else{
        alert.notice('请先选择异常原因')
        this.triggerEvent('report', { test:'test' })
      }
    },
    forbidBubble(e){
      console.log(e)
    }
  },

})

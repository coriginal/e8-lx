import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')
import {
  $wuxDialog
} from '../../../components/index'
import {
  numberRound10
} from '../../../utils/util.js';
const _App = getApp().globalData

Page({

  data: {
    settle_account_id:''
  },

  onLoad: function (options) {
    this.setData({
      list: JSON.parse(options.list),
      type: options.type
    })
    this.data.orderId = options.orderId || ''
    this.data.taskId = options.taskId || ''
    this.data.task = options.task ? JSON.parse(options.task) : {}
    this.data.fin_list = JSON.parse(options.fin_list)
  },
  onUnload() {
    lc.removeListener('back_settle_account', this.__wxWebviewId__.toString())
  },
  onReady() {
    lc.addListener('back_settle_account', this.__wxWebviewId__.toString(), res => {
      const {
        settle_account_name,
        settle_account_id
      } = res
      this.setData({
        settle_account_name,
        settle_account_id
      })
    })
  },
  chooseItem(e) {
    const {
      item
    } = e.currentTarget.dataset
    this.data.item = item
    $wuxDialog().prompt({
      ...options(item, this),
      defaultText: this.data.submit_money,
      cancelText: this.data.type == 'cost' ? '新增并报销' : '取消',
      buttons: buttonOptions(this.data.type, this, item)
    })
  },
  createFeeAndSpFee(fee_id) {
    let param = {}
    if(this.data.taskId){
      param = {
        fee_id,
        settle_account_id:this.data.settle_account_id,
        origin_id:this.data.taskId,
        _flowType:'task',
        add:true
      }
    }else{
      param = {
        fee_id,
        origin_id:this.data.orderId ,
        add_fee_flow: '是',
        type: this.data.orderId ? 'order' : 'task'
      }
    }
    this.setData({
      param,
      show_pop: true
    })
  },
  changePopShow(e) {
    console.log(e)
    this.setData({
      show_pop: e.detail.visiale
    })
    lc.emitEvent('back_fee_info')
  },
  chooseLcName() {
    wx.navigateTo({
      url: `${Pages.router_connect_1}?type=create_new_fee`,
    })
  },
  createFeeItem(finFlows) {
    console.log(finFlows)
    wx.showLoading({
      mask: true
    })
    let url 
    let params = {}
    if(this.data.taskId){
      url = '/tms/task/save_task_fee'
      params = {
        // ...this.data.task,
        task_id:this.data.taskId,
        fees : JSON.stringify(finFlows)
      }
    }
    if(this.data.orderId){
      url = '/tms/fin/save_order_fees'
      params.order_id = this.data.orderId
      params.fees = JSON.stringify(finFlows)
    }
    tss.post({
      url: tss.url('') + url,
      params,
      completion: res => {
        if (res.failed) {
          wx.hideLoading()
          errorAlert(res.errorMsg)
          return
        }
        wx.hideLoading()
        lc.emitEvent('back_fee_info')
        wx.navigateBack()
      }
    })
  }
})


const buttonOptions = (type, this_, item) => {
  if (type == 'cost') {
    if (this_.data.taskId) {
      return [
        {
          text: '新增并报销',
          type: 'red',
          onTap: e => {
            this_.setData({
              submit_money: e._response
            })
            this_.createFeeAndSpFee(item.subject_id)
          },
        },
        {
          text: '确定',
          type: 'primary',
          onTap(e) {
            console.log(e, '新增')
            let finFlows = this_.data.fin_list.map(item => ({
             ...item,
            }))
            finFlows.push({
              "type": item.type,
              "fee_id": item.subject_id,
              "fee": e._response,
              "settle_account_id": this_.data.settle_account_id,
              "fee_name":item.subject_name
            })
            this_.createFeeItem(finFlows)
          },
        },
      ]
    } else {
      return [{
        text: '新增并报销',
        type: 'red',
        onTap: e => {
          this_.setData({
            submit_money: e._response
          })
          this_.createFeeAndSpFee(item.subject_id)
        },
      },
      {
        text: '确定',
        type: 'primary',
        onTap(e) {
          console.log(e, '新增')
          let finFlows = this_.data.fin_list
          finFlows.push({
            "type": item.type,
            "fee_id": item.subject_id,
            "fee": e._response,
            "settle_account_id": this_.data.settle_account_id||'',
            "origin": "order_write",
            "if_pay": ""
          })
          this_.createFeeItem(finFlows)
        },
      },
      ]
    }
  }
  else {
    return [{
      text: '取消',
      type: 'default',
      onTap: e => {
        console.log('取消')
      },
    },
    {
      text: '确定',
      type: 'primary',
      onTap(e) {
        console.log(e, '新增')
        let finFlows = this_.data.fin_list
        finFlows.push({
          "type": item.type,
          "permission":item.permission,
          "fee_id": item.subject_id,
          "fee": e._response,
          "fee_id_edit":true,
          "origin": "order_write",
          "if_pay": ""
        })
        this_.createFeeItem(finFlows)
      },
    },
    ]
  }
}


const options = (item, this_) => ({
  resetOnClose:false,
  maskClosable: true,
  focus: true,
  title: `【${item.type == 'cost' ? '成本项' : '收入项'}】- ${item.subject_name}`,
  content: `请输入${item.subject_name}`,
  fieldtype: 'digit',
  maxlength: 10,
  confirmText: '新增'
})

const errorAlert = (content) => {
  wx.showModal({
    content,
    showCancel: false
  })
}
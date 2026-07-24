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
    submit_money:''
  },

  onLoad: function (options) {
    console.log(options)
    const list = JSON.parse(options.data)
    const spItems = JSON.parse(options.spItems)
    this.data.fin_list = JSON.parse(options.fin_list)
    this.setData({
      title: options.type == 'cost' ? `成本项 ` : `收入项 `,
      list: list.map(i => ({
        ...i,
        edit: !i.fk_id  && i.status !== '通过'
      })),
      spItems,
      type: options.type,
      taskId: options.taskId,
      orderId: options.orderId
    })
    this.computedTotal(list)
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
      let list_id = `list[${this.data.item_idx}].settle_account_id`
      let list_name = `list[${this.data.item_idx}].settle_account_name`
      this.setData({
        settle_account_name,
        settle_account_id,
        back: true,
        [list_id]: settle_account_id,
        [list_name]: settle_account_name
      })
    })
  },
  onShow() {
    if (this.data.back) {
      this.updateFees({
        currentTarget: {
          dataset: {
            item: this.data.list[this.data.item_idx],
            idx: this.data.item_idx
          }
        }
      })
      this.setData({
        back: false
      })
    }
  },
  computedTotal(list) {
    let total = list.map(i => Number(i.fee)).reduce((a, b) => a + b, 0)
    this.setData({
      total
    })
  },
  queryFeeItemDetail(){

  },
  // 订单费用报销
  doOrderSpFees(e){
    console.log(e)
    let param = {
      flowIds: e.currentTarget.dataset.flowId,
      origin_id: this.data.orderId,
      add_fee_flow: '否',
      type: 'order'
    }
    console.log(param)
    this.setData({
      submit_money:e.currentTarget.dataset.fee,
      param,
      show_pop: true,
      _spIdx:e.currentTarget.dataset.idx
    })
  },
  // doTaskSpFees运输单单项费用报销
  doTaskSpFees(e){
    const fee_id = e.currentTarget.dataset.id
    const feeFlowIds = e.currentTarget.dataset.flowId
    const idx =  e.currentTarget.dataset.idx
    // let param = {
      
    //   add_fee_flow
    // }
    
    let param = {
      flowIds:feeFlowIds,
      origin_id:this.data.taskId,
      _flowType:'task'
    }
    this.setData({
      submit_money:e.currentTarget.dataset.fee,
      param,
      show_pop: true,
      _spIdx:idx
    })

    console.log(feeFlowIds,fee_id)


  },

  // 新增并报销
  doSpFee(e) {
    let {
      id: add_fee_flow
    } = e.currentTarget
    let param = {}
    if(this.data.taskId){
      param = {
        fee_id:this.data.list[0].fee_id,
        settle_account_id:this.data.list[0].settle_account_id,
        origin_id:this.data.taskId,
        _flowType:'task',
        add:true
      }
    }else{
      param = {
        ...this.data.spItems,
        add_fee_flow
      }
    }
    this.setData({
      param,
      show_pop: true
    })
  },
  // 修改
  updateFees(e) {
   
    const {
      item,
      idx
    } = e.currentTarget.dataset
    this.setData({
      settle_account_name:item.settle_account_name,
      settle_account_id:item.settle_account_id
    })
    this.data.item = item
    this.data.item_idx = idx
    $wuxDialog().prompt({
      ...options(item),
      title: `【${this.data.type == 'cost' ? '成本项' : '收入项'}】- ${item.fee_name}`,
      defaultText: this.data.submit_money || '',
      onConfirm: (e, res) => {
        let list = `list[${idx}].fee`
        this.setData({
          [list]: Number(res),
          settle_account_name: '',
          settle_account_id: ''
        }, () => {
          this.doUpdate(item, res)
          this.computedTotal(this.data.list)
        })
      },
      onCancel: (e, res) => {
        this.setData({
          settle_account_name: '',
          settle_account_id: ''
        })
      }
    })
  },
  chooseLcName() {
    wx.navigateTo({
      url: `${Pages.router_connect_1}?type=create_new_fee`,
    })
  },
  // 更新费用
  doUpdate(item, fee) {
    console.log(item)
    wx.showLoading({
      mask: true
    })
    if(this.data.taskId){
      this.saveTaskFee()
      return
    }
    tss.post({
      url: tss.url('') + '/tms/fin/save_order_fee',
      params: {
        id:item.id,
        order_id: this.data.spItems.origin_id,
        fee_id: this.data.spItems.fee_id,
        fee,
        type: item.type,
        settle_account_id: item.settle_account_id
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.hideLoading()
          wx.showModal({
            showCancel: false,
            content: res.errorMsg
          })
          return
        }
        lc.emitEvent('back_fee_info')
        wx.showToast({
          title: '修改成功！'
        })
      }
    })
  },
  // 运输单费用修改
  saveTaskFee(){
    let fees = this.data.list
    console.log(fees)
    // return
    tss.post({
      url: tss.url('') + '/tms/task/save_task_fee',
      params: {
        task_id:this.data.taskId,
        fees:JSON.stringify(fees)
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.hideLoading()
          wx.showModal({
            showCancel: false,
            content: res.errorMsg
          })
          return
        }
        lc.emitEvent('back_fee_info')
        wx.showToast({
          title: '修改成功！'
        })
      }
    })
  },
  changePopShow(e) {
    console.log(e)
    this.setData({
      show_pop: e.detail.visiale,
      submit_money:''
    })
    if (e.detail.refresh) {
      lc.emitEvent('back_fee_info')
      if (e.detail.fee) {
        let list = this.data.list
        list[list.length] = {
          // fee_id: list[0].fee_id,
          fee: e.detail.fee,
          fee_name: list[0].fee_name,
          status:'审批中'
        }
        this.setData({
          list
        }, () => this.computedTotal(list))
      }else{
        let list1 = `list[${this.data._spIdx}].edit`
        let list2 = `list[${this.data._spIdx}].fk`
        this.setData({
          [list1]:false,
          [list2]:this.data.taskId?'tms_sp_task_fee':'tms_sp_order_fee'
        })
      }
    }
  },
})

const options = (item) => ({
  resetOnClose: true,
  maskClosable: false,
  focus: true,
  content: `请输入${item.fee_name}`,
  fieldtype: 'digit',
  maxlength: 10,
  // cancelText: `${item.type == 'cost'?'往来方':'取消'}`,
  cancelText: '取消',
  confirmText: '确定'
})
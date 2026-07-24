import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')
import { $wuxDialog } from '../../../components/index'
import { numberRound10 } from '../../../utils/util.js';
const _App = getApp().globalData;


Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { origin, task } = options
    this.data.task = JSON.parse(task)
    this.data.origin = origin
    this.beforeInitPage()
  },
  onReady() {

    wx.setNavigationBarTitle({
      title: `运输单号：${this.data.task.code}`
    })
    lc.addListener('back_fee_info', this.__wxWebviewId__.toString(), res => {
      this.initPage()
      this.data.task.version = this.data.task.version + 1
    })
  },

  beforeInitPage() {
    // 查询所有科目
    wx.showLoading({
      mask: true
    })
    queryAllFeeItems()
      .then(res => {
        console.log(res)
        this.data.allFeeItems = res.data
        // 查询角色对应科目
        queryOrderFeeList({
          origin: this.data.origin
        })
          .then(res => {
            console.log(res)
            this.data.allRoleFeeItems = res.data
            this.initPage()
          })
      })
  },
  // 初始化科目列表
  initPage() {
    // 运输单列表进来
    this.queryTaskFinFlows(this.data.task)
  },
  // 计算总和
  computedTotal(type = ['cost', 'income']) {
    type.forEach(item => {
      let list = this.data[`${item}_list`]
        .filter(i => i.value)
        .map(i => Number(i.value))
      this.setData({
        [`total_${item}`]: list.reduce((x, y) => x + y, 0).toFixed(2)
      })
    })
  },
  // 运输单费用详情
  queryTaskFinFlows(task) {
    tss.get({
      url: `${tss.url('')}/tms/fin/query_fin_task_flow?task_id=${task.id}`,
      completion: res => {
        if (res.failed) {
          errorAlert(res.errorMsg)
          return
        }
        this.data.taskMoneyDetail = res.data.map(i => ({
          ...i,
          permission: this.data.allRoleFeeItems.find(x => x.subject_id == i.fee_id) && this.data.allRoleFeeItems.find(x => x.subject_id == i.fee_id).permission
        }))
        console.log(res)
        let feeids = [...new Set(res.data.map(i => Number(i.fee_id)))]
        let list = feeids.map(i => ({
          permission: this.data.allRoleFeeItems.find(x => x.subject_id == i) && this.data.allRoleFeeItems.find(x => x.subject_id == i).permission,
          subject_id: i,
          subject_name: this.data.allRoleFeeItems.find(x => x.subject_id == i) && this.data.allRoleFeeItems.find(x => x.subject_id == i).subject_name,
          value: res.data.filter(x => x.fee_id == i).map(i => Number(i.fee)).reduce((a, b) => a + b, 0),
          type: this.data.allRoleFeeItems.find(x => x.subject_id == i) && this.data.allRoleFeeItems.find(x => x.subject_id == i).type,
        }))
        this.setData({
          income_list: _filter(list, 'income'),
          cost_list: _filter(list, 'cost')
        }, () => this.computedTotal(['cost']))
        wx.hideLoading()
      }
    })
  },
  // 添加一笔费用
  createFee(e) {
    let fee_ids = this.data[`${e.currentTarget.id}_list`].map(i => Number(i.subject_id))
    let _list = this.data.allRoleFeeItems
      .filter(i => i.permission == 2 && i.type == e.currentTarget.id)
    let fin_list = JSON.stringify(this.data.taskMoneyDetail)
    wx.navigateTo({
      url: `${Pages.create_new_fee}?list=${JSON.stringify(_list)}&fin_list=${fin_list}&taskId=${this.data.task.id || ''}&type=${e.currentTarget.id}&task=${JSON.stringify(this.data.task)}`
    })
  },
  // 本科目费用详情
  queryFeeItemDetail(e) {
    const {
      item,
      idx,
      type = 'cost'
    } = e.currentTarget.dataset
    this.setData({
      item,
      item_idx: idx
    })
    console.log(item, idx, type)
    let spItems = {
      fee_id: item.subject_id,
      origin_id: this.data.orderId,
      type: 'task'
    }
    console.log(spItems)
    let itemDetailList = this.data.taskMoneyDetail.filter(i => i.fee_id == item.subject_id)
    wx.navigateTo({
      url: `${Pages.feeitem_detail}?taskId=${this.data.task.id}&spItems=${JSON.stringify(spItems)}&data=${JSON.stringify(itemDetailList)}&type=${type}&fin_list=${JSON.stringify(this.data.taskMoneyDetail)}`,
    })
  },
  
  changePopShow(e) {
    console.log(e)
    this.setData({
      show_pop: e.detail.visiale
    })
    if (e.detail.refresh) {
      lc.emitEvent('back_fee_info')
      if (e.detail.fee) {
        let list = this.data.list
        list[list.length] = {
          // fee_id: list[0].fee_id,
          fee: e.detail.fee,
          fee_name: list[0].fee_name
        }
        this.setData({
          list
        }, () => this.computedTotal(list))
      }
    }
  },
})

const queryAllFeeItems = () => new Promise(completion => {
  tss.query({
    url: tss.url('') + '/tms/entity/ExpenseSubject',
    completion
  })
})

const queryOrderFeeList = (params) => new Promise(completion => {
  tss.query({
    url: tss.url('') + '/tms/fin/fee_role',
    params,
    completion
  })
})

const _filter = (data, type) => data.filter(i => i.type == type)

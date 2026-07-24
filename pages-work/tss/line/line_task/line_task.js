const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
const util = require('../../../../utils/util.js')
import Pages from '../../../../pages.js'

const today = util.formatDate(new Date(), 'yyyy-MM-dd')
const tomorrow = util.formatDate(util.subDate(today, -1), 'yyyy-MM-dd')
const week = util.formatDate(util.subDate(today, 7), 'yyyy-MM-dd')
const month = util.formatDate(util.subDate(today, 30), 'yyyy-MM-dd')
const threemonth = util.formatDate(util.subDate(today, 90), 'yyyy-MM-dd')

Page({

  data: {
    list: [
      { id: '', title: '全部' },
      { id: '已出发', title: '已出发' },
      { id: '已到达', title: '已到达' },
      // { id: '筛选', title: '筛选' }
    ],
    selectedId: '',
    taskList:[],
    taskType:'',
    items: [{
      type: 'filter',
      label: '筛选',
      value: 'filter',
      checked: true,
      children: [
        {
          type: 'radio',
          label: '创建日期（ 单选 ）',
          value: 'date1',
          selected: '最近七天',
          children: [
            {
              label: '今天',
              value: `${today}`
            },
            {
              label: '最近七天',
              value: `${week}`,
              checked: true,
              defaultChecked: true
            },
            {
              label: '近一个月',
              value: `${month}`
            },
            {
              label: '近三个月',
              value: `${threemonth}`
            }]
        },
        {
          type: 'radio',
          label: '运单状态（ 单选 ）',
          value: 'status',
          selected: '全部',
          children: [
            {
              label: '全部',
              value: '待接单,已出发,已到达',
              checked: true,
              defaultChecked: true
            },
            {
              label: '已出发',
              value: '已出发'
            },
            {
              label: '已到达',
              value: '已到达'
            }]
        }
      ]
    }],
  },

  onLoad: function (options) {
    if(options.toarrive){
      wx.setNavigationBarTitle({title: '到车确认'})
    }else{
      wx.setNavigationBarTitle({title: '配载清单'})
    }
    this.getTask();
  },

  handleTabChange:function(e){
    let selectedId = e.detail
    this.setData({ selectedId: selectedId })
    this.getTask()
  },

  onChange(e){
    let params = e.detail.param
    let selectedId = this.data.selectedId
    if(params.status == '待接单,已出发,已到达'){
      selectedId = ''
    }else {
      selectedId = params.status
    }
    this.setData({ selectedId: selectedId })
    this.getTask(params.date1)
  },

  getTask:function(date1){
    let params = {
      "status": this.data.selectedId,
      "date1": date1|| util.formatDate(new Date(new Date() - 7 * 24 * 1000 * 60 * 60), 'yyyy-MM-dd'),
      "addfee": true
    }
    tss.query({
      url: tss.url('sql') + 'tms_trans_order',
      params,
      completion: res => {
        if (res.data && res.data.length>=0){
          this.setData({
            taskList: res.data
          })
        }
      }
    })
  },
  goDetail:function(e){
    let {item}= e.currentTarget.dataset;
    const { ...task } = item;
    wx.navigateTo({ url: `${Pages.line_task_detail}?task=${JSON.stringify(task)}` })
  },

  taskFeeConfirm(e){
    const { item } = e.currentTarget.dataset
    const { ...task } = item
    wx.navigateTo({
      url: `${Pages.task_feeinfo_total}?origin=task&task=${JSON.stringify(task)}`,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
import { formatDate } from '../../../../utils/util.js'
const _App = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    date_from: [],
    date_to: [],
    // filterSwitch:false
  },

  onLoad(options){
    let data = JSON.parse(options.json)
    this.setData({
      date_from: data.date_from,
      date_to: data.date_to,
      picker_date_from: data.date_from,
      picker_date_to: data.date_to,
      _status:{ name:data.status_name||'',code: data.status_code||'' },
      trans_mode:{ name:data.trans_mode_name||'', id: data.trans_mode_id||'' },
      ware_house: { id: data.ware_house_id || '', name: data.ware_house_name||'' },
      customer: { id: data.customer_id, name: data.customer_name },
      filterSwitch: data.real_lc_id == 'is_null' ? false : true
    })
    this.getAllSatus()
    this.getAllTransMode()
    this.getAllSite()
  },
  getAllSite(){
    tss.query({
      url: tss.url('') + '/tms/entity/CSite',
      params:{
        type:'仓库',
        status:'在用'
      },
      completion: res => {
        if (res.failed) {
          wx.showModal({ content: res.errorMsg, showCancel: false })
          return
        }
        this.setData({
          all_ware_house:res.data
        })
      }
    })
  },
  switchChange(e){
    console.log(e)
    this.setData({
      filterSwitch:e.detail.value
    })
  },
  showDate({ currentTarget }) {
    let { id } = currentTarget
    this.setData({ [`show_date${id}`]:true })
  },
  onReady(){
    lc.addListener('customerChooseInfo', this.__wxWebviewId__.toString(), res => {
      console.log(res)
      if(res.customer){
        this.setData({ customer:res.customer})
      }
    })
  },
  showCustomerChoose(){
    wx.navigateTo({
      url: `${Pages.customer_list}?from_page=params`,
    })
  },
  onUnload(){
    lc.removeListener('customerChooseInfo', this.__wxWebviewId__.toString())
  },
  onVisibleChange({currentTarget}){
    let { id } = currentTarget
    this.setData({ [`show_date${id}`]: false})
  },
  onConfirm({ currentTarget, detail }) {
    let { id } = currentTarget, { label } = detail
    this.setData({
      [`date${id}`]: label
    })
  },
  showSatusChoose(){
    this.setData({
      show_status:true
    })
  },
  popupClick(e){
    console.log(e)
    let {code,name} = e.currentTarget.dataset
    this.setData({
      _status: { code, name },
      show_status: false
    })
  },
  // 请求所有状态
  getAllSatus() {
    tss.query({
      url: tss.url('sql') + 'domain_all_status',
      completion: res => {
        if (res.failed) {
          wx.showModal({ content: res.errorMsg, showCancel: false })
          return
        }
        this.setData({
          all_status_list: res.data
        })
      }
    })
  },
  showTransMode(){
    this.setData({
      show_trans_mode:true
    })
  },
  transPopupClick(e){
    let { id, name } = e.currentTarget.dataset
    this.setData({
      trans_mode: { id, name },
      show_trans_mode: false
    })
  },
  showWareHouseChoose(e){
    this.setData({
      show_ware_house: true
    })
  },
  wareHousePopupClick(e){
    let { id, name } = e.currentTarget.dataset
    this.setData({
      ware_house: { id, name },
      show_ware_house: false
    })
  },
  onClosePopup(){
    this.setData({
      show_trans_mode: false,
      show_status: false,
      show_ware_house:false
    })
  },
  getAllTransMode(){
    tss.query({
      url: tss.url('') + '/tms/api/entity/TransMode',
      params: { active: true },
      completion:res=>{
        if (res.failed) {
          wx.showModal({ content: res.errorMsg, showCancel: false })
          return
        }
        this.setData({
          all_trans_mode:res.data
        })
      }
    })
  },
  goBackList(){
    let params = {
      date_from:this.data.date_from,
      date_to:this.data.date_to,
      status_code:this.data._status.code,
      status_name: this.data._status.name,
      trans_mode_name:this.data.trans_mode.name,
      trans_mode_id: this.data.trans_mode.id,
      query_tag:true,
      ware_house_id:this.data.ware_house.id,
      ware_house_name: this.data.ware_house.name,
      customer_id: this.data.customer.id,
      customer_name:this.data.customer.name,
      ctms:true
    }
    if (!this.data.filterSwitch){
      params.real_lc_id = 'is_null'
    }
    console.log(params)
    lc.emitEvent('paramsInfo', {
      params
    })
    wx.navigateBack()
  },
  resetBack(){
    this.setData({ _status:{},trans_mode:{}})
    let params = {
      date_from: this.data.date_from,
      date_to: this.data.date_to,
      real_lc_id:'is_null'
    }
    lc.emitEvent('paramsInfo', {
      params
    })
    wx.navigateBack()
  }
})
const _App = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')
import { formatDate } from '../../../../utils/util.js'

Page({

  data: {
    params:{
      date_from: formatDate(new Date().getTime() - 7 * 1000 * 24 * 3600, 'yyyy-MM-dd'),
      date_to: formatDate(new Date(), 'yyyy-MM-dd'),
      real_lc_id:'is_null'
    },
    page:1,
    list:[],
    filterlist:[],
    order_ids:[]
  },

  onLoad: function (options) {
    this.queryOrder()
  },
  onShow(){
  
  },

  onReady(){
    lc.addListener('paramsInfo', this.__wxWebviewId__.toString(), res => {
      console.log(res)
      if(res.params){
        this.data.page = 1
        this.data.filterlist = []
        this.data.list = []
        this.setData({
          params:res.params
        })
        this.queryOrder(res.params)
      }else if(res.refresh){
        this.data.page = 1
        this.data.filterlist = []
        this.data.list = []
        this.queryOrder(this.data.params)
      }
    })    
  },

  chooseAllOrders() {
    wx.showLoading()
    let filterlist = this.data.filterlist.map(i => ({ ...i, checked: true }))
    this.setData({
      filterlist,chooseAllTag:true
    }, () => {
      this.data.order_ids = this.data.list.map(item => item)
      console.log(this.data.order_ids)
      wx.hideLoading()
    })
  },

  cancelChooseAllOrders(){
    wx.showLoading()
    let filterlist = this.data.filterlist.map(i => ({ ...i, checked: false }))
    this.setData({
      filterlist,chooseAllTag:false
    }, () => {
      this.data.order_ids = []
      console.log(this.data.order_ids)
      wx.hideLoading()
    })
  },


  paramsChoose(){
    wx.navigateTo({
      url: `${Pages.order_params}?json=${JSON.stringify(this.data.params)}`,
    })
  },
  searchCode(e = { detail: { value: this.data.inputValue } }) {
    console.log('search:', e)
    if (e.detail.value) {
      // this.data.inputValue = e.detail.value
      // let reg = new RegExp(e.detail.value)
      // let filterlist = this.data.list.filter(i =>
      //   reg.test(i.tcode) || reg.test(i.code) || reg.test(i.ccode) )
      // this.setData({
      //   filterlist
      // })
      tss.query({
        url: tss.url('sql') + 'tms_order',
        params: { ocode: e.detail.value },
        completion: res => {
          if(res.failed) return
          this.setData({
            filterlist: res.data.map(i => ({
              ...i,
              send_addr: [i.send_province, i.send_city, i.send_district, i.send_town, i.send_street_no].filter(i => i).join(' '),
              receive_addr: [i.receive_province, i.receive_city, i.receive_district, i.receive_town, i.receive_street_no].filter(i => i).join(' '),
              checked: false
            }))
          })
          wx.setNavigationBarTitle({ title: '' })
        }
      })
    } else {
      this.data.inputValue = ''
      this.setData({
        filterlist: this.data.list
      })
    }
  },
  
  queryOrder(params = this.data.params) {
    wx.showLoading({mask:true })
    params.ctms = true
    params.order_date_from = params.date_from
    params.order_date_to = params.date_to
    params.page = this.data.page
    params.rows = 10
    tss.query({
      url: tss.url('sql') + 'tms_order',
      params,
      completion:res=>{
        if(res.failed){
          wx.showModal({
            content: res.errorMsg, showCancel:false
          })
          wx.hideLoading()
          return
        }
        this.setData({
          total:res.data.total,
          list: [...this.data.list, ...res.data.rows.map(i => ({
            ...i,
            send_addr: [i.send_province, i.send_city, i.send_district, i.send_town, i.send_street_no].filter(i => i).join(' '),
            receive_addr: [i.receive_province, i.receive_city, i.receive_district, i.receive_town, i.receive_street_no].filter(i => i).join(' '),
            checked: false
          }))],
          filterlist: [...this.data.filterlist,...res.data.rows.map(i => ({
            ...i,
            send_addr: [i.send_province, i.send_city, i.send_district, i.send_town, i.send_street_no].filter(i => i).join(' '),
            receive_addr: [i.receive_province, i.receive_city, i.receive_district, i.receive_town, i.receive_street_no].filter(i => i).join(' '),
            checked: false
          }))]
        },()=>{
          setTimeout(()=>{
            wx.setNavigationBarTitle({
              title: `${params.real_lc_id == 'is_null' ? `待推送：${this.data.total || ''}` : `已完成：${this.data.total || ''}`}`
            })
          },500)
          wx.hideLoading()
        })
      }
    })
  },
  goOrderRoute(e){
    let { id, code, domain } = e.currentTarget.dataset
    console.log(id,code,domain)
    wx.navigateTo({ url: `${Pages.order_routes}?id=${id}&code=${code}&domain=${domain}` })
  },
  onReachBottom(){
    this.data.page += 1
    this.queryOrder(this.data.params)
  },
  checkboxChange(e) {
    console.log('choose:', e.detail.value)
    this.data.order_ids = this.data.filterlist.filter(item => e.detail.value.includes(item.id.toString()))
    if(e.detail.value.length != this.data.filterlist.length){
      this.setData({ chooseAllTag:false })
    }
  },
  goChooseLogistic(e){
    if(this.data.order_ids.length == 0){
      wx.showToast({
        title: '请选择订单',icon:'none'
      })
      return
    }
    let url = `${Pages.router_connect_1}?type=own_logistic&orderId=${this.data.order_ids.map(i => i.id).join(',')}`
    if (this.data.params.ware_house_id){
      url += `&warehouseId=${this.data.params.ware_house_id}&warehouseName=${this.data.params.ware_house_name}`
    }
    wx.navigateTo({ url })
  },
  onUnload(){
    lc.removeListener('paramsInfo', this.__wxWebviewId__.toString())
  }
})
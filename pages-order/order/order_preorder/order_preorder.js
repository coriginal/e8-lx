const _App = getApp().globalData
import Pages from '../../../pages.js'
import { formatDate } from '../../../utils/util.js'
const lc = require('../../../utils/listenerCenter.js')
const tss = require('../../../utils/tss.js')

Page({

  data: {
    customerObj:{},
    select:{},
    scanList:[],
    ifFrezen:false
  },

  onLoad: function (options) {
    if(_App.user.isCustomer){
      this.queryCustomer()
    }
    lc.addListener('orderInfo', this.__wxWebviewId__.toString(), res => {
      if(res.type == 'customerInfo'){
        this.setData({
          customerObj: res.data ,
          'select.customer': res.data.name, 'select.customer_id': res.data.id
        })
      }
    })
  },

  openCustomerList:function(){
    wx.navigateTo({ url: Pages.customer_list })
  },

  getValue:function(e){
    console.log(e)
    let index = e.currentTarget.dataset.index,name = e.currentTarget.dataset.name;
 
    this.setData({
      [`scanList[${index}].${name}`]: e.detail.value
    })
  },

  handAdd:function(e){
    let value = e.detail.value;
    if(value){
      let batch0 = value.trim().split(/\s+/), batch1 =  value.trim().split(',');
      let batch = batch0.length?batch0:batch1;

      let scanList = this.data.scanList;
      for(let i =0;i<batch.length;i++){

        let distinct = scanList.find(e => e.scan_code == batch[i]);
        if (distinct) {//去重
          wx.showToast({ title: '单号重复，已剔除' });
          continue
        }
        scanList.push({scan_code: batch[i]});
      }

      this.setData({ scanList: scanList, handcode:'' });
    }
  },

  scanCode: function () {
    let _this = this;
    wx.scanCode({
      success: res => {
        if (!res.result) { return }
        if (res.result.indexOf("/") >= 0 || res.result.indexOf("=") >= 0) { 
          return 
        }
        let scanList = _this.data.scanList;
        let scan = {
          scan_code: res.result
          // tempid: _this.data.tempid
        };
  
        let distinct = scanList.find(e => e.scan_code == scan.scan_code);
        if (distinct) {
          wx.showToast({ title: '单号重复' });
          return
        }//去重

        if(scanList.length>=20){
          wx.showToast({ title: '请及时提交' });
        }

        scanList.unshift(scan);
        _this.setData({ scanList: scanList });
      }
    })
  },

  deleteCode:function (e){
    let _this = this;
    wx.showModal({
      title: '确定删除',
      content: '详细检查信息再操作',
      success(res) {
        if (res.confirm) {
          let index = e.currentTarget.id;
          _this.data.scanList.splice(index, 1);
          _this.setData({ scanList: _this.data.scanList });
        }
      }
    })
  },

  formSubmit:function(e){
    wx.showLoading({ title: '提交中', mask: true })

    var field = [], scanList = this.data.scanList , select = this.data.select,ifFrezen = this.data.ifFrezen;
    if(scanList.length<=0){
      wx.hideLoading();
      return
    }
    for( let i=0;i<scanList.length;i++ ){
      let s = scanList[i];
      let obj = {customer_id:select.customer_id,code:s.scan_code, remark:s.remark ,subOrders:JSON.stringify([{amount: 1}]) };
      field.push(obj);

      if(i == scanList.length -1 && field.length>=1){
        tss.save({
          url: tss.url('') + "/tms/order/precreate_orders" ,
          params: { "json": JSON.stringify(field) },
          completion: res => {
            wx.hideLoading();
            if (res.failed) { 
              wx.showToast({ title: '失败或单号已有',duration:2000 })
              return 
            }
            wx.showToast({ title: '下单成功' })
            this.setData({scanList:[],handcode:''})
            if(ifFrezen){
              let orders=res.data, orderIds = [];
              for(var j=0;j<orders.length;j++){
                orderIds.push(orders[j].id)
              }
              this.batchFrezen(orderIds.join(","))
            }
          }
        })
      }
    }
  },

  checkboxChange:function(e){
    let value = e.detail.value.length;
    if(value>=1){
      this.setData({ ifFrezen: true})
    }else{
      this.setData({ ifFrezen: false})
    }
  },

  queryCustomer:function(){
    tss.query({
      url: tss.url('sql') + 'customer',
      params: {  active: 1 },
      completion: res => {
        if (res.failed) {
          wx.showModal({ content: res.errorMsg, showCancel: false })
          wx.hideLoading()
          return
        }
        this.setData({
          customerObj: res.data[0],
          'select.customer_id': res.data[0].id,
          'select.customer':res.data[0].name
        })
      }
    })
  },

  batchFrezen:function(ids){
    tss.save({
      url: tss.url('') + "/tms/order/frozenorder" ,
      params: {type:"order", ids:ids },
      completion: res => {
        wx.hideLoading();
        if (res.failed) {
          wx.showToast({ title: '冻结失败，请到【订单列表】人工冻结' });
          return 
        }
        wx.showToast({ title: '批量冻结成功' })
      }
    })
  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
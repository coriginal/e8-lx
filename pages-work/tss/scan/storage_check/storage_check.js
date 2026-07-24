const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
const util = require('../../../../utils/util.js')

import Pages from '../../../../pages.js'

Page({

  data: {
    table:{
      recordId:'storage_check',
      type:'入库',
      field:[ "station_id,station,type,scan_code,amount,weight,volume,tempid,longer,width,height"]
    },
    select:{},
    scanList:[],
  },


  onLoad: function (options) {
    this.getSite();
    this.setData({
      tempid: (new Date()).getTime()
    })
    wx.setNavigationBarTitle({ title: this.data.table.type + '核验' })
  },
  getSite:function(){
    tss.query({
      url: tss.url('sql') + 'c_site',
      params:{},
      completion: res => {
        if (res.data) {
          this.setData({ "select.station": res.data[0].name, "select.station_id": res.data[0].id, site: res.data })
        }
      }
    }) 
  },

  scanCode: function () {
    let _this = this;
    wx.scanCode({
      success: res => {
        if (!res.result) { return }
        if (res.result.indexOf("/") >= 0 || res.result.indexOf("=") >= 0) { return }
        let scanList = _this.data.scanList;
        let scan = {
          scan_code: res.result,
          tempid: _this.data.tempid
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
  getValue: function(e){
    let index = e.currentTarget.dataset.index,name = e.currentTarget.dataset.name;
 
    this.setData({
      [`scanList[${index}].${name}`]: e.detail.value
    })

    let scan = this.data.scanList[index];

    if(scan.longer && scan.width && scan.height){
      var volume = scan.longer * scan.width * scan.height / 1000000;
      volume = Math.round(volume * 1000) / 1000;
      this.setData({
        [`scanList[${index}].volume`]: volume
      })
    }
  },

  handAdd:function(e){
    let value = e.detail.value;
    if(value){
      let scan = {
        scan_code: e.detail.value,
        tempid: this.data.tempid
      };
      let scanList = this.data.scanList;
      let distinct = scanList.find(e => e.scan_code == scan.scan_code);
      if (distinct) {
        wx.showToast({ title: '单号重复' });
        return
      }//去重
  
      scanList.unshift(scan);
      this.setData({ scanList: scanList, handcode:'' });
    }
  },

  formSubmit:function(e){
    wx.showLoading({ title: '提交中', mask: true })

    var field = [], scanList = this.data.scanList , select= this.data.select,table = this.data.table;
    var type = table.type, recordId = table.recordId,tempid = this.data.tempid;
    field.push(this.data.table.field);

    if(scanList.length<=0){
      wx.hideLoading();
      return
    }

    for( var i=0;i<scanList.length;i++ ){
      let s = scanList[i];
      let obj = [select.station_id||'',select.station, type , s.scan_code, s.amount||'', s.weight||'', s.volume||'', tempid,s.longer||'',s.width||'',s.height||''];
      field.push(obj.join(','));

      if(i == scanList.length -1 && field.length>1){
        tss.save({
          url: tss.url('xdata') + "cud/" + recordId,
          params: { "csv": field.join("\n") },
          completion: res => {
            if (res.failed) {
              wx.hideLoading();
              return
            }
            wx.hideLoading();
            tss.post({
              url: tss.url("") + '/tms/scan/changeOrder',
              params: { tempid: tempid},
              completion: fro => {
                console.log(fro)
                this.setData({ tempid: (new Date()).getTime() })
              }
            })

            wx.showToast({ title: '保存成功' })
            this.setData({scanList:[],handcode:''})
          }
        })
      }
    }
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

  onReady: function () {

  },

  onShow: function () {

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
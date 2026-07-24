const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
const util = require('../../../../utils/util.js')
import Pages from '../../../../pages.js'

Page({

  data: {
    list: [
      { id: '运输单', title: '运输详情' },
      { id: '订单', title: '装车清单' },
      { id: '在途', title: '在途轨迹' }
    ],
    selectedId: '运输单',
    task:''
  },

  onLoad: function (options) {
    if(options.task){
      let task = JSON.parse(options.task)
      let line = task.line_name,start = line.substring(0,line.indexOf('-')),end = line.substring(line.lastIndexOf('-')+1);
      if(task.type == '提货'){
       task.start = task.area||'-';
       task.end = '-'
      }else if(task.type == '送货'){
        task.start = '-';
        task.end = task.area||'-';
      }else{
        task.start = start||'-';
        task.end = end||'-'
      }
      this.setData({ task:task })

      this.getTaskOrder();
    }
    wx.setNavigationBarTitle({title: '运输单详情'})
  },

  handleTabChange:function(e){
    let selectedId = e.detail
    if(selectedId == '订单'){
      this.goDetail()
    }
    if(selectedId == '在途'){
      let task = this.data.task
      wx.navigateTo({
        url: `${Pages.car_location}?plate_num=${task.plate_num}&task_code=${task.code}`,
      })
    }
  },

  getTaskOrder:function(){
    tss.query({
      url:tss.url('') + `/tms/task/${this.data.task.id}/subOrder`,
      params:{showOrderFee: true},
      completion:res=>{
        var orderList = [];
        if(res.data && res.data.length>=0){
          let totalFee=0,arriveFee=0,cod=0;
          res.data.forEach(function(e){
            var item = e[2];
            totalFee = totalFee + item.moreInfo.feeMap.income;
            if(item.settle_type == '到付'){
              arriveFee = arriveFee + item.moreInfo.feeMap.income;
            }
            if(item.cod){
              cod = cod + item.cod
            }
            orderList.push(item)
          })
          this.setData({ orderList: orderList ,totalFee:totalFee,arriveFee:arriveFee, cod:cod })
        }
      }
    })    
  },
  // filterData:function(){
  //   var orderList = this.data.orderList;
  //   var feeSubject = this.data.feeSubject;
  //   var jie1 = 0,jie2 = 0,feeArrive=0;
  //   orderList.forEach(function(e){
  //     if(e.settle_type == '到付'){
  //       feeArrive = feeArrive + e.income
  //     }
  //     for(var key in e.feeMap){
  //       if(key.indexOf(orderList[0].id)>=0){
  //         jie1 = jie1 + e.feeMap[key]
  //       }
  //       if(key.indexOf(orderList[1].id)>=0){
  //         jie2 = jie2 + e.feeMap[key]
  //       }
  //     }
  //   })
  // },

  // getExpenseSubject:function(){
  //   tss.query({
  //     url:tss.url('ENTITY') + 'ExpenseSubject',
  //     params:{name:'现返,欠返'},
  //     completion:res=>{
  //       if(res.data && res.data.length>=0){
  //         this.setData({feeSubject: res.data})
  //       }
  //     }
  //   }) 
  // },

  onReady: function () {

  },

  onShow: function () {
    // this.setData({selectedId: '运输单'})
  },

  goDetail:function(){
   let task_id = this.data.task.id
    wx.navigateTo({
      url: `${Pages.arrange}?page_from=task&task_id=${task_id}`,
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
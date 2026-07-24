// pages-work/tss/capacity/truck_task/index.js
const app = getApp().globalData;
const tss = require('../../../../utils/tss.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        page: 1,
        status: 'loading',
        keyWords:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getTruckTask();
    },
    editOrder(e){
        console.log(e)
        let code = e.currentTarget.dataset.code
        wx.navigateTo({
          url: `../add_truck_task/index?taskCode=${code}`,
        })
    },
    toDetail(e){
        console.log("toDetail")
        let taskCode = e.currentTarget.dataset.code
        wx.navigateTo({
          url: '../truck_task_detail/index?taskCode='+taskCode,
        })
    },
    truckComplete(e){
        let taskCode = e.currentTarget.dataset.taskcode
        wx.showModal({
          title: '提示',
          content: `确定操作任务单[${taskCode}]?`,
          complete: (res) => {
            if (res.confirm) {
              tss.post({
                  type:'repair_operate',
                  url:tss.url('')+'/tms/deliveryTask/truckComplete',
                  params:taskCode,
                  useCookie:true,
                  completion:res=>{
                      if(res.failed){
                        wx.showModal({
                            title: '提示',
                            content: res.errMsg,
                            showCancel: false,
                        })
                        return
                      }
                      wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false,
                        complete:()=>{
                            this.refresh();
                        }
                    })
                  }
              })
            }
          }
        })
    },
    truckArrive(e){
        console.log(e.currentTarget.dataset)
        let taskCode = e.currentTarget.dataset.taskcode
        wx.showModal({
          title: '提示',
          content: `确定操作任务单[${taskCode}]?`,
          complete: (res) => {
            if (res.confirm) {
              tss.post({
                  type:'repair_operate',
                  url:tss.url('')+'/tms/deliveryTask/truckArrive',
                  params:taskCode,
                  useCookie:true,
                  completion:res=>{
                      if(res.failed){
                        wx.showModal({
                            title: '提示',
                            content: res.errMsg,
                            showCancel: false,
                        })
                        return
                      }
                      wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false,
                        complete:()=>{
                            this.refresh();
                        }
                    })
                  }
              })
            }
          }
        })
    },
    refresh(){
        this.setData({
            page:1,
            status:'loading',
            list:[]
        },()=>{
            this.getTruckTask()
        })
    },
    getTruckTask() {
        tss.get({
            url: tss.url('sql') + `/truck_task_list?page=${this.data.page}&rows=${5}&taskCode=${this.data.keyWords}`,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.data,
                        showCancel: false,
                    })
                    return
                }
                console.log(res)
                let list = this.data.list.concat(res.data.rows)
                let status = this.data.status;
                if (list.length === res.data.total) {
                    status = 'nomore'
                }
                this.setData({
                    list,
                    status
                })
            }
        })
    },
    onSearch(e){
        console.log(e)
        this.setData({
            keyWords: e.detail
        })
        this.refresh()
    },
    supplementOrder(e) {
        console.log(e)
        wx.navigateTo({
            url: '/pages-order/order/order/order?truckTaskCode=' + e.currentTarget.dataset.trucktaskcode,
            fail: error => {
                console.log(error)
            }
        })

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        console.log("加载更多")
        if (this.data.status === 'nomore') return;
        this.setData({
            page: ++this.data.page
        })
        this.getTruckTask();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
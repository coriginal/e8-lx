// pages-work/tss/capacity/truck_task_customer/index.js
const app = getApp().globalData;
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        filterData: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getTruckTaskCustomer();
    },
    getTruckTaskCustomer() {
        tss.get({
            url: tss.url('sql') + `/tms_customer`,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.data,
                        showCancel: false,
                    })
                    return
                }
                this.setData({
                    list: res.data,
                    filterData: res.data
                })
            }
        })
    },
    bindKeyInput: tss.debounce(function (e) {
        let value = e.detail.value
        let filterData = this.data.list
            .filter(item => item.name.includes(value) || item.phone.includes(value))
        this.setData({
            filterData
        })
    }, 500),
    chooseCustomer(e) {
        let index = e.currentTarget.id
        lc.emitEvent('orderInfo', {
            type: 'customerInfo',
            data: this.data.list[index]
        })
        setTimeout(() => {
            wx.navigateBack()
        }, 500)
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
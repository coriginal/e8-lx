// pages/today-order/index.js
import {formatDate} from '../../utils/util'
const _App = getApp().globalData;
const tss = require('../../utils/tss.js')
import Pages from '../../pages.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        status: "loading",
        page: 1,
        customer_id: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options)
        if (options._params) {
            options = JSON.parse(options._params)
            this.setData({
                customer_id: options.customer_id
            })
            this.getTodayOrder();
        }
    },
    getTodayOrder(){
        if(!this.data.customer_id) return
        tss.post({
            url: tss.url("") + "/api/data/sql/tms_order",
            params: {
                customer_id: this.data.customer_id,
                page: this.data.page,
                rows: 10,
                order_date_from: formatDate(new Date(),"yyyy-MM-dd")
            },
            completion: res => {
                console.log(res)
                wx.setNavigationBarTitle({
                  title: "今日订单("+res.data.total+")",
                })
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.errMsg,
                        showCancel: false
                    })
                    return
                }
                this.setData({
                    list: this.data.list.concat(res.data.rows)
                }, () => {
                    if (this.data.list.length === res.data.total) {
                        this.setData({
                            status: "nomore"
                        })
                    }
                })
            }
        })
    },
    goRouteInfo(e) {
        let {
            id,
            code,
            domain
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `${Pages.order_routes}?id=${id}&code=${code}&domain=${domain}`
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
        if(this.data.status!="nomore"){
            this.setData({
                page: ++this.data.page
            })
            this.getTodayOrder();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
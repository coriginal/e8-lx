// pages-order/order/order_scan_print_log/index.js
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')
import {
    formatDate,
    subDate
} from '../../../utils/util'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        subOrders: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options.order_id)
        wx.showLoading()
        if (options.order_id) {
            tss.get({
                url: tss.url("") + `/tms/order/${options.order_id}`,
                completion: res => {
                    tss.post({
                        url: tss.url("sql") + "/print_log",
                        params: {
                            start_date: formatDate(subDate(new Date(), 7), "yyyy-MM-dd"),
                            end_date: formatDate(new Date(), "yyyy-MM-dd")
                        },
                        completion: result => {
                            wx.hideLoading()
                            if (res.failed || result.failed) {
                                wx.showModal({
                                    title: '提示',
                                    content: '数据获取失败！',
                                    showCancel: false,
                                    complete: (res) => {
                                        wx.navigateBack()
                                    }
                                })
                                return
                            }
                            wx.setNavigationBarTitle({
                                title: res.data.code,
                            })
                            let list = result.data.filter(item => item.order_id == options.order_id),
                                listed = res.data.subOrders;
                            listed = listed.map(item => {
                                list.map(it => {
                                    if (it.type == item.code || it.type == item.boxNo || it.type == item.sub_tcode) {
                                        if (it.origin == 'WXE8') {
                                            item['e8Printed'] = '已打印'
                                        } else {
                                            item['platformPrinted'] = '已打印'
                                        }
                                    }
                                })
                                return item
                            })
                            console.log("打印日志：", listed)
                            listed.unshift({
                                code: '子单号',
                                platformPrinted: '平台',
                                e8Printed: 'E8'
                            })
                            this.setData({
                                subOrders: listed
                            })
                        }
                    })
                }
            })
        } else {
            wx.navigateBack()
        }
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
// pages-other/sys/pay/index.js
const tss = require('../../utils/tss.js')
const _App = getApp().globalData
import user from '../../utils/user.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        moneyCal: "0.00",
        orderData: {

        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options._params && JSON.parse(options._params).orderId) {
            let {
                orderId
            } = JSON.parse(options._params)
            tss.get({
                url: tss.url("") + `/cloud/order/${orderId}`,
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        wx.showModal({
                            showCancel: false,
                            content: res.errorMsg,
                            complete:()=>{
                                this.goHome()
                            }
                        })
                        return
                    }
                    this.setData({
                        orderData: res.data
                    }, () => {
                        this.setData({
                            moneyCal:this.data.orderData.money_cal.toFixed(2)
                        })
                    })
                }
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '缺少必要参数！',
                showCancel: false,
                complete: () => {
                    this.goHome()
                }
            })
            return
        }
    },
    goHome() {
        wx.reLaunch({
            url: '/pages/login/login',
        })
    },
    payMoney: function () {
        let param = this.data.orderData
        user.__wxCode({
            completion: res => {
                this.data.jscode = res.code
                tss.post({
                    url: tss.url('wxapi') + 'minipay',
                    params: {
                        body: '续费- ' + param.money_cal + '元',
                        out_trade_no: param.order_no,
                        total_fee: param.money_cal * 100,
                        jscode: this.data.jscode,
                        openid: _App.user.openid,
                        appid: _App.app_id,
                        mchid: _App.mchid
                    },
                    completion: res => {
                        console.log(param.order_no)
                        if (res.data.code == 'success') {
                            wx.hideLoading()
                            wx.requestPayment({
                                ...res.data.data,
                                success: res => {
                                    tss.post({
                                        url: tss.url('') + '/wxnotify2.in',
                                        params: {
                                            afterPaySuccess: 'CloudService',
                                            out_trade_no: param.order_no,
                                            receipt_amount: param.money_cal
                                        },
                                        completion: res => {
                                            if (res.failed) {
                                                wx.showModal({
                                                    content: '续费失败',
                                                    showCancel: false
                                                })
                                                return
                                            }
                                            console.log(res)
                                            wx.showModal({
                                                title: '提示',
                                                content: '支付成功!',
                                                showCancel: false,
                                                success: res => {
                                                    this.setData({
                                                        "orderData.status": "已付款"
                                                    })
                                                }
                                            })
                                        }
                                    })
                                },
                                fail: res => {
                                    wx.showToast({
                                        title: '取消支付',
                                        icon: 'none'
                                    })
                                }
                            })
                            return
                        }
                    }
                })
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
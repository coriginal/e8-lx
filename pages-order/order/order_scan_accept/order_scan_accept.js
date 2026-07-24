const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.doScan();
    },
    //加一个步骤
    scanBackOrder(code) {
        tss.getJSON({
            url: tss.url('tms') + '/order/anon/scanBackOrder',
            params: {
                scanCode: String(code).replace(/[^\x00-\xff]|\s*/g, '')
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.hideLoading()
                    wx.showModal({
                        content: "扫描失败！请重试",
                        confirmText: '重新扫描',
                        cancelText: '返回',
                        success: res => {
                            if (res.confirm) {
                                this.doScan()
                            } else {
                                wx.navigateBack()
                            }
                        }
                    })
                    return
                }
                if (res.data.data.length == 0) {
                    wx.hideLoading()
                    wx.showModal({
                        content: `暂未查到相关单号`,
                        confirmText: '重新扫描',
                        cancelText: '返回',
                        success: res => {
                            if (res.confirm) {
                                this.doScan()
                            } else {
                                wx.navigateBack()
                            }
                        }
                    })
                    return
                }
                this.checkCode(res.data.data[0].code)
            }
        })
    },
    doScan() {
        wx.scanCode({
            // onlyFromCamera: true,
            success: res => {
                console.log(res)
                // 匹配英文和字母
                wx.showLoading()
                if (res.result.includes('https://')) {
                    // 扫描二维码进来的；
                    const arr1 = res.result.split(/code=/g);
                    const code = arr1[1].split('&')[0];
                    this.scanBackOrder(code)
                } else if (/^[A-Za-z0-9]+$/g.test(res.result)) {
                    //this.checkCode(res.result)
                    this.scanBackOrder(res.result)
                } else {
                    wx.hideLoading()
                    wx.showModal({
                        content: `【${res.result}】单号仅支持数字和英文！`,
                        confirmText: '重新扫描',
                        cancelText: '返回',
                        success: res => {
                            if (res.confirm) {
                                this.doScan()
                            } else {
                                wx.navigateBack()
                            }
                        }
                    })
                }
            },
            fail: res => {
                console.log(res)
                wx.showModal({
                    content: res.result ? `当前[ ${res.result} ]暂不支持,请重新扫描` : '请扫描正确条码',
                    confirmText: '重新扫描',
                    cancelText: '返回',
                    success: res => {
                        if (res.confirm) {
                            this.doScan()
                        } else {
                            wx.navigateBack()
                        }
                    }
                })
            }
        })
    },
    checkCode(code) {
        // 先查询是否有轨迹
        console.log(_App)
        tss.query({
            url: tss.url('data') + 'xcx_query_route',
            params: { // 正则匹配脏字符和空格
                code: code,
                page: 1,
                rows: 1
            },
            completion: res => {
                if (!res.failed && res.data.total > 0) {
                    if (res.data.rows[0].status === '待接单' && !_App.user.isCustomer) {
                        wx.redirectTo({
                            url: `${Pages.order_list}?code=${code}&query=true&fromPage=order_scan_accept`
                        })
                        return
                    }
                    wx.redirectTo({
                        url: `${Pages.order_query_route}?code=${code}&query=true`
                    })
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        content: `暂未查到相关单号`,
                        confirmText: '重新扫描',
                        cancelText: '返回',
                        success: res => {
                            if (res.confirm) {
                                this.doScan()
                            } else {
                                wx.navigateBack()
                            }
                        }
                    })
                }
            }
        })
    },
    goToOrder() {
        wx.redirectTo({
            url: Pages.order
        })
    }
})
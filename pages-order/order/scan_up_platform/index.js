// pages-order/order/scan_up_platform/index.js
const tss = require('../../../utils/tss')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        code: '8602262314',
        info_type: ['send', 'receive'],
        currentOrderInfo: null,
        platformInfoList: [],
        platFormPriceList: [],
        currentPriceId: null,
        curPlatform: null
    },
    getOrder(e) {
        wx.showLoading({
            title: '获取订单信息...',
            mask: true
        })
        var code = e.detail.value
        tss.getJSON({
            url: tss.url('tms') + '/order/anon/scanBackOrder',
            params: {
                scanCode: code.replace(/[^\x00-\xff]|\s*/g, ''),
            },
            completion: res => {
                wx.hideLoading()
                console.log(res)
                if (res.failed || !res.data.data.length) {
                    return
                }
                this.setData({
                    currentOrderInfo: res.data.data[0],
                    curPlatform: {
                        lc_id: res.data.data[0]['lc_id'] || null,
                        trans_mode_id: res.data.data[0]['trans_mode_id'] || null
                    }
                })
                this.getPrice()
            }
        })
    },
    getPlatformInfo() {
        wx.showLoading({
            title: '获取平台信息中...',
            mask: true
        })
        tss.post({
            url: tss.url('') + '/tms/api/user/platform/info',
            completion: res => {
                wx.hideLoading()
                if (res.failed) {
                    wx.hideLoading()
                    wx.showModal({
                        title: '提示',
                        content: '平台信息读取失败，请稍后再试',
                        complete: (res) => {
                            if (res.confirm) {
                                wx.navigateBack()
                            }
                        }
                    })
                    return
                }
                this.setData({
                    platformInfoList: res.data.data
                })
            }
        })
    },

    getPrice() {
        wx.showLoading({
            title: '获取报价...',
            mask: true
        })
        let info = this.data.currentOrderInfo
        // var params = {
        //     customId: info.customer_id,
        //     params: {
        //         goodsInfo: {
        //             goodsName: info.cargo,
        //             amount: info.amount,
        //             volume: info.volume,
        //             realWeight: info.weight,
        //             insurance_limit: Number(info.insurance_limit) || null
        //         },
        //         receiver: {
        //             name: "",
        //             phone: "",
        //             address: "",
        //             detailsAddress: info.receive_addr
        //         }
        //     },
        //     platformKeys: this.data.platformInfoList.map(item => {
        //         return item.sign
        //     })
        // }
        let params={
            ...info,
            platformSignStr:this.data.platformInfoList.map(item=>{return item.sign}).join(','),
            searchType:2
        }
        console.log(params)
        delete params['domainInfo']
        delete params['moreInfo']
        wx.request({
            url: tss.url('') + '/tms/api/rpa/search',
            data: params,
            method: "POST",
            header: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Cookie": wx.getStorageSync('cookie')
            },
            success: res => {
                console.log(res)
                wx.hideLoading()
                if (res.data.result) {
                    this.dealPrice(res.data.data)
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.data.errorMsg,
                        showCancel: false
                    })
                    this.setData({
                        platFormPriceList: []
                    })
                }
            }
        })
    },
    dealPrice(data) {
        console.log(data)
        data = data.filter(item => item.search_status && item.cost)
        console.log(data)
        if (!data.length) {
            wx.showToast({
                title: '暂无报价!',
                icon: 'none'
            })
            return
        }
        let currentPriceId = null
        if (data.find(item => item.lc_info_id == this.data.curPlatform.lc_id)) {
            currentPriceId = data.find(item => item.lc_info_id == this.data.curPlatform.lc_id).id
        } else {
            this.setData({
                "curPlatform.lc_id": null,
                "curPlatform.trans_mode_id": null
            })
        }
        this.setData({
            currentPriceId,
            platFormPriceList: data,
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    choosePlatform(e) {
        console.log(e)
        let platform = this.data.platFormPriceList.find(item => item.id == e.detail.value)
        this.setData({
            curPlatform: {
                lc_id: platform.lc_info_id,
                trans_mode_id: platform.trans_mode_id,
                platformProductCostId: platform.id
            },
            currentPriceId: Number(e.detail.value)
        })
    },
    onLoad(options) {
        this.getPlatformInfo()
    },
    save() {
        if (!this.data.currentOrderInfo || !this.data.platFormPriceList.length) {
            wx.showToast({
                title: '无报价或未载入运单！',
                icon: 'none'
            })
            return
        }
        if (!this.data.curPlatform.lc_id) {
            wx.showToast({
                title: '未选择报价',
                icon: 'none'
            })
            return
        }
        wx.showModal({
            title: '提示',
            content: '确定上传至平台？',
            complete: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        mask: true
                    })
                    let order = this.data.currentOrderInfo
                    let params = {
                        id: order.id,
                        ...this.data.curPlatform
                    }
                    tss.post({
                        url: tss.url('') + '/tms/order',
                        params,
                        completion: res => {
                            if (res.failed) {
                                wx.showModal({
                                    title: '提示',
                                    content: res.errorMsg,
                                    showCancel: false
                                })
                                return
                            }
                            this.upPlatform(order.id)
                        }
                    })
                }
            }
        })
    },
    upPlatform(id) {
        tss.post({
            url: tss.url('') + '/tms/order/push2Logistices',
            params: {
                order_ids: id
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.hideLoading()
                    wx.showModal({
                        title: '提示',
                        content: res.errorMsg
                    })
                    return
                }
                wx.showModal({
                    title: '提示',
                    content: res.data,
                    showCancel: false
                })
                wx.hideLoading()
                // tss.query({
                //     url: tss.url('sql') + 'tms_order',
                //     params: {
                //         tms_order_id: id,
                //         addPlatformInfo: true
                //     },
                //     completion: res => {
                //         if (res.data[0].real_lc_id) {
                //             wx.showToast({
                //                 title: '上传成功！',
                //             })
                //         } else {
                //             wx.showModal({
                //                 title: '提示',
                //                 content: '上传失败',
                //                 showCancel: false
                //             })
                //         }
                //     }
                // })
            }
        })
    },
    scanCode() {
        var _this = this
        wx.scanCode({
            success(res) {
                console.log(res)
                _this.getOrder({
                    detail: {
                        value: res.result
                    }
                })
            },
            fail: err => {
                console.log(err)
                wx.showModal({
                    title: '提示',
                    content: '扫描失败，请重新尝试',
                    showCancel: false
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
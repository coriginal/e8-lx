// pages-work/tss/capacity/repair_task/index.js
const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
import Pages from '../../../../pages.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dataList: [],
        rows: 5,
        page: 1,
        isAll: false,

        feedBackList: [],
        feedBackContent: "",
        feedbackImages: [],
        pageContainerType: 0,
        showPageContainer: false,
        feedBackTempId: null,
        endImages: [],

        currentOrderNo: "",

        appHost:getApp().globalData.app_host
    },
    getData(refresh = true) {
        var {
            dataList,
            rows,
            page,
            isAll
        } = this.data
        if (refresh) {
            dataList = []
            page = 1
            isAll = false
        } else {
            console.log(isAll)
            if (isAll) {
                return
            }
            page++
            console.log(page)
        }
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        tss.post({
            url: tss.url("/api/data/sql") + "/service_order",
            params: {
                rows,
                page,
                service_order_status: [40, 50, 60,70]
            },
            completion: res => {
                console.log(page)
                console.log(res)
                if (res.data.rows.length == 0 && !refresh) {
                    isAll = true
                }
                for (let i in res.data.rows) {
                    let data = res.data.rows[i]
                    let x = data.customer_area_name ? (data.customer_area_name.split('|')).join("") : ""
                    let y = x + (data.customer_street_no || "")
                    data["area"] = y;
                }
                dataList = [...dataList, ...res.data.rows];
                console.log(dataList)
                this.setData({
                    dataList,
                    page,
                    isAll
                })
                wx.hideLoading()
                wx.stopPullDownRefresh()
            }
        })
    },
    goDetail(e) {
        var {
            order_no
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `../repair_detail/index?order_no=${order_no}`
        })
    },
    callCustomer(e) {
        console.log(e)
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phonenumber,
        })
    },
    openSubscribe(e) {
        console.log(e)
        this.setData({
            pageContainerType: 0,
            showPageContainer: true,
            subscribe_date: "",
            subscribe_time: "",
            currentOrderNo: e.currentTarget.dataset.order_no
        })
    },
    bindDateChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            subscribe_date: e.detail.value
        })
    },
    bindTimeChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            subscribe_time: e.detail.value
        })
    },
    openFeedBack(e) {
        this.setData({
            pageContainerType: 2,
            showPageContainer: true,
            feedBackTempId: Date.parse(new Date()),
            feedbackImages: [],
            feedBackContent: "",
            currentOrderNo: e.currentTarget.dataset.order_no
        })
        var {
            feedbackImages
        } = this.data
        tss.get({
            url: tss.url("/xdata/api/attach/json/-25/") + this.data.feedBackTempId,
            completion: b => {
                console.log(b)
                feedbackImages = b.data
                console.log(feedbackImages)
                this.setData({
                    feedbackImages
                })
            }
        })
        console.log(this.data.feedBackTempId)
    },
    setFeedback(e) {
        console.log(e);
        this.setData({
            feedBackContent: e.detail.value
        })
    },
    chooseImage() {
        var {
            feedbackImages
        } = this.data
        wx.chooseMedia({
            mediaType: ["image"],
            success: res => {
                let urlList = []
                res.tempFiles.forEach(item => urlList.push(item.tempFilePath))
                wx.showLoading({
                    title: '上传中...',
                    mask: true
                })
                tss.uploadImagesAsync({
                    itemId: this.data.feedBackTempId,
                    tableId: -25,
                    recordId: -25,
                    filePaths: urlList,
                    completion: a => {
                        tss.get({
                            url: tss.url("/xdata/api/attach/json/-25/") + this.data.feedBackTempId,
                            completion: b => {
                                console.log(b)
                                feedbackImages = b.data
                                console.log(feedbackImages)
                                this.setData({
                                    feedbackImages
                                })
                                wx.hideLoading()
                            }
                        })
                    }
                })

            }
        })
    },
    submitFeedBack() {
        wx.showModal({
            title: "提示",
            content: `确定进行提交吗？`,
            success: res => {
                var {
                    feedBackContent,
                    feedBackTempId,
                    currentOrderNo
                } = this.data
                if (res.confirm) {
                    wx.showLoading({
                        title: '上传中...',
                        mask: true
                    })
                    tss.post({
                        url: tss.url("tms") + "/serviceOrder/feedback",
                        type: "repair_operate",
                        params: {
                            feedback: feedBackContent,
                            tempid: feedBackTempId,
                            serviceOrderNo: currentOrderNo
                        },
                        completion: res => {
                            if (res.failed) {
                                wx.showModal({
                                    showCancel: false,
                                    title: "提示",
                                    content: res.errorMsg
                                })
                                wx.hideLoading()
                                return
                            }
                            this.setData({
                                showPageContainer: false,
                            })
                            this.getData()
                            wx.hideLoading()
                        }
                    })
                }
            }
        })
    },
    upSubscribeTime() {
        wx.showModal({
            title: "提示",
            content: `确定进行提交吗？`,
            success: res => {
                if (res.confirm) {
                    var {
                        subscribe_time,
                        subscribe_date,
                    } = this.data
                    if (subscribe_time && subscribe_date) {
                        var time = subscribe_date + " " + subscribe_time + ":00"
                        console.log(time)
                        tss.post({
                            url: tss.url("tms") + "/serviceOrder/serviceMan/subscribe",
                            type: "repair_operate",
                            params: {
                                serviceOrderNo: this.data.currentOrderNo,
                                subscribeTime: time
                            },
                            completion: res => {
                                if (res.failed) {
                                    wx.showModal({
                                        showCancel: false,
                                        title: "提示",
                                        content: "上传失败！"
                                    })
                                    return
                                }
                                this.setData({
                                    showPageContainer: false
                                })
                                this.getData()
                            }
                        })
                        console.log(time)
                    } else {
                        wx.showModal({
                            showCancel: false,
                            title: "提示",
                            content: "请选择日期和时间"
                        })
                    }
                }
            }
        })
    },
    startService(e) {
        var {
            order_no
        } = e.currentTarget.dataset
        wx.showModal({
            title: "提示",
            content: `确定开始服务吗？`,
            success: res => {
                if (res.confirm) {
                    tss.post({
                        url: tss.url("tms") + "/serviceOrder/serviceMan/start",
                        type: "repair_operate",
                        params: {
                            serviceOrderNo: order_no
                        },
                        completion: res => {
                            if (res.failed) {
                                wx.showModal({
                                    showCancel: false,
                                    title: "提示",
                                    content: "上传失败！"
                                })
                                return
                            }
                            this.getData()
                        }
                    })
                }
            }
        })
    },
    openEndService(e) {
        var {
            id,
            order_no
        } = e.currentTarget.dataset
        this.setData({
            pageContainerType: 1,
            showPageContainer: true,
            endImages: [],
            currentOrderId: id,
            currentOrderNo: order_no
        })
        var {
            endImages
        } = this.data
        tss.get({
            url: tss.url("/xdata/api/attach/json/-24/") + id,
            completion: b => {
                console.log(b)
                endImages = b.data
                console.log(endImages)
                this.setData({
                    endImages
                })
            }
        })
    },
    endChooseImages() {
        var {
            endImages
        } = this.data
        wx.chooseMedia({
            mediaType: ["image"],
            success: res => {
                let urlList = []
                res.tempFiles.forEach(item => urlList.push(item.tempFilePath))
                wx.showLoading({
                    title: '上传中...',
                    mask: true
                })
                tss.uploadImagesAsync({
                    itemId: this.data.currentOrderId,
                    tableId: -24,
                    recordId: -24,
                    filePaths: urlList,
                    completion: a => {
                        tss.get({
                            url: tss.url("/xdata/api/attach/json/-24/") + this.data.currentOrderId,
                            completion: b => {
                                console.log(b)
                                endImages = b.data
                                console.log(endImages)
                                this.setData({
                                    endImages
                                })
                                wx.hideLoading()
                            }
                        })
                    }
                })
            }
        })
    },
    delImg(e) {
        wx.showLoading({
            title: '删除中...',
            mask: true
        })
        var {
            index,
            id,
            type
        } = e.currentTarget.dataset
        console.log(id)
        tss.removeImages(id, res => {
            var {
                feedbackImages
            } = this.data
            tss.get({
                url: tss.url("/xdata/api/attach/json/" + type + "/") + (type == -24 ? this.data.currentOrderId : this.data.feedBackTempId),
                completion: b => {
                    console.log(b)
                    feedbackImages = b.data
                    console.log(feedbackImages)
                    if (type == -24) {
                        this.setData({
                            endImages: feedbackImages
                        })
                    } else {
                        this.setData({
                            feedbackImages
                        })
                    }
                    wx.hideLoading()
                }
            })
            console.log(res)
        })
    },
    endService() {
        wx.showModal({
            title: "提示",
            content: `确定结束服务吗？`,
            success: res => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '操作中...',
                        mask: true
                    })
                    tss.post({
                        url: tss.url("tms") + "/serviceOrder/serviceMan/complete",
                        type: "repair_operate",
                        params: {
                            serviceOrderNo: this.data.currentOrderNo
                        },
                        completion: res => {
                            if (res.failed) {
                                wx.showModal({
                                    showCancel: false,
                                    title: "提示",
                                    content: res.errorMsg
                                })
                                wx.hideLoading()
                                return
                            }
                            this.setData({
                                showPageContainer: false
                            })
                            wx.hideLoading()
                            this.getData()
                        }
                    })
                }
            }
        })
    },
    goTop() {
        wx.pageScrollTo({
            scrollTop: 0,
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(this.data.appHost)
        this.getData()
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
        this.getData()
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
        this.getData()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {
        this.getData(false)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
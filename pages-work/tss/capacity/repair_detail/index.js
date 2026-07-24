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
        orderDetail: {},
        repairList: [],
        filedsList: {
            serviceOrderNo: "服务单号",
            customerName: "客户名称"
        },
        feedBackList: [],
        feedBackContent: "",
        feedbackImages: [],
        pageContainerType: 0,
        showPageContainer: false,
        feedBackTempId: null,

        endImages: [],
        completeImg:[],
        appHost:getApp().globalData.app_host
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(options)
        this.getDetail(options.order_no)
        this.getFeedBackData(options.order_no)
    },
    getCompeleteImg(){
        console.log(this.data)
        var {serviceAttaches} =this.data.orderDetail
        var {completeImg}=this.data
        console.log(serviceAttaches)
        serviceAttaches= serviceAttaches.split(',')
        console.log(serviceAttaches)
        for(let i in serviceAttaches){
            completeImg.push(tss.url("",false)+serviceAttaches[i])
        }
        console.log(completeImg)
        this.setData({
            completeImg
        })
    },
    getDetail(order_no) {
        tss.get({
            url: tss.url("tms") + `/serviceOrder/find/${order_no}`,
            completion: res => {
                console.log(res)
                this.setData({
                    orderDetail: res.data.data.serviceOrder,
                    repairList: res.data.data.serviceOrderDetailList
                })
                if(this.data.orderDetail.serviceOrderStatus==80) this.getCompeleteImg()
                console.log(this.data.orderDetail, this.data.repairList)
            }
        })
    },
    getFeedBackData(order_no) {
        var {
            feedBackList
        } = this.data
        tss.post({
            url: tss.url("/api/data/sql") + "/service_order_feedback",
            params: {
                "service_order_no": order_no
            },
            completion: res => {
                feedBackList = res.data
                console.log(feedBackList)
                if (feedBackList.length == 0) {
                    return
                }
                for (let i in feedBackList) {
                    let urls = feedBackList[i].feedback_attaches.split(",")
                    for (let j in urls) {
                        urls[j] = tss.url("", false) + urls[j]
                    }
                    feedBackList[i]["imgList"] = urls
                }
                console.log(feedBackList)
                this.setData({
                    feedBackList
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
                    orderDetail
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
                            serviceOrderNo: orderDetail.serviceOrderNo
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
                            wx.hideLoading()
                            this.getDetail(orderDetail.serviceOrderNo)
                            this.getFeedBackData(orderDetail.serviceOrderNo)
                        }
                    })
                }
            }
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
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    setFeedback(e) {
        console.log(e);
        this.setData({
            feedBackContent: e.detail.value
        })
    },
    openFeedBack() {
        this.setData({
            pageContainerType: 2,
            showPageContainer: true,
            feedBackTempId: Date.parse(new Date()),
            feedbackImages: [],
            feedBackContent: ""
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
    previewImages(e) {
        let index = e.currentTarget.dataset.index,
            imgList = e.currentTarget.dataset.imglist
        wx.previewImage({
            urls: imgList,
            current: imgList[index],
            showmenu: true,
            success: (res) => {}
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

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
                url: tss.url("/xdata/api/attach/json/" + type + "/") + (type == -24 ? this.data.orderDetail.id : this.data.feedBackTempId),
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
    openSubscribe() {
        this.setData({
            pageContainerType: 0,
            showPageContainer: true,
            subscribe_date: "",
            subscribe_time: ""
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
    upSubscribeTime() {
        wx.showModal({
            title: "提示",
            content: `确定进行提交吗？`,
            success: res => {
                if (res.confirm) {
                    var {
                        subscribe_time,
                        subscribe_date,
                        orderDetail
                    } = this.data
                    if (subscribe_time && subscribe_date) {
                        let time = subscribe_date + " " + subscribe_time + ":00"
                        tss.post({
                            url: tss.url("tms") + "/serviceOrder/serviceMan/subscribe",
                            type: "repair_operate",
                            params: {
                                serviceOrderNo: orderDetail.serviceOrderNo,
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
                                this.getDetail(orderDetail.serviceOrderNo)
                                this.getFeedBackData(orderDetail.serviceOrderNo)
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
                    itemId: this.data.orderDetail.id,
                    tableId: -24,
                    recordId: -24,
                    filePaths: urlList,
                    completion: a => {
                        tss.get({
                            url: tss.url("/xdata/api/attach/json/-24/") + this.data.orderDetail.id,
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
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },
    startService() {
        wx.showModal({
            title: "提示",
            content: `确定开始服务吗？`,
            success: res => {
                if (res.confirm) {
                    var {
                        orderDetail
                    } = this.data
                    tss.post({
                        url: tss.url("tms") + "/serviceOrder/serviceMan/start",
                        type: "repair_operate",
                        params: {
                            serviceOrderNo: orderDetail.serviceOrderNo
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
                            this.getDetail(orderDetail.serviceOrderNo)
                            this.getFeedBackData(orderDetail.serviceOrderNo)
                        }
                    })
                }
            }
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
                    var {
                        orderDetail
                    } = this.data
                    tss.post({
                        url: tss.url("tms") + "/serviceOrder/serviceMan/complete",
                        type: "repair_operate",
                        params: {
                            serviceOrderNo: orderDetail.serviceOrderNo
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
                            this.getDetail(orderDetail.serviceOrderNo)
                            this.getFeedBackData(orderDetail.serviceOrderNo)
                        }
                    })
                }
            }
        })
    },
    openEndService() {
        this.setData({
            pageContainerType: 1,
            showPageContainer: true,
            endImages: []
        })
        var {
            endImages
        } = this.data
        tss.get({
            url: tss.url("/xdata/api/attach/json/-24/") + this.data.orderDetail.id,
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
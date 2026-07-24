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
        isAll: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getData()
    },
    //-1表示大于5 0表示小于5
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
                service_order_status: [80]
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
    orderOperate(e) {
        var {
            operate,
            order_no
        } = e.currentTarget.dataset
        var _this = this
        wx.showModal({
            title: "提示",
            content: `确定${operate=="accept"?"接单":"拒单"}吗？`,
            success: res => {
                if (res.confirm) {
                    wx.showLoading({
                        title: '操作中...',
                        mask: true
                    })
                    tss.post({
                        url: tss.url("tms") + `/serviceOrder/serviceMan/${operate}`,
                        params: {
                            "serviceOrderNo": order_no
                        },
                        type: "repair_operate",
                        completion: res => {
                            console.log(res)
                            wx.hideLoading()
                            if (res.failed) {
                                wx.showModal({
                                    title: "提示",
                                    content: "操作失败！",
                                    showCancel: false
                                })
                                return
                            }
                            wx.showModal({
                                title: "提示",
                                showCancel: false,
                                content: res.data.msg,
                                success(res) {
                                    if (res.confirm) {
                                        _this.getData()
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    },
    callCustomer(e) {
        console.log(e)
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phonenumber,
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
    goTop() {
        wx.pageScrollTo({
            scrollTop: 0,
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
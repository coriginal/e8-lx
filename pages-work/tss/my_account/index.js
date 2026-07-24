// pages-work/tss/my_account/index.js
const app = getApp().globalData
const tss = require('../../../utils/tss.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        allAmount: 0,
        canUseAmount: 0,
        frozenAmount: 0,
        limitAmount: 0,
        list: [],
        page: 1,
        status: 'loading'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(app)
        this.getCustomerFinAccount();
        this.getDetail();
    },
    getDetail() {
        wx.showLoading()
        tss.get({
            url: tss.url('') + `/api/data/sql/customer_auto_statement_order_list?customer_id=${app.customerInfo.id}&page=${this.data.page}&rows=10`,
            completion: res => {
                wx.hideLoading()
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.errorMsg,
                        showCancel: false
                    })
                    return
                }
                let {
                    list,
                    status
                } = this.data;
                list = list.concat(res.data.rows);
                if (list.length === res.data.total) {
                    status = "nomore"
                }
                this.setData({
                    list,
                    status
                })
            }
        })
    },
    copyCode(e) {
        wx.setClipboardData({
            data: e.currentTarget.id,
        })
    },
    getCustomerFinAccount() {
        tss.get({
            url: tss.url('') + `/tms/customerFinAccount/byCustomerId/${app.customerInfo.id}`,
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.errorMsg,
                        showCancel: false
                    })
                    return
                }
                let data = res.data.data
                this.setData({
                    allAmount: Number(data.qty).toFixed(2),
                    canUseAmount: Number(data.qty - data.qty_locked).toFixed(2),
                    frozenAmount: Number(data.qty_locked).toFixed(2),
                    limitAmount: data.owner.limit_qty ? Number(data.owner.limit_qty).toFixed(2) : data.owner.limit_qty
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
        if (this.data.status === 'nomore') return;
        this.setData({
            page: ++this.data.page
        }, () => {
            this.getDetail();
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
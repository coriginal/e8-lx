// pages-order/account/detail/in.js
const tss = require('../../../utils/tss.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        history: [],
        nomore: false,
        params: null,
        page: 1,
        rows: 4
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            params: JSON.parse(options.params)
        })
        this.getHistory()
    },
    onReachBottom() {
        console.log('触底')
        if (!this.data.nomore) {
            console.log("加载更多")
            this.setData({
                page: ++this.data.page
            })
            this.getHistory()
        }
    },
    getHistory() {
        tss.post({
            url: tss.url('') + `/api/data/invHistory`,
            params: {
                ...this.data.params,
                page: this.data.page,
                rows: this.data.rows
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    return
                }
                if (res.data.rows.length) {
                    res.data.rows = res.data.rows.map(item => {
                        item.toqty=item.toqty && Number(item.toqty).toFixed(2)
                        item.inqty=item.inqty && Number(item.inqty).toFixed(2)
                        item.outqty=item.outqty && Number(item.outqty).toFixed(2)
                        return item
                    })
                }

                this.setData({
                    history: this.data.history.concat(res.data.rows)
                })
                if (this.data.history.length >= res.data.total) {
                    this.setData({
                        nomore: true
                    })
                }
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
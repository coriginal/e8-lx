// pages-order/order/platform_order_list/index.js
const tss = require('../../../utils/tss.js')
const _App = getApp().globalData
const lc = require('../../../utils/listenerCenter.js')
import Pages from '../../../pages.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        statusColor: require('../order_list/source.js').OrderStatusColor,
        page: 1,
        rows: 5,
        status: 'loading',
        moreMenu: [{
                code: 'acceptOrder',
                title: '接单'
            },
            {
                code: 'printOrder',
                title: '打印订单',
                icon: 'i-punch'
            },
            {
                code: 'push2Logistic',
                title: '上传至平台',
                icon: 'i-punch',
                color: 'var(--red)'
            }
        ],
        orderIds:''
    },
    clickMoreMenu(e) {
        console.log(e)
        const {
            code
        } = e.currentTarget.dataset
        this[code]()
        setTimeout(() => {
            this.closeMoreMenu()
        }, 500)
    },
    push2Logistic() {
        wx.showLoading()
        tss.post({
            url: tss.url('') + '/tms/order/push2Logistices',
            params: {
                order_ids: this.data.menuOrderId
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.hideLoading()
                    wx.showModal({
                        content: res.errorMsg
                    })
                    return
                }
                wx.hideLoading()
                lc.emitEvent('ChangeInfo', {
                    change: true
                })
                wx.showModal({
                    title: '提示',
                    content: res.data,
                    confirmText: '确定',
                    showCancel: false
                })
            }
        })
    },
    printOrder() {
        wx.navigateTo({
            url: `${Pages.order_print}?ids=${this.data.menuOrderId}&code=${this.data.menuOrderCode}`
        })
    },
    onReachBottom(){
        if(this.data.status === 'nomore') return
        this.setData({
            page: ++this.data.page
        })
        this.queryData()
    },
    moreMenu(e) {
        const {
            id,
            status,
            code,
            idx
        } = e.currentTarget.dataset
        let realMoreMenu = this.data.moreMenu
        console.log(e.currentTarget.dataset, this.data.chooseType)

        // 不是待接单的隐藏取消订单入口
        //不是待接单的隐藏修改订单
        console.log(_App.user.isCustomer)
        if (status != '待接单') {
            realMoreMenu = realMoreMenu.filter(i => i.code != 'cancelOrder')
        }
        // 公司内部人员才可以有接单入口
        if (status != '待接单' && !_App.user.isCustomer) {
            realMoreMenu = realMoreMenu.filter(i => i.code != 'acceptOrder')
        }
        if (_App.user.isCustomer) {
            realMoreMenu = realMoreMenu.filter(i => i.code != 'pickDriver');
        }
        if (status != '待接单' && _App.user.isCustomer) {
            realMoreMenu = realMoreMenu.filter(i => i.code != 'changeOrder')
        }
        // 已取消的不允许修改和绑定承运商
        if (status == '已取消') {
            realMoreMenu = realMoreMenu.filter(i => i.code != 'changeOrder' && i.code != 'bindLogistic' && i.code != 'pickDriver')
        }

        // 已签收的也不允许修改订单和绑定承运商
        if (this.data.chooseType == 'signed') {
            realMoreMenu = realMoreMenu.filter(i => i.code != 'changeOrder' && i.code != 'bindLogistic' && i.code != 'pickDriver')
        }

        // 客户和体验者没得相关操作
        if (_App.user.isCustomer || _App.user.isTest) {
            realMoreMenu = realMoreMenu.filter(i => i.code != 'bindLogistic' && i.code != 'changeTrans' && i.code != 'acceptOrder')

            //客户上传平台
            if (!this.data.customerShowLcUpload) {
                realMoreMenu = realMoreMenu.filter(i => i.code != 'push2Logistic')
            }
        }
        this.setData({
            realMoreMenu,
            popVisible: true,
            menuOrderId: id,
            menuOrderCode: code,
            menuOrderIdx: idx
        })
    },
    closeMoreMenu() {
        this.setData({
            popVisible: false,
            menuOrderId: '',
            menuOrderIdx: '',
            menuOrderCode: ''
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.orderIds) {
            this.setData({
                orderIds: options.orderIds
            })
            this.queryData()
        }
        if (options.pageTitle) {
            wx.setNavigationBarTitle({
                title: options.pageTitle,
            })
        }
    },
    copyCode(e) {
        wx.setClipboardData({
            data: e.currentTarget.id,
        })
    },
    queryData() {
        let params = {}
        params.page = this.data.page
        params.rows = this.data.rows
        params.tms_order_id = this.data.orderIds
        tss.query({
            url: tss.url('sql') + 'tms_order',
            params,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    wx.hideLoading()
                    return
                }
                console.log(res)
                this.setData({
                    list: this.data.list.concat(res.data.rows),
                })
                if (res.data.total === this.data.list.length) {
                    this.setData({
                        status: 'nomore'
                    })
                }
            }
        })
    },
    goOrderDetail(e) {
        console.log(e)
        const {
            id,
            code,
            idx,
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `${Pages.order_detail}?id=${id}&code=${code}&orderIdx=${idx}`
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
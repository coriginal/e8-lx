import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
const lc = require('../../../utils/listenerCenter.js')
const _App = getApp().globalData

Page({
    data: {
        list: [],
        page: 1,
        more: true,
        search_content: '',
        result: []
    },
    createOrder() {
        console.log(this.data.result)
        wx.showModal({
            title: '提示',
            content: '确认下单吗？',
            complete: (res) => {
                if (res.confirm) {
                    tss.post({
                        url: tss.url('') + `/tms/order/customerId/createOrder`,
                        useCookie: true,
                        params: this.data.result.map(item=>Number(item)),
                        type: 'repair_operate',
                        completion: res => {
                            console.log(res)
                            if (res.failed) {
                                wx.showModal({
                                    content: res.errorMsg,
                                    showCancel: false
                                })
                                wx.hideLoading()
                                return
                            }
                            wx.showModal({
                                title: '提示',
                                content: '下单成功！',
                                showCancel: false,
                                complete: (res) => {
                                    wx.navigateBack()
                                }
                            })
                        }
                    })
                }
            }
        })
    },
    onChange(event) {
        this.setData({
            result: event.detail,
        });
    },
    onLoad(options) {
        console.log(options)
        let {
            from_page = '', fee_type = ''
        } = options
        this.setData({
            from_page,
            fee_type
        })
        wx.setNavigationBarTitle({
            title: '客户批量下单',
        })

        wx.removeStorage({
            key: 'cookie',
            complete: res => {
                console.log(res)
                this.queryCustomerList()
            }
        })
    },
    // 客户过滤
    bindKeyInput: tss.debounce(function (e) {
        let value = e.detail.value
        if (value) {
            // let filterData = this.data.list
            //     .filter(item => item.name.includes(value) || item.phone.includes(value))
            // this.setData({
            //     filterData
            // })
            this.setData({
                search_content: value,
                result: [],
                list: [],
                page: 1,
                more: true
            })
            this.queryCustomerList()
        } else {
            this.setData({
                search_content: null,
                result: [],
                list: [],
                page: 1,
                more: true
            })
            this.queryCustomerList()
        }
    }, 500),
    // 查询客户列表
    queryCustomerList(phone = null) {
        wx.showLoading({
            mask: true
        })
        tss.query({
            url: tss.url('sql') + 'customer',
            params: {
                active: 1,
                rows: 30,
                page: this.data.page,
                name: phone ? null : this.data.search_content,
                phone
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    wx.hideLoading()
                    return
                }
                if (!res.data.rows.length) {
                    this.setData({
                        more: false
                    })
                    wx.showToast({
                        title: '没有更多啦',
                        icon: 'none'
                    })
                    return
                }
                this.setData({
                    list: [...this.data.list, ...res.data.rows]
                }, () => {
                    wx.hideLoading()
                    if (this.data.search_content && !phone) {
                        if (this.data.search_content) {
                            this.queryCustomerList(this.data.search_content)
                        }
                    }
                })
            }
        })
    },
    onReachBottom() {
        if (this.data.more) {
            this.setData({
                page: ++this.data.page
            })
            this.queryCustomerList()
        }
    }
})
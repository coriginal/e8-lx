import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')

Page({
    data: {
        account_list: [],
        checklist: [],
        current_order: {},
        total_price: "请选择需要续费的账号",
        btn_isDisabled: true,
        order_params: {},
        month_list: [12],
        month_index: 0,
        isHidden: true,
        monthLimit: {
            4: [],
            2: []
        }
    },
    initMonthLimit() {
        let {
            monthLimit
        } = this.data;
        for (let i = 1; i <= 24; i++) {
            if (i >= 12) {
                monthLimit[2].push(i)
            }
            monthLimit[4].push(i)
        }
        this.setData({
            monthLimit
        })
        console.log(monthLimit)
    },
    onLoad: function (options) {
        this.initMonthLimit()
        this.getAccount()
    },
    checkboxChange(e) {
        //console.log('checkbox发生change事件，携带value值为：', e.detail.value)
        var values = e.detail.value;
        var accountlist = this.data.account_list
        var {monthLimit,order_params}=this.data
        if (values.length == 0) {
            for (i in accountlist) {
                console.log(i)
                accountlist[i].disabled = false
            }
            this.setData({
                total_price: "请选择需要续费的账号",
                btn_isDisabled: true,
                order_params: {},
                account_list: accountlist
            })
            return
        }
        console.log(values.length)
        if (values.length == 1) {
            for (var i = 0; i < accountlist.length; i++) {
                if (values[0] == accountlist[i].id) {
                    order_params.module_id = accountlist[i].moduleId
                    this.setData({
                        month_list:monthLimit[order_params.module_id]||[12],
                        month_index:order_params.module_id==4?11:0
                    })

                    for (var j = 0; j < accountlist.length; j++) {
                        if (accountlist[j].moduleId != accountlist[i].moduleId) {
                            accountlist[j].disabled = true
                        }
                    }
                    break;
                }
            }
        }
        //
        order_params.params = values;
        order_params.account_num = values.length;
        order_params.month_num = this.data.month_list[this.data.month_index]
        order_params.type = 'com.boubei.tss.modules.cloud.pay.RenewalfeeOrderHandler'
        //
        this.setData({
            account_list: accountlist,
            order_params: order_params
        })
        this.checkPrice()
    },
    //日期选择
    monthChange(e) {
        console.log(e)
        let order_params = this.data.order_params
        order_params.month_num = this.data.month_list[e.detail.value]
        this.setData({
            order_params: order_params,
            month_index: e.detail.value
        })
        this.checkPrice()
    },
    //检查价格
    checkPrice() {
        console.log(this.data.order_params)
        wx.showLoading({
            mask: true
        })
        tss.getJSON({
            url: tss.url('') + '/api/cloud/order/price/query',
            params: {
                ...this.data.order_params
            },
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        showCancel: false,
                        content: "未知错误，请稍后再试！",
                        success: res => {
                            wx.navigateBack()
                        }
                    })
                    wx.hideLoading()
                    return
                }
                console.log(res)
                if (!res.data.account_num) {
                    wx.hideLoading()
                    return
                }
                this.setData({
                    btn_isDisabled: false,
                    current_order: res.data,
                    total_price: `${res.data.account_num}个账号，续费${res.data.month_num}个月，需支付${res.data.money_cal}元`
                })
                wx.hideLoading()
            }
        })
    },
    getAccount() {
        wx.showLoading({
            mask: true
        })
        tss.query({
            url: tss.url('') + '/wx/api/users_ex_customer',
            completion: res => {
                console.log(res.data)
                let customer = res.data
                tss.query({
                    url: tss.url('') + '/auth/account/subauthorize',
                    completion: res => {
                        if (res.data.length == 0) {
                            this.setData({
                                total_price: "无可续费产品"
                            })
                            wx.hideLoading()
                            return
                        }
                        console.log(res)
                        var list = []
                        res.data.map(item => {
                            item.name = item.name.split('_')[1]
                            item.ownerId = customer[item.ownerId]
                            item.checked = false
                            item.disabled = false
                            list.push(item)
                        })
                        this.setData({
                            account_list: list,
                            isHidden: false
                        })
                        wx.hideLoading()
                    }
                })
            }
        })
    },
    confirmTopUp() {
        if (_App.user.isTest) {
            wx.showToast({
                title: '体验者无法续费!',
                icon: 'none'
            })
            return
        }
        wx.showLoading({
            mask: true
        })
        tss.post({
            url: tss.url('') + '/api/cloud/order',
            params: {
                ...this.data.order_params
            },
            completion: result => {
                console.log(result)
                if (result.failed) {
                    wx.showModal({
                        content: result.errorMsg,
                    })
                    wx.hideLoading()
                    return false
                }
                user.__wxCode({
                    completion: res => {
                        this.data.jscode = res.code
                        this.payMoney(result.data)
                    }
                })
            }
        })
    },
    payMoney: function (param) {
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
                                        content: '续费成功!',
                                        showCancel: false,
                                        success: res => {
                                            wx.navigateBack()
                                        },
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
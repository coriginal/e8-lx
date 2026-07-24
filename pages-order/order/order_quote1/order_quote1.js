const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
import {
    formatDate
} from '../../../utils/util'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        modelList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        const {
            companyInfo,
            ifHideCompany
        } = _App
        wx.setNavigationBarTitle({
            // title: _App.user.company
            title: (ifHideCompany && companyInfo.name) || ''
        })
        this.data.customerTag = 1
        this.data.orderInfo = JSON.parse(options.data)
        this.getCustomerModeList(this.data.orderInfo.customerInfo)
        this.setData({
            "orderInfo.red_packet": this.data.orderInfo.red_packet
        })
    },
    // 获取模型
    getCustomerModeList(customer) {
        wx.showLoading({
            title: '加载中...'
        })
        // /tss/price/getOptimalBillModels  
        const [send_province = "", send_city = "", send_district = ""] = this.data.orderInfo.send.obj?.region ?? []
        const [receive_province = "", reiceive_city = "", reiceive_district = ""] = this.data.orderInfo.receive.obj?.region ?? []
        console.log(send_district)
        tss.query({
            // url: tss.url('sql') + 'bind_bill_model',
            url: tss.url('') + '/price/getOptimalBillModels',
            params: {
                target: 'customer',
                targetId: customer.id,
                date: formatDate(new Date(), 'yyyy-MM-dd'),
                ...this.data.orderInfo.cargoInfo,
                send_province,
                send_city,
                send_district,
                receive_province,
                reiceive_city,
                reiceive_district
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
                const [receive_province="", receive_city="", receive_district="", receive_town=""] = this.data.orderInfo.receive?.addr ?? []
                const [send_province="", send_city="", send_district="", send_town=""] = this.data.orderInfo.send?.addr ?? []
                const {
                    weight,
                    amount,
                    volume
                } = this.data.orderInfo.cargoInfo
                let params = {
                    send_province,
                    send_city,
                    send_district,
                    send_town,
                    receive_province,
                    receive_city,
                    receive_district,
                    receive_town,
                    weight,
                    amount,
                    volume,
                    order_date: formatDate(new Date(), 'yyyy-MM-dd'),
                    service_mode: this.data.orderInfo.customerInfo.service_mode ? '派送' : '自提',
                    if_visit: this.data.orderInfo.customerInfo.if_visit,
                    truck_type: this.data.orderInfo.truck_type,
                    customer_id: this.data.orderInfo.customerInfo.id,
                    line_id: this.data.orderInfo.line_id
                    // ...this.data.orderInfo.customerInfo
                }
                let modelList = res.data.filter(i => this.data.orderInfo._transModeTitle == '整车' ? i.type == '按车型' : i.type !== '按车型')
                console.log(modelList)
                let arr = modelList
                    .map(i => {
                        return this.getModelListMoney({
                            ...params,
                            bill_model_id: i.id,
                            // if_visit: false,
                        })
                    })
                // this.data.modelList = res.data
                Promise.all(arr).then(res => {
                    console.log(res)
                    res.forEach((item, idx) => {
                        // let list = `modelList[${idx}].billModel`
                        console.log(item)
                        if (item.failed) {
                            modelList[idx].billModel = {}
                        } else {
                            modelList[idx].billModel = item.data
                        }
                    })
                    const _sort = (a, b) => a.allMoney - b.allMoney
                    let _modelList = modelList
                        // .filter(i => i.billModel.money)
                        .map(i => ({
                            ...i,
                            allMoney: Math.round(i.billModel.money + (i.billModel.vasFees.reduce((x, y) => x + y.fee, 0)))
                        }))
                        .sort(_sort)
                    _modelList && _modelList[0] ? _modelList[0].choosed = true : ''
                    this.setData({
                        modelList: _modelList
                    }, () => {
                        // if (this.data.modelList.length == 1) {
                        if (this.data.modelList.length) {
                            this.data.orderInfo.bill_model_id = this.data.modelList[0].id
                            this.setData({
                                chooseCardIdx: 0
                            })
                        }
                        // }
                    })
                    wx.hideLoading()
                })
            }
        })
    },

    // 计算价格
    getModelListMoney(params) {
        return new Promise(completion => {
            tss.post({
                url: tss.url('') + '/price/getMoney',
                params,
                completion
            })
        })
    },
    // onAction(e) {
    //   console.log(e)
    //   let idx = e.detail.index
    //   this.data.orderInfo.bill_model_id = this.data.modelList[idx].id
    //   wx.navigateTo({
    //     url: `${Pages.order_quote2}?data=${JSON.stringify(this.data.orderInfo)}`
    //   })
    // },
    nextStep() {
        if (this.data.orderInfo.bill_model_id) {
            wx.navigateTo({
                url: `${Pages.order_quote2}?data=${JSON.stringify(this.data.orderInfo)}`,
                success: res => {
                    this.data.customerTag = 2
                }
            })
        } else {
            wx.showToast({
                title: '请选择一个产品！',
                icon: 'none'
            })
        }
    },
    goOnOrder() {
        wx.navigateTo({
            url: `${Pages.order_quote2}?data=${JSON.stringify(this.data.orderInfo)}`,
            success: res => {
                this.data.customerTag = 2
            }
        })
    },
    chooseCard(e) {
        const idx = e.currentTarget.id
        this.data.orderInfo.bill_model_id = this.data.modelList[idx].id
        this.setData({
            chooseCardIdx: idx
        })
    },
    onUnload() {
        if (this.data.customerTag == 1) {
            this.createPotentialCustomer()
        }
    },
    createPotentialCustomer() {
        const {
            weight,
            volume,
            amount
        } = this.data.orderInfo.cargoInfo
        let bill_model = []
        let money = []
        let bill_model_id = []
        this.data.modelList.forEach(item => {
            bill_model.push(item.name)
            money.push(item.allMoney)
            bill_model_id.push(item.id)
        })
        tss.post({
            url: tss.recordURLs('tms_pontential_customer').CREATE,
            params: {
                name: _App.user.cnName,
                phone: _App.user.uName,
                receive_addr: this.data.orderInfo.receive?.obj?.region.join('') || '',
                weight,
                volume,
                amount,
                bill_model: JSON.stringify(bill_model),
                money: JSON.stringify(money),
                bill_model_id: JSON.stringify(bill_model_id)
            }
        })
    },
    showDetail(e) {
        const {
            id: idx
        } = e.currentTarget
        this.setData({
            showPop: true,
            product: this.data.modelList[idx].description
        })
    },
    onClosePopup() {
        this.setData({
            showPop: false
        })
    }
})
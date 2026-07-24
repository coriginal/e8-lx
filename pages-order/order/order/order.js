const tss = require('../../../utils/tss.js')
const _App = getApp().globalData

import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        form: {
            if_visit: true
        },
        orderInfo: {},
        truckTaskCode:''
    },

    onLoad: function (options) {
        console.log(options)
        if(options._params){
            options = JSON.parse(options._params)
        }
        if(user.domain=='D006'){
            wx.showModal({
                content: "您目前登录的是测试环境，如您是正式发件客户，请不要下单并联系物流公司处理，是否继续",
                success: res => {
                    if(!res.confirm){
                        wx.navigateBack()
                    }
                }
            })
        }
        if (_App.user.uName) {
            if (_App.user.roles.includes('体验者')) {
                wx.reLaunch({
                    url: Pages.login
                })
            }
        } else {
            wx.reLaunch({
                url: Pages.login
            })
        }
        // console.log(options)
        // 传入Id即为修改订单
        const {
            companyInfo,
            ifHideCompany
        } = _App
        wx.setNavigationBarTitle({
            // title: _App.user.company
            title: (ifHideCompany && companyInfo.name) || ''
        })
        if (options.orderId) {
            this.queryOrderData(options.orderId)
            this.setData({
                orderId: options.orderId
            })
        }
        if (options.scanType && options.scanCode) {
            let form = {}
            form[options.scanType] = options.scanCode
            this.setData({
                form,
                ifScan: true
            })
        }
        //是否是落地配补录运单
        if(options.truckTaskCode){
            console.log("补录运单",options.truckTaskCode)
            this.setData({
                truckTaskCode: options.truckTaskCode
            })
        }
    },
    // 查询此单
    queryOrderData(id) {
        tss.query({
            url: tss.url('') + '/tms/order/' + id,
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: `获取订单数据失败${res.errorMsg}`
                    })
                    return
                }
                this.dealData(res.data)
            }
        })
    },
    // 处理数据
    dealData(data) {
        for (let key in data) {
            data[key] = data[key] || ''
        }
        let keys = ['send', 'receive']
        let orderInfo = {};
        let recordsList = {}
        let records = []
        for (var i = 1; i <= 7; i++) {
            records.push(`udf${i}`)
        }
        records.forEach(item => {
            recordsList[item] = data[item]
        })
        console.log(recordsList)
        keys.forEach(item => {
            orderInfo[item] = {
                addr: [data[`${item}_province`], data[`${item}_city`], data[`${item}_district`], data[`${item}_town`], data[`${item}_street_no`]],
                info: [data[`${item}_man`], data[`${item}_phone`]],
                site: data[`${item}_site`],
                obj: {
                    region: [data[`${item}_province`], data[`${item}_city`], data[`${item}_district`], data[`${item}_town`]],
                    addr_detail: data[`${item}_street_no`],
                    name: data[`${item}_man`],
                    phone: data[`${item}_phone`]
                },
            }
        })
        orderInfo.fee = {
            _fees: ''
        };
        ['entry_type', 'insurance_type', 'rcode_type', 'upstairs_type'].forEach(item => {
            orderInfo.fee[item] = data[item]
            orderInfo.fee._fees += `${data[item]} `
        })

        orderInfo.customerInfo = {
            id: data.customer_id,
            name: data.customer_name,
            clerk:data.clerk||''
        }
        orderInfo.cargo = {
            message: ''
        };
        [{
                a: 'cargo',
                b: ''
            },
            {
                a: 'amount',
                b: '件'
            },
            {
                a: 'weight',
                b: getApp().globalData.DomainConfig.weight_unit?getApp().globalData.DomainConfig.weight_unit.content:"kg"
            },
            {
                a: 'volume',
                b: 'm³'
            },
            {
                a: 'pack',
                b: ''
            }
        ]
        .forEach(item => {
            orderInfo.cargo[item.a] = `${data[item.a]}`
            orderInfo.cargo.message += `${data[item.a]}${item.b} `
        })
        orderInfo.cargo.subOrders = data.subOrders
        orderInfo[data.trans_mode] = {
            message: '',
            transModeInfo: {}
        };
        ['expect_arrive', 'expect_depart', 'pallet_num', 'truck_type'].forEach(item => {
            orderInfo[data.trans_mode].transModeInfo[item] = data[item]
            orderInfo[data.trans_mode].message = `点击修改${data.trans_mode}信息`
        })
        console.log(data)
        orderInfo.settleTypeList = [{
            title: '到付',
            checked: data.settle_type == '到付',
            arrive_pay: data.arrive_pay
        }, {
            title: '现付',
            checked: data.settle_type == '现付'
        }, {
            title: '月结',
            checked: data.settle_type == '月结'
        }]
        orderInfo.line_id=data.line_id
        orderInfo.line_name=data.line_name
        let form = {
            id: data.id,
            ccode: data.ccode,
            if_visit: data.if_visit,
            settle_type: data.settle_type,
            trans_mode: data.trans_mode,
            trans_mode_id: data.trans_mode_id,
            remark: data.remark,
            recordsList,
            recordsInfo: recordsList
        }
        console.log(orderInfo, form)
        this.setData({
            orderInfo,
            form
        })
        let order=this.selectComponent("#order")
        order.getCustomerLine(true)
    },
    refresh() {
        wx.showLoading({
          title: '请稍后',
          mask:true
        })
        wx.redirectTo({
            url: Pages['order'],
        })
    }
})
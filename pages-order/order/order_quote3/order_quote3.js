const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
import {
    formatDate
} from '../../../utils/util'
Page({

    data: {
        _options: {
            if_up: true,
            if_warehouse: true,
            settle_type: true,
            trans_mode: true,
            title: "货",
            needAddress: false
        },
        needAddress: true,
        visible: false,
        receipt_address: {
            info: "省 / 市 / 区 / 县"
        },
        value_addr: '',
        rcode_addr: '',
        pcShow: false,
        receiptManList: [],
        receiptManListFilter: [],
        receiptManKeywords: '',
        rcode_man:'',
        rcode_phone:'',
        rcode_street_no:''
    },
    openReceiptManBook(){
        this.setData({
            pcShow: true
        })
    },
    onClose() {
        this.setData({
            visible: false
        })
    },
    open() {
        this.setData({
            visible: true
        })
    },
    selectReceiptMan(e) {
        console.log(e)
        const {
            info
        } = e.currentTarget.dataset
        let region = `${info.province} ${info.city} ${info.district}`.split(' ')
        let {
            receipt_address
        } = this.data
        receipt_address = {
            obj: {
                region
            },
            addr: region
        }
        this.setData({
            receipt_address,
            rcode_addr: region.join(' '),
            rcode_phone: info.phone,
            rcode_man: info.man,
            rcode_street_no: info.street_no,
            pcShow:false
        })
    },
    onChange(e) {
        console.log(e)
        this.setData({
            value_addr: e.detail.value,
        })
        if (e.detail.done) {
            this.setData({
                rcode_addr: e.detail.options.map((n) => n.label).join(' '),
                receipt_address: {
                    obj: {
                        region: e.detail.options.map((n) => n.label)
                    },
                    addr: e.detail.options.map((n) => n.label)
                }
            })
        }
    },
    getReceiptMan() {
        tss.get({
            url: tss.url('') + '/api/data/sql/receipt_man',
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg
                    })
                    wx.hideLoading()
                    return
                }
                this.setData({
                    receiptManListFilter: res.data,
                    receiptManList: res.data
                })
            }
        })
    },
    debounce(fn, wait) {
        var timer = null;
        return function () {
            var context = this
            var args = arguments
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            timer = setTimeout(() => {
                fn.apply(context, args)
            }, wait)
        }
    },
    filterReceiptManList(e) {
        this.debounce(() => {
            this.setData({
                receiptManKeywords: e.detail.value,
                receiptManListFilter: this.data.receiptManList.filter(item => {
                    let address = `${item.province}${item.city}${item.district}`
                    if (item.phone.includes(e.detail.value) || item.man.includes(e.detail.value) || address.includes(e.detail.value)) {
                        return item
                    }
                })
            })
        }, 200)()
    },
    onLoad: function (options) {
        const {
            companyInfo,
            ifHideCompany
        } = _App
        wx.setNavigationBarTitle({
            // title: _App.user.company
            title: (ifHideCompany && companyInfo.name) || ''
        })
        this.setData({
            orderInfo: JSON.parse(options.data)
        })
        this.getCusTransMode(this.data.orderInfo.customerInfo.id)
        if (_App.user.domain == 'D768') {
            let opts = this.data._options;
            Object.keys(this.data._options).forEach((item) => {
                if (item === "title") {
                    opts[item] = ''
                } else if (item === 'needAddress') {
                    opts[item] = true
                } else {
                    opts[item] = false
                }
            })
            this.setData({
                _options: opts
            })
        }
        this.getReceiptMan()
    },

    radioChange(e) {
        this.setData({
            "orderInfo.settle_type": e.detail.value
        })
    },
    chooseRcode(e) {
        if (e.detail.value === '纸质回单') {
            this.setData({
                needAddress: true
            })
        } else {
            this.setData({
                needAddress: false
            })
        }
    },
    formSubmit(e) {
        console.log(e)
        const {
            if_rcode,
            if_up,
            if_warehouse,
            ...form
        } = e.detail.value
        if (this.data.if_rcode && this.data.needAddress && this.data._options.needAddress) {
            if (!form.rcode_man || !form.rcode_phone) {
                wx.showModal({
                    title: '提示',
                    content: '请填写回单收件人信息',
                    showCancel: false
                })
                return
            }
            if (!this.data.rcode_addr || !form.rcode_street_no) {
                wx.showModal({
                    title: '提示',
                    content: '请填写回单邮寄地址',
                    showCancel: false
                })
                return
            }
            form['rcode_addr'] = this.data.rcode_addr
        }
        for (let key in form) {
            if (form[key]) {
                this.data.orderInfo[key] = form[key]
            }
        }
        this.confirmOrder()
    },
    switchChange(e) {
        let key = e.currentTarget.id
        if (key === 'if_rcode') {
            this.setData({
                needAddress: e.detail.value
            })
        }
        this.setData({
            [key]: e.detail.value
        })
    },

    confirmOrder() {
        wx.showLoading({
            mask: true
        })
        let data = this.dealData(this.data.orderInfo)
        tss.post({
            url: tss.url('') + '/tms/order',
            params: data,
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg
                    })
                    wx.hideLoading()
                    return
                }
                wx.reLaunch({
                    url: `${Pages.order_success}?orderId=${res.data.data}&pageFrom=order_quote`,
                    success: () => wx.vibrateLong()
                })
            }
        })
    },

    // 字段处理
    dealData(data) {

        let {
            customerInfo,
            cargoInfo,
            send,
            receive,
            red_packet = {},
            ...other
        } = data

        let {
            id: customer_id,
            clerk = _App.user.isCustomer ? _App.user.belong || null : _App.user.mobile || _App.user.uName,
            origin = App.ifFromGzh ? "WECHAT-XJ-GZH" : "WECHAT-XJ",
            if_send = true,
            service_mode,
            if_visit
        } = customerInfo
        service_mode = service_mode ? '派送' : '自提'
        // 处理收寄件信息
        let x = ['send', 'receive'],
            y = ['province', 'city', 'district', 'town', 'street_no'],
            z = ['man', 'phone'],
            v = ['site']
        let addrObj = {}
        x.forEach(title => {
            y.forEach((addr, index) => {
                addrObj[`${title}_${addr}`] = addr != 'street_no' ? data[title].obj.region[index] || '' : data[title].obj.addr_detail || ''

            })
            z.forEach((name, index) => {
                addrObj[`${title}_${name}`] = name == 'man' ? data[title].obj.name : data[title].obj[name] || ''
            })
            v.forEach((site, index) => {
                addrObj[`${title}_${site}`] = site == 'site' ? data[title].site : ''
            })
        })
        // const { _transModeTitle }

        return {
            redPacketDetailId: red_packet.id || '',
            ...other,
            ...data.cargoInfo,
            ...data.fee,
            customer_id,
            clerk,
            origin,
            if_send,
            if_visit,
            service_mode,
            ...addrObj
        }
    },
    getCusTransMode(customer_id) {

        const getAllMode = () =>
            new Promise(resolve => {
                tss.query({
                    url: tss.url('sql') + 'trans_mode_wt',
                    completion: res => {
                        console.log("trans_mode_wt:", res)
                        if (res.failed) {
                            console.log("trans_mode_wt:", res.errorMsg)
                            resolve('fail')
                        } else {
                            resolve(res.data)
                        }
                    }
                })
            })
        getAllMode()
            .then(models => {
                tss.post({
                    url: tss.url('') + '/tms/api/customerGetTransMode',
                    params: {
                        customer_id
                    },
                    completion: res => {
                        if (res.failed) return

                        let transModeList = res.data.map(i => ({
                            ...i,
                            if_wt: models.find(x => x.id == i.id).if_wt
                        }))
                        if (this.data.orderInfo._transModeTitle == '整车') {
                            transModeList = transModeList.filter(i => i.if_wt)
                        } else {
                            transModeList = transModeList.filter(i => !i.if_wt)
                        }
                        this.setData({
                            transModeList
                        })
                        this.chooseTransMode({
                            currentTarget: {}
                        })
                    }
                })
            })

    },
    chooseTransMode(e) {
        const idx = e.currentTarget.id || 0
        this.setData({
            choosedId: idx,
            "orderInfo.trans_mode_id": this.data.transModeList[idx].id,
            "orderInfo.trans_mode": this.data.transModeList[idx].name
        })
    }
})
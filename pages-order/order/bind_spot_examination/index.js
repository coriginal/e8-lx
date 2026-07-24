// pages-order/order/order_price_parity/index.js
const tss = require('../../../utils/tss')
const app = getApp().globalData
const lc = require('../../../utils/listenerCenter')
import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
Page({
    animation: null,
    /**
     * 页面的初始数据
     */
    data: {
        form: {
            // subOrders: [null],
            // if_visit: true,
            // service_mode: '自提',
            // settle_type: '现付'
        },
        customerInfo: null,
        addrField: ['man', 'phone', 'province', 'city', 'district', 'town', 'street_no'],
        addrInfo: {
            send: {},
            receive: {}
        },
        isCustomer: true,
        animationList: [],
        current: null,
        // hideChooseServiceMode: true,
        // hideChooseSettleType: true,
        // settleTypeList: ['现付', '月结', '到付'],
        // serviceModeList: ['派送', '自提'],
        // showPickTime: false,
        // showOther: false,
        // platFormPriceList: [],
        showDetail: false,
        needGet: false,
        currentSelectPlatForm: null,
        requiredList: [],
        platformInfoList: [],
        hidePlatformList: false,
        checkedList: [],
        resultList: [],
        hide: true,
        status: 0 //控制底部按钮 0无结果 1有结果
    },

    /**
     * 生命周期函数--监听页面加载
     */

    async onLoad(options) {
        if (user.domain == 'D006') {
            wx.showModal({
                content: "您目前登录的是测试环境，如您是正式发件客户，请不要下单并联系物流公司处理，是否继续",
                success: res => {
                    if (!res.confirm) {
                        wx.navigateBack()
                    }
                }
            })
        }
        wx.showLoading({
            title: '请稍候...',
            mask: true
        })
        //
        this.animation = wx.createAnimation({
            duration: 500,
        })
        // this.getRecordsField()
        // this.queryConfigCode()
        await this.getPlatformInfo()
        console.log(app)
        lc.addListener('orderInfo', this.__wxWebviewId__.toString(), res => {
            console.log(res)
            switch (res.type) {
                case "send":
                case "receive":
                    let {
                        form, addrField, addrInfo
                    } = this.data
                    addrField.map((item, index) => {
                        form[`${res.type}_${item}`] = index <= 1 ? (index == 0 ? res.data['obj']['name'] : res.data['obj']['phone']) : (index == 6 ? res.data.obj.addr_detail : res.data.addr[index - 2])
                    })
                    console.log(form)
                    addrInfo[res.type] = res.data
                    this.setData({
                        form,
                        addrInfo,
                        needGet: res.type == "receive"
                    })
                    break;
                case "customerInfo":
                    this.setData({
                        customerInfo: res.data
                    })
                    break;
                    // case "cargo":
                    //     let {
                    //         subOrders
                    //     } = this.data.form
                    //     for (let key in res.data) {
                    //         subOrders[key] = res.data[key]
                    //     }
                    //     this.setData({
                    //         "form.subOrders": subOrders,
                    //         needGet: true
                    //     })
                    //     break;
                    // case "fee":
                    //     if (res.data._fees.length) {
                    //         this.setData({
                    //             form: {
                    //                 ...this.data.form,
                    //                 ...res.data
                    //             }
                    //         })
                    //         if (Number(res.data['insurance_limit'])) {
                    //             this.setData({
                    //                 needGet: true
                    //             })
                    //         }
                    //     } else {
                    //         let {
                    //             form
                    //         } = this.data
                    //         form._fees && delete form['_fees']
                    //         this.setData({
                    //             form
                    //         })
                    //     }
                    //     break;
                default:
                    break;
            }
        })
        if (app.user.groups.includes('customer')) {
            //0.1 0.01
            tss.post({
                url: tss.url('sql') + 'customer',
                params: {},
                completion: res => {
                    wx.hideLoading()
                    console.log(res)
                    this.setData({
                        customerInfo: res.data[0],
                        "form.customer_id": res.data[0].id,
                        "form.clerk": res.data[0].clerk,
                    })
                }
            })
        } else {
            wx.hideLoading()
            this.setData({
                isCustomer: false,
            })
        }
    },
    platformListAnim(type = 0, back = false) {
        let list = this.data.animationList
        this.animation.opacity(back ? 0 : type).step()
        list[type] = this.animation.export()
        this.setData({
            animationList: list
        })
        setTimeout(function () {
            this.setData({
                hidePlatformList: !back,
                hide: back
            })
            this.animation.opacity(type == 0 ? 1 : back ? 1 : 0).step() //1:1
            list[type == 0 ? 1 : 0] = this.animation.export()
            this.setData({
                animationList: list
            })
        }.bind(this), 500)
    },
    goChooseAddr(e) {
        if (!this.data.customerInfo) {
            wx.showModal({
                title: '提示',
                content: '请先选择客户哦',
                showCancel: false
            })
            return
        }
        const {
            id: type
        } = e.currentTarget
        const {
            id: customer_id
        } = this.data.customerInfo
        let info = {
            type,
            customer_id
        }
        wx.navigateTo({
            url: `${Pages.customer_addr_list}?info=${JSON.stringify(info)}`
        })
    },
    reSearch() {
        this.setData({
            status: 0
        })
        this.platformListAnim(1, true)
    },
    // 前往编辑地址
    goEditAddr(e) {
        if (!this.data.customerInfo) {
            wx.showModal({
                title: '提示',
                content: '请先选择客户哦',
                showCancel: false
            })
            return
        }
        const {
            id: type
        } = e.currentTarget
        const {
            id: customer_id
        } = this.data.customerInfo
        wx.navigateTo({
            url: `${Pages.customer_addr_edit}?customer_id=${customer_id}&type=${type}&data=${JSON.stringify(this.data.addrInfo[type] || {})}`
        })
    },
    toChooseCustomer(e) {
        wx.navigateTo({
            url: Pages.customer_list
        })
    },
    // goCargoInfo(e) {
    //     var index = e.currentTarget.dataset.index
    //     if (this.data.orderId) {
    //         wx.navigateTo({
    //             url: `${Pages.order_cargo_tms}?type=cargo&subOrders=${JSON.stringify(this.data.form.subOrders || [])}`
    //         })
    //         return
    //     }
    //     console.log(this.data.form.subOrders[index])
    //     wx.navigateTo({
    //         url: `${Pages.order_cargo}?type=cargo&index=${index}&data=${JSON.stringify(this.data.form.subOrders || "")}`,
    //     })
    // },
    addCargoItem() {
        let {
            form
        } = this.data
        form.subOrders.push(null)
        this.setData({
            form
        })
    },
    // delCargoItem(e) {
    //     let {
    //         index
    //     } = e.currentTarget.dataset, {
    //         form
    //     } = this.data
    //     form.subOrders.splice(index, 1)
    //     this.setData({
    //         form
    //     })
    // },
    // showChooseServiceMode() {
    //     this.setData({
    //         hideChooseServiceMode: !this.data.hideChooseServiceMode
    //     })
    // },
    // showChooseSettleType() {
    //     this.setData({
    //         hideChooseSettleType: !this.data.hideChooseSettleType
    //     })
    // },
    // chooseSettleType(e) {
    //     console.log(e)
    //     let type = e.currentTarget.id,
    //         {
    //             form
    //         } = this.data
    //     form.settle_type = type
    //     this.setData({
    //         form,
    //         hideChooseSettleType: true
    //     })
    // },
    // chooseServer(e) {
    //     console.log(e)
    //     let mode = e.currentTarget.id,
    //         {
    //             form
    //         } = this.data
    //     form.service_mode = mode
    //     this.setData({
    //         form,
    //         hideChooseServiceMode: true
    //     })
    // },
    // switchChange(e) {
    //     console.log(e)
    //     this.setData({
    //         "form.if_visit": e.detail.value
    //     })
    // },
    // getPickTimes() {
    //     this.setData({
    //         showPickTime: true
    //     })
    // },
    // changePickTime(e) {
    //     console.log(e)
    //     this.setData({
    //         "form.scheduled_pick_time": e.detail,
    //         showPickTime: false
    //     })
    // },
    // inputCode(e) {
    //     let code = e.detail.value
    //     if (code) {
    //         this.setData({
    //             "form.code": code
    //         })
    //     } else {
    //         let {
    //             form
    //         } = this.data
    //         delete form['code']
    //         this.setData({
    //             form
    //         })
    //     }
    // },
    // scanCode() {
    //     var _this = this
    //     wx.scanCode({
    //         success(res) {
    //             console.log(res)
    //             _this.setData({
    //                 "form.code": res.result
    //             })
    //         },
    //         fail: err => {
    //             wx.showModal({
    //                 title: '提示',
    //                 content: '扫描失败，请重新尝试',
    //                 showCancel: false
    //             })
    //         }
    //     })
    // },
    // goFeeInfo(e) {
    //     wx.navigateTo({
    //         url: `${Pages.order_fee}?type=fee&data=${JSON.stringify(this.data.form || {})}`
    //     })
    // },
    // goOtherInfo() {
    //     this.setData({
    //         showOther: true
    //     })
    // },
    setRecords() {
        let {
            recordsInfo,
            form,
            curRecords,
            recordsLabel
        } = this.data
        curRecords = ''
        form = {
            ...form,
            ...recordsInfo
        }
        for (let i in recordsInfo) {
            if (recordsInfo[i]) {
                curRecords += `${recordsLabel[i]}:${recordsInfo[i]},`
            }
        }
        curRecords = curRecords.slice(0, -1)
        this.setData({
            form,
            curRecords,
            showOther: false
        })
    },
    recordInput(e) {
        let {
            recordsInfo
        } = this.data
        recordsInfo[e.currentTarget.id] = e.detail.value

        this.setData({
            recordsInfo,
        })
    },
    // getRecordsField() {
    //     tss.get({
    //         url: tss.url('') + '/api/bi/recordfield/tms_order',
    //         completion: res => {
    //             if (res.failed) {
    //                 wx.showModal({
    //                     showCancel: false,
    //                     content: '获取自定义字段失败'
    //                 })
    //             }
    //             let list = res.data.filter(item => {
    //                 return item.type !== "hidden"
    //             })
    //             let recordsLabel = {}
    //             let curRecords = ""
    //             list.map(item => {
    //                 recordsLabel[item.code] = item.label
    //             })
    //             for (let i in this.data.form['recordsList']) {
    //                 if (this.data.form.recordsList[i]) {
    //                     curRecords += `${recordsLabel[i]}:${this.data.form.recordsList[i]},`
    //                 }
    //             }
    //             curRecords = curRecords.slice(0, -1)
    //             this.setData({
    //                 recordsList: list,
    //                 recordsInfo: this.data.form['recordsList'] || {},
    //                 recordsLabel,
    //                 curRecords,
    //                 initB: true
    //             })
    //             this.checkInitLoading()
    //         }
    //     })
    // },
    async checkInitLoading() {
        // if (this.data.initA && this.data.initB && this.data.initC && this.data.initD) {
        //     wx.hideLoading()
        //     console.log(this.data.requiredList, this.data.recordsList)
        // } else {
        //     console.log("初始化加载还未完成")
        // }
    },
    remarkInput(e) {
        if (!e.detail.value) {
            let {
                form
            } = this.data
            form.remark && delete form['remark']
            this.setData({
                form
            })
            return
        }
        this.setData({
            "form.remark": e.detail.value
        })
    },
    search() {
        let {
            form
        } = this.data, addressReady = false
        if (form.receive_province && form.receive_city && form.receive_district) {
            addressReady = true
        }
        if (!addressReady) {
            console.log("信息还未完整，不进行比价")
            wx.showModal({
                title: '提示',
                content: '填写收件地址即可查询',
                showCancel: false
            })
            return
        }
        if (!this.data.checkedList.length) {
            wx.showModal({
                title: '提示',
                content: '请选择承运商',
                showCancel: false
            })
            return
        }
        wx.showLoading({
            title: '查询中...',
            mask: true
        })
        let data = {
            ...this.data.form,
            platformSignStr: this.data.checkedList.join(','),
            searchType: 1
        }
        wx.request({
            url: tss.url('') + '/tms/api/rpa/search',
            data,
            method: "POST",
            header: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", //"application/json;charset=UTF-8",
                "Cookie": wx.getStorageSync('cookie')
            },
            success: res => {
                console.log(res)
                wx.hideLoading()
                if (res.failed || !res.data.result) {
                    wx.showModal({
                        content: '查询失败',
                        showCancel: false
                    })
                    return
                }
                if (res.data.data.length) {
                    this.setData({
                        resultList: res.data.data,
                        hide: false,
                        status: 1
                    })
                    this.platformListAnim()
                } else {
                    wx.showModal({
                        content: '未查询到数据',
                        showCancel: false
                    })
                }
            }
        })
    },
    openDetail(e) {
        let {
            index
        } = e.currentTarget.dataset
        console.log(this.data.resultList[index])
        let current = {
            ...this.data.resultList[index]
        }
        current.delivery_details = current.delivery_details && JSON.parse(current.delivery_details)
        this.setData({
            showDetail: true,
            current
        })
    },
    toWriteOrder() {
        let {
            form,
            customerInfo,
            addrInfo
        } = this.data
        wx.redirectTo({
            url: `../order_price_parity/index?customerInfo=${JSON.stringify(customerInfo)}&form=${JSON.stringify(form)}&addrInfo=${JSON.stringify(addrInfo)}`,
        })
    },
    pageScrollToBottom() {
        wx.createSelectorQuery().select('#box').boundingClientRect(function (rect) {
            if (rect) {
                // 使页面滚动到底部
                console.log(rect.height);
                wx.pageScrollTo({
                    scrollTop: rect.height
                })
            }
        }).exec()
    },
    dealPrice(data) {
        console.log(data)
        data = data.filter(item => item.search_status)
        console.log(data)
        if (!data.length) {
            wx.showToast({
                title: '暂无报价!',
                icon: 'none'
            })
            return
        }
        for (let i in data) {
            data[i]['feeFlag'] == false && delete data[i]
            if (this.data.isCustomer) {
                data[i]['cost'] += (data[i]['cost'] * 100 + data[i]['add_fee'] * 100) / 100
            } else {
                if (data[i]['platform_key'] == 7) {
                    data[i]['cost'] = data[i]['add_fee']
                }
            }
        }

        this.setData({
            platFormPriceList: data,
            currentSelectPlatForm: {
                ...data[0],
                index: 0
            }
        })
        this.getLcId()
        this.pageScrollToBottom()
    },
    choosePlatForm(e) {
        console.log(e.currentTarget.dataset.platform)
        this.setData({
            currentSelectPlatForm: {
                ...e.currentTarget.dataset.platform,
                index: e.currentTarget.dataset.index
            },
            'form.platformProductCostId': e.currentTarget.dataset.platform.id,
            'form.batchId': e.currentTarget.dataset.platform.batch_id,
            'form.lc_id': e.currentTarget.dataset.platform.sign
        })
        this.getLcId()
    },
    // queryConfigCode() {
    //     tss.get({
    //         url: tss.url('data') + 'xcx_order_write',
    //         completion: res => {
    //             console.log(res)
    //             if (res.failed) {
    //                 return
    //             }
    //             let list = res.data.length ? JSON.parse(res.data[0].content).filter(i => i.belong_title == '增值服务' && !i.hidden && i.field !== 'arrive_pay' && i.required == "true") : []
    //             this.setData({
    //                 requiredList: list,
    //                 initA: true
    //             })
    //             this.checkInitLoading()
    //         }
    //     })
    // },
    save() {
        if (!this.data.form.hasOwnProperty('send_man') || !this.data.form.hasOwnProperty('receive_man')) {
            wx.showModal({
                title: '提示',
                content: '收件或寄件人未填写',
                showCancel: false
            })
            return
        }
        let cargoReady = false
        for (let i in this.data.form.subOrders) {
            let j = this.data.form.subOrders[i]
            if (j) {
                if (j.cargo && j.amount && j.weight && j.volume) {
                    cargoReady = true
                } else {
                    cargoReady = false
                }
            }
        }
        if (!cargoReady) {
            wx.showModal({
                title: '提示',
                content: '货物信息未填写完整',
                showCancel: false
            })
            return
        }
        for (let i in this.data.requiredList) {
            if (!this.data.form.hasOwnProperty(this.data.requiredList[i].field)) {
                wx.showModal({
                    title: '提示',
                    content: '增值服务有必填项未填写',
                    showCancel: false
                })
                return
            }
        }
        let form_copy = {
            ...this.data.form
        }
        let newSuborders = form_copy.subOrders.filter(item => item)
        this.setData({
            "form.subOrders": newSuborders
        })
        form_copy.subOrders = JSON.stringify(newSuborders)
        form_copy['customer_id'] = this.data.customerInfo.id
        form_copy['clerk'] = this.data.customerInfo.clerk
        let content = "确定下单吗？"
        if (!this.data.currentSelectPlatForm) {
            content = "当前无报价，您仍可下单，但不会推送至平台，确定下单吗？"
        }
        wx.showModal({
            title: '提示',
            content,
            complete: (res) => {
                if (res.confirm) {
                    wx.showLoading({
                        mask: true
                    })
                    tss.post({
                        url: tss.url('') + '/tms/order',
                        params: {
                            ...form_copy
                        },
                        completion: res => {
                            wx.hideLoading()
                            if (res.failed) {
                                wx.showModal({
                                    title: '提示',
                                    content: '下单失败，请稍后再试',
                                    showCancel: false
                                })
                                return
                            }
                            console.log(res)
                            if (this.data.form['lc_id']) {
                                wx.showLoading({
                                    title: '正在上传平台...',
                                })
                                this.upPlatform(res.data.data).then(r => {
                                    wx.hideLoading()
                                    if (r) {
                                        wx.redirectTo({
                                            // wx.navigateTo({
                                            url: `${Pages.order_success}?orderId=${res.data.data}&ifScan=${this.data.ifScan}&pageFrom=order_price_parity`,
                                            success: wx.vibrateLong()
                                        })
                                    } else {
                                        wx.showModal({
                                            title: '提示',
                                            content: '平台推送失败，请联系相关负责人',
                                            showCancel: false,
                                            complete: (e) => {
                                                if (e.confirm) {
                                                    wx.redirectTo({
                                                        // wx.navigateTo({
                                                        url: `${Pages.order_success}?orderId=${res.data.data}&ifScan=${this.data.ifScan}&pageFrom=order_price_parity`,
                                                        success: () => wx.vibrateLong()
                                                    })
                                                }
                                            }
                                        })
                                    }
                                })
                            } else {
                                wx.redirectTo({
                                    // wx.navigateTo({
                                    url: `${Pages.order_success}?orderId=${res.data.data}&ifScan=${this.data.ifScan}&pageFrom=order_price_parity`,
                                    success: wx.vibrateLong()
                                })
                            }
                        }
                    })
                }
            }
        })
    },
    getPlatformInfo(sign) {
        return new Promise((resolve, reject) => {
            tss.post({
                url: tss.url('') + '/tms/api/user/platform/info',
                completion: res => {
                    if (res.failed) {
                        wx.hideLoading()
                        wx.showModal({
                            title: '提示',
                            content: '平台信息读取失败，请稍后再试',
                            complete: (res) => {
                                if (res.confirm) {
                                    wx.navigateBack()
                                }
                            }
                        })
                        return reject()
                    }
                    this.setData({
                        platformInfoList: res.data.data,
                    })
                    //this.platformListAnim()
                    resolve()
                }
            })
        })
    },
    checkboxChange(e) {
        console.log(e)
        this.setData({
            checkedList: e.detail.value
        })
    },
    opChecked(e) {
        let plist = this.data.platformInfoList,
            type = e.currentTarget.dataset.type
        switch (type) {
            case 0:
                plist.map(item => {
                    item.checked = !item.checked;
                })
                break;
            case 1:
                plist.map(item => {
                    item.checked = true
                })
                break;
            case 2:
                plist.map(item => {
                    item.checked = false
                })
                break;
        }
        this.checkboxChange({
            detail: {
                value: plist.filter(item => item.checked).map(item => item.sign)
            }
        })
        this.setData({
            platformInfoList: plist
        })
        console.log(this.data.checkedList)
    },
    itemChecked(e) {
        this.data.platformInfoList[e.currentTarget.dataset.index].checked = !this.data.platformInfoList[e.currentTarget.dataset.index].checked
    },
    getLcId() {
        let info = this.data.currentSelectPlatForm,
            infoList = this.data.platformInfoList,
            form = this.data.form
        for (let i in infoList) {
            if (info.sign == infoList[i].sign) {
                form['lc_id'] = infoList[i].lc_info_id
                this.setData({
                    form
                })
                return
            }
        }
        wx.showModal({
            title: '提示',
            content: '无法选中平台，此平台不在此域下',
            showCancel: false
        })
        this.setData({
            currentSelectPlatForm: null
        })
    },
    upPlatform(id) {
        return new Promise((resolve, reject) => {
            tss.post({
                url: tss.url('') + '/tms/order/push2Logistices',
                params: {
                    order_ids: id
                },
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        wx.hideLoading()
                        resolve(false)
                    }
                    tss.query({
                        url: tss.url('sql') + 'tms_order',
                        params: {
                            tms_order_id: id,
                            addPlatformInfo: true
                        },
                        completion: res => {
                            console.log(res)
                            if (res.data[0].real_lc_id) {
                                resolve(true)
                            } else {
                                resolve(false)
                            }
                        }
                    })
                }
            })
        })
    },
    refresh() {
        wx.showLoading({
            title: '请稍后',
            mask: true
        })
        wx.redirectTo({
            url: Pages['order_price_parity'],
        })
    },
    pasteAddress() {
        if (!this.data.customerInfo) {
            wx.showModal({
                title: '提示',
                content: '请先选择客户哦',
                showCancel: false
            })
            return
        }
        var _this = this
        wx.getClipboardData({
            success(res) {
                wx.showLoading({
                    title: '解析中...',
                    mask: true
                })
                tss.post({
                    url: tss.url('/addr/v2/splitNamePhoneAddress'),
                    params: {
                        addr: res.data
                    },
                    completion: res => {
                        wx.hideLoading()
                        console.log(res)
                        if (res.failed) {
                            alert.notice(res.errorMsg)
                            return
                        }
                        const data = res.data
                        for (let key in data) {
                            typeof data[key] !== 'string' ? '' :
                                data[key] = data[key].replace(/\n|\\S/g, '')
                        }
                        // this.setData({
                        //     "form.region": [data.province || '', data.city || '', data.district || '', data.town || ''],
                        //     "form.addr_detail": data.street_no || '',
                        //     "form.name": data.name || '',
                        //     "form.phone": data.phone || ''
                        // })
                        wx.showModal({
                            title: '识别内容',
                            content: `姓名：${data.name}\r\n电话：${data.phone}\r\n地址：${data.province||''}${data.city||''}${data.district||''}${data.town||''}${data.street_no}\r\n填入哪里？`,
                            cancelText: "寄件人",
                            confirmText: '收件人',
                            complete: (res) => {
                                var type = ""
                                if (res.cancel) {
                                    type = "send"
                                    _this.setAddress(type, data)
                                }
                                if (res.confirm) {
                                    type = "receive"
                                    _this.setAddress(type, data)
                                }
                            }
                        })
                    }
                })
            }
        })
    },
    setAddress(type, data) {
        this.setData({
            form: {
                ...this.data.form,
                [`${type}_man`]: data.name,
                [`${type}_phone`]: data.phone,
                [`${type}_province`]: data.province,
                [`${type}_city`]: data.city,
                [`${type}_district`]: data.district,
                [`${type}_town`]: data.town || '',
                [`${type}_street_no`]: data.street_no
            },
            [`addrInfo.${type}`]: {
                obj: {
                    addr_detail: data.street_no,
                    name: data.name,
                    phone: data.phone,
                    region: [data.province, data.city, data.district, data.town]
                },
                info: [data.name, data.phone],
                addr: [data.province, data.city, data.district, data.town, data.street_no].map(item => {
                    return item
                })
            }
        })
        if (type == 'receive' && this.data.checkedList.length && this.data.customerInfo) {
            this.search()
        }
    },
    /*
    subOrders: [{"0":"4","1":"5","2":"6","weight":"3","volume":"0.000","pack":"纸箱","cargo":"1","amount":"2","v1":"4","v2":"5","v3":"6","message":"1 2件 3kg 0.000m³ 纸箱"}]
    if_visit: true
    agreement: xieyi
    customer_id: 5159
    clerk: 14755752682
    origin: WECHAT-GZH
    if_send: true
    trans_mode: 整车
    trans_mode_id: 1691
    service_mode: 自提
    settle_type: 现付
    send_province: 浙江省
    send_city: 杭州市
    send_district: 钱塘区
    send_town: 下沙街道
    send_street_no:  杭州市 钱塘区 科创科技园
    send_man: 李镇勇
    send_phone: 15773521643
    send_site:  杭州市 钱塘区 科创科技园
    receive_province: 广西壮族自治区
    receive_city: 百色市
    receive_district: 隆林各族自治县
    receive_street_no: 隆林县兴隆路三中路口对面天洪宾馆电话：
    receive_man: 王美燕
    receive_phone: 13347665299
    receive_site: 江门市
    if_load: false
    if_unload: false
    click: 19858115956
    finFlows: []
    uName: 19858115956
    uToken: o_Y_Y1b3dIRkUKYgetk7DV9NmSRk
    */
    /*
    subOrders: [{"0":"4","1":"5","2":"6","weight":"3","volume":"0.000","pack":"纸箱","cargo":"1","amount":"2","v1":"4","v2":"5","v3":"6","message":"1 2件 3kg 0.000m³ 纸箱"}]
if_visit: true
udf1: 陈大爷
udf2: 19858115956
udf3: 浙D5X9D1
udf4: 18
remark: 快点
agreement: xieyi
code: test1234567890001
scheduled_pick_time: 2023-04-23 10:00~12:00
rcode_type: 电子回单
_fees: 回单类型:电子回单
customer_id: 5159
clerk: 14755752682
origin: WECHAT-GZH
if_send: true
trans_mode: 整车
trans_mode_id: 1691
service_mode: 自提
settle_type: 现付
send_province: 浙江省
send_city: 杭州市
send_district: 钱塘区
send_town: 下沙街道
send_street_no:  杭州市 钱塘区 科创科技园
send_man: 李镇勇
send_phone: 15773521643
send_site:  杭州市 钱塘区 科创科技园
receive_province: 广西壮族自治区
receive_city: 百色市
receive_district: 隆林各族自治县
receive_street_no: 隆林县兴隆路三中路口对面天洪宾馆电话：
receive_man: 王美燕
receive_phone: 13347665299
receive_site: 江门市
if_load: false
if_unload: false
click: 19858115956
finFlows: []
uName: 19858115956
uToken: o_Y_Y1b3dIRkUKYgetk7DV9NmSRk
   */
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (this.data.needGet) {
            if (this.data.checkedList.length) {
                this.search()
            }
            this.setData({
                needGet: false
            })
        }
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
        lc.removeListener('orderInfo', this.__wxWebviewId__.toString())
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
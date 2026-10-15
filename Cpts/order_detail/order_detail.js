import Pages from '../../pages.js';
import user from '../../utils/user.js';
const _App = getApp().globalData;
const tss = require('../../utils/tss.js');
const lc = require('../../utils/listenerCenter.js');

Component({
    options: {
        styleIsolation: 'apply-shared',
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    properties: {
        orderId: {
            type: Number,
            value: ''
        },
        orderIdx: {
            type: Number,
            value: ''
        },
        order: {
            type: Object,
            value: ''
        },
        showSend: {
            type: Boolean,
            value: true
        },
        showReceive: {
            type: Boolean,
            value: true
        },
        showOthers: {
            type: Boolean,
            value: true
        },
        showCode: {
            type: Boolean,
            value: false
        },
        showArrivePay: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        takePhone: false,
        loadingUrl: `${_App.aliyun_host}/loading.gif`,
        qrcodeLoaded: false,
        showBottomBtn: false,
        color: ['volcano', 'orange', 'gold', 'cyan', 'blue', 'geekblue'],
        src: "https://e8.boudata.com/tss/wx/api/acode2?appId=wx1f18a0c7e9272b40&page=pages/homepage/homepage/homepage&onlyQparam=true&qparam=1,2,3,os,EF190601001",
        weight_unit: "",
        hideDelBtn: false,
        showTcode: false,
        //
        cargoImages: [],
        hasCargoImages: false,
        recordList: [],
        canEditOrder: true,
        show: false,
        actions: [{
            name: '微信',
            value: 'WECHAT'
        }, {
            name: '支付宝',
            value: 'ALIPAY'
        }],
        payCodeImage: ''
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        created() {
            console.log('created')
        },
        attached() {

        },
        ready() {
            console.log(user, _App)
            this.setData({
                weight_unit: getApp().globalData.DomainConfig.weight_unit ? getApp().globalData.DomainConfig.weight_unit.content : "kg",
                showTcode: this.getShowTcode()
            })
            // 初始化订单详情
            if (this.data.orderId) {
                this.queryOrderDeail(this.data.orderId)
                this.checkCargoImage(this.data.orderId)
                if (user.domain == 'D636') this.getRecordField()
            }
            lc.addListener('ChangeInfo', this.__wxWebviewId__.toString(), res => {
                console.log(res)
                if (res.orderId) {
                    this.queryOrderDeail(res.orderId);
                    this.checkCargoImage(res.orderId)
                    // lc.removeListener('ChangeInfo', this.__wxWebviewId__.toString());   
                }
                let pages = getCurrentPages();
                console.log(pages)
            })

        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        // 承运单号是否显示：非客户账号直接显示；客户账号按 customerInfo.show_lc 判断（1 显示，0/2/null 均不显示）
        getShowTcode() {
            if (!(_App.user && _App.user.isCustomer)) return true
            return !!(_App.customerInfo && _App.customerInfo.show_lc == 1)
        },
        onLoad(options) {
            cosole.log(options, this.data)
            checkCargoImage()
        },
        onClose() {
            this.setData({
                show: false
            });
        },
        onSelect(event) {
            console.log(event.detail);
            tss.post({
                url: tss.url('') + `/tms/djPayment/scanPay/${this.data.order.asnno}`,
                type: 'repair_operate',
                params: JSON.stringify(event.detail.value),
                useCookie: true,
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
                    this.setData({
                        payCodeImage: tss.url('') + `/img/api/qrbar/1?msg=${res.data.data.counter_url}&uName=${_App.user.uName}&uToken=${_App.user.uToken}`
                    }, () => {
                        wx.previewImage({
                            urls:[this.data.payCodeImage]
                        })
                    })
                }
            })
        },
        startPay() {
            if (this.data.payCodeImage) {
                wx.previewImage({
                    urls: [this.data.payCodeImage],
                })
                return
            }
            if (this.data.order.asnno) {
                tss.post({
                    url: tss.url('') + '/tms/djPayment/getPayment',
                    params: this.data.order.asnno,
                    type: 'repair_operate',
                    useCookie: true,
                    completion: res => {
                        console.log(res)
                        if (res.failed) {
                            wx.showModal({
                                title: '提示',
                                content: res.data.errorMsg,
                                showCancel: false
                            })
                            return
                        }
                        if(!res.data.data.lakalaPayUrl){
                            this.setData({
                                show: true,
                            })
                            return
                        }
                        console.log(tss.url('') + `/img/api/qrbar/1?msg=${res.data.data.lakalaPayUrl}`)
                        this.setData({
                            payCodeImage: tss.url('') + `/img/api/qrbar/1?msg=${res.data.data.lakalaPayUrl}&uName=${_App.user.uName}&uToken=${_App.user.uToken}`
                        }, () => {
                            wx.previewImage({
                                urls: [this.data.payCodeImage]
                            })
                        })
                    }
                })
            } else {
                tss.post({
                    url: tss.url('') + '/tms/order/autoCreateBill',
                    params: {
                        orderId: this.data.order.order_id
                    },
                    useCookie: true,
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
                        let {
                            order
                        } = this.data;
                        order.asnno = res.data.data.asn.asnno;
                        this.setData({
                            show: true,
                            order
                        })
                    }
                })
            }

        },
        getRecordField() {
            tss.get({
                url: tss.url('') + '/tms/entity/RecordField?sortby=id asc',
                completion: res => {
                    console.log(res)
                    if (res.failed) return
                    let list = [
                        []
                    ]
                    let _index = 0
                    res.data.filter(item => item.type != 'hidden').map((item, index) => {
                        if (index != 0 && index % 2 == 0) {
                            list.push([])
                            _index += 1
                        }
                        list[_index].push(item)
                    })
                    this.setData({
                        recordList: list
                    })
                }
            })
        },
        checkCargoImage(id) {
            tss.getJSON({
                url: tss.url('') + `/auth/xdata/attach/json/-6/${id}`,
                completion: res => {
                    console.log("查看附件图片", res)
                    if (res.failed) {
                        return
                    }
                    if (!res.data.length) {
                        return
                    }
                    console.log("客户信息", _App.user)
                    let b = !(_App.user.domain === 'D689' && _App.user.isCustomer)
                    this.setData({
                        hasCargoImages: b
                    })
                    this.setData({
                        cargoImages: res.data.map(i => {
                            if (i.fileSrc.indexOf("https://") != -1) {
                                return i.fileSrc
                            } else {
                                return `${_App.app_host}${i.fileSrc}?uName=${_App.user.uName}&uToken=${_App.user.uToken}`
                            }
                        })
                    })
                    // tss.downloadFile({
                    //     ids: res.data.map(item => {
                    //         return item.id
                    //     }),
                    //     completion: r => {
                    //         this.setData({
                    //             cargoImages: r
                    //         })
                    //     }
                    // })
                }
            })
        },
        previewCargoImage() {
            if (!this.data.cargoImages.length) {
                wx.showToast({
                    title: '加载中，请稍后再试',
                    icon: 'none'
                })
                return
            }
            wx.previewImage({
                urls: this.data.cargoImages,
            })
        },
        qrcodeOnload() {
            setTimeout(() => {
                this.setData({
                    qrcodeLoaded: true
                }, 1000)
            })
        },
        preImage() {
            wx.previewImage({
                urls: [this.data.src],
            })
        },

        closePhone(e) {
            this.setData({
                phoneList: null
            })
        },
        makePhone(e) {
            this.setData({
                phoneList: e.currentTarget.dataset.phone
            })
        },
        copyCode(e) {
            let {
                code
            } = e.currentTarget.dataset
            wx.setClipboardData({
                data: code,
            })
        },
        copyAddr(e) {
            console.log(e)
            let {
                item
            } = e.currentTarget.dataset
            wx.setClipboardData({
                data: item,
            })
        },
        cantDel(status_code) {
            if (user.roles.includes('总经理') || user.roles.includes('财务主管')) {
                this.setData({
                    showBottomBtn: true,
                    hideDelBtn: false
                })
            } else {
                if (status_code == 99) {
                    this.setData({
                        showBottomBtn: true,
                        hideDelBtn: false
                    })
                } else {
                    this.setData({
                        showBottomBtn: true,
                        hideDelBtn: true
                    })
                }
            }
            // if (status_code && _App.DomainConfig['cannot_delete_status'] && _App.DomainConfig['cannot_delete_status'].content.split(',').indexOf(String(status_code)) != -1) {
            //     this.setData({
            //         hideDelBtn: false,
            //         showBottomBtn: true,
            //     })
            // } else {
            //     this.setData({
            //         hideDelBtn: true,
            //         showBottomBtn: true,
            //     })
            // }
        },
        queryOrderDeail(tms_order_id) {
            wx.showLoading()
            tss.query({
                url: tss.url('sql') + 'tms_order',
                params: {
                    tms_order_id,
                    task_info: true
                },
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        wx.hideLoading()
                        wx.showModal({
                            content: res.errorMsg,
                            showCancel: false
                        })
                        return
                    }
                    let order = res.data[0]
                    // this.triggerEvent('info',order)
                    order.qrcode = `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&page=Cpts/order_query_route/order_query_route&onlyQparam=true&qparam=1,2,3,os,${order.code}`
                    wx.getImageInfo({
                        src: order.qrcode,
                        complete: res => {
                            if (res.path) {
                                order.qrcode = res.path
                            }
                            wx.hideLoading()
                            this.setData({
                                order
                            })
                        }
                    })
                    console.log(order.status)
                    if (user.groups.includes('customer')) {
                        this.setData({
                            showBottomBtn: order.status_code == 99,
                            hideDelBtn: order.status_code == 99
                        })
                    } else {
                        if (order.status_code == 624 || order.status_code == 999 || this.checkRoles()) {
                            if (user.domain == 'D195') {
                                this.setData({
                                    showBottomBtn: true,
                                    cantDel: false
                                })
                            } else {
                                this.setData({
                                    showBottomBtn: false,
                                })
                            }
                        } else {
                            this.cantDel(order.status_code)
                        }
                    }
                    //let showBtnStatus = '待接单,已接单'
                    //console.log(!user.groups.includes('customer')&&"not customer")
                    // if (
                    //     showBtnStatus.indexOf(order.status) >= 0 &&
                    //     (!user.groups.includes('customer')||
                    //         (order.status == "待接单" && user.roles.indexOf('客户') !=-1)
                    //     )) {
                    //     this.cantDel()
                    //     this.setData({
                    //         showBottomBtn: true
                    //     })
                    // }
                }
            })
        },
        checkRoles() {
            if (user.domain == 'D195') {
                return true
            }
            // let roles = ["总经理", "副总经理", "人事岗", "部门经理", "客服", "调度", "业务员", "出纳", "项目会计", "会计", "财务主管", "销售员"]
            let roles = _App.DomainConfig?.xcx_delete_order_roles?.content.split(',') || []
            console.log(roles)
            for (let i = 0; i < roles.length; i++) {
                if (user.roles.indexOf(roles[i]) >= 0) {
                    return false;
                }
            }
            return true
        },
        showRecord() {
            tss.query({
                url: tss.url('ENTITY') + 'ReceiptLog',
                params: {
                    order_id: this.data.orderId,
                    showAttach: true
                },
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        wx.showModal({
                            content: res.errorMsg,
                            showCancel: false
                        })
                        return
                    }
                    if (!res.data.length) return
                    const [{
                        attachs
                    }] = res.data
                    let urls = attachs.map(i => {
                        if (i.fileSrc.indexOf("https://") != -1) {
                            return i.fileSrc
                        } else {
                            return `${_App.app_host}${i.fileSrc}?uName=${_App.user.uName}&uToken=${_App.user.uToken}`
                        }

                    })
                    console.log(urls)
                    if (urls.length) {
                        wx.previewImage({
                            urls
                        })
                    } else {
                        wx.showToast({
                            title: '暂无可查看回单',
                            icon: 'none'
                        })
                    }
                }
            })
        },
        changeOrder() {
            if (_App.user.isTest) {
                wx.showToast({
                    title: '体验者暂无权限！',
                    icon: 'none'
                })
                return
            }
            wx.navigateTo({
                url: `${Pages.order}?orderId=${this.data.orderId}`
            })
        },
        cancelOrder() {
            wx.navigateTo({
                url: `${Pages.order_cancel}?orderId=${this.data.orderId}&orderIdx=${this.data.orderIdx}`
            })
        },
        deleteOrder() {
            tss.delnew({
                url: tss.url('') + '/tms/order',
                // method:'DELETE',
                order_ids: this.data.orderId,
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        wx.showModal({
                            content: res.errorMsg,
                            showCancel: false
                        })
                        return
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '删除成功',
                            showCancel: false,
                            success(res) {
                                if (res.confirm) {
                                    lc.emitEvent('ChangeInfo', {
                                        change: true
                                    })
                                    wx.navigateBack({
                                        delta: 0,
                                    })
                                }
                            }
                        })

                    }
                }
            })
        }
    }
})
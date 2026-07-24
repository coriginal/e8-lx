const _App = getApp().globalData
const SearchLabel = require('./source.js').SearchLabel
import Pages from '../../../pages.js'
import {
    formatDate
} from '../../../utils/util.js'
const lc = require('../../../utils/listenerCenter.js')
const tss = require('../../../utils/tss.js')
import {
    $wuxDialog
} from '../../../components/index'
import user from '../../../utils/user.js'

Page({
    data: {
        chooseType: 'onroad',
        label: SearchLabel.selected,
        orderList: {
            "tobepaid": [],
            "onroad": [],
            "signed": [],
            "cancel": []
        },
        statusColor: require('./source.js').OrderStatusColor,
        visible: false,
        painting: {},
        printData: {},
        elecImgUrl: '../../../images/modal.png',
        moreMenu: [{
                code: 'acceptOrder',
                title: '接单'
            },
            {
                code: 'showElcOrder',
                title: '电子面单'
            },
            {
                code: 'changeOrder',
                title: '修改订单',
                icon: 'i-write'
            },
            {
                code: 'printOrder',
                title: '打印订单',
                icon: 'i-punch'
            },
            {
                code: 'bindLogistic',
                title: '绑定平台',
                icon: 'i-deliver',
                color: 'var(--blue)'
            },
            {
                code: 'cancelOrder',
                title: '取消发货',
                icon: 'i-delete',
                color: 'var(--red)'
            },
            {
                code: 'frozenorder',
                title: '拦截订单',
                icon: 'i-magic',
                color: 'var(--red)'
            },
            {
                code: 'changeTrans',
                title: '修改承运商',
                icon: 'i-deliver',
                color: 'var(--red)'
            },
            {
                code: 'push2Logistic',
                title: '上传至平台',
                icon: 'i-punch',
                color: 'var(--red)'
            }, {
                code: 'pickDriver',
                title: '指派司机',
                icon: 'i-deliver',
                color: 'var(--green)'
            }
        ],
        total: {
            "tobepaid": '',
            "onroad": '',
            "signed": '',
            'cancel': ''
        },
        page: {
            "tobepaid": 1,
            "onroad": 1,
            "signed": 1,
            'cancel': 1
        },
        showPage: false,
        queryCode: '',
        checkboxResult: [],
        allowOperate: false
    },
    toPay(e){
        wx.navigateToMiniProgram({
            appId:'wxc4267d613d482792',
            extraData: {
                orderId: e.currentTarget.dataset.id,
                asnno: e.currentTarget.dataset.asnno,
                domain: e.currentTarget.dataset.domain
            },
            envVersion:'develop'
        })
    },
    //    height: calc(100vh - 199rpx)
    checkboxOnChange(event) {
        console.log(event)
        this.setData({
            checkboxResult: event.detail,
        });
    },
    requestFunds() {
        if (this.data.checkboxResult.length === 0) {
            wx.showToast({
                title: '请选择订单',
                icon: "none"
            })
            return
        }
        wx.navigateTo({
            url: `/pages-order/order/request_funds/index?orderIds=${this.data.checkboxResult.join(',')}`,
        })
    },
    pickDriver(e) {
        let jsonStr = JSON.stringify([this.data.orderList[this.data.chooseType][this.data.menuOrderIdx]])
        wx.navigateTo({
            url: `${Pages.pick}?data=${jsonStr}&type=提货`
        })
    },
    onLoad(options) {
        this.fromPage = options.fromPage;
        if (!_App.user.isCustomer && options.fromPage != 'customer_choose' && !options.query) {
            wx.redirectTo({
                url: Pages.customer_choose
            })
            return
        }
        this.initOptions(options);
        this.checkPermission()
    },
    checkPermission() {
        tss.get({
            url: tss.url('') + "/api/menu/json?noCache=true&name=fin_nav",
            completion: res => {
                if (res.failed) {
                    return
                }
                this.setData({
                    allowOperate: res.data.find(item => item.code === 'cost_qk')
                })
            }
        })
    },
    initOptions(options) {
        // console.log(options)
        // 携带 _params 进来时 会选择_params中的订单状态进行查询
        this.getCustomerOptions()
        console.log(options)
        let {
            _params,
            customer_name = '',
            customer_id = ''
        } = options
        if (_params) {
            let status = JSON.parse(_params).status || ''
            items[0].children.forEach(child => {
                if (child.value == 'status') {
                    child.selected = status
                    child.children.forEach(_child => {
                        _child.checked = _child.value == status ? true : false
                    })
                }
            })
            this.setData({
                items
            })
        } else {
            let items = JSON.parse(JSON.stringify(require('./source.js').FilterList)) //;
            if (_App.user.domain === 'D195') {
                console.log(items)
                items[0].children[1].children.push({
                    label: '近一年',
                    value: '365'
                }, {
                    label: '近两年',
                    value: '730'
                })
            }
            this.setData({
                items
            })
        }
        this.setData({
            queryCode: options.query && options.code,
            _App: _App,
            customer_name,
            customer_id,
            showPage: true
        })
        // 获取打印模版
        this.queryPrintMode()
        wx.setNavigationBarTitle({
            title: customer_id ? `我的发件-【${customer_name}】` : '我的发件'
        })
    },

    // 客户是否可见承运商
    getCustomerOptions() {
        // 取客户配置 承运商默认客户不可见 非客户可见
        if (_App.user.isCustomer) {
            tss.query({
                url: tss.url('sql') + 'tms_customer',
                // params: { phone: _App.user.uName },
                completion: async res => {
                    if (res.failed) return
                    console.log(res)
                    const [customer = {}] = res.data
                    let customerShowLc, customerShowLcUpload;
                    if (customer.show_lc === 1) {
                        // 承运商可见
                        customerShowLc = true
                    } else if (customer.show_lc === 0) {
                        // 承运商不可见
                        customerShowLc = false
                    } else {
                        // 按域级配置
                        const res = await this.getShowLc();
                        if (res.failed) return
                        const [data] = res.data
                        customerShowLc = data.content == 1 ? true : false
                    }
                    if (customerShowLc) {
                        customerShowLcUpload = !!customer.show_lc_upload
                    }
                    this.setData({
                        customerShowLc,
                        customerShowLcUpload
                    })
                }
            })
        } else {
            this.setData({
                customerShowLc: true
            })
        }
    },
    getShowLc() {
        return new Promise(completion => {
            tss.query({
                url: tss.url('') + '/tms/entity/DomainConfig',
                params: {
                    code: 'show_lc'
                },
                completion
            })
        })
    },

    //查询条件变换时 进行查询
    onChange(e) {
        const {
            param: queryParam
        } = e.detail
        const _find = SearchLabel.children.find(n => n.value == queryParam.type)
        let label = queryParam.type ? _find && _find.label : '查询条件'
        console.log(label, queryParam)
        this.setData({
            label,
            queryParam,
            page: {
                "onroad": 1,
                "signed": 1
            },
            orderList: {
                "onroad": [],
                "signed": []
            },
            // page_scrollTop: this.data.page_scrollTop
        }, () => {
            if (this.data.queryCode) {
                this.searchCode({
                    detail: {
                        sscode: this.data.queryCode
                    }
                })
                this.data.queryCode = '';
            } else {
                this.searchCode({
                    detail: this.data.queryInput
                })
            }
        })
    },

    // 订单列表数据处理
    dealData(data) {
        const dealTag = (list = []) => {
            let _list = []
            list.forEach(item => {
                const [key, value] = Object.entries(item)[0]
                _list.push({
                    title: key,
                    class: value
                })
            })
            return _list
        }
        data = data.map(i => ({
            domain: i.domain,
            id: i.id,
            createtime: i.createtime,
            creator: i.createtime,
            status: i.status,
            status_code: i.status_code,
            receive_city: i.receive_city,
            receive_district: i.receive_district,
            receive_lng_lat: i.receive_lng_lat,
            receive_man: i.receive_man,
            receive_phone: i.receive_phone,
            receive_province: i.receive_province,
            receive_site: i.receive_site,
            receive_street_no: i.receive_street_no,
            receive_town: i.receive_town,
            send_city: i.send_city,
            send_district: i.send_district,
            send_lng_lat: i.send_lng_lat,
            send_man: i.send_man,
            send_phone: i.send_phone,
            send_province: i.send_province,
            send_site: i.send_site,
            send_street_no: i.send_street_no,
            send_town: i.send_town,
            customer_name: i.customer_name,
            sign_date: i.sign_date,
            order_date: formatDate(i.order_date, 'MM-dd hh:mm'),
            code: i.code,
            tcode: i.tcode,
            ccode: i.ccode,
            lc_info: [i.lc_name, i.tcode].filter(i => i).join(' - '),
            clerk: i.clerk,
            volume: i.volume,
            amount: i.amount,
            weight: i.weight,
            remark: i.remark,
            cod: i.cod,
            arrive_pay: i.arrive_pay,
            settle_type: i.settle_type,
            rcode_type: i.rcode_type,
            if_visit: i.if_visit,
            tag_names: dealTag(i.tag_names || []),
            hasFollow: false,
            asnno: i.asnno
        }))
        let orderList = {
            "tobepaid": this.data.orderList.tobepaid || [],
            "signed": this.data.orderList.signed || [],
            "onroad": this.data.orderList.onroad || [],
            "cancel": this.data.orderList.cancel || [],
        }
        if(this.data.chooseType == 'tobepaid'){
            data.forEach(item=>{
                orderList.tobepaid.push(item)
            })
        }else{
            data.forEach(item => {
                item.status == '已签收' ? orderList.signed.push(item) : orderList.onroad.push(item)
                item.status == '已取消' && orderList.cancel.push(item)
            })
        }
        
        if (this.data.filterFollow) {
            this.setData({
                total: this.data.total,
                page_scrollTop: this.data.page_scrollTop
            })
        } else {
            this.setData({
                orderList,
                total: this.data.total,
                page_scrollTop: this.data.page_scrollTop
            })
        }
        //this.checkFollow(0, orderList[this.data.chooseType].length,this.data.chooseType, orderList)
        console.log(orderList)
        wx.hideLoading()
    },
    /*     checkFollow(i, length, type, orderList) {
            console.log(i, length, type, orderList)
            let {filterFollow}=this.data
            console.log(filterFollow)
            if (i >= length) {
                if(filterFollow){
                    orderList[type]=orderList[type].filter(i=>i.hasFollow)
                }
                this.setData({
                    orderList
                })
                return
            }
            console.log(orderList[type][i].id)
            tss.post({
                url: tss.url('tms') + '/order/follow',
                params: {
                    order_id: orderList[type][i].id
                },
                completion: res => {
                    if (res.data.length) {
                        orderList[type][i]['hasFollow'] = true
                    }
                    i=i+1
                    this.checkFollow(i, length, type, orderList)
                }
            })
        }, */
    // 搜索订单
    searchCode(e) {
        console.log(e)
        this.setData({
            queryInput: e.detail,
            page: {
                "tobepaid": 1,
                "onroad": 1,
                "signed": 1,
                "cancel": 1
            },
            orderList: {
                "tobepaid": [],
                "onroad": [],
                "signed": [],
                "cancel": []
            },
        }, () => {
            console.log(this.data.queryParam, e.detail)
            this.queryData({
                ...this.data.queryParam,
                ...e.detail
            })
        })
    },

    // 筛选框打开回调
    onOpen(e) {
        console.log('Filter Open')
    },
    // 筛选框关闭回调
    onClose(e) {
        console.log('Filter Close', e)
    },
    // 切换tab
    chooseOrderType(e) {
        if (this.data.chooseType == e.currentTarget.id) return
        this.setData({
            chooseType: e.currentTarget.id
        }, () => {
            // this.data.page[this.data.chooseType]++ 
            this.queryData({
                ...this.data.queryParam,
                ...this.data.queryInput
            })
        })
    },
    // 进入订单详情
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
    //接单
    acceptOrder() {
        const order_ids = this.data.menuOrderId;
        if (!order_ids) return;
        tss.post({
            url: tss.url('') + '/tms/order/acceptOrders',
            params: {
                order_ids: this.data.menuOrderId
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        showCancel: false,
                        content: '接单失败！'
                    })
                    return
                }
                wx.showModal({
                    content: '接单成功！',
                    confirmText: '修改订单',
                    success: res => {
                        if (res.confirm) {
                            this.changeOrder(order_ids);
                        } else {
                            if (this.fromPage) {
                                wx.redirectTo({
                                    url: Pages[this.fromPage],
                                })
                            }
                        }
                    },
                    complete() {
                        lc.emitEvent('ChangeInfo', {
                            change: true
                        })
                    }
                })
            }
        })
    },
    // 打开更多操作菜单
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
    // 点击更多菜单
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
    changeTrans() {
        wx.showLoading()
        wx.navigateTo({
            url: `${Pages.router_connect_1}?type=changeTrans&orderId=${this.data.menuOrderId}`
        })
        // tss.query({
        //   url: tss.url('sql') + 'lc_info',
        //   completion: res => {
        //     console.log(res)
        //     if (res.failed) {
        //       wx.showToast({
        //         title: '获取承运商失败', icon: 'none'
        //       })
        //       return
        //     }
        //     this.setData({
        //       lcInfos: res.data
        //     })
        //     wx.hideLoading()
        //   }
        // })
    },
    // 冻结订单
    frozenorder() {
        const id = this.data.menuOrderId
        const idx = this.data.menuOrderIdx
        const _this = this
        $wuxDialog().prompt({
            resetOnClose: true,
            maskClosable: false,
            focus: true,
            title: '请输拦截原因',
            content: '',
            fieldtype: 'text',
            maxlength: -1,
            onConfirm(e, text) {
                console.log(e, text)
                tss.post({
                    url: tss.url('/tms/order/frozenorder'),
                    params: {
                        ids: id,
                        type: 'order',
                        reason: text
                    },
                    completion: res => {
                        console.log()
                        if (res.failed) {
                            wx.showModal({
                                showCancel: false,
                                content: res.errMsg
                            })
                        }
                        lc.emitEvent('ChangeInfo', {
                            change: true
                        })
                    }
                })
            },
        })
    },
    // 关闭更多操作菜单
    closeMoreMenu() {
        this.setData({
            popVisible: false,
            menuOrderId: '',
            menuOrderIdx: '',
            menuOrderCode: ''
        })
    },

    // 删除订单 逻辑删除
    cancelOrder() {
        console.log(Pages.order_cancel)
        wx.navigateTo({
            url: `${Pages.order_cancel}?orderId=${this.data.menuOrderId}&orderIdx=${this.data.menuOrderIdx}`
        })
    },
    // 修改订单
    changeOrder(orderId) {
        if (_App.user.isTest) {
            wx.showToast({
                title: '体验者暂无权限！',
                icon: 'none'
            })
            return
        }
        let id = this.data.menuOrderId || orderId
        wx.navigateTo({
            url: `${Pages.order}?orderId=${id}`
        })
    },
    // 绑定平台
    bindLogistic() {
        wx.navigateTo({
            url: `${Pages.router_connect_1}?type=bindLogistic&orderId=${this.data.menuOrderId}`
        })
    },
    // 上传至平台
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
    // 打印订单
    printOrder() {
        wx.navigateTo({
            url: `${Pages.order_print}?ids=${this.data.menuOrderId}&code=${this.data.menuOrderCode}`
        })
    },
    // 查看轨迹
    goOrderRoute(e) {
        let {
            id,
            code,
            domain
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `${Pages.order_routes}?id=${id}&code=${code}&domain=${domain}`
        })
    },
    // 查询发件列表
    queryData(params) {
        params.page = this.data.page[this.data.chooseType]
        params.rows = 5
        params.task_info = true
        if (this.data.customer_id) {
            params.customer_id = this.data.customer_id
        }
        console.log(params)
        wx.showLoading()
        if (this.data.chooseType == 'onroad') {
            params.no_sign = 'yes'
            delete params.signed
        } else if (this.data.chooseType == 'signed') {
            delete params.no_sign
            params.signed = 'yes'
        } else if (this.data.chooseType == 'tobepaid') {
            params.fin_status = "auto_billed"
            params.addAsnno = true
        } else {
            delete params.signed
            delete params.no_sign,
                params.status_code = 999
        }
        if (params.days) {
            const times = new Date().getTime()
            //改动：raspberry
            //原来的代码直接暴力的-1会导致筛选到昨天的单
            params.order_date_from = params.days == 1 ? formatDate(times, 'yyyy-MM-dd') + " 00:00:00" : formatDate(times - params.days * 3600000 * 24, 'yyyy-MM-dd hh:mm:ss')
            //
            console.log(params.order_date_from)
            delete params.days
        }
        if (params.follow) {
            this.setData({
                filterFollow: params.follow == "is_not_null" ? true : false
            })
        } else {
            this.setData({
                filterFollow: false
            })
        }
        console.log(params)

        tss.query({
            url: tss.url('sql') + 'tms_order',
            // url: tss.url('') + '/tms/order/print',
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
                if (res.data.total == this.data.orderList[this.data.chooseType].length) {
                    wx.hideLoading()
                    return
                }
                this.data.total[this.data.chooseType] = res.data.total
                this.data.page[this.data.chooseType]++
                this.dealData(res.data.rows)
            }
        })
    },
    // painting()回调
    eventGetImage(e) {
        console.log(e)
        const {
            tempFilePath,
            errMsg
        } = e.detail
        if (errMsg == 'canvasdrawer:ok') {
            this.data.lastFilePath = tempFilePath
            this.setData({
                elecImgUrl: tempFilePath
            })
        } else if (errMsg == 'canvasdrawer:samme params') {
            this.setData({
                elecImgUrl: this.data.lastFilePath
            })
        }
    },
    //打开电子免单
    showElcOrder(e, id = this.data.menuOrderId) {
        // const data = [...this.data.orderList.signed,...this.data.orderList.onroad].find(i=>i.id == id)
        // console.log(data)
        tss.post({
            url: tss.url('') + '/tms/order/print',
            params: {
                ids: id,
                type: '主单',
                print_id: this.data.printData.printModeId || '',
                newModule: true
            },
            completion: res => {
                console.log(user)
                let {
                    lineData
                } = res.data[0]
                let lineDataObj = {}
                let painting = user.domain == "D032" ? require('./source.js').painting_032 : require('./source.js').painting
                Object.entries(lineData).forEach(([key, value]) => {
                    value && value.forEach(i => lineDataObj[i.field] = i.value)
                })
                this.setData({
                    visible: true,
                    painting: painting(lineDataObj, _App)
                })
            }
        })
    },
    //关闭电子面单
    onClosePop() {
        this.setData({
            visible: false,
            elecImgUrl: '../../../images/modal.png'
        })
    },
    // 复制订单号
    copyCode(e) {
        wx.setClipboardData({
            data: e.currentTarget.id,
        })
    },
    // 打印模版请求
    queryPrintMode() {
        tss.query({
            url: tss.url('') + '/tms/entity/PrintModel',
            params: {
                type: 1
            },
            completion: res => {
                console.log(res)
                if (res.failed || res.data.length == 0) {
                    console.log(res.errorMsg)
                    return
                } else {
                    this.setData({
                        "printData.printMode": res.data[0].name,
                        "printData.printModeId": res.data[0].id
                    })
                }
            }
        })
    },
    onReachPageBottom() {
        this.queryData({
            ...this.data.queryParam,
            ...this.data.queryInput
        })
    },
    onReachBottom() {
        console.log("加载更多")
        this.onReachPageBottom();
    },
    pageScroll(e) {
        let {
            scrollLeft,
            scrollTop,
            scrollHeight,
            scrollWidth,
            deltaX,
            deltaY
        } = e.detail
        if (scrollTop == 0) return
        this.data.page_scrollTop = scrollTop
    },
    onReady() {

        lc.addListener('ChangeInfo', this.__wxWebviewId__.toString(), res => {
            console.log(res)
            if (res.change) {
                this.setData({
                    page: {
                        "onroad": 1,
                        "signed": 1
                    },
                    orderList: {
                        "onroad": [],
                        "signed": []
                    },
                }, () => {
                    this.queryData({
                        ...this.data.queryParam,
                        ...this.data.queryInput || ''
                    })
                })
            }
            if (res.cancleOrderIdx) {
                let list = `orderList.onroad[${res.cancleOrderIdx}].status`
                this.setData({
                    [list]: '已取消'
                })
            }
        })
    },
    onUnload() {
        // 在组件实例被从页面节点树移除时执行
        lc.removeListener('ChangeInfo', this.__wxWebviewId__.toString())
    }
})
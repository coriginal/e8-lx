const _App = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js');
const lc = require('../../../../utils/listenerCenter.js')
const Package = 10;
const QQMapWX = require('../../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
const tms = require('../../../../pages/tms.js')
import {
    $wuxDialog
} from '../../../../components/index';
import {
    formatDate
} from '../../../../utils/util.js'
// const _Page = 1;

var qqmapsdk = new QQMapWX({
    key: Map_Key
});

Page({

    data: {
        pick_visible: false,
        list: [],
        items: require('./filter.js').FilterList,
        taskType: {
            "待接单": {
                status: '待接单'
            },
            "已接单": {
                status: '已接单'
            },
            "提货": {
                status_code_lt: 203,
                tag_type: '提货'
            },
            "中转": {
                status_code_lt: 503,
                tag_type: '中转'
            },
            "派送": {
                status_code_lt: 613,
                tag_type: '派送'
            },
            "直送": {
                status_code_lt: 203,
                tag_type: '直送'
            },
            "整车": {
                task_type: '整车',
                tag_type: '整车'
            }
        },
        effTopMenuList: [{
            title: '待接单',
            code: '99'
        }, {
            title: '已接单',
            code: '100'
        }, {
            title: '已提货',
            code: 203
        }, {
            title: '待调度',
            code: '100,203,213,214,303,304,313,314,315,403,404,413,414,415,503,504,513,514,515,613'
        }],
        order_ids: [],
        params: {
            date_from: formatDate(new Date().getTime() - 7 * 1000 * 24 * 3600, 'yyyy-MM-dd'),
            date_to: formatDate(new Date(), 'yyyy-MM-dd'),
            real_lc_id: 'is_null',
            ctms: true
        },
        TabCur: 0,
        scrollLeft: 0,
        typesList: ["待接单", "已接单", "已提货", "待运营", "提货", "中转", "派送", "直送", "整车"],
        ifCheckbox: true,
        inputTextarea: '',
        weight_unit: getApp().globalData.DomainConfig.weight_unit ? getApp().globalData.DomainConfig.weight_unit.content : "kg",
        date_from: formatDate(new Date().getTime() - 3 * 1000 * 24 * 3600, 'yyyy-MM-dd'),
        date_to: formatDate(new Date(), 'yyyy-MM-dd'),
        //D876需求
        showPickButton: true,
        showRobOrder: false
    },
    bindDateFromChange(e) {
        let date1 = new Date(e.detail.value),
            date2 = new Date(this.data.date_to)
        if (date1 > date2) {
            wx.showModal({
                title: '提示',
                content: '始日期不能大于止日期，请重新选择',
                showCancel: false,
            })
            return
        }
        this.setData({
            date_from: e.detail.value
        })
        this.querySubOrderList()
    },
    upPlatform() {
        if (this.data.order_ids.length == 0) {
            wx.showToast({
                title: '请选择订单',
                icon: "none"
            })
            return
        }
        let ids = this.data.order_ids.map(item => item.id).join(',')
        wx.showModal({
            title: '提示',
            content: '确定上传至平台？',
            complete: (res) => {
                if (res.confirm) {
                    tss.post({
                        url: tss.url('') + '/tms/order/push2Logistices',
                        params: {
                            order_ids: ids
                        },
                        completion: res => {
                            console.log(res)
                            wx.hideLoading()
                            if (res.failed) {
                                wx.showModal({
                                    title: '提示',
                                    content: res.errorMsg
                                })
                                return
                            }
                            wx.showModal({
                                title: '提示',
                                content: res.data,
                                showCancel: false
                            })
                        }
                    })
                }
            }
        })
    },
    bindDateToChange(e) {
        let date1 = new Date(e.detail.value),
            date2 = new Date(this.data.date_from)
        if (date1 < date2) {
            wx.showModal({
                title: '提示',
                content: '止日期不能小于始日期，请重新选择',
                showCancel: false,
            })
            return
        }
        this.setData({
            date_to: e.detail.value
        })
        this.querySubOrderList()
    },
    orderPick(e) {
        console.log(this.data.order_ids)
        if (this.data.order_ids.length == 0) {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
            return
        } else if (this.data.order_ids.length > 1) {
            wx.showToast({
                title: '只支持单条操作',
                icon: 'none'
            })
            return
        }
        if (this.data.typesList[this.data.TabCur] === '待接单') {
            wx.showModal({
                title: '提示',
                content: '确定提货吗？',
                complete: (res) => {
                    if (res.confirm) {
                        this.setData({
                            rightDrawer: false
                        })
                        tss.post({
                            url: tss.url("") + '/tms/order/pickOrderMain',
                            params: {
                                order_id: this.data.order_ids[0].id,
                            },
                            completion: res => {
                                console.log(res)
                                if (res.failed) {
                                    wx.showModal({
                                        title: '提示',
                                        content: '提货操作失败',
                                        showCancel: false
                                    })
                                    return
                                }
                                this.querySubOrderList()
                                wx.showToast({
                                    title: '提货成功！',
                                })
                            }
                        })
                    }
                }
            })
            return
        }
        this.setData({
            pick_visible: true,
            rightDrawer: false
        })
    },
    onClosePick() {
        this.setData({
            pick_visible: false
        })
    },
    orderBatch() {
        console.log('drawer')
        this.setData({
            rightDrawer: true
        })
    },
    closeDrawer() {
        this.setData({
            rightDrawer: false
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)

        if (options._params) {
            let _params = options._params
            delete options['_params']
            options = {
                ...JSON.parse(_params),
                ...options
            }
            if (options.TabCur) {
                this.tabSelect({
                    currentTarget: {
                        dataset: {
                            id: Number(options.TabCur)
                        }
                    }
                })
            }
        }
        let {
            page_from,
            task_id
        } = options

        if (task_id) {
            wx.setNavigationBarTitle({
                title: '任务单操作'
            })
        } else {
            wx.setNavigationBarTitle({
                title: options.eff ? '接单' : `调度指派 - ${this.data.typesList[this.data.TabCur]}`
            })
        }
        let {
            showRobOrder
        } = this.data;
        if (_App.DomainConfig.rob_order && _App.DomainConfig.rob_order.content == '1') {
            showRobOrder = true;
        }
        this.setData({
            user: _App.user,
            datetime: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            page_from,
            task_id,
            showPickButton: _App.user.domain != 'D876',
            showRobOrder
        })
    },

    onShow() {
        // this.searchCode()
        if (this.data.page_from && this.data.task_id) {
            this.queryTaskSubOrders()
        } else {
            this.querySubOrderList()
        }
        this.setData({
            rightDrawer: false,
            chooseAllTag: false
        })
    },

    // 查询任务单下面有几个子单 移除操作
    queryTaskSubOrders() {
        tss.query({
            url: tss.url('') + `/tms/task/${this.data.task_id}/subOrder2`,
            // url:tss.url('sql') + `tms_sub_code?task_id=${this.data.task_id}`,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    return
                }
                this.setData({
                    list: res.data.map(i => ({
                        ...i,
                        send_addr: [i.send_province, i.send_city, i.send_district, i.send_town, i.send_street_no].filter(i => i).join(' '),
                        receive_addr: [i.receive_province, i.receive_city, i.receive_district, i.receive_town, i.receive_street_no].filter(i => i).join(' '),
                        checked: false
                    })),
                    filterlist: res.data.map(i => ({
                        ...i,
                        send_addr: [i.send_province, i.send_city, i.send_district, i.send_town, i.send_street_no].filter(i => i).join(' '),
                        receive_addr: [i.receive_province, i.receive_city, i.receive_district, i.receive_town, i.receive_street_no].filter(i => i).join(' '),
                        checked: false
                    })).filter((i, v) => v < 30)
                })
            }
        })
    },
    // 将订单从任务单中移除
    removeTaskOrder(e) {
        let ids = this.data.order_ids.map(i => i.id).join(',')
        tss.post({
            url: tss.url('') + '/tms/task/remove',
            params: {
                subOrderIds: ids,
                taskId: this.data.task_id
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
                wx.showToast({
                    title: '移除成功',
                    icon: 'none'
                })
                lc.emitEvent('alltask', this.__wxWebviewId__.toString(), {})
                this.onShow()
            }
        })
    },

    paramsChoose() {
        wx.navigateTo({
            url: `${Pages.order_params}?json=${JSON.stringify(this.data.params)}`,
        })
    },

    onReady: function () {
        lc.addListener('task_arrange', this.__wxWebviewId__.toString(), res => {
            if (res.msg == 'success') {
                this.setData({
                    order_ids: []
                })
            }
        })

        lc.addListener('paramsInfo', this.__wxWebviewId__.toString(), res => {
            console.log(res)
            if (res.params) {
                this.data.page = 1
                this.data.filterlist = []
                this.data.list = []
                this.setData({
                    params: {
                        ...res.params,
                        status_code: this.data.effTopMenuList[this.data.TabCur].code
                    }
                }, () => {
                    this.queryOrderList(this.data.params)
                })
            } else if (res.refresh) {
                this.data.page = 1
                this.data.filterlist = []
                this.data.list = []
                this.querySubOrderList()
            }
        })
    },

    pushInvitePlatform() {
        console.log(this.data.order_ids)
        if (this.data.order_ids.length == 0) {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
            return
        }
        let url;
        // if(_App.user.isEff){
        //    url = `${Pages.router_connect_1}?type=own_logistic&orderId=${this.data.order_ids.map(i => i.id).join(',')}`
        // }else{
        url = `${Pages.router_connect_1}?type=own_logistic&orderId=${this.data.order_ids.map(i => i.order_id).join(',')}`
        // }

        if (this.data.params.ware_house_id) {
            url += `&warehouseId=${this.data.params.ware_house_id}&warehouseName=${this.data.params.ware_house_name}`
        }
        wx.navigateTo({
            url
        })
    },

    chooseAllOrders() {
        wx.showLoading()
        let filterlist = this.data.filterlist.map(i => ({
            ...i,
            checked: true
        }))
        this.setData({
            filterlist,
            chooseAllTag: true
        }, () => {
            let order_ids = this.data.filterlist.map(item => item)
            this.setData({
                order_ids
            })
            console.log(this.data.order_ids)
            wx.hideLoading()
        })
    },

    cancelChooseAllOrders() {
        wx.showLoading()
        let filterlist = this.data.filterlist.map(i => ({
            ...i,
            checked: false
        }))
        this.setData({
            filterlist,
            chooseAllTag: false
        }, () => {
            let order_ids = []
            this.setData({
                order_ids
            })
            console.log(this.data.order_ids)
            wx.hideLoading()
        })
    },


    // eff批量接件
    effOrderPick(e) {
        if (this.data.order_ids.map(i => i.id).length == 0) {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
            this.setData({
                rightDrawer: false
            })
            return
        }
        tss.post({
            url: tss.url('') + '/tms/order/acceptOrders',
            params: {
                order_ids: this.data.order_ids.map(i => i.id).join(',')
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
                wx.showModal({
                    content: '接单成功',
                    showCancel: false,
                    success: res => {
                        this.setData({
                            rightDrawer: false,
                            chooseAllTag: false,
                            TabCur: _App.DomainConfig.rob_order && _App.DomainConfig.rob_order.content == '1' ? 0 : 1
                        })
                        this.querySubOrderList()
                        if (_App.DomainConfig.rob_order && _App.DomainConfig.rob_order.content == '1') {
                            wx.navigateTo({
                                url: '/pages-work/tss/capacity/capacity_task/index',
                            })
                        }
                    }
                })
            }
        })
    },
    // 切换eff头部菜单
    // effTabSelect(e) {
    //   console.log(e)
    //   let idx = e.currentTarget.dataset.id
    //   if (idx == this.data.TabCur) return
    //   this.setData({
    //     TabCur: idx,
    //     scrollLeft: (idx - 1) * 60,
    //     chooseAllTag:false
    //   }, () => {
    //     let codes = this.data.effTopMenuList[idx].code
    //     if([0,1].includes(idx) ){
    //       this.querySubOrderList({ status_code: codes })
    //       // this.queryOrderList({ status_code: codes })
    //       return
    //     }
    //     // this.queryOrderList({ ...this.data.params, status_code: codes })
    //     this.querySubOrderList({ ...this.data.params, status_code: codes })
    //   })
    // },
    // 切换e8头部菜单
    tabSelect(e) {
        let idx = e.currentTarget.dataset.id
        if (idx == this.data.TabCur) return
        this.setData({
            TabCur: idx,
            scrollLeft: (idx - 1) * 60
        }, () => {
            // if (this.data.TabCur == 0){
            //   this.queryOrderList()
            // }else{
            this.querySubOrderList()
            // }

        })
        wx.setNavigationBarTitle({
            title: `调度指派 - ${this.data.typesList[idx]}`
        })
    },
    // copyCode 复制单号
    copyCode(e) {
        wx.setClipboardData({
            data: e.currentTarget.id
        })
    },
    // 显示底部按钮
    showCheckbox() {
        this.setData({
            ifCheckbox: !this.data.ifCheckbox
        })
    },
    // 前往订单详情
    goOrderInfo(e) {
        console.log(e)
        const {
            orderCode: code,
            orderId: id
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `${Pages.order_detail}?id=${id}&code=${code}`
        })
    },

    // searchCode筛选订单
    searchCode(e = {
        detail: {
            value: this.data.inputValue
        }
    }) {
        console.log('search:', e)
        if (e.detail.value) {
            this.data.inputValue = e.detail.value
            let reg = new RegExp(e.detail.value)
            let filterlist = this.data.list.filter(i =>
                reg.test(i.customer_name) || reg.test(i.code) || reg.test(i.order_code) || reg.test(i.status) || reg.test(i.send_addr) || reg.test(i.receive_addr)
            ).filter((i, v) => v <= 30)

            console.log(filterlist)
            this.setData({
                filterlist
            })
        } else {
            this.data.inputValue = ''
            this.setData({
                filterlist: this.data.list.filter((i, v) => v <= 30)
            })
        }
    },
    // 前往录单页
    goOrder() {
        wx.navigateTo({
            url: Pages.order
        })
    },
    //查询未指派订单

    // E8订单查询
    querySubOrderList(params = {}) {
        wx.showLoading()
        let type = this.data.typesList[this.data.TabCur]
        params.task_type = type
        if ([0, 2].includes(this.data.TabCur)) {
            this.queryOrderList({
                status_code: this.data.effTopMenuList[this.data.TabCur].code,
                order_date_from: this.data.date_from,
                order_date_to: this.data.date_to
            })
            return
        }
        // if ([2].includes(this.data.TabCur)||[3].includes(this.data.TabCur)) {
        //     this.queryOrderList({
        //         //...this.data.params,
        //         //order_date_from: formatDate(new Date().getTime() - 7 * 1000 * 24 * 3600, 'yyyy-MM-dd'),
        //         //order_date_to: formatDate(new Date(), 'yyyy-MM-dd'),

        //         status_code: "99,100",
        //         task_info: true,
        //     },this.data.TabCur)
        //     return
        // }
        if ([1, 3].includes(this.data.TabCur)) {
            if (_App.DomainConfig.ignore_tag_create_task && _App.DomainConfig.ignore_tag_create_task.content == 1) {
                params.ignore_tag = true
                params.task_type = null
            } else {
                params.task_type = "提货,中转,派送,直送,整车"
            }
        }
        params.order_date1 = this.data.date_from //formatDate((new Date() - 90 * 1000 * 60 * 24 * 2), 'yyyy-MM-dd')
        params.order_date2 = this.data.date_to
        // params.status = '待接单'
        console.log(params)
        tss.query({
            url: tss.url('') + '/tms/task/sub_order_pool',
            params,
            completion: res => this.successQuery(res)
        })
        // }
    },

    queryOrderList(params = this.data.params, filter = "") {
        // params.order_date1 = formatDate((new Date() - 90 * 1000 * 60 * 24 * 2), 'yyyy-MM-dd')
        tss.query({
            url: tss.url('sql') + 'tms_order',
            // url: tss.url('') + '/tms/task/sub_order_pool',
            params,
            completion: res => {
                if (res.failed) {
                    wx.hideLoading()
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    return
                }
                res.data = res.data.map(i => ({
                    ...i,
                    order_code: i.code,
                    order_id: i.id
                }))
                console.log(res.data)
                if (filter) {
                    switch (filter) {
                        case 2:
                            res.data = res.data.filter(item => Object.keys(item.task_param).length === 0)
                            break;
                        case 3:
                            res.data = res.data.map(item => {
                                if (Object.keys(item.task_param).length !== 0) {
                                    for (let key in item.task_param) {
                                        //console.log(key)
                                        if (item.task_param[key] == '待接单') {
                                            return item
                                        }
                                    }
                                    return
                                } else {
                                    return
                                }
                            }).filter(item => item)
                            break;
                    }
                    console.log("过滤", res.data)
                }
                this.successQuery(res)
            }
        })
    },
    successQuery(res) {
        console.log(res)
        if (res.failed) {
            wx.hideLoading()
            wx.showModal({
                content: res.errorMsg,
                showCancel: false
            })
            return
        }
        let list = res.data
            .map(i => ({
                ...i,
                send_addr: [i.send_province, i.send_city, i.send_district, i.send_town, i.send_street_no].filter(i => i).join(' '),
                receive_addr: [i.receive_province, i.receive_city, i.receive_district, i.receive_town, i.receive_street_no].filter(i => i).join(' '),
                checked: false
            }))
            .filter(i => !i.task_code)
        if (this.data.TabCur == 1) {
            list = list.filter(item => item.status_code == 100)
        }
        console.log(list)
        this.data.list = list
        this.data.filterlist = list
        this.setData({
            filterlist: list.filter((i, v) => v <= 30),
            order_ids: []
        })
        this.searchCode()
        wx.hideLoading()
    },
    // 调度到新任务
    goTask(e) {
        let {
            order_ids
        } = e.detail.value
        let tag = this.data.typesList[this.data.TabCur]
        let type = tag == '已接单' || tag == '待运营' ? '提货' : tag
        switch (tag) {
            case "已提货":
                type = "中转";
                break;
        }
        if (this.data.order_ids.length) {
            order_ids = order_ids.map(item => this.data.filterlist.find(x => x.id == item))
            console.log(order_ids, this.data.filterlist)
            wx.navigateTo({
                url: `${Pages.pick}?data=${JSON.stringify(order_ids)}&type=${type}`
            })
        } else {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
        }
    },
    checkboxChange(e) {
        console.log('choose:', e.detail.value)

        let order_ids = this.data.filterlist.filter(item => e.detail.value.includes(item.id.toString()))
        this.setData({
            order_ids
        })

        if (e.detail.value.length != this.data.filterlist.length) {
            this.setData({
                chooseAllTag: false
            })
        }

    },
    // 调度到已有任务单
    goHasTask() {
        if (this.data.order_ids.length) {
            let q_params = {
                days: 90,
                type: this.data.typesList[this.data.TabCur],
                status: '待接单,已接单'
            }
            wx.navigateTo({
                url: `${Pages.task_yunying}?if_op=true&_data=${JSON.stringify(this.data.order_ids)}&q_params=${JSON.stringify(q_params)}&from_page=menu`
            })
        } else {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
        }
    },
    onUnload() {
        lc.removeListener('task_arrange', this.__wxWebviewId__.toString())
    },
    onPullDownRefresh: function () {
        // this.data.page = 1
        // this.data.filterlist = []
        // this.data.list = []
        // this.querySubOrderList();
        // wx.stopPullDownRefresh();
    },
    // 关闭批量轨迹编辑
    onCloseRoute() {
        this.setData({
            route_visible: false,
            inputTextarea: '',
            click_auto_route_id: ''
        })
    },
    // 批量编辑轨迹
    orderRouteBatch() {
        console.log(this.data.order_ids)
        if (this.data.order_ids.length == 0) {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
            return
        }
        this.setData({
            route_visible: true,
            rightDrawer: false
        })
        this.doLocation()
    },
    // 确定日期时间
    onConfirm(e) {
        this.setData({
            time: e.detail.date,
            datetime: e.detail.label
        })
    },
    // 打开时间选择器
    clickTap() {
        this.setData({
            date_picker: true
        })
    },
    // 关闭时间选择器
    onVisibleChange() {
        this.setData({
            date_picker: false,
            message_date_picker: false
        })
    },
    inputTextarea(e) {
        this.data.inputTextarea = e.detail.value
    },
    popRouteInput(e) {
        let {
            id
        } = e.currentTarget
        this.data.inputTextarea_input = `${id==1?`从【${e.detail.value}】出发`:`到达【${e.detail.value}】`}`
    },
    // 确定自定义轨迹
    confirmRouter() {
        this.data.inputTextarea = this.data.click_auto_route_id ? this.data.inputTextarea_input : this.data.inputTextarea
        if (this.data.inputTextarea.replace(/\s/g, '').length == 0) {
            wx.showToast({
                title: '输入框内不能为空！',
                icon: 'none'
            })
            return
        }
        wx.showLoading({
            mask: true
        })
        tss.post({
            url: tss.url('') + '/tms/order/path/hand',
            params: {
                scan_date: this.data.datetime,
                description: this.data.inputTextarea,
                ids: this.data.order_ids.map(i => i.order_id).join(',')
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
                wx.showToast({
                    title: '操作成功！',
                    icon: 'none'
                })
                this.onCloseRoute()
            }
        })
    },
    confirmSign() {
        wx.showLoading({
            mask: true
        })
        console.log(this.data)
        /*tss.post({
            url: tss.url('') + '/tms/order/signOrders',
            params: {
                scan_date: this.data.datetime,
                description: `【已签收】。${this.data.inputTextarea||''}`,
                ids: this.data.order_ids.map(i => i.id).join(','),
                ifSign: true
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
                wx.showToast({
                    title: '操作成功！',
                    icon: 'none'
                })
                this.onCloseRoute()
            }
        })*/
        this.batchSign()

    },
    batchSign() {
        tms.saveWithAddr({
            url: tss.url('tms') + '/task/driver_batch_sign',
            params: {
                task_id: this.data.task_id,
                target_ids: this.data.order_ids.map(i => i.id).join(',')
            },
            completion: res => {
                if (res.failed || res.data) {
                    alert.notice('批量签收失败。' + (res.errorMsg || res.data.errorMsg || ''))
                } else {
                    wx.showToast({
                        title: '批量签收成功'
                    })
                    if (this.data.page_from && this.data.task_id) {
                        this.queryTaskSubOrders()
                    } else {
                        this.querySubOrderList()
                    }
                    this.onCloseRoute()
                }
            }
        })
    },
    // 查看轨迹
    goRouteInfo(e) {

        let {
            id,
            code,
            domain
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: `${Pages.order_routes}?id=${id}&code=${code}&domain=${domain}`
        })
    },
    // 快速定位
    doLocation() {
        let _this = this
        wx.showLoading()
        wx.getLocation({
            success: res => {
                console.log(res)
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: res => {
                        console.log(res)
                        let {
                            district: route_district_location
                        } = res.result.address_component
                        _this.setData({
                            route_district_location
                        })
                    },
                    complete: res => {
                        wx.hideLoading()
                    }
                })
            },
            fail() {
                wx.hideLoading()
                wx.showToast({
                    title: '定位失败,请开启小程序定位权限。',
                    icon: 'none',
                    duration: 5000
                })
            }
        })
    },
    chooseRouteAuto(e) {
        let {
            id
        } = e.currentTarget
        this.setData({
            click_auto_route_id: id
        })
        this.data.inputTextarea_input = `${id==1?`从【${this.data.route_district_location}】出发`:`到达【${this.data.route_district_location}】`}`
    },
    focusTextarea() {
        this.setData({
            click_auto_route_id: ''
        })
    },
    showMoreTextarea() {
        this.setData({
            more_textarea: !this.data.more_textarea
        })
    },
    // 拒绝接单
    refuseOrderPick() {
        this.setData({
            rightDrawer: false
        })
        let _this = this
        if (this.data.order_ids.length > 0) {
            $wuxDialog().prompt({
                resetOnClose: true,
                maskClosable: false,
                focus: true,
                title: '拒绝接单',
                content: '请输入拒绝理由',
                fieldtype: 'text',
                maxlength: -1,
                onConfirm(e, response) {
                    console.log(e, response)
                    _this.doRejectOrder(response)
                },
            })
        } else {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
        }
    },
    doRejectOrder(reason) {
        tss.post({
            url: tss.url('') + '/tms/order/reject',
            params: {
                order_ids: this.data.order_ids.map(i => i.id).join(','),
                reason
            },
            completion: res => {
                if (res.failed) return

                this.querySubOrderList()
                wx.showToast({
                    title: '操作成功',
                    icon: 'none'
                })
            }
        })
    },
    // 打印
    orderPrint() {
        this.setData({
            rightDrawer: false
        })
        let _this = this
        if (this.data.order_ids.length > 0) {
            let code = this.data.order_ids.map(i => i.order_code).join(',')
            let ids = this.data.order_ids.map(i => i.order_id).join(',')
            wx.navigateTo({
                url: `${Pages.order_print}?code=${code}&ids=${ids}`,
            })
        } else {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
        }
    },
    // 短信通知
    orderSendMessage() {
        this.setData({
            rightDrawer: false
        })
        let _this = this
        if (this.data.order_ids.length > 0) {
            // wx.navigateTo({
            //   url: `${Pages.order_send_message}`,
            // })
            this.setData({
                send_message_pop: true
            })
        } else {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
        }
    },
    popCheckGroup(e) {
        let message_send_type = e.detail.value.join(',')
        this.setData({
            message_send_type,
            show_send_date: message_send_type.includes('receive')
        })
    },

    confirmSendMessage() {
        if (!this.data.message_send_type) {
            wx.showToast({
                title: '请选择信息发送对象',
                icon: 'none'
            })
            return
        }
        if (this.data.message_send_type.includes('receive') && !this.data.message_datetime) {
            wx.showToast({
                title: '请选择预到日',
                icon: 'none'
            })
            return
        }
        tss.post({
            url: tss.url('') + '/tms/send_mail',
            params: {
                order_ids: this.data.order_ids.map(i => i.order_id).join(','),
                type: this.data.message_send_type,
                expect_reach_time: this.data.message_datetime || ''
            },
            completion: res => {
                console.log(res)
                if (res.data.errors.length) {
                    let person = res.data.errors.map(i => i.type == 'receive' ? '收件人' : '寄件人').join(',')
                    wx.showModal({
                        title: '发送失败',
                        content: `${person} 信息发送失败, 请重试。`,
                        cancelText: '取消',
                        showCancel: false,
                        confirmText: '重新发送',
                        success: res => {
                            if (res.confirm) {

                            }
                        }
                    })
                } else {
                    wx.showToast({
                        title: '发送成功',
                        icon: 'no'
                    })
                    this.setData({
                        message_send_type: '',
                        send_message_pop: false,
                        message_send: '',
                        message_receive: ''
                    })
                }

            }
        })
    },

    onCloseMessagePop() {
        this.setData({
            send_message_pop: false
        })
    },

    // 选择日期
    chooseDate() {
        this.setData({
            message_date_picker: true
        })
    },
    onConfirmMessageDate(e) {
        this.setData({
            message_time: e.detail.date,
            message_datetime: e.detail.label
        })
    },
    pickSign(data) {
        console.log(data)
        wx.showModal({
            title: '提示',
            content: '确定提货吗？',
            complete: (res) => {
                if (res.confirm) {
                    // tss.query({
                    //     url: tss.url('') + '/tms/task/sub_order_pool',
                    //     params:{
                    //         order_id:this.data.order_ids[0].id
                    //     },
                    //     completion: res => {
                    //         console.log(res)
                    //     }
                    // })
                    tss.post({
                        url: tss.url("") + '/tms/order/pickOrder',
                        params: {
                            sub_order_id: this.data.order_ids[0].id,
                            ...data.detail.value
                        },
                        completion: res => {
                            console.log(res)
                            if (res.failed) {
                                wx.showModal({
                                    title: '提示',
                                    content: '提货操作失败',
                                    showCancel: false
                                })
                                return
                            }
                            this.setData({
                                pick_visible: false
                            })
                            wx.showToast({
                                title: '提货成功！',
                            })
                        }
                    })
                }
            }
        })
    },
    robOrders(e) {
        if (this.data.order_ids.map(i => i.id).length == 0) {
            wx.showToast({
                title: '请选择订单',
                icon: 'none'
            })
            this.setData({
                rightDrawer: false
            })
            return
        }
        wx.showModal({
            title: '提示',
            content: '确定抢单吗？',
            complete: (res) => {
                if (res.confirm) {
                    tss.post({
                        url: tss.url('') + '/tms/order/robOrders',
                        type: 'repair_operate',
                        useCookie: true,
                        params: this.data.order_ids.map(i => i.id),
                        completion: res => {
                            console.log(res)
                            if (res.failed) {
                                wx.showModal({
                                    content: res.errorMsg,
                                    showCancel: false
                                })
                                return
                            }
                            wx.showModal({
                                content: '抢单成功',
                                showCancel: false,
                                success: res => {
                                    this.setData({
                                        rightDrawer: false,
                                        chooseAllTag: false,
                                        TabCur: 2
                                    })
                                    this.querySubOrderList()
                                }
                            })
                        }
                    })
                }
            }
        })
    },
})
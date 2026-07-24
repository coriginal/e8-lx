const app = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
import {
    $wuxDialog
} from '../../../../components/index'
import {
    formatDate
} from '../../../../utils/util.js'
import dayjs from 'dayjs'
const QQMapWX = require('../../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';

var qqmapsdk = new QQMapWX({
    key: Map_Key
});



Page({
    data: {
        // width: app.menuRect.left,
        chooseType: 'send',
        taskList: [],
        statusColor: require('./source.js').TaskStatusColor,
        tableObj: require('./source.js').tableObj,
        flexObj: require('./source.js').flexObj,
        typeObj: require('./source.js').typeObj,
        if_op: false,
        status: '',
        inputTextarea: '',
        tabs: [{
                title: '进行中',
                code: 'tab1',
                params: {},
                count: ''
            },
            {
                title: '已完成',
                code: 'tab2',
                params: {
                    "status": "已到达",
                    "create_from": formatDate(new Date(new Date() - 7 * 24 * 1000 * 60 * 60), 'yyyy-MM-dd')
                },
                count: ''
            }
        ],
        domain: "",
        page: 1,
        rows: 10,
        loadStatus: 'loading',
        active: 0,
        taskCodeKeywords: "",
        filterPopupShow: false,
        form: {
            create_from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
            create_to: dayjs().format("YYYY-MM-DD"),
            type: "",
            send_site: "",
            receive_site: ""
        },
        formClone: {
            create_from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
            create_to: dayjs().format("YYYY-MM-DD"),
            type: "",
            send_site: "",
            receive_site: ""
        },
        calendarShow: false,
        minDate: new Date(dayjs().subtract(30, "day").format("YYYY-MM-DD")).getTime(),
        typeShow: false,
        typeColumns: ["提货", "中转", "派送", "直送", "整车"]
    },
    onClickShow() {
        this.setData({
            typeShow: true
        });
    },
    onChange(e) {
        console.log(e)
        let {
            field
        } = e.currentTarget.dataset;
        this.setData({
            [`form.${field}`]: e.detail
        })
    },
    typeConfirm(e) {
        this.setData({
            "form.type": e.detail.value,
            typeShow: false
        })
    },
    onClickHide() {
        this.setData({
            typeShow: false
        });
    },
    //确定日期
    onCalendarConfirm(e) {
        this.setData({
            "form.create_from": formatDate(e.detail[0], "yyyy-MM-dd"),
            "form.create_to": formatDate(e.detail[1], "yyyy-MM-dd")
        })
        this.calendarClose()
    },
    calendarClose() {
        this.setData({
            calendarShow: false
        })
    },
    openCalendar() {
        this.setData({
            calendarShow: true
        })
    },
    resetFilter() {
        this.setData({
            form: JSON.parse(JSON.stringify(this.data.formClone)),
            page: 1,
            loadStatus: 'loading',
            taskList: [],
            filterPopupShow: false
        })
        this.queryTaskList(this.data.q_params);
    },
    confirmFilter() {
        this.setData({
            page: 1,
            loadStatus: 'loading',
            taskList: [],
            filterPopupShow: false
        })
        this.queryTaskList(this.data.q_params)
    },
    onClose() {
        this.setData({
            filterPopupShow: false
        })
    },
    openFilter() {
        this.setData({
            filterPopupShow: true
        })
    },
    searchChange({
        detail
    }) {
        if (!detail) {
            this.setData({
                page: 1,
                loadStatus: 'loading',
                taskList: [],
                taskCodeKeywords: ''
            })
            this.queryTaskList(this.data.q_params)
        }
    },
    search({
        detail
    }) {
        this.setData({
            taskCodeKeywords: detail,
            page: 1,
            taskList: [],
            loadStatus: 'loading'
        })
        this.queryTaskList(this.data.q_params)
    },
    onChangeTabs({
        detail
    }) {
        this.setData({
            tab_current: detail.key
        })
        console.log(detail);
        console.log(user)
        let params = this.data.tabs.find(i => i.code == detail.key).params
        if (detail.key == 'tab1') {
            params.tasking = true
        } else {
            delete this.data.q_params.tasking
        }
        this.queryTaskList({
            ...this.data.q_params,
            ...params
        })
    },
    sendMessageAgain(e) {
        let {
            id: share_task_id,
            code: share_task_code
        } = e.currentTarget.dataset
        this.setData({
            share_task_id
        })
        $wuxDialog().open({
            resetOnClose: true,
            title: `任务单号：${share_task_code}`,
            content: '是否再次通知给司机',
            buttons: [{
                    text: '取消'
                },
                {
                    text: '确定',
                    type: 'primary',
                    openType: 'share'
                },
            ],
        })
    },
    onLoad(options) {
        console.log(formatDate)
        //TODO 起始地 整车和中转要有起始地

        let q_params = {}

        console.log(options)
        let {
            success_create_task_id,
            task_code
        } = options
        if (success_create_task_id) {
            this.data.created_task_code = task_code
            this.successCreateOrUpdateToShare(success_create_task_id, () => {
                // lc.emitEvent('task_arrange', { msg:'success' })
                // setTimeout(()=>{ wx.navigateBack() },1000)
            })
        }
        if (options.if_op) {
            this.setData({
                if_op: true
            })
            q_params = JSON.parse(options.q_params)

        } else if (options.status) {
            this.setData({
                status: options.status
            })
            let p = {};
            if (options.create_from) {
                p = {
                    create_from: formatDate(new Date(new Date() - options.create_from * 24 * 1000 * 60 * 60), 'yyyy-MM-dd')
                }
            }
            q_params = Object.assign({
                status: options.status
            }, p)
        } else {
            q_params = {
                phone: app.user.uName,
                tasking: true
            }
        }
        if (options._params) {
            // let task_id = options._params.replace(/taskid/g,'')
            q_params = {
                ...q_params,
                ...JSON.parse(options._params)
            }
            this.data._params = JSON.parse(options._params)
        }
        this.setData({
            q_params
        })
        wx.showLoading({
            title: '数据加载中',
            mask: true
        })
        console.log(options, q_params)

        this.queryTaskList(q_params)
        if (JSON.parse(options._data || "[]")) {
            this.setData({
                sub_orders: JSON.parse(options._data || "[]")
            })
        }
    },
    onShow() {
        // let _this = this
        // wx.getSetting({
        //   success(res) {
        //     if (res.authSetting['scope.userLocationBackground']) {
        //       wx.startLocationUpdateBackground({
        //         success(res) {
        //           console.log('开启后台定位', res)
        //         },
        //         fail(res) {
        //           console.log('开启后台定位失败', res)
        //           // _this.setData({ showPerModal: true})
        //         }
        //       })
        //     } else {
        //       _this.setData({ showPerModal: true })
        //     }
        //   },
        //   fail(res) {
        //     _this.setData({ showPerModal: true })
        //   }
        // })
    },
    onReady() {
        lc.addListener('alltask', this.__wxWebviewId__.toString(), res => {
            // this.queryTaskList({ phone: app.user.uName, tasking: true })
            this.setData({
                taskList:[]
            }, () => {
                this.queryTaskList(this.data.q_params);
            })
            console.log(this.data.q_params)
        })
        if (this.data._params) {
            this.setData({

            })
        }
    },
    onReachBottom() {
        if (this.data.loadStatus === "nomore") return;
        this.setData({
            page: ++this.data.page
        })
        this.query(this.data.q_params);
    },
    queryTaskList(q_params) {
        console.log('task')
        wx.showLoading({
            title: '数据加载中',
            mask: true
        })
        if (!this.data.if_op) {
            if (this.data.status) {
                this.query(Object.assign(q_params, {
                    status: this.data.status
                }))
            } else {
                let params = {
                    status: '待接单',
                    phone: app.user.uName
                }
                if (this.data._params) {
                    params = {
                        ...params,
                        ...this.data._params
                    }
                }
                tss.query({
                    url: tss.url('sql') + 'task',
                    params,
                    completion: res => {
                        console.log(res)
                        wx.hideLoading()
                        if (res && res.data && res.data.length) {
                            alert.notice('您有新的运输单，请点击确认接单', {
                                text: '确认',
                                handler: () => {
                                    tss.save({
                                        url: tss.url('tms') + '/task/driver_receive_task',
                                        params: {},
                                        completion: res => {
                                            if (res.failed || res.data) {
                                                alert.notice('接单失败。' + (res.errorMsg || res.data.errorMsg || ''))
                                            } else {
                                                wx.showToast({
                                                    title: '接单成功'
                                                })
                                            }
                                            this.query(q_params)
                                        }
                                    })
                                }
                            })
                        } else {
                            this.query(q_params)
                        }
                    }
                })
            }
        } else {
            this.query(q_params)
        }
    },
    query(q_params) {
        wx.showLoading({
            title: '数据加载中',
            mask: true
        });
        let roles = app.user.roles.split(',');
        roles.splice(roles.indexOf('司机'), 1);
        roles.splice(roles.indexOf('$匿名角色'), 1);
        roles.splice(roles.indexOf('普通员工'), 1);
        if (roles.length == 0) {
            q_params['phone'] = app.user.uName
        }
        tss.query({
            url: tss.url('sql') + 'task',
            params: {
                page: this.data.page,
                rows: this.data.rows,
                ...q_params,
                task_code: this.data.taskCodeKeywords,
                ...this.data.form
            },
            completion: res => {
                wx.hideLoading()
                if (res.failed) {
                    alert.notice('获取运输任务失败。' + (res.errorMsg || ''))
                    return
                }
                console.log(res)
                if (res.data.rows.length && this.data._params && this.data._params.task_id && res.data.rows[0].status != '已到达') {
                    this.doLocation()
                    this.getTaskSubOrderIds().then(ids => {
                        this.data.task_sub_order_ids = ids
                        this.setData({
                            show_route_batch_edit: true,
                            datetime: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                        })
                    })
                }
                let list = this.data.taskList.concat(res.data.rows.map(i => this.dealData(i)))
                this.setData({
                    taskList: list,
                    loadStatus: list.length == res.data.total ? "nomore" : "loading"
                })
            }
        })
    },

    dealData(data) {
        return {
            ...data,
            plan_depart_time: `${data.plan_depart_time ? formatDate(data.plan_depart_time, 'MM-dd hh:mm') : '出发'} ～ ${data.plan_arrive_time ? formatDate(data.plan_arrive_time, 'MM-dd hh:mm') : '到达'}`,
            short_createtime: formatDate(data.createtime, 'MM-dd hh:mm'),
            carInfo: `${data.driver || ''} ${data.plate_num || ''}`,
            cargoInfo: `${data.amount || ''} 件 / ${Math.round(data.weight * 100) / 100 || ''} kg / ${data.volume || ''} m³`
        }
    },

    // onChange(e) {
    //   const { param } = e.detail
    // },
    goDetail(e) {
        console.log(e.currentTarget.dataset)
        const dataset = e.currentTarget.dataset;
        const task_type = dataset.type;
        const task_id = dataset.id;
        const status = dataset.status;
        console.log(this.data.typeObj[task_type], task_type)
        wx.navigateTo({
            url: this.data.typeObj[task_type].url + '?task_id=' + task_id + '&task_type=' + task_type + '&task_status=' + dataset.status
        })
    },
    doTask(e) {
        const {
            id: taskId
        } = e.currentTarget
        let {
            code: task_code
        } = e.currentTarget.dataset
        console.log(taskId)
        let params = this.data.taskList.find(item => taskId == item.id)
        // params.sub_orders = [...params.sub_orders,...this.data.sub_orders]
        this.querySubOrders(taskId)
            .then(res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: `获取运输单详情失败。${res.errorMsg}`,
                        showCancel: false
                    })
                    return
                }
                let task_sub_orders = res.data
                params.sub_orders = JSON.stringify([...task_sub_orders, ...this.data.sub_orders].map(i => ({
                    id: i.id
                })))
                console.log(params)
                tss.post({
                    url: tss.url('') + '/tms/task',
                    params,
                    completion: res => {
                        console.log(res)
                        if (res.failed) {
                            wx.showModal({
                                content: res.errorMsg
                            })
                            return
                        }
                        // wx.redirectTo({ url: Pages.task })
                        this.setData({
                            sub_orders: []
                        })
                        wx.showToast({
                            title: '调度成功',
                            icon: 'none',
                            duration: 3000
                        })
                        task_code ? this.data.created_task_code = task_code : ''
                        this.successCreateOrUpdateToShare(taskId, () => {
                            lc.emitEvent('task_arrange', {
                                msg: 'success'
                            })
                            setTimeout(() => {
                                wx.navigateBack()
                            }, 1000)
                        })
                        // this.queryTaskList(this.data.q_params)
                    }
                })
            })
    },


    querySubOrders(task_id) {
        return new Promise(completion => {
            tss.query({
                // url: tss.url('sql') + 'tms_sub_code',
                // params: { task_id },
                url: tss.url('') + `/tms/task/${task_id}/subOrder2`,
                completion
            })
        })
    },
    truckDepart(e) {
        alert.notice('确认已取到货物并出发？', {
            text: '确认',
            handler: () => {
                tms.saveWithAddr({
                    url: tss.url('tms') + '/task/truck_depart',
                    params: {
                        task_id: e.currentTarget.dataset.task_id
                    },
                    completion: res => {
                        if (res.failed || res.data) {
                            alert.notice('操作失败。' + (res.errorMsg || res.data.errorMsg || ''))
                        } else {
                            wx.showToast({
                                title: '操作成功'
                            })
                            this.queryTaskList({
                                phone: app.user.uName,
                                tasking: true
                            })
                        }
                    }
                })
            }
        }, {
            text: '取消',
            handler: () => {}
        })
    },
    truckArrive(e) {
        alert.notice('确认已运输完成？', {
            text: '确认',
            handler: () => {
                tms.saveWithAddr({
                    url: tss.url('tms') + '/task/truck_complete',
                    params: {
                        task_id: e.currentTarget.dataset.task_id
                    },
                    completion: res => {
                        if (res.failed || res.data) {
                            alert.notice('操作失败。' + (res.errorMsg || res.data.errorMsg || ''))
                        } else {
                            wx.showToast({
                                title: '操作成功'
                            })
                            this.queryTaskList({
                                phone: app.user.uName,
                                tasking: true
                            })
                        }
                    }
                })
            }
        }, {
            text: '取消',
            handler: () => {}
        })
    },
    onPullDownRefresh: function () {
        this.setData({
            taskList: [],
            loadStatus: "loading",
            page: 1
        })
        this.queryTaskList(this.data.q_params);
        wx.stopPullDownRefresh();
    },
    update: function (e) {
        const index = e.currentTarget.dataset.index;
        const task = this.data.taskList[index];
        wx.navigateTo({
            url: '../capacity_pick/capacity_pick?taskid=' + task.id + '&task=' + JSON.stringify(task)
        })
    },
    successCreateOrUpdateToShare(taskId, fn) {
        this.data.share_task_id = taskId
        $wuxDialog().open({
            resetOnClose: true,
            title: `操作成功！${this.data.created_task_code ? `任务单号：${this.data.created_task_code}` : ''}`,
            content: '是否通知给司机',
            buttons: [{
                    text: '取消',
                    onTap: () => fn(),
                },
                {
                    text: '确定',
                    type: 'primary',
                    openType: 'share'
                },
            ],
        })
    },
    onShareAppMessage() {
        return {
            title: '运营给您调度了新的订单！',
            // imageUrl: this.data.shareImage,
            // path: `${Pages.redirect}?pid=40&params=staskid${this.data.share_task_id}`
            path: `${Pages.redirect}?pid=40&params=${JSON.stringify({ task_id: this.data.share_task_id })}`

        }
    },

    // 
    chooseRouteAuto(e) {
        let {
            id
        } = e.currentTarget
        this.setData({
            click_auto_route_id: id
        })
        this.data.inputTextarea_input = `${id == 1 ? `从【${this.data.route_district_location}】出发` : `到达【${this.data.route_district_location}】`}`
    },
    popRouteInput(e) {
        let {
            id
        } = e.currentTarget
        this.data.inputTextarea_input = `${id == 1 ? `从【${e.detail.value}】出发` : `到达【${e.detail.value}】`}`
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
    inputTextarea(e) {
        this.data.inputTextarea = e.detail.value
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
                ids: this.data.task_sub_order_ids
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
    onCloseRoute() {
        this.setData({
            show_route_batch_edit: false
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
    getTaskSubOrderIds() {
        return new Promise(resolve => {
            tss.query({
                // url: tss.url('sql') + `tms_sub_code?task_id=${this.data._params.task_id}`,
                url: tss.url('') + `/tms/task/${this.data._params.task_id}/subOrder2`,
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        wx.showModal({
                            content: res.errorMsg,
                            showCancel: false
                        })
                        return
                    }
                    let ids = [...new Set(res.data.map(i => i.order_id))].join(',')
                    resolve(ids)
                }
            })
        })

    },
    settingCallback() {
        this.setData({
            showPerModal: false
        })
    }
})
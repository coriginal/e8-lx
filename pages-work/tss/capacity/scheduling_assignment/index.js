// pages-work/tss/capacity/scheduling_assignment/index.js
const tss = require('../../../../utils/tss.js')
const util = require('../../../../utils/util.js')
import Pages from '../../../../pages.js'

const TASK_STATUSES = ['待接单', '已接单', '已出发', '已到达', '已完成']

Page({
    data: {
        activeTab: 0,
        taskRows: 10,

        // 待指派子单一次性加载状态。
        orderList: [],
        orderLoading: false,
        selectedOrderIds: [],

        // 提货任务分页状态。
        taskList: [],
        taskPage: 1,
        taskLoading: false,
        taskFinished: false,

        // 两个 tab 分别保存筛选条件，切换或重置时互不影响。
        orderFilter: {
            order_date_from: util.formatDate(util.subDate(new Date(), 7), 'yyyy-MM-dd'),
            order_date_to: util.formatDate(new Date(), 'yyyy-MM-dd')
        },
        taskFilter: {
            date1: util.formatDate(util.subDate(new Date(), 7), 'yyyy-MM-dd'),
            date2: util.formatDate(new Date(), 'yyyy-MM-dd'),
            statuses: TASK_STATUSES
        },
        orderFilterDraft: {},
        taskFilterDraft: {},
        filterVisible: false
    },

    /**
     * 初始化页面标题，列表请求统一放在 onShow，便于从调度页面返回后刷新。
     */
    onLoad() {
        wx.setNavigationBarTitle({
            title: '提货调度'
        })
    },

    /**
     * 首次进入及从下级页面返回时刷新当前 tab，避免展示已完成调度的旧订单。
     */
    onShow() {
        if (this.data.activeTab === 0) {
            this.loadOrderList()
        } else {
            this.loadTaskList(true)
        }
    },

    /**
     * 切换 tab。已加载过的 tab 保留当前位置，首次进入时再发起请求。
     */
    onTabChange(e) {
        const activeTab = Number(e.detail.index)
        this.setData({
            activeTab,
            filterVisible: false
        })
        if (activeTab === 0 && !this.data.orderList.length) {
            this.loadOrderList()
        }
        if (activeTab === 1 && !this.data.taskList.length) {
            this.loadTaskList(true)
        }
    },

    /**
     * 一次性查询所有可创建提货任务的待指派子单。
     */
    loadOrderList() {
        const requestId = (this.orderRequestId || 0) + 1
        this.orderRequestId = requestId
        this.setData({
            orderLoading: true,
            orderList: [],
            selectedOrderIds: []
        })

        tss.query({
            url: tss.url('') + '/tms/task/sub_order_pool',
            params: {
                task_type: '提货',
                ignore_tag: false,
                showOrderFee: true,
                order_date1: this.data.orderFilter.order_date_from,
                order_date2: this.data.orderFilter.order_date_to
            },
            completion: res => {
                if (requestId !== this.orderRequestId) return
                wx.stopPullDownRefresh()
                if (res.failed) {
                    this.setData({ orderLoading: false })
                    wx.showModal({
                        title: '加载失败',
                        content: res.errorMsg || '待指派订单加载失败',
                        showCancel: false
                    })
                    return
                }

                const result = Array.isArray(res.data) ? res.data : []
                const orderList = result.map(item => ({
                    ...item,
                    _selectId: String(item.id),
                    _sendAddr: item.send_addr || [item.send_province, item.send_city, item.send_district, item.send_town, item.send_street_no].filter(Boolean).join(''),
                    _receiveAddr: item.receive_addr || item.receive_address || [item.receive_province, item.receive_city, item.receive_district, item.receive_town, item.receive_street_no].filter(Boolean).join('')
                }))
                this.setData({
                    orderList,
                    orderLoading: false
                })
            }
        })
    },

    /**
     * 分页查询全部司机的提货任务，type 为接口要求的固定条件。
     *
     * @param {boolean} refresh 是否从第一页重新加载
     */
    loadTaskList(refresh) {
        if (!refresh && (this.data.taskLoading || this.data.taskFinished)) return

        const page = refresh ? 1 : this.data.taskPage
        const requestId = (this.taskRequestId || 0) + 1
        this.taskRequestId = requestId
        this.setData({
            taskLoading: true,
            ...(refresh ? {
                taskList: [],
                taskPage: 1,
                taskFinished: false
            } : {})
        })

        tss.query({
            url: tss.url('sql') + 'tms_trans_order',
            params: {
                page,
                rows: this.data.taskRows,
                type: '提货',
                date1: this.data.taskFilter.date1,
                date2: this.data.taskFilter.date2,
                status: this.data.taskFilter.statuses.join(',')
            },
            completion: res => {
                if (requestId !== this.taskRequestId) return
                wx.stopPullDownRefresh()
                if (res.failed) {
                    this.setData({ taskLoading: false })
                    wx.showModal({
                        title: '加载失败',
                        content: res.errorMsg || '提货任务加载失败',
                        showCancel: false
                    })
                    return
                }

                // 兼容接口直接返回数组及返回 rows 分页对象两种格式。
                const result = res.data || []
                const rows = Array.isArray(result) ? result : (result.rows || [])
                const taskList = refresh ? rows : this.data.taskList.concat(rows)
                const total = Number(result.total || 0)
                this.setData({
                    taskList,
                    taskPage: page + 1,
                    taskLoading: false,
                    taskFinished: total ? taskList.length >= total : rows.length < this.data.taskRows
                })
            }
        })
    },

    /**
     * 页面触底时仅为支持分页的提货任务列表加载下一页。
     */
    onReachBottom() {
        if (this.data.activeTab === 1) {
            this.loadTaskList(false)
        }
    },

    /**
     * 下拉刷新当前 tab。
     */
    onPullDownRefresh() {
        if (this.data.activeTab === 0) {
            this.loadOrderList()
        } else {
            this.loadTaskList(true)
        }
    },

    /**
     * 打开右侧筛选层，并复制当前 tab 的条件作为草稿。
     */
    openFilter() {
        this.setData({
            filterVisible: true,
            orderFilterDraft: { ...this.data.orderFilter },
            taskFilterDraft: {
                ...this.data.taskFilter,
                statuses: this.data.taskFilter.statuses.slice()
            }
        })
    },

    /**
     * 关闭筛选层，不保存草稿条件。
     */
    closeFilter() {
        this.setData({ filterVisible: false })
    },

    /**
     * 修改待指派订单的日期筛选草稿。
     */
    onOrderDateChange(e) {
        const field = e.currentTarget.dataset.field
        this.setData({
            [`orderFilterDraft.${field}`]: e.detail.value
        })
    },

    /**
     * 修改提货任务的日期筛选草稿。
     */
    onTaskDateChange(e) {
        const field = e.currentTarget.dataset.field
        this.setData({
            [`taskFilterDraft.${field}`]: e.detail.value
        })
    },

    /**
     * 修改提货任务的多选状态。
     */
    onTaskStatusChange(e) {
        this.setData({
            'taskFilterDraft.statuses': e.detail
        })
    },

    /**
     * 校验并应用当前 tab 的筛选草稿，另一个 tab 的条件保持不变。
     */
    applyFilter() {
        const isOrder = this.data.activeTab === 0
        const filter = isOrder ? this.data.orderFilterDraft : this.data.taskFilterDraft
        const dateFrom = isOrder ? filter.order_date_from : filter.date1
        const dateTo = isOrder ? filter.order_date_to : filter.date2

        if (dateFrom && dateTo && dateFrom > dateTo) {
            wx.showToast({
                title: '开始日期不能晚于结束日期',
                icon: 'none'
            })
            return
        }
        if (!isOrder && !filter.statuses.length) {
            wx.showToast({
                title: '请至少选择一个任务状态',
                icon: 'none'
            })
            return
        }

        if (isOrder) {
            this.setData({
                orderFilter: { ...filter },
                filterVisible: false
            }, () => this.loadOrderList())
        } else {
            this.setData({
                taskFilter: {
                    ...filter,
                    statuses: filter.statuses.slice()
                },
                filterVisible: false
            }, () => this.loadTaskList(true))
        }
    },

    /**
     * 重置当前 tab 的筛选草稿，筛选条件在点击“确定”后才生效。
     */
    resetFilter() {
        if (this.data.activeTab === 0) {
            this.setData({
                orderFilterDraft: {
                    order_date_from: '',
                    order_date_to: ''
                }
            })
        } else {
            this.setData({
                taskFilterDraft: {
                    date1: util.formatDate(util.subDate(new Date(), 7), 'yyyy-MM-dd'),
                    date2: util.formatDate(new Date(), 'yyyy-MM-dd'),
                    statuses: TASK_STATUSES.slice()
                }
            })
        }
    },

    /**
     * 同步订单勾选结果。
     */
    onOrderSelectionChange(e) {
        this.setData({ selectedOrderIds: e.detail })
    },

    /**
     * 全选或取消当前已加载的待指派订单。
     */
    toggleSelectAll() {
        const allSelected = this.data.orderList.length > 0 &&
            this.data.selectedOrderIds.length === this.data.orderList.length
        this.setData({
            selectedOrderIds: allSelected ? [] : this.data.orderList.map(item => item._selectId)
        })
    },

    /**
     * 跳转到子单所属的主单详情，传递主单 id 和 code。
     */
    goOrderDetail(e) {
        const { id, code } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages-order/order/order_detail/order_detail?id=${id}&code=${encodeURIComponent(code || '')}`
        })
    },

    /**
     * 跳转到任务详情页。
     */
    goTaskDetail(e) {
        const { id, code } = e.currentTarget.dataset
        wx.navigateTo({
            url: `${Pages.scheduling_task_detail}?id=${id}&code=${encodeURIComponent(code || '')}`
        })
    },

    /**
     * 将已选择的待指派子单直接传给新建任务单页面。
     */
    assignNewTask() {
        const subOrders = this.data.orderList.filter(item => this.data.selectedOrderIds.includes(item._selectId))
        if (!subOrders.length) {
            wx.showToast({ title: '请先选择订单', icon: 'none' })
            return
        }
        wx.navigateTo({
            url: `${Pages.pick}?data=${JSON.stringify(subOrders, (key, value) => ['_selectId', '_sendAddr', '_receiveAddr'].includes(key) ? undefined : value)}&type=提货`
        })
    },

    /**
     * 将选中子单调度到已有的提货任务。
     */
    assignExistingTask() {
        const subOrders = this.data.orderList.filter(item => this.data.selectedOrderIds.includes(item._selectId))
        if (!subOrders.length) {
            wx.showToast({ title: '请先选择订单', icon: 'none' })
            return
        }
        const queryParams = {
            days: 90,
            type: '提货',
            status: '待接单,已接单'
        }
        wx.navigateTo({
            url: `${Pages.task_yunying}?if_op=true&_data=${JSON.stringify(subOrders)}&q_params=${JSON.stringify(queryParams)}&from_page=menu`
        })
    },

    /**
     * 阻止勾选区域的点击事件触发卡片跳转。
     */
    noop() {}
})

// pages-work/tss/capacity/scheduling_task_detail/index.js
const tss = require('../../../../utils/tss.js')

Page({
    data: {
        taskId: '',
        taskCode: '',
        activeTab: 0,
        rows: 10,

        // 包含子单分页状态。
        subOrderList: [],
        subOrderPage: 1,
        subOrderLoading: false,
        subOrderFinished: false,

        // 包含主单分页状态。
        orderList: [],
        orderPage: 1,
        orderLoading: false,
        orderFinished: false
    },

    /**
     * 保存任务标识并加载默认的“包含子单”tab。
     */
    onLoad(options) {
        this.setData({
            taskId: options.id || '',
            taskCode: options.code || ''
        })
        wx.setNavigationBarTitle({
            title: options.code ? `任务 ${options.code}` : '任务详情'
        })
        this.loadSubOrders(true)
    },

    /**
     * 切换详情 tab，首次打开时加载对应列表。
     */
    onTabChange(e) {
        const activeTab = Number(e.detail.index)
        this.setData({ activeTab })
        if (activeTab === 0 && !this.data.subOrderList.length) {
            this.loadSubOrders(true)
        }
        if (activeTab === 1 && !this.data.orderList.length) {
            this.loadOrders(true)
        }
    },

    /**
     * 分页加载任务包含的子单。接口每条数据由关联记录、子单、主单三部分组成。
     *
     * @param {boolean} refresh 是否从第一页重新加载
     */
    loadSubOrders(refresh) {
        if (!this.data.taskId || (!refresh && (this.data.subOrderLoading || this.data.subOrderFinished))) return

        const page = refresh ? 1 : this.data.subOrderPage
        const requestId = (this.subOrderRequestId || 0) + 1
        this.subOrderRequestId = requestId
        this.setData({
            subOrderLoading: true,
            ...(refresh ? {
                subOrderList: [],
                subOrderPage: 1,
                subOrderFinished: false
            } : {})
        })

        tss.query({
            url: tss.url('') + `/tms/task/${this.data.taskId}/subOrder`,
            params: {
                page,
                rows: this.data.rows,
                showOrderFee: true
            },
            completion: res => {
                if (requestId !== this.subOrderRequestId) return
                wx.stopPullDownRefresh()
                if (res.failed) {
                    this.setData({ subOrderLoading: false })
                    wx.showModal({
                        title: '加载失败',
                        content: res.errorMsg || '子单加载失败',
                        showCancel: false
                    })
                    return
                }

                const result = res.data || {}
                const rows = (result.data || []).map(group => {
                    const relation = group[0] || {}
                    const subOrder = group[1] || {}
                    const order = group[2] || {}
                    return {
                        id: relation.id || subOrder.id,
                        subOrderId: subOrder.id,
                        code: subOrder.code,
                        status: subOrder.status || relation.target_status,
                        taskType: relation.task_type,
                        cargo: subOrder.cargo,
                        pack: subOrder.pack,
                        amount: subOrder.amount,
                        weight: subOrder.weight,
                        volume: subOrder.volume,
                        orderId: order.id || subOrder.order_id,
                        orderCode: order.code,
                        customerName: order.customer_name,
                        sendAddr: order.send_addr || [order.send_province, order.send_city, order.send_district, order.send_town, order.send_street_no].filter(Boolean).join(''),
                        receiveAddr: order.receive_addr || [order.receive_province, order.receive_city, order.receive_district, order.receive_town, order.receive_street_no].filter(Boolean).join('')
                    }
                })
                const subOrderList = refresh ? rows : this.data.subOrderList.concat(rows)
                const totalPages = Number(result.totalPages || 0)
                const totalSize = Number(result.totalSize || 0)
                this.setData({
                    subOrderList,
                    subOrderPage: page + 1,
                    subOrderLoading: false,
                    subOrderFinished: totalPages
                        ? page >= totalPages
                        : (totalSize ? subOrderList.length >= totalSize : rows.length < this.data.rows)
                })
            }
        })
    },

    /**
     * 分页加载任务包含的主单。
     *
     * @param {boolean} refresh 是否从第一页重新加载
     */
    loadOrders(refresh) {
        if (!this.data.taskId || (!refresh && (this.data.orderLoading || this.data.orderFinished))) return

        const page = refresh ? 1 : this.data.orderPage
        const requestId = (this.orderRequestId || 0) + 1
        this.orderRequestId = requestId
        this.setData({
            orderLoading: true,
            ...(refresh ? {
                orderList: [],
                orderPage: 1,
                orderFinished: false
            } : {})
        })

        tss.query({
            url: tss.url('') + `/tms/task/${this.data.taskId}/order`,
            params: {
                page,
                rows: this.data.rows
            },
            completion: res => {
                if (requestId !== this.orderRequestId) return
                wx.stopPullDownRefresh()
                if (res.failed) {
                    this.setData({ orderLoading: false })
                    wx.showModal({
                        title: '加载失败',
                        content: res.errorMsg || '主单加载失败',
                        showCancel: false
                    })
                    return
                }

                const result = res.data || {}
                const rows = result.data || []
                const orderList = refresh ? rows : this.data.orderList.concat(rows)
                const totalPages = Number(result.totalPages || 0)
                const totalSize = Number(result.totalSize || 0)
                this.setData({
                    orderList,
                    orderPage: page + 1,
                    orderLoading: false,
                    orderFinished: totalPages
                        ? page >= totalPages
                        : (totalSize ? orderList.length >= totalSize : rows.length < this.data.rows)
                })
            }
        })
    },

    /**
     * 触底时加载当前 tab 的下一页。
     */
    onReachBottom() {
        if (this.data.activeTab === 0) {
            this.loadSubOrders(false)
        } else {
            this.loadOrders(false)
        }
    },

    /**
     * 下拉刷新当前 tab。
     */
    onPullDownRefresh() {
        if (this.data.activeTab === 0) {
            this.loadSubOrders(true)
        } else {
            this.loadOrders(true)
        }
    },

    /**
     * 从子单卡片进入其所属主单详情。
     */
    goSubOrderDetail(e) {
        const { id, code } = e.currentTarget.dataset
        if (!id) return
        wx.navigateTo({
            url: `/pages-order/order/order_detail/order_detail?id=${id}&code=${encodeURIComponent(code || '')}`
        })
    },

    /**
     * 从主单卡片进入订单详情。
     */
    goOrderDetail(e) {
        const { id, code } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages-order/order/order_detail/order_detail?id=${id}&code=${encodeURIComponent(code || '')}`
        })
    }
})

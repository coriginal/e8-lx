import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')
import {
    $wuxDialog
} from '../../../components/index'
const _App = getApp().globalData;
import {
    formatDate
} from '../../../utils/util'

Component({
    options: {
        styleIsolation: 'apply-shared',
    },
    data: {
        income_list: [],
        cost_list: [],
        origin: 'order_write',
        billModelList: '',
        truckTaskCode: '',
        isEdit: false
    },
    properties: {
        pageFrom: String,
        orderId: Number
    },
    lifetimes: {
        attached(options) {

        },
        ready() {

            this.setData({
                user: _App.user
            })
            lc.addListener('back_fee_info', this.__wxWebviewId__.toString(), res => {
                this.initPage()
                if (this.data.taskId) {
                    this.data.task.version = this.data.task.version + 1
                }
            })
            lc.addListener('task_settle_account', this.__wxWebviewId__.toString(), res => {
                let list_id = `cost_list[${this.data.item_idx}].settle_account_id`
                let list_name = `cost_list[${this.data.item_idx}].settle_account_name`
                this.setData({
                    [list_id]: res.settle_account_id,
                    [list_name]: res.settle_account_name,
                    "item.settle_account_id": res.settle_account_id,
                    "item.settle_account_name": res.settle_account_name
                })
            })
            if (this.data.orderId) {
                this.beforeInitPage()
            }

        },
        detached() {
            lc.removeListener('back_fee_info', this.__wxWebviewId__.toString())
            lc.removeListener('task_settle_account', this.__wxWebviewId__.toString())
        }
    },
    methods: {
        chooseBillModel(e) {
            const {
                id: chooseId
            } = e.currentTarget
            const billModel = this.data.billModelList[chooseId]

            if (this.data.chooseId == chooseId) return

            this.setData({
                chooseId
            })
            //绑定报价模型
            //this.data.order.bill_model_id = billModel.id
            this.getModelMoney({
                    ...this.data.order,
                    bill_model_id: billModel.id
                })
                .then(res => {
                    wx.hideLoading()
                    res.data.errorMessage && wx.showToast({
                        title: res.data.errorMessage,
                        icon: 'none'
                    })
                    let idx = this.data.income_list.findIndex(i => i.subject_name == '运费')
                    let income_list = this.data.income_list
                    let cost_list = this.data.cost_list;

                    [...income_list, ...cost_list].forEach(i => {
                        let value = res.data.vasFees.find(item => item.type == i.type && item.fee_id == i.subject_id)
                        i.value = value && value.fee
                    })

                    income_list[idx].value = res.data.money
                    this.setData({
                        income_list,
                        cost_list
                    }, () => this.computedTotal())
                })
        },
        // 获取报价金额
        getModelMoney(params) {
            wx.showLoading({
                title: '价格计算中...',
                mask: true
            })
            params.order_date = formatDate(new Date().getTime(), 'yyyy-MM-dd')
            let awv = JSON.parse(params.subOrders),
                amount = 0,
                weight = 0,
                volume = 0
            for (let i in awv) {
                amount += Number(awv[i]["amount"])
                weight += Number(awv[i]["weight"])
                volume += Number(awv[i]["volume"])
            }
            params["amount"] = amount
            params["weight"] = weight
            params["volume"] = volume
            return new Promise(completion => {
                tss.post({
                    url: tss.url('') + '/price/getMoney',
                    params,
                    completion
                })
            })
        },
        onLoad(options) {
            // this.data.orderId = 15066
            // options.origin = 'task'
            // options.task = JSON.stringify({id:190})
            this.data.origin = options.origin || 'order_write'
            if (options.pageFrom) {
                this.setData({
                    pageFrom: options.pageFrom
                })
                this.data.order = JSON.parse(options.order)
                if(this.data.order.id){
                  this.setData({
                    isEdit: true,
                    orderId: this.data.order.id
                  })
                }
                this.getBillModel()
            }
            if (options.origin == 'task') {
                this.setData({
                    taskId: JSON.parse(options.task).id
                })
                this.data.task = JSON.parse(options.task)
            }
            if (options.truckTaskCode) {
                this.setData({
                    truckTaskCode: options.truckTaskCode
                })
            }
            this.beforeInitPage()
        },
        // 获取报价模型
        getBillModel() {
            const {
                customer_id,
                subOrders,
                ...other
            } = this.data.order
            // console.log(order)
            tss.query({
                // url: tss.url('') + '/price/getOptimalBillModels',
                url: tss.url('') + '/price/getOptimalBillModel',
                params: {
                    target: 'customer',
                    targetId: customer_id,
                    date: formatDate(new Date(), 'yyyy-MM-dd'),
                    ...other,
                },
                completion: res => {
                    // let data = (!res.failed && res.data) || []
                    // this.setData({
                    //   billModelList: data.filter(i => other.truck_type ? i.type == '按车型' : i.type != '按车型')
                    // }) 
                    let billModelList = []
                        // if(typeof !res.failed && res.data){

                        // }
                        !res.failed && res.data ? billModelList.push(!res.failed && res.data) : ''
                    this.setData({
                        billModelList
                    }, () => {
                        // this.chooseBillModel({ currentTarget: { id: 0 } })
                    })
                }
            })
        },
        beforeInitPage() {
            // 查询所有科目
            wx.showLoading({
                mask: true
            })
            queryAllFeeItems().then(res => {
                this.data.allFeeItems = res.data
                // 查询角色对应科目
                queryOrderFeeList({
                    origin: this.data.origin
                }).then(res => {
                    this.data.allRoleFeeItems = res.data
                    this.initPage(this.data.origin)
                })
            })
        },
        // 初始化科目列表
        initPage(origin = this.data.origin) {
            let order_id = this.data.orderId
            switch (origin) {
                case 'order_write':
                    // 有orderId的查询tms_order
                    // 没有orderId的初始化roleFee列表
                    order_id ? this.doOrderQuery(order_id) : this.initFeesItems(origin)

                    break;
                case 'task':
                    // 运输单列表进来
                    // this.queryTaskFinFlows(this.data.task)
                    // console.log('task')
                    break;

                default:
                    break;
            }
        },
        // 运输单费用详情 new 
        queryTaskFeeFlow(task) {
            tss.query({

            })
        },
        // 运输单费用详情
        queryTaskFinFlows(task) {
            tss.get({
                url: `${tss.url('')}/tms/fin/query_fin_task_flow?task_id=${task.id}`,
                completion: res => {
                    if (res.failed) {
                        errorAlert(res.errorMsg)
                        return
                    }
                    this.data.taskMoneyDetail = res.data.map(i => ({
                        ...i,
                        permission: this.data.allRoleFeeItems.find(x => x.subject_id == i.fee_id) && this.data.allRoleFeeItems.find(x => x.subject_id == i.fee_id).permission
                    }))
                    let feeids = [...new Set(res.data.map(i => Number(i.fee_id)))]
                    let list = feeids.map(i => ({
                        permission: this.data.allRoleFeeItems.find(x => x.subject_id == i) && this.data.allRoleFeeItems.find(x => x.subject_id == i).permission,
                        subject_id: i,
                        subject_name: this.data.allRoleFeeItems.find(x => x.subject_id == i) && this.data.allRoleFeeItems.find(x => x.subject_id == i).subject_name,
                        value: res.data.filter(x => x.fee_id == i).map(i => Number(i.fee)).reduce((a, b) => a + b, 0),
                        type: this.data.allRoleFeeItems.find(x => x.subject_id == i) && this.data.allRoleFeeItems.find(x => x.subject_id == i).type,
                    }))
                    this.setData({
                        income_list: _filter(list, 'income'),
                        cost_list: _filter(list, 'cost')
                    }, () => this.computedTotal(['cost']))
                    wx.hideLoading()
                }
            })
        },
        chooseLcName() {
            wx.navigateTo({
                url: `${Pages.router_connect_1}?type=task_settle_account`,
            })
        },
        // 订单费用详情
        doOrderQuery(order_id) {
            queryOrderMoney(order_id)
                .then(res => {
                    if (res.failed) {
                        errorAlert(item.errorMsg)
                        return
                    }
                    this.data.orderMoneyDetail = res.data
                        .map(i => ({
                            ...i,
                            permission: this.data.allRoleFeeItems.find(x => x.subject_id == i.fee_id) && this.data.allRoleFeeItems.find(x => x.subject_id == i.fee_id).permission
                        }))
                    queryTmsOrder(order_id)
                        .then(res => {
                            if (res.failed) {
                                wx.hideLoading()
                                errorAlert(item.errorMsg)
                                return
                            }
                            let order = res.data[0]
                            let list = []
                            let total_income = 0,
                                total_cost = 0;
                            for (let key in order) {
                                if (key.includes('_compare')) {
                                    let key_array = key.split('_')
                                    list.push({
                                        type: key_array[0],
                                        subject_id: key_array[2],
                                        subject_name: this.data.allFeeItems.find(i => i.id == key_array[2]).name,
                                        value: order[key],
                                        value_type: isRealNum(order[key]),
                                        permission: this.data.allRoleFeeItems.find(i => i.subject_id == key_array[2]).permission
                                    })
                                }
                                if (key.includes('_approving')) {
                                    let fees = key.split('_');
                                    total_income += fees[0] == 'income' ? order[key] : 0
                                    total_cost += fees[0] == 'cost' ? order[key] : 0
                                }
                            }
                            wx.hideLoading()
                            this.setData({
                                income_list: _filter(list, 'income'),
                                cost_list: _filter(list, 'cost'),
                                total_cost,
                                total_income
                            })
                        })
                })
        },
        // 初始化费用列表
        initFeesItems() {
            wx.hideLoading()
            this.setData({
                income_list: _filter(this.data.allRoleFeeItems, 'income'),
                cost_list: _filter(this.data.allRoleFeeItems, 'cost')
            }, () => this.chooseBillModel({
                currentTarget: {
                    id: 0
                }
            }))
        },

        // 计算总和
        computedTotal(type = ['cost', 'income']) {
            type.forEach(item => {
                let list = this.data[`${item}_list`]
                    .filter(i => i.value)
                    .map(i => Number(i.value))
                this.setData({
                    [`total_${item}`]: list.reduce((x, y) => x + y, 0).toFixed(2)
                })
            })
        },
        // 添加一笔费用
        createFee(e) {
            let fee_ids = this.data[`${e.currentTarget.id}_list`].map(i => Number(i.subject_id))
            let _list = this.data.allRoleFeeItems
                .filter(i => i.permission == 2 && i.type == e.currentTarget.id)
            if (e.currentTarget.id == 'income') {
                // 收入新增费用过滤相同
                _list = _list.filter(i => !fee_ids.includes(i.subject_id))
            }
            if (this.data.orderId) {
                let fin_list = JSON.stringify(this.data.orderMoneyDetail.filter(i => i.type == e.currentTarget.id))
                wx.navigateTo({
                    url: `${Pages.create_new_fee}?list=${JSON.stringify(_list)}&fin_list=${fin_list}&orderId=${this.data.orderId || ''}&type=${e.currentTarget.id}`
                })
                return
            }
            if (this.data.taskId) {
                let fin_list = JSON.stringify(this.data.taskMoneyDetail)
                wx.navigateTo({
                    url: `${Pages.create_new_fee}?list=${JSON.stringify(_list)}&fin_list=${fin_list}&taskId=${this.data.taskId || ''}&type=${e.currentTarget.id}&task=${JSON.stringify(this.data.task)}`
                })
                return
            }
        },
        // 本科目费用详情
        queryFeeItemDetail(e) {
            const {
                item,
                idx,
                type
            } = e.currentTarget.dataset
            this.setData({
                item,
                item_idx: idx
            })
            if (this.data.taskId) {
                let spItems = {
                    fee_id: item.subject_id,
                    origin_id: this.data.orderId || this.data.orderId,
                    type: this.data.orderId ? 'order' : 'task'
                }
                let itemDetailList = this.data.orderMoneyDetail.filter(i => i.fee_id == item.subject_id && i.type == item.type)

                wx.navigateTo({
                    url: `${Pages.feeitem_detail}?spItems=${JSON.stringify(spItems)}&data=${JSON.stringify(itemDetailList)}&type=${type}&fin_list=${JSON.stringify(this.data.orderMoneyDetail)}&orderId=${this.data.orderId}`,
                })
            }
            // else if (this.data.task) {
            //   if (item.permission != 2) {
            //     wx.showToast({
            //       title: '暂无修改权限',
            //       icon: 'none'
            //     })
            //     return
            //   }
            //   this.updateFeeItem(item, idx, type)
            // } 
            else {
                this.updateFeeItem(item, idx, type)
            }
        },
        // 更新运输单费用
        updateTaskFee() {
            let fees = [...this.data.cost_list, ...this.data.income_list]
                .filter(i => i.value)
                .map(i => ({
                    ...i,
                    fee: i.value
                }))
            tss.post({
                url: tss.url('') + '/tms/task',
                params: {
                    ...this.data.task,
                    fees: JSON.stringify(fees)
                },
                completion: res => {
                    if (res.failed) {
                        errorAlert(res.errorMsg)
                        return
                    }
                    wx.showToast({
                        title: '修改成功！',
                    })
                }
            })
        },
        // 报销
        doSpFees(e) {
            var param;
            if (this.data.orderId) {
                param = {
                    flowIds: e.currentTarget.id,
                    origin_id: this.data.orderId,
                    add_fee_flow: '否',
                    type: 'order'
                }
            }
            if (this.data.taskId) {
                param = {
                    fee_id: e.currentTarget.id,
                    origin_id: this.data.taskId,
                    add_fee_flow: '否',
                    type: 'task'
                }
            }
            this.setData({
                param,
                show_pop: true
            })
        },
        changePopShow(e) {
            this.setData({
                show_pop: e.detail.visiale
            })
        },
        // 录单时 更改订单费用
        updateFeeItem(item, idx, type) {
            this.setData({
                showLcChoose: item.type == 'cost'
            })
            $wuxDialog().prompt({
                ...options(item),
                onConfirm: (e, res) => {
                    let list = `${type}_list[${idx}].value`
                    this.setData({
                        [list]: res
                    }, () => this.data.taskId ? this.updateTaskFee() : '')
                    this.computedTotal([item.type])
                }
            })
        },
        // 保存订单
        confirmOrder() {
            wx.showLoading({
                mask: true
            })
            let finFlows = [...this.data.income_list, ...this.data.cost_list]
                .filter(i => i.value)
                .map(i => ({
                    type: i.type,
                    fee_id: i.subject_id,
                    fee: i.value,
                    settle_account_id: i.settle_account_id || '',
                    origin: 'order_write',
                    if_pay: ''
                }))
            const data = {
                ...this.data.order,
                click: _App.user.uName,
                finFlows: JSON.stringify(finFlows),
                ...(this.data.truckTaskCode ? {
                    truckTaskCode: this.data.truckTaskCode
                } : {})
            }
            tss.post({
                url: tss.url('') + (this.data.truckTaskCode ? '/tms/deliveryTask/createOrder' : '/tms/order'),
                params: data,
                completion: res => {
                    if (res.failed) {
                        errorAlert(res.errorMsg)
                        return
                    }
                    if(this.data.isEdit){
                      wx.hideLoading()
                      wx.showModal({
                        title:"提示",
                        content:"修改成功！",
                        showCancel:false,
                        complete:()=>{
                          wx.navigateBack({
                            delta: 2
                          })
                        }
                      })
                    }else{
                      wx.redirectTo({
                        url: `${Pages.order_success}?orderId=${res.data.data}`+(this.data.truckTaskCode ? '': `&asnno=${res.data.asnno}&income=${res.data.income}`),
                        success: () => {
                            wx.hideLoading()
                            wx.vibrateLong()
                        }
                    })
                    }

                }
            })
        }
    }
})

const options = item => ({
    resetOnClose: true,
    maskClosable: true,
    focus: true,
    title: `【${item.type == 'cost' ? '成本项' : '收入项'}】- ${item.subject_name}`,
    content: `请输入${item.subject_name}`,
    fieldtype: 'digit',
    maxlength: 10,
    defaultText: item.value || '',
    cancelText: '取消',
    confirmText: '确定'
})

const _filter = (data, type) => data.filter(i => i.type == type)

const queryTmsOrder = (order_id) => new Promise(completion => {
    tss.query({
        url: tss.url('sql') + 'tms_order',
        params: {
            tms_order_id: order_id
        },
        completion
    })
})

const queryOrderFeeList = (params) => new Promise(completion => {
    tss.query({
        url: tss.url('') + '/tms/fin/fee_role',
        params,
        completion
    })
})

const queryAllFeeItems = () => new Promise(completion => {
    tss.query({
        url: tss.url('') + '/tms/entity/ExpenseSubject',
        completion
    })
})

const queryOrderMoney = (order_id) => new Promise(completion => {
    tss.get({
        url: `${tss.url('')}/tms/fin/order_money?order_id=${order_id}`,
        completion
    })
})

const errorAlert = (content) => {
    wx.showModal({
        content,
        showCancel: false,
        complete: () => {
            wx.hideLoading()
        }
    })
}

function isRealNum(val) {
    // 先判定是否为number
    if (typeof val !== 'number') {
        return false;
    }
    if (!isNaN(val)) {
        return true;
    } else {
        return false;
    }
}
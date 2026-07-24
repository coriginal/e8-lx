import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
const lc = require('../../../utils/listenerCenter.js')
const _App = getApp().globalData

Page({
    data: {
        list: [],
        moreMenu: [{
                code: 'cusDetail',
                title: '详细资料'
            },
            // { code: 'cusEdit', title: '修改信息' }
        ],
        page: 1,
        more: true,
        search_content:''
    },
    onLoad(options) {
        console.log(options)
        let {
            from_page = '', fee_type = ''
        } = options
        this.setData({
            from_page,
            fee_type
        })
        wx.setNavigationBarTitle({
            title: '客户列表',
        })

        wx.removeStorage({
            key: 'cookie',
            complete: res => {
                console.log(res)
                this.queryCustomerList()
            }
        })
    },
    // 客户过滤
    bindKeyInput: tss.debounce(function (e) {
        let value = e.detail.value
        if (value) {
            // let filterData = this.data.list
            //     .filter(item => item.name.includes(value) || item.phone.includes(value))
            // this.setData({
            //     filterData
            // })
            this.setData({
                search_content:value,
                list:[],
                page:1,
                more:true
            })
            this.queryCustomerList()
        }else{
            this.setData({
                search_content:null,
                list:[],
                page:1,
                more:true
            })
            this.queryCustomerList()
        }
    }, 500),
    // 选择客户并返回
    chooseCustomer(e) {
        let index = e.currentTarget.id
        if (this.data.from_page == 'params') {
            lc.emitEvent('customerChooseInfo', {
                customer: this.data.list[index]
            })
            wx.navigateBack()
            return
        }
        if (this.data.fee_type == 'abnormal_fee') {
            wx.navigateTo({
                url: `${Pages.order_list}?customer_name=${this.data.list[index].name}&customer_id=${this.data.list[index].id}`,
            })
            return
        }
        console.log(this.data.list[index])
        lc.emitEvent('orderInfo', {
            type: 'customerInfo',
            data: this.data.list[index]
        })
        setTimeout(() => {
            wx.navigateBack()
        }, 500)
    },
    // 前往客户详情
    goCustomerDetail(e) {
        wx.navigateTo({
            url: `${Pages.customer_detail}?id=${e.currentTarget.id}`,
        })
    },
    // 新增客户
    newCustomer(e) {
        wx.redirectTo({
            url: Pages.customer_create
        })
    },
    // 查询客户列表
    queryCustomerList(phone=null) {
        wx.showLoading({
            mask: true
        })
        tss.query({
            url: tss.url('sql') + 'customer',
            params: {
                active: 1,
                rows: 30,
                page: this.data.page,
                name:phone?null:this.data.search_content,
                phone
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
                if (!res.data.rows.length) {
                    this.setData({
                        more: false
                    })
                    wx.showToast({
                        title: '没有更多啦',
                        icon: 'none'
                    })
                    return
                }
                this.setData({
                    list: [...this.data.list, ...res.data.rows]
                }, () => {
                    wx.setNavigationBarTitle({
                        title: `客户列表 ${this.data.list.length}位`,
                    })
                    wx.hideLoading()
                    if(this.data.search_content && !phone){
                        if(this.data.search_content){
                            this.queryCustomerList(this.data.search_content)
                        }
                    }
                    
                })
            }
        })
    },
    // 打开更多菜单
    showMoreMenu(e) {
        const {
            id: customer_id
        } = e.currentTarget
        // this.setData({ visible: true, customer_id })
        this.setData({
            customer_id
        })
        this.cusDetail()
    },
    // 关闭更多菜单
    closeMoreMenu(e) {
        this.setData({
            visible: false,
            customer_id: ''
        })
    },
    // 点击更多菜单按钮
    clickMoreMenu(e) {
        const {
            code
        } = e.currentTarget.dataset
        this[code]()
        setTimeout(() => {
            this.closeMoreMenu()
        }, 500)
    },
    cusDetail() {
        console.log(this.data.customer_id)
        wx.navigateTo({
            url: `${Pages.customer_detail}?customer_id=${this.data.customer_id}`
        })
    },
    cusEdit() {
        wx.navigateTo({
            url: `${Pages.customer_detail}?customer_id=${this.data.customer_id}&type=edit`
        })
    },
    onReachBottom() {
        if (this.data.more) {
            this.setData({
                page: ++this.data.page
            })
            this.queryCustomerList()
        }
    }
})
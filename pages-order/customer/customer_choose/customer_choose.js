import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
const lc = require('../../../utils/listenerCenter.js')
const _App = getApp().globalData

Page({
    data: {
        list: [],
        filterData: [],
        pages: 1,
        nomore: false,
        name:''
    },
    onLoad(options) {
        this.queryCustomerList()
    },
    // 客户过滤
    bindKeyInput: tss.debounce(function (e) {
        let value = e.detail.value
        this.setData({
            name:value,
            pages:1,
            list:[],
            nomore:false
        })
        this.queryCustomerList()
        // if (value) {
        //     let filterData = this.data.list
        //         .filter(item => item.name.includes(value))
        //     this.setData({
        //         filterData
        //     })
        // } else {
        //     this.setData({
        //         filterData: this.data.list
        //     })
        // }
    }, 500),
    onReachBottom() {
        if (!this.data.nomore) {
            this.setData({
                pages: ++this.data.pages
            })
            this.queryCustomerList()
        }
    },
    // 选择客户并返回
    chooseCustomer(e) {
        const {
            item
        } = e.currentTarget.dataset
        const {
            name,
            customer_id
        } = item
        wx.navigateTo({
            url: `${Pages.order_list}?customer_name=${name||''}&customer_id=${customer_id||''}&fromPage=customer_choose`,
        })
    },
    // 查询客户列表
    queryCustomerList() {
        wx.showLoading({
            mask: true
        })
        let params={
            page: this.data.pages,
            rows: 30
        }
        if(this.data.name){
            params={
                ...params,
                name:this.data.name
            }
        }
        tss.query({
            url: tss.url('data') + 'xcx_customer_choose',
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
                if (this.data.pages === 1 && !this.data.name) {
                    res.data.rows.splice(0, 0, {
                        name: '选择全部'
                    })
                }

                this.setData({
                    list: this.data.list.concat(res.data.rows),
                    //filterData: res.data.rows
                })
                if (this.data.list.length >= res.data.total) {
                    this.setData({
                        nomore: true
                    })
                }
                wx.hideLoading()
            }
        })
        // tss.query({
        //   url: tss.url('data') + 'xcx_customer_choose',
        //   completion: res => {
        //     if (res.failed) {
        //       wx.showModal({ content: res.errorMsg, showCancel: false })
        //       wx.hideLoading()
        //       return
        //     }
        //     res.data.splice(0, 0, { name: '选择全部' })
        //     this.setData({
        //       list: res.data,
        //       filterData: res.data
        //     })
        //     wx.hideLoading()
        //   }
        // })
    }
})
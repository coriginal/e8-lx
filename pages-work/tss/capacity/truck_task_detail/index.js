// pages-work/tss/capacity/truck_task_detail/index.js
const app = getApp().globalData;
const tss = require('../../../../utils/tss.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        active: 0,
        page: 1,
        rows: 10,
        list: [],
        feeList:[],
        status: 'loading',
        currentTaskCode: '',
        show: false,
        currentUnloadOrder: null,
        form: {
            orderVolume: '',
            orderWeight: ''
        },
        feeRoleList:[]
    },
    close() {
        this.setData({
            form: {
                orderWeight: '',
                orderVolume: ''
            },
            show: false
        })
    },
    submit(form) {
        console.log(form)
        form = form.detail.value
        if (!form.orderWeight) {
            wx.showToast({
                title: '请输入运单重量',
                icon: 'none'
            })
            return
        }
        if (!form.orderVolume) {
            wx.showToast({
                title: '请输入运单体积',
                icon: 'none'
            })
            return
        }
        wx.showModal({
            title: '提示',
            content: '确认提交吗？',
            complete: (res) => {
                if (res.confirm) {
                    tss.post({
                        url: tss.url('') + '/tms/deliveryTask/orderUnload',
                        params: {
                            ...form,
                            orderId: this.data.currentUnloadOrder.id,
                            taskCode: this.data.currentUnloadOrder.taskCode
                        },
                        type: 'repair_operate',
                        completion: res => {
                            if (res.failed) {
                                wx.showModal({
                                    title: '提示',
                                    content: res.errorMsg,
                                    showCancel: false,
                                })
                                this.close()
                                return
                            }
                            wx.showModal({
                                title: '提示',
                                content: res.data.msg,
                                showCancel: false,
                                complete: () => {
                                    this.refresh();
                                    this.close();
                                }
                            })
                        }
                    })
                }
            }
        })
    },
    refresh() {
        this.setData({
            page: 1,
            status: 'loading',
            list: []
        }, () => {
            this.getOrder()
        })
    },
    unload(e) {
        this.setData({
            currentUnloadOrder: e.currentTarget.dataset.order,
            show: true
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    getOrder() {
        tss.get({
            url: tss.url('') + `/api/data/sql/delivery_task_added_order?taskCode=${this.data.currentTaskCode}&page=${this.data.page}&rows=10`,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.errMsg,
                        showCancel: false,
                    })
                    return
                }
                let list = this.data.list.concat(res.data.rows)
                let status = this.data.status;
                if (list.length === res.data.total) {
                    status = 'nomore'
                }
                this.setData({
                    list,
                    status
                })
            }
        })
    },
    getFee(){
        tss.get({
            url: tss.url('') + `/api/data/sql/truck_task_fee_list?taskCode=${this.data.currentTaskCode}`,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.errMsg,
                        showCancel: false,
                    })
                    return
                }
                let list = res.data
                list = list.map(item=>{
                    return{
                        ...item,
                        feeName: this.data.feeRoleList.find(i=>i.subject_id===item.feeId).subject_name
                    }
                })
                console.log(list,this.data.feeRoleList)
                this.setData({
                    feeList:list,
                })
            }
        })
    },
    loadMore() {
        console.log("加载更多")
        if (this.data.status === 'nomore') return;
        this.setData({
            page: ++this.data.page
        })
        this.getOrder();
    },
    getFeeRole(){
        tss.getJSON({
            url: tss.url('') + '/tms/fin/fee_role',
            params: {
                origin: 'task',
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    return
                }
                this.setData({
                    feeRoleList: res.data.filter(item=>item.type==='income')
                },()=>{
                    this.getFee()
                })
            }
        })
    },
    onLoad(options) {
        if (options.taskCode) {
            this.setData({
                currentTaskCode: options.taskCode
            }, () => {
                this.getOrder();
                this.getFeeRole();
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '缺少参数',
                showCancel: false,
                complete: () => {
                    wx.navigateBack()
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

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
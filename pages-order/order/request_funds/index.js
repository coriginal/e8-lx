const tss = require('../../../utils/tss.js')
const _App = getApp().globalData
// pages-order/order/request_funds/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        feeList: [],
        result: [],
        settleAccountList: [],
        _settleAccountList: [],
        form: {
            flowIds: "",
            fee: "",
            remark: "",
            account_id: "",
            account_name: "",
            receive_person: "",
            receive_bank: "",
            receive_account: "",
            _tempID: "",
            order_ids: "",
            pay_type: "请款"
        },
        show: false,
        fileList: []
    },
    fieldChange(e) {
        let {
            field
        } = e.currentTarget.dataset;
        this.setData({
            [`form.${field}`]: e.detail
        })
    },
    getSettleAccountList() {
        tss.get({
            url: tss.url('') + '/tms/entity/SettleAccount?income_cost=cost',
            completion: res => {
                console.log(res)
                if (res.failed) {
                    return
                }
                this.setData({
                    settleAccountList: res.data,
                    _settleAccountList: res.data
                })
            }
        })
    },
    searchChange({
        detail
    }) {
        let list = JSON.parse(JSON.stringify(this.data.settleAccountList));
        this.setData({
            _settleAccountList: list.filter(item => item.name.includes(detail))
        })
    },
    showPopup() {
        this.setData({
            show: true
        });
    },

    onClose() {
        this.setData({
            show: false
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    selectedAccount(e) {
        console.log(e)
        let {
            id,
            name
        } = e.currentTarget.dataset
        this.setData({
            "form.account_id": id,
            "form.account_name": name
        })
        this.onClose()
    },
    submit() {
        console.log(this.data.form)
        if (!this.data.form.fee) {
            wx.showToast({
                title: '请填写金额',
                icon: "none"
            })
            return
        }
        if (!this.data.form.account_id) {
            wx.showToast({
                title: '请选择承运商',
                icon: "none"
            })
            return
        }
        wx.showModal({
            title: '提示',
            content: '确定提交申请吗？',
            complete: (res) => {
                if (res.confirm) {
                    wx.showLoading();
                    tss.post({
                        url: tss.url('') + '/tms/fin/spfee_with_orderflow',
                        params: this.data.form,
                        completion: res => {
                            wx.hideLoading()
                            if (res.failed) {
                                wx.showModal({
                                    showCancel: false,
                                    content: res.errorMsg
                                })
                                return
                            }
                            wx.showModal({
                                title: '提示',
                                content: '提交成功！',
                                showCancel: false,
                                complete: (res) => {
                                    if (res.confirm) {
                                        wx.navigateBack()
                                    }
                                }
                            })
                        }
                    })
                }
            }
        })
    },
    onLoad(options) {
        console.log(options)
        if (options.orderIds) {
            this.getOrderMoney(options.orderIds);
            this.getSettleAccountList();
            this.setData({
                "form.order_ids": options.orderIds,
                "form._tempID": new Date().getTime()
            })
        } else {
            wx.navigateBack()
        }
    },
    calculateMoney() {
        let {
            result
        } = this.data;
        console.log(result)
        let total = 0;
        let ids = []
        result.map(idx => {
            total += this.data.feeList[idx].fee * 100
            ids.push(this.data.feeList[idx].id)
        })
        this.setData({
            "form.fee": total / 100,
            "form.flowIds": ids.join(',')
        })
    },
    afterRead(event) {
        console.log(event)
        const {
            file
        } = event.detail;
        tss.uploadImagesAsync({
            recordId: 'tms_sp_order_fee',
            itemId: this.data.form._tempID,
            uName: _App.user.uName,
            uToken: _App.user.uToken,
            filePaths: file.map(item => item.tempFilePath),
            completion: res => {
                console.log(res)
                const {
                    fileList = []
                } = this.data;
                fileList.push(...file);
                this.setData({
                    fileList
                });
            }
        })
    },
    getOrderMoney(orderIds) {
        tss.post({
            url: tss.url("") + '/tms/fin/order_money',
            params: {
                type: "cost",
                order_id: orderIds
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    return
                }
                this.setData({
                    feeList: res.data
                })
            }
        })
    },
    onChange(event) {
        this.setData({
            result: event.detail,
        });
        this.calculateMoney()
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
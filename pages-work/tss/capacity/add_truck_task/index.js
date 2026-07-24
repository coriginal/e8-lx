// pages-work/tss/capacity/add_truck_task/index.js
import Pages from '../../../../pages'
const tss = require('../../../../utils/tss.js')
const dayjs = require('dayjs')
import {
    formatDate
} from '../../../../utils/util'
const lc = require('../../../../utils/listenerCenter.js')
const testData = {
    "id": "",
    "version": "",
    "taskCode": "",
    "taskDate": "2025-06-28",
    "ifUnload": "NO",
    "customerId": "36160",
    "driver": "",
    "phone": "",
    "plateNum": "",
    "trailerNum": "",
    "truckType": "",
    "loadWeight": "",
    "unloadWeight": "",
    "remark": "",
    "creator": "Jenny",
    "createTime": "2025-06-28 14:08:48",
    "taskType": "CDT",
    "feeReqList": [],
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        customerInfo: null,
        formData: {
            customerId: '',
            taskDate: formatDate(new Date(), 'yyyy-MM-dd'),
            ifUnload: false,
            driver: '',
            phone: '',
            plateNum: '',
            trailerNum: '',
            truckType: '',
            loadWeight: '',
            unloadWeight: '',
            realArriveTime: '',
            planArriveTime: '',
            remark: '',
            feeReqList: []
        },
        showPageContainer: false,
        showClerkChoose: false,
        filterDriverList: [],
        driverList: [],
        currentPlanDate: new Date().getTime(),
        currentRealDate: new Date().getTime(),
        show: false,
        showReal: false,
        totalFee: 0,
        mode: 'create',
        noInputTaskCode: false
    },
    driverChoose() {
        this.setData({
            showClerkChoose: true,
            showPageContainer: true
        })
    },
    switchChange(e) {
        console.log(e)
        this.data.formData.ifUnload = e.detail.value
    },
    bindDateChange(e) {
        console.log(e)
        this.setData({
            formData: {
                ...this.data.formData,
                taskDate: e.detail.value
            }
        })
    },
    goFee() {
        let feeReqList = this.data.formData.feeReqList;
        console.log(feeReqList)
        if (feeReqList.length) {
            var obj = feeReqList.reduce((acc, item) => {
                acc[item.feeId] = {
                    ...item,
                    subject_id: item.feeId
                };
                return acc;
            }, {});
        }
        wx.navigateTo({
            url: Pages.truck_task_fee + (obj ? `?data=${JSON.stringify(obj)}` : ''),
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        lc.addListener('orderInfo', this.__wxWebviewId__.toString(), res => {
            if (res.type === 'customerInfo') {
                this.setData({
                    'formData.customerId': res.data.id,
                    customerInfo: res.data
                })
            }
            if (res.type === 'feeInfo') {
                let totalFee = res.data.map(item => item.feeAmount).reduce((a, b) => {
                    console.log(a)
                    return Number(a) + Number(b)
                }, 0)
                console.log("总费用", totalFee)
                this.setData({
                    'formData.feeReqList': res.data,
                    totalFee
                })
            }
        })
        if (options.taskCode) {
            console.log(options.taskCode)
            tss.get({
                url: tss.url('') + `/tms/deliveryTask/query/${options.taskCode}`,
                completion: res => {
                    if (res.failed) {
                        wx.showModal({
                            title: '提示',
                            content: res.errMsg,
                            showCancel: false,
                        })
                        return
                    }
                    const {
                        truckTask,
                        truckTaskFeeList
                    } = res.data.data;
                    let formData = this.data.formData;
                    Object.assign(formData, {
                        ...truckTask,
                        ifUnload: truckTask.ifUnload === 'YES' ? true : false,
                    })
                    this.setData({
                        formData,
                        noInputTaskCode: true,
                        mode:'edit'
                    }, () => {
                        lc.emitEvent('orderInfo', {
                            type: 'feeInfo',
                            data: truckTaskFeeList
                        })
                    })
                    tss.get({
                        url: tss.url('') + '/api/data/sql/tms_customer?id=' + truckTask.customerId,
                        completion: res => {
                            if (res.failed) {
                                wx.showModal({
                                    title: '提示',
                                    content: res.errMsg,
                                    showCancel: false,
                                })
                                return
                            }
                            lc.emitEvent('orderInfo', {
                                type: 'customerInfo',
                                data: res.data[0]
                            })
                        }
                    })
                }
            })
        }
        this.getDriver();
    },
    confirmPlanTime(value) {
        console.log(value)
        this.setData({
            'formData.planArriveTime': dayjs(value.detail).format('YYYY-MM-DD HH:mm:ss'),
            show: false
        })
    },
    confirmRealTime(value) {
        console.log(value)
        this.setData({
            'formData.realArriveTime': dayjs(value.detail).format('YYYY-MM-DD HH:mm:ss'),
            showReal: false
        })
    },
    closePlanPopup() {
        this.setData({
            show: false
        })
    },
    closeRealPopup() {
        this.setData({
            showReal: false
        })
    },
    submitForm(form) {
        console.log(form)
        let data = form.detail.value;
        if (this.data.formData.customerId) {
            wx.showModal({
                title: '提示',
                content: this.data.mode === 'create' ? '确定新建运输单吗？' : '确定保存修改吗？',
                complete: (res) => {
                    if (res.confirm) {
                        data.ifUnload = data.ifUnload === true ? 'YES' : 'NO'
                        data.taskType = 'CDT'
                        Object.assign(data, {
                            feeReqList: this.data.formData.feeReqList
                        })
                        tss.post({
                            url: tss.url('') + (this.data.mode === 'create' ? '/tms/deliveryTask/create' : '/tms/deliveryTask/update'),
                            params: data,
                            type: 'repair_operate',
                            completion: res => {
                                console.log(res)
                                if (res.failed) {
                                    wx.showModal({
                                        title: '提示',
                                        content: res.data,
                                        showCancel: false
                                    })
                                    return
                                }
                                wx.showModal({
                                    title: '提示',
                                    content: res.data.msg,
                                    showCancel: false,
                                    complete: () => {
                                        wx.navigateBack();
                                    }
                                })
                            }
                        })
                    }
                }
            })
        } else {
            wx.showToast({
                title: '请选择客户',
                icon: 'none'
            })
        }
    },
    bindKeyInput(e) {
        let {
            value
        } = e.detail
        this.setData({
            filterDriverList: this.data.driverList.filter(item => item.userName.includes(value))
        })
    },
    goChooseCustomer(e) {
        wx.navigateTo({
            url: Pages.truck_task_customer
        })
    },
    selectedDriver(e) {
        this.setData({
            'formData.driver': e.currentTarget.dataset.item.driver,
            showPageContainer: false,
            'formData.phone': e.currentTarget.dataset.item.phone,
            'formData.plateNum': e.currentTarget.dataset.item.plate_num,
            'formData.truckType': e.currentTarget.dataset.item.truck_type
        })
    },
    getDriver() {
        tss.get({
            url: tss.url('ENTITY') + `/Truck`,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.data,
                        showCancel: false,
                    })
                    return
                }
                this.setData({
                    driverList: res.data,
                    filterDriverList: res.data
                })
            }
        })
    },
    selectPlanArriveTime() {
        this.setData({
            show: true
        })
    },
    selectRealArriveTime() {
        this.setData({
            showReal: true
        })
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
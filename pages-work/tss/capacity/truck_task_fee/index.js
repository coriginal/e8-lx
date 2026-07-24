// pages-work/tss/capacity/truck_task_fee/index.js
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')
const {
    formatDate
} = require('../../../../utils/util.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        formData: {

        },
        feeFieldList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        tss.getJSON({
            url: tss.url('') + '/tms/fin/fee_role',
            params: {
                origin: 'task',
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.navigateBack()
                    return
                }
                this.setData({
                    feeFieldList: res.data.filter(item=>item.type==='income')
                })
            }
        })
        if (options.data) {
            console.log(JSON.parse(options.data))
            this.setData({
                formData: JSON.parse(options.data)
            })
        }
    },
    inputChange(e) {
        let {
            formData
        } = this.data
        let {
            item,
            type
        } = e.currentTarget.dataset;
        Object.assign(formData, {
            [`${item.subject_id}`]: {
                feeAmount: formData[item.subject_id] ? formData[item.subject_id].feeAmount : item.feeAmount,
                remark: formData[item.subject_id] ? formData[item.subject_id].remark : item.remark,
                feeId: item.subject_id,
                feeType: item.type,
                id: item.id,
                ...(type == 'fee' ? {
                    feeAmount: e.detail.value
                } : {
                    remark: e.detail.value
                })
            }
        })
        this.setData({
            formData
        })
        console.log(this.data.formData);
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    submitFee() {
        let feeReqList = []
        for (let key in this.data.formData) {
            feeReqList.push(this.data.formData[key])
        }
        lc.emitEvent('orderInfo', {
            type: 'feeInfo',
            data: feeReqList
        })
        wx.navigateBack()
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
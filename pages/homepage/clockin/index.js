import {
    formatDate
} from "../../../utils/util"
const _App = getApp().globalData;
const QQMapWX = require('../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
var qqmapsdk = new QQMapWX({
    key: Map_Key
});
const tss = require('../../../utils/tss.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentTime: '',
        currentLocation: '',
        lngLat: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(_App.user.cnName)
        clearInterval()
        setInterval(() => {
            this.setData({
                currentTime: formatDate(new Date(), 'hh:mm:ss')
            })
        }, 500)
        this.getLocation();
    },
    getLocation() {
        wx.showLoading()
        let _this = this
        wx.getLocation({
            type:'gcj02',
            success: res => {
                wx.hideLoading()
                let lng_lat = `${res.longitude},${res.latitude}`;
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: res => {
                        let address = res.result.address
                        _this.setData({
                            currentLocation: address,
                            lngLat: lng_lat
                        })
                    },
                    fail: error => {
                        wx.showModal({
                            title: '提示',
                            content: '获取定位失败！',
                            showCancel: false,
                            complete: () => {
                                wx.navigateBack()
                            }
                        })
                    },
                    complete: res => {}
                })
            },
            fail() {
                wx.showModal({
                    title: '提示',
                    content: '获取定位失败！',
                    showCancel: false,
                    complete: () => {
                        wx.navigateBack()
                    }
                })
            }
        })
    },
    clockIn() {
        wx.showModal({
            title: '提示',
            content: '确定打卡吗?',
            complete: (res) => {
                if (res.confirm) {
                    tss.post({
                        url: tss.url('') + '/tms/api/clock/create',
                        type: "repair_operate",
                        params: {
                            lngLat: this.data.lngLat,
                            addr: this.data.currentLocation
                        },
                        completion: res => {
                            console.log(res)
                            if (res.failed) {
                                wx.showModal({
                                    title: '提示',
                                    content: res.errorMsg,
                                    showCancel: false,
                                })
                                return
                            }

                            if (res.data.data.status == '1') {
                                wx.showModal({
                                    title: '提示',
                                    content: '打卡成功！',
                                    showCancel: false,
                                })
                                wx.navigateBack()
                            } else {
                                wx.showModal({
                                    title: '提示',
                                    content: res.data.data.disableReason,
                                    showCancel: false,
                                })
                            }
                        }
                    })
                }
            }
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
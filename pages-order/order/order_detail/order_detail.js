const ComputMargin = length => 64 / 3 * length
const _App = getApp().globalData
const tss = require('../../../utils/tss.js');
const QQMapWX = require('../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
import {
    $wuxToptips
} from '../../../components/index'
var qqmapsdk = new QQMapWX({
    key: Map_Key
});
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [{
                title: '订单详情',
                code: 'detail'
            },
            // { title: '轨迹信息', code: 'route' },
            // { title: '费用详情', code: 'feeinfo' }
        ],
        current: 0,
        chooseType: 'detail',
        order: {},
        send: "",
        receive: ""
    },

    chooseOrderType(e) {
        console.log(e)
        this.setData({
            chooseType: e.currentTarget.id,
            current: e.currentTarget.dataset.index
        })
    },
    swiperChange(e) {
        this.setData({
            chooseType: this.data.tabs[e.detail.current].code
        })
    },

    onLoad: function (options) {
        let {
            id = '', code = '', orderIdx = '',status_code=''
        } = options
        console.log(id, code, orderIdx, options)
        this.setData(options)
        // this.setData({ id, code, orderIdx })
        // if (!_App.user.isCustomer) {
        this.data.tabs.push({
            title: '费用详情',
            code: 'feeinfo'
        })
        // if (!_App.user.isCustomer) {
        //   this.data.tabs.push({ title: '车辆位置', code: 'order_car_location' })
        // }
        this.setData({
            tabs: this.data.tabs
        })
        this.queryOrderDeail(id)
        // }
    },
    onReady() {
        wx.setNavigationBarTitle({
            title: `No.${this.data.code}`,
        })
    },

    getOrders(e) {
        const order = e.detail
        let task = {
            '提1': [],
            '转1': [],
            '转2': [],
            '转3': [],
            '派1': []
        };
        const reg = /^提1$|^转1$|^转2$|^转3$|^派1$/
        console.log(123)
        for (let key in order) {
            reg.test(key) && (task[key] = order[key])
        }
        this.setData({
            task
        })
    },
    goMap(e) {
        let type = e.currentTarget.dataset.type
        this.getLatLng(this.data[type]).then(res => {
            console.log(res)
            wx.openLocation({
                latitude: res.lat,
                longitude: res.lng,
                name: this.data[type],
                scale: 15
            })
        })
    },
    queryOrderDeail(tms_order_id) {
        return new Promise((resolve, reject) => {
            tss.query({
                url: tss.url('sql') + 'tms_order',
                params: {
                    tms_order_id,
                    task_info: true
                },
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        wx.hideLoading()
                        wx.showModal({
                            content: res.errorMsg,
                            showCancel: false
                        })
                        return
                    }
                    let {
                        send_addr,
                        receive_addr,
                        status_code,
                    } = res.data[0]
                    this.setData({
                        send: send_addr,
                        receive: receive_addr,
                        status_code
                    })
                }
            })
        })
    },
    getLatLng(adr) {
        wx.showLoading()
        return new Promise((resolve, reject) => {
            qqmapsdk.geocoder({
                address: adr,
                complete: res => {
                    if (res.status != "0") {
                        wx.showModal({
                            title: '提示',
                            content: res.message,
                            showCancel: false
                        })
                        reject(res.message)
                    }
                    wx.hideLoading()
                    resolve(res.result.location)
                }
            })
        })
    }
})
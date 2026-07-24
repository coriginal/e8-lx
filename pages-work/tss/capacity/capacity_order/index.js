const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
import Pages from '../../../../pages.js'
const QQMapWX = require('../../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
var qqmapsdk = new QQMapWX({
    key: Map_Key
});
Page({
    data: {
        app: getApp().globalData,
        task_id: '',
        task_type: '',
        order: {},
        typeObj: require('./source.js').typeObj,
        flexTagObj: require('./source.js').flexTagObj,
        flexObj: require('./source.js').flexObj,
        show_pick: false,
        show_sign: false, 
        abnormal_list: [],
        receipt_list: [],
        timestamp: '',
        needOnlinePay: app.DomainConfig?.online_pay_dj_station_code?.content || false
    },

    onLoad(options) {
        console.log(app)
        console.log(options)

        // options.task_id = 109
        // options.order_id = 214
        // options.task_type = '提货'
        if (!options.task_id || !options.task_type || !options.order_id) {
            alert.notice('未传递正确的参数（运输单ID或类型为空）')
        } else {
            wx.showLoading({
                title: '加载数据中',
                mask: true
            })
            this.setData({
                task_id: options.task_id,
                task_type: options.task_type,
                order_id: options.order_id
            })
            tms.writeLocation(this.data.task_id)
            tss.query({
                url: tss.url('sql') + 'tms_sub_code',
                params: {
                    sub_order_id: options.order_id,
                    ...((this.data.needOnlinePay && this.data.task_type==='派送') && {addAsnno:true})
                },
                completion: res => {
                    wx.hideLoading()
                    if (res.failed) {
                        alert.notice('获取订单明细数据失败。' + (res.errorMsg || ''))
                        return
                    } else {
                        if (res.data.length) {
                            let item = res.data[0]
                            item['send_addr'] = tms.joinAddr(item, 'send')
                            item['receive_addr'] = tms.joinAddr(item, 'receive')
                            this.setData({
                                order: item
                            })
                            this.queryAbnormal()
                        } else {
                            alert.notice('您对此单无权限或此单已被删除')
                        }
                    }
                }
            })
        }
    },

    onChange(e) {
        const {
            param
        } = e.detail
    },
    queryAbnormal(e) {
        tss.query({
            url: tss.url('ENTITY') + 'OrderFollow',
            params: {
                showAttach: true,
                task_id: this.data.task_id,
                sub_order_id: this.data.order_id
            },
            completion: res => {
                if (res && res.data && res.data.length) {
                    this.setData({
                        abnormal_list: res.data
                    })
                }
            }
        })
    },
    goDetail(e) {
        console.log(e)
        const dataset = e.currentTarget.dataset;
        const task_type = dataset.type;
        const taskid = dataset.id;
        console.log(this.data.typeObj[task_type].url)
    },
    call(e) {
        const phone = e.currentTarget.dataset.phone;
        if (phone) {
            wx.makePhoneCall({
                phoneNumber: phone
            })
        }
    },
    print(e) {
        wx.navigateTo({
            url: `${Pages.order_print}?ids=${this.data.order.order_id}`
        })
    },
    viewOrder(e) {
        console.log('view')
        wx.navigateTo({
            url: `${Pages.order_detail}?id=${this.data.order.order_id}&code=${this.data.order.code}`
        })
    },
    pickorder(e) {
        this.setData({
            show_pick: true
        })
    },
    confirm_pick(e) {
        const value = e.detail.value;
        tms.saveWithAddr({
            url: tss.url('tms') + '/task/pick_order',
            params: Object.assign({
                sub_order_id: this.data.order.id,
                tempid: this.data.timestamp,
                task_id: this.data.task_id
            }, value),
            completion: res => {
                if (res.failed || res.data) {
                    alert.notice('取件失败。' + (res.errorMsg || res.data.errorMsg || ''))
                } else {
                    wx.showToast({
                        title: '取件成功'
                    })
                    this.setData({
                        show_pick: false
                    })
                    // lc.emitEvent('op', {})
                    wx.navigateBack()
                }
            }
        })
    },
    signorder(e) {
        //TODO 获取之前上传的回单及其他附件
        this.setData({
            show_sign: true
        })
        console.log('signorder')
    },
    confirmSign(e) {
        wx.showLoading({
          title:'请稍候',
          mask:true
        })
        tms.saveWithAddr({
            url: tss.url('tms') + '/order/receipt/submit',
            params: {
                tempid: this.data.receipt_tempid,
                order_id: this.data.order.order_id,
                type: '电子回单',
                amount: 1
            },
            completion: res => {
                console.log(res)
            }
        })
        tms.saveWithAddr({
            url: tss.url('tms') + '/task/driver_sign',
            params: {
                type: 'order',
                task_id: this.data.task_id,
                target_id: this.data.order.id
            },
            completion: res => {
                wx.hideLoading()
                if (res.failed || res.data) {
                    alert.notice('签收失败。' + (res.errorMsg || res.data.errorMsg || ''))
                } else {
                    wx.showToast({
                        title: '签收成功'
                    })
                    this.setData({
                        show_sign: false
                    })
                    lc.emitEvent('op', {})
                    wx.navigateBack()
                }
            }
        })
    },
    reportAbnormal(e) {
        if (e.detail.out_task || e.detail.cancel_order) {
            lc.emitEvent('op', {})
            wx.navigateBack()
        } else {
            this.queryAbnormal()
        }
    },
    goMap(e) {
        const type = e.currentTarget.dataset.type;
        const order = this.data.order;
        this.getLatLng(order[type+'_addr']).then(res=>{
            wx.openLocation({
                latitude: res.lat,
                longitude: res.lng,
                name: order[type+'_addr'],
                scale: 15
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
    },
    addreceipt(e) {
        this.setData({
            receipt_tempid: e.detail._tempID
        })
    },
    addsign(e) {
        tms.saveWithAddr({
            url: tss.url('tms') + '/task/suborder_signpic',
            params: {
                tempid: e.detail._tempID,
                sub_order_id: this.data.order.id
            },
            completion: res => {
                console.log(res)
            }
        })
    },
    addProof(e) {
        console.log(e)
        this.setData({
            timestamp: e.detail._tempID
        })
    },
    previewAttach: function (e) {
        console.log(e)
        const ds = e.target.dataset;
        const attach_list = ds.urls;
        let urls = [];
        for (let i = 0; i < attach_list.length; i++) {
            urls.push(app.app_host + attach_list[i].downloadUrl)
        }
        wx.previewImage({
            current: ds.index,
            urls: urls
        })
    }
})
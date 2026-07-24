const _App = getApp().globalData
const lc = require('../../../../utils/listenerCenter.js')
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
import Pages from '../../../../pages.js'
Component({
    externalClasses: ['udf_btn_class'],
    options: {
        styleIsolation: 'apply-shared',
    },
    properties: {
        task_id: {
            type: Number,
            value: ''
        },
        sub_order_id: {
            type: Number,
            value: ''
        },
        location_id: {
            type: Number,
            value: ''
        },
        type: {
            type: String,
            value: ''
        },
        volume: {
            type: Number,
            value: ''
        },
        weight: {
            type: Number,
            value: ''
        },
        amount: {
            type: Number,
            value: ''
        },
        num: {
            type: Number,
            value: ''
        },
        sub_order_ids: {
            type: String,
            value: ''
        },
        rcode_type: {
            type: String,
            value: ''
        },
        timestamp: {
            type: Number,
            value: ''
        },
        order_ids: {
            type: String,
            value: ''
        },
        order_id: {
            type: Number,
            value: ''
        },
        receipt_tempid: {
            type: String,
            value: ''
        }
    },

    data: {
        show_pick: false,
        show_sign: false,
        attachURLs: [],
        packList: ['纸箱', '木箱', '编织袋', '托盘', '木架', '纸/木', '桶', '裸装', '膜', '泡沫箱', '长纸筒', '塑料箱', '纸托', '圆纸筒', '纸袋', '铁架', '膜包纸箱', '布袋', '圆盘'],
        packIndex: 0
    },

    lifetimes: {
        // 获取从各个页面返回的订单信息
        attached: function () {
            lc.addListener('orderInfo', this.__wxWebviewId__.toString(), res => {

            })
        },
        ready() {
            //如果是客户则进行查询 如果非客户则开启客户选择列表
            //console.log('ready')
            if (this.data.order_ids) {
                tss.get({
                    url: tss.url('') + `/api/data/sql/tms_order?noCache=true&tms_order_id=${this.data.order_ids}`,
                    completion: res => {
                        let index = this.data.packList.indexOf(res.data[0].pack)
                        index = index != -1 ? index : 0
                        this.setData({
                            packIndex: index
                        })
                    }
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: '订单信息获取失败！',
                    showCancel: false
                })
            }
        },
        detached: function () {
            //console.log('detached')
            // 在组件实例被从页面节点树移除时执行
        },
    },
    methods: {
        packChange(e) {
            console.log(this.data.order_ids)
            this.setData({
                packIndex: e.detail.value
            })
        },
        addProof(e) {
            console.log(e, e.detail._tempID)
            this.setData({
                timestamp: e.detail._tempID
            })
        },
        showPickSign(e) {
            let ds = e.target.dataset;
            const dlg = ds.type == 'start' ? 'show_pick' : 'show_sign';
            this.setData({
                [dlg]: true
            })
            if (ds.type == 'start') {
                tms.startWxLoc(this.data.task_id)
            } else {
                tms.endWxloc()
            }
        },
        changeOrder() {
            wx.navigateTo({
                url: `${Pages.order}?orderId=${this.data.order_ids}`
            })
        },
        savePackChange() {
            return new Promise((resolve, reject) => {
                let data = {
                    id: this.data.order_ids,
                    pack: this.data.packList[this.data.packIndex]
                }
                tss.post({
                    url: tss.url('') + '/tms/order',
                    params: data,
                    completion: res => {
                        console.log(res)
                        if (res.failed) {
                            resolve(false)
                        }
                        resolve(true)
                    }
                })
            })
        },
        async confirm_pick(e) {
            wx.showLoading({
                mask: true
            })
            await this.savePackChange()
            const value = e.detail.value;
            let url = this.data.sub_order_id ? 'pick_order' : 'pick_loc_order';
            tms.saveWithAddr({
                url: tss.url('tms') + '/task/' + url,
                params: Object.assign({
                    location_id: this.data.location_id,
                    sub_order_id: this.data.sub_order_id,
                    tempid: this.data.timestamp,
                    task_id: this.data.task_id
                }, value),
                completion: res => {
                    wx.hideLoading()
                    if (res.failed || res.data) {
                        alert.notice('取件失败。' + (res.errorMsg || res.data.errorMsg || ''))
                    } else {
                        wx.showToast({
                            title: '取件成功'
                        })
                        this.setData({
                            attachURLs: [],
                            show_pick: false
                        })
                        this.triggerEvent('pick', res.data)
                    }
                }
            })
        },
        confirmSign(e) {
            let tempids = (this.data.receipt_tempid + '').split(',');
            let orderids = ((this.data.order_ids || this.data.order_id) + '').split(',')
            let saveParams = [];
            for (let i = 0; i < tempids.length; i++) {
                saveParams.push({
                    tempid: tempids[i],
                    order_id: orderids[i],
                    type: '电子回单',
                    amount: 1
                })
            }
            tms.saveWithAddr({
                url: tss.url('tms') + '/order/receipts/submit',
                params: {
                    list: JSON.stringify(saveParams)
                },
                completion: res => {
                    if (res.failed) {
                        alert.notice('操作失败。' + (res.errorMsg || ''))
                    }
                }
            })

            let url = this.data.sub_order_id ? 'driver_sign' : 'driver_loc_sign';
            tms.saveWithAddr({
                url: tss.url('tms') + '/task/' + url,
                params: {
                    task_id: this.data.task_id,
                    location_id: this.data.location_id,
                    target_id: this.data.sub_order_id
                },
                completion: res => {
                    console.log(res)
                    if (res.failed || res.data) {
                        alert.notice('签收失败。' + (res.errorMsg || res.data.errorMsg || ''))
                    } else {
                        wx.showToast({
                            title: '签收成功',
                        })
                        this.setData({
                            attachURLs: [],
                            receipt_list: [],
                            show_sign: false
                        })
                        this.triggerEvent('sign', res.data)
                    }
                }
            })
        },
        addreceipt(e) {
            console.log(e)
            this.setData({
                receipt_tempid: e.detail._tempID
            })
            // tms.saveWithAddr({
            //   url: tss.url('tms') + '/order/receipt/submit',
            //   params: { tempID: e.detail._tempID, 
            //     sub_order_id: this.data.sub_order_ids || this.data.sub_order_id, 
            //     order_id:this.data.order_ids || this.data.order_id,
            //     task_id: this.data.task_id,
            //     type: '电子回单',
            //     op_time: new Date(),amount:1 },
            //   completion: res => {
            //     if(res.failed){
            //       alert.notice('操作失败。' + (res.errorMsg || ''))
            //     }
            //   }
            // })
        },
        addlog(e) {
            console.log(e)
            const _this = this;
            tms.getLoc(function (loc) {
                tss.save({
                    url: tss.url('ENTITY') + 'TaskOperateLog',
                    params: {
                        type: 'sign_pic',
                        target_type: "loc",
                        task_id: _this.data.task_id,
                        addr: loc.addr,
                        tempid: e.detail._tempID,
                        target_id: _this.data.location_id,
                        lng_lat: loc.lng_lat
                    },
                    completion: res => {
                        console.log(res)
                    }
                })
            })
        },
        addsign(e) {
            console.log(this.data)
            tms.saveWithAddr({
                url: tss.url('tms') + '/task/suborder_signpic',
                params: {
                    tempid: e.detail._tempID,
                    sub_order_id: this.data.sub_order_ids || this.data.sub_order_id
                },
                completion: res => {
                    if (res.failed) {
                        alert.notice('操作失败。' + (res.errorMsg || ''))
                    }
                }
            })
        },
        forbidBubble(e) {
            console.log(e)
        }
    },

})
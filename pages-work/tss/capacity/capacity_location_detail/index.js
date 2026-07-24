const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
import Pages from '../../../../pages.js'

Page({
    data: {
        task_id: '',
        task_type: '',
        location_key: '',
        location_type: '',
        location_id: '',
        showData: [],
        allOrder: [],
        typeObj: require('./source.js').typeObj,
        flexTagObj: require('./source.js').flexTagObj,
        select_ids: [],
        show_done: false,
        if_list: true,
        markers: [],
        lng: '',
        lat: '',
        showCheck: false,
        if_op: false,
        show_pick: false,
        show_sign: false,
    },
    onLoad(options) {
        console.log(options)
        if (!options.task_id || !options.location_key) {
            alert.notice('未传递正确的参数（运输单ID或类型为空）')
        } else {
            let type = 'start';
            if (options.location_key.startsWith('end')) {
                type = 'end';
            }
            this.setData({
                task_id: options.task_id,
                location_key: options.location_key,
                location_type: type,
                location_id: options.location_key.replace(type, ''),
                task_type: options.task_type
            })
            console.log(this.data)
            this.queryOrder()
        }
        if (options.task_status == '已到达') {
            this.setData({
                show_done: true
            })
        }
        if (app.user.roles.indexOf('运营') >= 0) {
            this.setData({
                if_op: true
            })
        }
    },
    // onReady(){
    //   lc.addListener('op', this.__wxWebviewId__.toString(), res => {
    //     this.queryOrder()
    //   })
    // },
    goOrderDetail(e) {
        const {
            id,
            code
        } = e.currentTarget.dataset
        id && wx.navigateTo({
            url: `${Pages.order_detail}?id=${id}&code=${code}`,
        })
    },
    onShow() {
        console.log('onshow')
        this.queryOrder()
    },
    queryOrder(p) {
        tms.writeLocation(this.data.task_id)
        tss.query({
            url: tss.url('/tms/task/') + `${this.data.task_id}/location/key/${this.data.location_key}`,
            completion: res => {
                wx.hideLoading()
                if (res.failed) {
                    alert.notice('获取包含订单失败。' + (res.errorMsg || ''))
                    return
                } else {
                    let allOrder = [];
                    for (let i = 0; i < res.data.length; i++) {
                        let item = res.data[i];
                        let transTaskOrder = item[0];
                        let subOrder = item[1];
                        let order = item[2];

                        order.task_order_id = transTaskOrder.id;
                        order.tag = transTaskOrder.tag;
                        order.location_id = this.data.location_id;
                        order.if_done = transTaskOrder[this.data.location_type + '_operate_time'] != null;

                        order = {
                            ...order,
                            ...subOrder,
                            show_code: subOrder.code
                        };

                        allOrder.push(order)
                    }
                    this.data.allOrder = allOrder;
                    console.log(allOrder)
                    this.getShowOrder(p)
                }
            }
        })
    },
    getShowOrder(p) {
        let show_order = [],
            markers = [];
        let c = 0;
        console.log(this.data)
        for (let i = 0; i < this.data.allOrder.length; i++) {
            let item = this.data.allOrder[i];
            if (this.data.show_done || !item.if_done) {
                show_order.push(item)
                if (item.lng_lat) {
                    markers.push({
                        iconPath: "../../../../images/addr.png",
                        callout: {
                            content: item.loc_name,
                            bgColor: '#6dab79',
                            textAlign: 'center',
                            display: 'ALWAYS'
                        },
                        id: item.target_id,
                        latitude: item.lng_lat.split(',')[1],
                        longitude: item.lng_lat.split(',')[0],
                        width: 30,
                        height: 30,
                        loc: item.receive_addr,
                        lng_lat: item.lng_lat
                    })
                }
            }
            if (!item.if_done) {
                c++
            }
        }
        const _this = this;
        tms.getLoc(function (loc) {
            _this.setData({
                lng: markers.length ? markers[0].longitude : (loc.lng || 120),
                lat: markers.length ? markers[0].latitude : (loc.lat || 30)
            })
        })
        let sd = show_order.map(i => this.dealData(i));
        if (p && !sd.length) {
            lc.emitEvent('query_cl', {})
            wx.navigateBack({})
        } else {
            this.setData({
                showData: sd,
                markers: markers
            })
            let isDone = this.data.allOrder.filter(i => i.if_done).length
            wx.setNavigationBarTitle({
                title: `完成情况：${isDone} / ${this.data.allOrder.length}`
            })
        }
    },
    dealData(data) {
        var typeObj = this.data.typeObj,
            type = this.data.location_type
        console.log(typeObj, this.data.type)
        return {
            ...data,
            title: `${data[typeObj[type].title] || ((data.send_site || data.send_city || data.send_district) + ' — ' + (data.receive_site || data.receive_city || data.receive_district))}`,
            cargoInfo: `${data.num ? data.num + '票' : ''} ${data.amount || 0}件 / ${data.weight || 0}千克 / ${data.volume || 0}方`
        }
    },
    changeShow(e) {
        this.setData({
            show_done: !this.data.show_done
        })
        this.getShowOrder()
    },
    changeModal(e) {
        this.setData({
            if_list: !this.data.if_list
        })
    },

    dispDone(e) {
        alert.notice('全部订单已派送完成，是否结束此次运输？', {
            text: '结束',
            handler: () => {
                tms.saveWithAddr({
                    url: tss.url('ENTITY') + 'TransTask',
                    params: {
                        status: '已到达',
                        id: this.data.task_id
                    },
                    completion: res => {
                        if (res.failed) {
                            alert.notice('结束运输单失败。' + (res.errorMsg || ''))
                        } else {
                            lc.emitEvent('alltask', {})
                            wx.navigateBack({})
                        }
                    }
                })
            }
        }, {
            text: '取消',
            handler: () => {}
        })

    },

    switchChange: function (e) {
        let select_ids = this.data.select_ids;
        const id = e.target.dataset.id;
        let is_in = true;
        for (var i = 0; i < select_ids.length; i++) {
            if (select_ids[i] == id) {
                select_ids.splice(i, 1)
                is_in = false;
                break;
            }
        }
        if (is_in) {
            select_ids.push(id)
        }
        var showData = this.data.showData;
        for (var i = 0; i < showData.length; i++) {
            var item = showData[i];
            if (select_ids.indexOf(item.id) > -1) {
                item['selected'] = 'selected'
            } else {
                item['selected'] = ''
            }
        }
        this.data.allOrder = this.data.allOrder.map(i => ({
            ...i,
            selected: select_ids.indexOf(i.id) > -1 ? 'selected' : ''
        }))
        this.setData({
            showData: showData
        })
    },
    goDetail(e) {
        const order_id = e.currentTarget.dataset.order_id || e.markerId;
        //   wx.navigateTo({
        //     url: `../capacity_order/index?order_id=${order_id}&task_id=${this.data.task_id}&task_type=${this.data.task_type}`
        //   })
        // wx.navigateTo({
        //   url: `${Pages.order_detail}?id=${order_id}&code=${this.data.order.code}`
        // })
    },
    batchTodo(e) {
        console.log(e)
        const check = e.currentTarget.dataset.check
        this.setData({
            showCheck: !check
        })
    },
    batchDone: function () {
        this.setData({
            showCheck: false
        })
    },
    batchPrint(e) {
        const ids = this.batchOpId();
        if (ids) {
            tms.print(ids)
        }
    },
    batchPick(e) {
        const ids = this.batchOpId();
        if (ids) {
            alert.notice('确认将选中的' + this.data.select_ids.length + '单批量取件？', {
                text: '确认',
                handler: () => {
                    tms.saveWithAddr({
                        url: tss.url('tms') + '/task/batch_pick_order',
                        params: {
                            task_id: this.data.task_id,
                            sub_order_ids: ids
                        },
                        completion: res => {
                            this.setData({
                                select_ids: []
                            })
                            if (res.failed || res.data) {
                                alert.notice('批量取件失败。' + (res.errorMsg || res.data.errorMsg || ''))
                            } else {
                                this.queryOrder()
                                wx.showToast({
                                    title: '批量取件成功'
                                })
                                this.batchDone()
                            }
                        }
                    })
                }
            }, {
                text: '取消',
                handler: () => {}
            })
        }
    },
    batchSign(e) {
        const ids = this.batchOpId();
        if (ids) {
            alert.notice('确认选中的' + this.data.select_ids.length + '单已签收？', {
                text: '确认',
                handler: () => {
                    tms.saveWithAddr({
                        url: tss.url('tms') + '/task/driver_batch_sign',
                        params: {
                            task_id: this.data.task_id,
                            target_ids: ids
                        },
                        completion: res => {
                            if (res.failed || res.data) {
                                alert.notice('批量签收失败。' + (res.errorMsg || res.data.errorMsg || ''))
                            } else {
                                this.queryOrder()
                                wx.showToast({
                                    title: '批量签收成功'
                                })
                                this.batchDone()
                            }
                        }
                    })
                }
            }, {
                text: '取消',
                handler: () => {}
            })

        }
    },
    batchOpId(e) {
        const select_ids = this.data.select_ids;
        if (select_ids.length) {
            return select_ids.join(',')
        } else {
            alert.notice('未选择数据')
        }
    },
    addOrder(e) {
        console.log('TODO 携带taskid=' + this.data.task_id + '到订单录入界面')
    },
    batchRemove(e) {
        const _this = this;
        tss.query({
            url: tss.url('sql') + 'task',
            params: {
                task_id: _this.data.taskid
            },
            completion: res => {
                if (res.failed) {
                    wx.hideLoading()
                    alert.notice('获取运输单详情失败。' + (res.errorMsg || ''))
                    return
                } else {
                    let params = res.data[0];
                    tss.query({
                        url: tss.url('') + `/tms/task/${_this.data.task_id}/subOrder2`,
                        // url: tss.url('sql') + 'tms_sub_code',
                        // params: { task_id: _this.data.task_id },
                        completion: res => {
                            console.log(res, _this.data)
                            wx.hideLoading()
                            if (res.failed) {
                                alert.notice('获取运输单详情失败。' + (res.errorMsg || ''))
                                return
                            } else {
                                let sub_orders = [];
                                for (let i = 0; i < res.data.length; i++) {
                                    const the_id = res.data[i].id;
                                    if (_this.data.select_ids.indexOf(the_id) == -1) {
                                        sub_orders.push({
                                            id: the_id + ""
                                        });
                                    }
                                }
                                params.sub_orders = JSON.stringify(sub_orders);
                                tss.post({
                                    url: tss.url('') + '/tms/task',
                                    params,
                                    completion: res => {
                                        console.log(res)
                                        if (res.failed) {
                                            wx.showModal({
                                                content: res.errorMsg
                                            })
                                            return
                                        }
                                        wx.showToast({
                                            title: '移除成功',
                                            icon: 'none',
                                            duration: 3000
                                        })
                                        lc.emitEvent('alltask', {
                                            msg: 'success'
                                        })
                                        setTimeout(() => {
                                            this.queryOrder();
                                            this.batchDone()
                                        }, 1000)
                                        // setTimeout(() => { wx.navigateBack() }, 1000)
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    },
    onPullDownRefresh: function () {
        this.queryOrder();
        wx.stopPullDownRefresh();
    },
    pickSignDone: function (e) {
        console.log(e)
        this.queryOrder(true)
        // this.getShowOrder()si
    }

})
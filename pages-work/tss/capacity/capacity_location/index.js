const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
import Pages from '../../../../pages.js'
const util = require('../../../../utils/util.js')
//获取位置
const QQMapWX = require('../../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';

var qqmapsdk = new QQMapWX({
    key: Map_Key
});

Page({
    data: {
        task_id: '',
        order_id: "",
        task_type: '',
        task_status: '',
        showData: [],
        allData: [],
        flexObj: require('./source.js').flexObj,
        typeObj: require('./source.js').typeObj,
        flexTagObj: require('./source.js').flexTagObj,
        select_ids: [],
        show_done: false,
        location_id: '',
        type: '',
        rcode_type: '',
        if_list: true,
        markers: [],
        lng: '',
        lat: '',
        timestamp: '',
        show_depart_arrive: false,
        attachUrls: [],
        showPerModal: false,
        domain: ""
    },
    onLoad(options) {
        console.log(app)
        console.log(options)
        // options.task_id = 95
        // options.task_type = '中转'
        if (!options.task_id || !options.task_type) {
            alert.notice('未传递正确的参数（运输单ID或类型为空）')
        } else {
            this.setData({
                task_id: options.task_id,
                task_type: options.task_type,
                task_status: options.task_status,
                domain: app.user.domain
            })
            this.queryOrder()
        }
        if (options.task_status == '已到达') {
            this.setData({
                show_done: true
            })
            this.endWxloc();
        }
    },
    onReady() {
        lc.addListener('query_cl', this.__wxWebviewId__.toString(), res => {
            this.queryOrder()
        })
        let _this = this;
        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userLocationBackground']) {
                    wx.startLocationUpdateBackground({
                        success(res) {
                            console.log('开启后台定位', res)
                        },
                        fail(res) {
                            console.log('开启后台定位失败', res)
                            // _this.setData({ showPerModal: true})
                        }
                    })
                } else {
                    _this.setData({
                        showPerModal: true
                    })
                }
            },
            fail(res) {
                _this.setData({
                    showPerModal: true
                })
            }
        })
    },
    queryOrder() {
        wx.showLoading({
            title: '加载中'
        })
        tms.writeLocation(this.data.task_id)
        tss.query({
            url: tss.url('/tms/task/') + this.data.task_id + '/location',
            params: {},
            completion: res => {
                console.log(tss.url('/tms/task/') + this.data.task_id + '/location')
                wx.hideLoading()
                if (res.failed) {
                    alert.notice('获取包含订单失败。' + (res.errorMsg || ''))
                    return
                } else {
                    for (let i = 0; i < res.data.length; i++) {
                        let item = res.data[i];
                        item['receive_addr'] = tms.joinAddr(item, 'receive');
                        if (item.tag) {
                            item.tag = item.tag.replace(/^(\s|,)+|(\s|,)+$/g, '')
                        }
                        item.orderIds = [];
                        if (item.subOrders.length) {
                            for (let j = 0; j < item.subOrders.length; j++) {
                                let order_id = item.subOrders[j][1].order_id;
                                if (item.orderIds.indexOf(order_id) == -1) {
                                    item.orderIds.push(order_id)
                                }
                            }
                            item.order_ids = item.orderIds.join(',');
                        }
                    }
                    console.log(res.data);
                    this.data.allData = res.data;
                    this.getShowOrder()
                }
            }
        })
    },
    getShowOrder() {
        let show_order = [],
            markers = [];
        let c = 0;
        for (let i = 0; i < this.data.allData.length; i++) {
            let item = this.data.allData[i];
            if (this.data.show_done || !item.if_done) {
                show_order.push(item)
                if (item.lng_lat) {
                    markers.push({
                        iconPath: "../../../../images/addr.png",
                        callout: {
                            content: item.name,
                            bgColor: '#6dab79',
                            textAlign: 'center',
                            display: 'ALWAYS'
                        },
                        id: item.id,
                        latitude: item.lng_lat.split(',')[1],
                        longitude: item.lng_lat.split(',')[0],
                        width: 30,
                        height: 30,
                        loc: item.addr,
                        lng_lat: item.lng_lat
                    })
                }
            }
            if (!item.if_done) {
                c++
            }
        }
        if (c == 0 && (this.data.task_status == "已到达" || this.data.task_status == '已出发' || this.data.task_status == '已接单')) {
            console.log(this.data.task_status)
            this.truckArrive({
                content: '全部订单已操作完成，是否'
            })
        }
        console.log(markers)
        const _this = this;
        tms.getLoc(function (loc) {
            _this.setData({
                lng: markers.length ? markers[0].longitude : (loc.lng || 120),
                lat: markers.length ? markers[0].latitude : (loc.lat || 30)
            })
        })
        this.setData({
            showData: show_order.map(i => this.dealData(i)),
            markers: markers
        })
        let isDone = this.data.allData.filter(i => i.if_done).length
        wx.setNavigationBarTitle({
            title: `完成情况：${isDone} / ${this.data.allData.length}`
            // title: `未完成：${this.data.allData.length - isDone} 完成：${isDone}`,
        })
    },
    dealData(data) {
        console.log(data)
        let need_rcode = '';
        if (data.subOrders.length) {
            for (let i = 0; i < data.subOrders.length; i++) {
                console.log(data.subOrders[i])
                need_rcode = need_rcode || data.subOrders[i][2].rcode_type
            }
        }
        console.log('re')
        return {
            ...data,
            need_rcode: need_rcode,
            cargoInfo: `${data.num ? data.num + '票' : ''} ${data.amount || 0}件 / ${data.weight || 0}千克 / ${data.volume || 0}方`
        }
    },
    changeShow(e) {
        this.setData({
            show_done: !this.data.show_done
        })
        console.log('qweqwe')
        this.getShowOrder()
    },

    switchChange: function (e) {
        console.log(e)
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
            if (select_ids.indexOf(item.sub_id) > -1) {
                item['selected'] = 'selected'
            } else {
                item['selected'] = ''
            }
        }
        this.data.allData = this.data.allData.map(i => ({
            ...i,
            selected: select_ids.indexOf(i.sub_id) > -1 ? 'selected' : ''
        }))

        console.log(showData)
        this.setData({
            showData: showData
        })
    },
    batchPrint(e) {
        const ids = this.batchOpId();
        console.log(ids)
        if (ids) {
            tms.print(ids)
            // tss.query({
            //   url: tss.url('sql') + 'subid2id',
            //   params:{ids:ids},
            //   completion:res=>{
            //     if(res && res.data && res.data.length){
            //       wx.navigateTo({
            //         url: `${Pages.order_print}?ids=${res.data[0].ids}`
            //       })
            //     }else{
            //       alert.notice('未找到打印订单信息'+(res.errorMsg || res.data.errorMsg || ''))
            //     }
            //   }
            // })    
        }
    },
    truckArrive(e) {
        const content = e.content ? e.content : '';
        alert.notice(content + this.data.typeObj[this.data.task_type].confirm_title, {
            text: '确认',
            handler: () => {
                tms.saveWithAddr({
                    url: tss.url('tms') + '/task/truck_complete',
                    params: {
                        task_id: this.data.task_id
                    },
                    completion: res => {
                        if (res.failed || res.data) {
                            console.log(res)
                            alert.notice('操作失败。' + (res.errorMsg || res.data.errorMsg || ''))
                        } else {
                            wx.showToast({
                                title: '操作成功'
                            })
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
        tms.endWxloc();
    },
    showDepartArrive(e) {
        const ds = e.target.dataset;
        this.setData({
            show_depart_arrive: true,
            type: ds.type,
            location_id: ds.location_id,
            amount: ds.amount
        })
        console.log(ds.type)
        if (ds.type == 'start') {
            tms.startWxLoc(this.data.task_id)
        } else {
            tms.endWxloc()
        }
    },
    locDepartArrive(e) {
        const ds = e.target.dataset;
        const amount = e.detail.value.amount;
        const content = amount ? '件数：' + amount : '';
        const _url = this.data.type == 'start' ? 'loc_depart' : 'loc_arrive';
        tms.saveWithAddr({
            url: tss.url('tms') + '/task/' + _url,
            params: {
                task_id: this.data.task_id,
                location_id: this.data.location_id,
                tempid: this.data.timestamp,
                content: content
            },
            completion: res => {
                if (res.failed || res.data) {
                    alert.notice('操作失败。' + (res.errorMsg || res.data.errorMsg || ''))
                } else {
                    wx.showToast({
                        title: '操作成功'
                    })
                    this.setData({
                        show_depart_arrive: false,
                        attachUrls: []
                    })
                    this.queryOrder()
                }
            }
        })
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
    reportAbnormal(e) {
        console.log(e)
        if (e.detail.out_task || e.detail.cancel_order) {
            this.queryOrder()
        }
    },
    changeModal(e) {
        this.setData({
            if_list: !this.data.if_list
        })
    },
    goMap(e) {
        console.log(e)
        const ds = e.currentTarget.dataset;
        const lng_lat = ds.lng_lat;
        const loc = ds.loc;
        if (lng_lat) {
            wx.openLocation({
                latitude: lng_lat.split(',')[1] - 0,
                longitude: lng_lat.split(',')[0] - 0,
                name: loc,
                scale: 15
            })
        } else if (e.markerId) {
            for (let i = 0; i < this.data.markers.length; i++) {
                const item = this.data.markers[i];
                console.log(e.markerId, item.target_id, e.markerId == item.target_id)
                if (e.markerId == item.id) {
                    wx.openLocation({
                        latitude: item.lng_lat.split(',')[1] - 0,
                        longitude: item.lng_lat.split(',')[0] - 0,
                        name: item.loc,
                        scale: 15
                    })
                    break;
                }
            }
        } else {
            alert.notice('未找到位置信息，无法打开地图')
        }
    },
    addProof(e) {
        console.log(e, e.detail._tempID)
        this.setData({
            timestamp: e.detail._tempID
        })
    },
    goDetail(e) {
        const ds = e.currentTarget.dataset;
        const location_key = ds.location_key;
        const type = ds.type;
        // console.log(`./capacity_location_detail?task_id=${this.data.task_id}&task_type=${this.data.task_type}&type=${type}&location_id=${location_id}`)
        wx.navigateTo({
            url: `../capacity_location_detail/index?task_id=${this.data.task_id}&location_key=${location_key}&task_type=${this.data.task_type}`,
        })
    },
    removeOrder(e) {
        // let { taskId,subId } = 
    },
    settingCallback() {
        console.log('l')
        this.setData({
            showPerModal: false
        })
    },
    editStatus(e) {
        var {
            operate
        } = e.currentTarget.dataset
        var _this = this;
        wx.showModal({
            title: '提示',
            content: `确定进行${operate}操作？`,
            success(res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: '请稍后...',
                        mask: true
                    })
                    var station,
                        station_id,
                        tempid = (new Date()).getTime(),
                        lng_lat = "",
                        address,
                        scan_time = util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                        site,
                        scan_person = app.user.uName,
                        scan_code,
                        last_stop = "",
                        next_stop = "",
                        task = "",
                        location = "",
                        no_order = 1,
                        customer = "",
                        customer_id = "",
                        checkFrozen = ""
                    _this.getOrderCode().then(res => {
                        scan_code = res;
                        _this.getSite().then(res => {
                            console.log(res, scan_time)
                            if (res.type == 0) {
                                station = res.station
                                station_id = res.station_id
                                site = res.site
                            } else {
                                station = res.station
                                lng_lat = res.lng_lat
                            }
                            var field = ["station_id,station,scan_time,scan_code,scan_person,last_stop,next_stop,operate,task,location,origin,no_order,customer,customer_id,tempid,lng_lat"]
                            var obj = [station_id, station, scan_time, scan_code, scan_person, last_stop, next_stop, operate, task, location, "WxScan", no_order, customer || '', customer_id || '', tempid || '', lng_lat]
                            field.push(obj.join(','));
                            tss.save({
                                url: tss.url('xdata') + "cud/tms_scan",
                                params: {
                                    "csv": field.join("\n")
                                },
                                completion: res => {
                                    if (res.failed) {
                                        return
                                    }
                                    tss.post({
                                        url: tss.url("") + '/tms/scan/scanDone',
                                        params: {
                                            operate: operate
                                        },
                                        completion: can => {
                                            console.log(can, checkFrozen, tempid)
                                            if (checkFrozen) {
                                                tss.post({
                                                    url: tss.url("") + '/tms/scan/queryFrozenCode',
                                                    params: {
                                                        tempid: tempid
                                                    },
                                                    completion: fro => {
                                                        console.log(fro)
                                                        _this.setData({
                                                            tempid: (new Date()).getTime()
                                                        })
                                                        if (fro.data && fro.data.length) {
                                                            _this.setData({
                                                                frozen: fro.data.map(e => ({
                                                                    code: e,
                                                                    ifHand: false
                                                                })),
                                                                showFrozen: true
                                                            })
                                                            wx.vibrateLong();
                                                            const backgroundAudioManager = wx.getBackgroundAudioManager()
                                                            backgroundAudioManager.title = '留仓提示'
                                                            backgroundAudioManager.src = 'https://tms.boudata.com/alarm.mp3'
                                                        }
                                                    }
                                                })
                                            }
                                            wx.showToast({
                                                title: '操作成功',
                                            })
                                        }
                                    })
                                }
                            })
                        })
                    })
                } else if (res.cancel) {
                    return
                }
            }
        })
    },
    getSite() {
        return new Promise((resolve, reject) => {
            var station_id, station, site, type
            tss.query({
                url: tss.url('sql') + 'c_site',
                params: {},
                completion: res => {
                    console.log(res)
                    if (res.data && res.data.length >= 1) {
                        station_id = res.data[0].id
                        station = res.data[0].name
                        site = res.data
                        type = 0
                        resolve({
                            type,
                            station_id,
                            station,
                            site
                        })
                    } else {
                        this.doLocation().then(res => {
                            type = 1
                            let {
                                station,
                                lng_lat
                            } = res
                            resolve({
                                type,
                                station,
                                lng_lat
                            })
                        });
                    }
                }
            })
        })
    },
    doLocation() {
        let _this = this
        var lng_lat = ""
        return new Promise((resolve, reject) => {
            wx.getLocation({
                success: res => {
                    lng_lat = `${res.longitude}&${res.latitude}`;
                    qqmapsdk.reverseGeocoder({
                        location: {
                            latitude: res.latitude,
                            longitude: res.longitude
                        },
                        success: res => {
                            let station = res.result.address
                            resolve({
                                station,
                                lng_lat
                            })
                        },
                        complete: res => {
                            // wx.hideLoading()
                        }
                    })
                },
                fail() {
                    // wx.hideLoading()
                }
            })
        })
    },
    getOrderCode() {
        return new Promise((resolve, reject) => {
            tss.post({
                url: tss.url("sql") + `/tms_sub_code?task_id=${this.data.task_id}`,
                completion: res => {
                    console.log(res)
                    resolve(res.data[0].order_code)
                }
            })
        })
    }
})
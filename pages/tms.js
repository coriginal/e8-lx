const _App = getApp().globalData
const tss = require('../utils/tss.js')
const txmap = require('../utils/txmap.js')
const Pages = require('../pages.js').default
const util = require('../utils/util.js')
//获取位置
const QQMapWX = require('../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';

var qqmapsdk = new QQMapWX({
    key: Map_Key
});

const joinAddr = function (item, type) {
    return (item[type + '_province'] || '') + (item[type + '_city'] || '') + (item[type + '_district'] || '') + (item[type + '_town'] || '') + (item[type + '_street_no'] || '');
}
const getLoc = function (cb) {
    const _this = this;
    if (_App.txmap_key) {
        let map = new txmap({
            key: _App.txmap_key
        })
        map.reverseGeocoder({
            complete: res => {
                if (res && res.result && res.result.address && res.result.formatted_addresses && res.result.location) {
                    var location = res.result.address;
                    const addr = res.result.formatted_addresses;
                    if (addr && addr.recommend) {
                        const a = res.result.address_component;
                        location = a.province + a.city + (a.district || '') + addr.recommend.replace(a.province, '').replace(a.city, '').replace(a.district || '', '')
                    }
                    const lng = res.result.location.lng;
                    const lat = res.result.location.lat;
                    typeof cb == "function" && cb({
                        lng: lng,
                        lat: lat,
                        lng_lat: lng + ',' + lat,
                        addr: location
                    })
                } else {
                    typeof cb == "function" && cb({})
                }
            }
        });
    } else {
        wx.getLocation({
            success: res => {
                const lng = res.longitude;
                const lat = res.latitude;
                typeof cb == "function" && cb({
                    lng: lng,
                    lat: lat,
                    lng_lat: lng + ',' + lat,
                    addr: ''
                })
            },
            failed: res => {
                typeof cb == "function" && cb({})
            }
        })
    }
}

const writeLocation = function (taskid) {
    if (taskid) {
        this.getLoc(function (loc) {
            if (loc && loc.lng && new Date() - _App.writeLocTime > 3 * 1000 * 60) {
                tss.save({
                    url: tss.url('') + '/tms/task/note_driver_loc',
                    params: {
                        taskid: taskid,
                        lng_lat: loc.lng_lat,
                        addr: loc.addr
                    }
                })
                _App.writeLocTime = new Date()
            }
        })
    }
}

const saveWithAddr = function ({
    url,
    params,
    completion
}) {
    this.getLoc(loc => {
        tss.save({
            url: url,
            params: Object.assign(params, loc),
            completion: completion
        })
    })
}

const print = function (subids) {
    tss.query({
        url: tss.url('sql') + 'subid2id',
        params: {
            ids: subids
        },
        completion: res => {
            if (res && res.data && res.data.length) {
                wx.navigateTo({
                    url: `${Pages.order_print}?ids=${res.data[0].ids}`
                })
            } else {
                alert.notice('未找到打印订单信息' + (res.errorMsg || res.data.errorMsg || ''))
            }
        }
    })
}

const logistic = function (params) {
    var p = new Promise(function (resolve, reject) {
        tss.query({
            url: tss.url('sql') + 'lc_info',
            params: params,
            completion: res => {
                if (res.failed) {
                    reject(res.errorMsg)
                }
                resolve(res.data.map(e => ({
                    id: e.id,
                    lc: e.name
                })))
            }
        })
    })

    return p
}

/**
 * 开启后台定位
 */
const startWxLoc = function (taskid) {
    console.log('start location')
    if (taskid) {
        let upwxloc_time = new Date((new Date()).getTime() - 600 * 1000),
            _num = 0;
        wx.onLocationChange(function (res) {
            console.log(res)
            let diff = (new Date()).getTime() - upwxloc_time.getTime();
            console.log(diff, upwxloc_time)
            if (res && diff >= 600 * 1000) {
                _num = _num + 1
                upwxloc_time = new Date()
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: loc => {
                        let address = loc.result.address
                        let msg_data = {
                            type: 'wx',
                            task_id: taskid,
                            lng_lat: res.longitude + ',' + res.latitude,
                            loc_time: util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                            addr: address,
                            speed: res.speed.toFixed(2)
                        }

                        tss.post({
                            url: tss.url('ENTITY') + 'TaskMsg',
                            params: msg_data,
                            completion: task => {

                                // _num = _num + 1
                                // upwxloc_time = new Date()
                            }
                        })
                    }
                })
            }
            if (_num >= 300) {
                wx.stopLocationUpdate(function (stop) {

                })
            }
        })
    }
}

/**
 * 关闭后台定位
 */
const endWxloc = function () {
    wx.stopLocationUpdate(function (stop) {

    })
}

export {
    joinAddr,
    getLoc,
    writeLocation,
    saveWithAddr,
    print,
    logistic,
    startWxLoc,
    endWxloc
}
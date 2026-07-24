const _App = getApp().globalData
import Pages from '../../../pages.js'
import {
    formatDate
} from '../../../utils/util'
const tss = require('../../../utils/tss.js')
const txmap = require('../../../utils/txmap.js');
const tempid = new Date().getTime()
const time = formatDate(tempid, 'yyyy-MM-dd hh:mm:ss')

Page({
    data: {
        oldLocation: '',
        ocode: ''
    },

    onLoad() {
        /*this.upLngLat().then(res=>{
            console.log(res)
        })*/
        this.loadData();
        console.log(_App)
        // this.doScan()
        // https://tms.boudata.com/tss/wx/api/acode2?appId=wx9b75ba40fdf9b921&page=pages/redirect/redirect&onlyQparam=true&addDomain=true&qparam=,,,93,,,,JE25080400002&envVersion=develop,
        // https://e8dev.boudata.com/tss/wx/api/acode2?appId=wx9b75ba40fdf9b921&page=pages/redirect/redirect&onlyQparam=true&addDomain=true&qparam=,,,93,,,,JE25080400002&envVersion=trial,
        if (_App.entryParams && _App.entryParams.scene) {
            let scene = decodeURIComponent(_App.entryParams.scene) // D319,,,93,,,,JE25080400002
            let infos = scene.split(",")
            if (infos.length > 7) {
                let code = infos[7]
                this.queryOrder(code)
                this.setData({
                    scode: code,
                    ocode: code
                })
            }
        }
    },
    inputOcode(e) {
        this.setData({
            scode: e.detail.value
        })
        this.queryOrder(e.detail.value)
    },
    showStatus(e) {
        let index = e.currentTarget.dataset.index;
        wx.showActionSheet({
            itemList: this.data.dataList[index].type,
            success: ({
                tapIndex
            }) => {
                this.setData({
                    [`dataList[${index}].value`]: this.data.dataList[index].type[tapIndex]
                })
            }
        })
    },
    addProof: function (e) {
        var attachURLs = e.detail.attachURLs;
        let index = e.currentTarget.dataset.index;
        this.setData({
            [`uploadList[${index}].tempid`]: e.detail._tempID,
            [`uploadList[${index}].urls`]: attachURLs
        })
        wx.hideLoading()
    },
    delattach(e) {
        let index = e.currentTarget.dataset.index
        let list = this.data.uploadList[index].urls
        list = e.detail.attachURLs
        this.setData({
            [`uploadList[${index}].urls`]: list
        })
    },
    forSubmit(e) {
        let sca = _App.DomainConfig?.sign_condition_attach?.content
        if (sca == 1 || sca == true) {
            if (!this.data.uploadList[1].urls.length) {
                wx.showModal({
                    title: "提示",
                    content: "请上传回单",
                    showCancel: false
                })
                return
            }
        }
        if (_App.DomainConfig.sign_pic_camera_only && Number(_App.DomainConfig.sign_pic_camera_only.content)) {
            if (!this.data.uploadList[0].urls.length) {
                wx.showModal({
                    title: "提示",
                    content: "请上传签收图片",
                    showCancel: false
                })
                return
            }
        }
        wx.showLoading({
            mask: true
        })
        let _this = this
        let signRemark = (_this.data.uploadList[0].urls.length || _this.data.uploadList[1].urls.length) ? '单据已上传' : '';
        let location = this.data.location || ''
        e.detail.value.remark = e.detail.value.remark + location + signRemark;
        if (_this.data.order.status_code == '624' && !_this.data.uploadList[0].urls.length && !_this.data.uploadList[1].urls.length) {
            _this.loadData()
            _this.triggerEvent('success')
            wx.hideLoading()
            console.log("不进行签收上传了")
            this.setData({
                ocode: ''
            })
            return
        }
        //需有sign_up_lnglat参数
        _this.upLngLat().then(res => {
            //624  异常623
            switch (e.detail.value.status) {
                case "正常签收":
                    e.detail.value.status = 624;
                    break;
                case "异常签收":
                    e.detail.value.status = 623;
                    break;
            }
            console.log(res)
            tss.post({ //rcode提交
                url: tss.url('/tms/order/receipt/submit'),
                params: {
                    order_id: _this.data.order.id,
                    tempid: _this.data.uploadList[1].tempid,
                    op_time: time,
                    type: '电子回单'
                },
                completion: res => {
                    if (res.failed) {
                        wx.showModal({
                            title: '电子回单上传失败，签收操作不受影响',
                            content: res.errorMsg,
                            showCancel: false
                        })
                        wx.hideLoading()
                    }
                    const sign = (lng_lat) => {
                        tss.post({ //sign提交
                            url: tss.url('/tms/order/sign'),
                            params: {
                                order_id: _this.data.order.id,
                                tempid: _this.data.uploadList[0].tempid,
                                ...e.detail.value,
                                lng_lat
                            },
                            completion: res => {
                                console.log(res)
                                if (res.failed) {
                                    wx.showModal({
                                        title: '签收失败',
                                        content: res.errorMsg,
                                        showCancel: false
                                    })
                                    wx.hideLoading()
                                    return
                                }
                                // this.setData({
                                //     ocode:''
                                // })
                                wx.showToast({
                                    title: '签收成功',
                                    icon: 'none'
                                })
                                _this.loadData()
                                _this.triggerEvent('success')
                                wx.hideLoading()
                            }
                        })
                    }
                    wx.getLocation({
                        success: res => {
                            sign(`${res.longitude},${res.latitude}`)
                        },
                        fail: err => {
                            sign('')
                        }
                    })
                }
            })
        })
    },
    checkLocationPower() {
        return new Promise((resolve, reject) => {
            wx.getSetting({
                success: res => {
                    if (!res.authSetting['scope.userLocation']) {
                        wx.authorize({
                            scope: 'scope.userLocation',
                            success() {
                                resolve(true)
                            },
                            fail() {
                                wx.hideLoading()
                                wx.showModal({
                                    showCancel: false,
                                    content: "签收需上传定位，请授权定位信息后再试！"
                                })
                                reject('需上传定位，请授权定位信息')
                            }
                        })
                    } else {
                        resolve(true)
                    }
                }
            })
        })
    },
    upLngLat() {
        return new Promise((resolve, reject) => {
            const get = () => {
                var lng_lat = ""
                wx.getLocation({
                    success: res => {
                        console.log(res)
                        lng_lat = `${res.longitude},${res.latitude}`;
                        resolve(lng_lat);
                    }
                })
            }
            /*if (_App.DomainConfig.sign_up_lnglat && Number(_App.DomainConfig.sign_up_lnglat.content)) {
                console.log("代号122")*/
            this.checkLocationPower().then(res => {
                if (res) {
                    get()
                }
            })
            /*}else{
                resolve('')
            }*/
        })
    },
    //需要 数据表->域参数配置 中增加show_receive_position字段 参数为1会上传地址 参数为0或没有这个字段则不会上传
    getLocation() {
        var _this = this
        return new Promise((resolve, reject) => {
            const get = () => {
                wx.showLoading({
                    title: '定位中...',
                    mask: true
                })
                var map = new txmap({
                    key: _App.txmap_key
                });
                map.reverseGeocoder({
                    success: res => {
                        resolve(res.result.address)
                        _this.setData({
                            oldLocation: res.result.address
                        })
                        wx.hideLoading()
                    },
                    fail() {
                        resolve(_this.data.oldLocation)
                        wx.hideLoading()
                    }
                })
            }
            if (_App.DomainConfig.show_receive_position && Number(_App.DomainConfig.show_receive_position.content)) {
                _this.checkLocationPower().then(res => {
                    console.log(res)
                    if (res) {
                        get()
                    }
                })
            } else {
                resolve('')
            }
        })
    },
    loadData() {
        const tempid = new Date().getTime()
        const time = formatDate(tempid, 'yyyy-MM-dd hh:mm:ss')

        let sourceType = ''
        if (_App.DomainConfig.sign_pic_camera_only && Number(_App.DomainConfig.sign_pic_camera_only.content)) {
            sourceType = 'camera'
        }
        this.setData({
            scode: "",
            showReceive: false,
            dataList: [{
                    name: 'sign_man',
                    title: '签收人：',
                    bindtap: '',
                    value: ''
                },
                {
                    name: 'sign_date',
                    title: '签收时间：',
                    bindtap: '',
                    value: `${time}`
                },
                {
                    name: 'sign_method',
                    title: '签收方式：',
                    bindtap: 'showStatus',
                    value: '送货签收',
                    type: ['送货签收', '自提签收'],
                    disabled: true,
                    icon: 'i-triangledownfill'
                },
                {
                    name: 'status',
                    title: '签收类型：',
                    bindtap: 'showStatus',
                    value: '正常签收',
                    type: ['正常签收', '异常签收'],
                    code: [624, 623],
                    disabled: true,
                    icon: 'i-triangledownfill'
                },
                {
                    name: 'remark',
                    title: '备注：',
                    bindtap: '',
                    value: ''
                }
            ],
            uploadList: [{
                    code: 'sign',
                    recordId: '-7',
                    title: '签收面单：',
                    urls: [],
                    tempid: tempid,
                    sourceType: sourceType,
                    waterMark: '',
                    markMode: 'left,bottom'
                },
                {
                    code: 'rcode',
                    recordId: '-19',
                    title: '上传回单：',
                    urls: [],
                    tempid: tempid,
                    sourceType: '',
                    waterMark: '',
                    markMode: ''
                }
            ]
        })
    },

    doScan() {
        wx.scanCode({
            scanType: 'barCode',
            // onlyFromCamera: true,
            success: res => {
                console.log(res)
                // 匹配英文和字母
                wx.showLoading({
                    title: '正在查询..'
                })
                this.queryOrder(res.result)
                this.setData({
                    scode: res.result,
                    ocode: res.result
                })
            },
            fail: res => {
                console.log(res)
                wx.showModal({
                    content: res.result ? `当前[ ${res.result} ]暂不支持,请重新扫描` : '请扫描正确条码',
                    confirmText: '重新扫描',
                    cancelText: '取消',
                    success: res => {
                        if (res.confirm) {
                            this.doScan()
                        }
                    }
                })
            }
        })
    },

    queryOrder(code) {
        this.getLocation().then(loc => {
            if (code.length < 4) {
                return wx.showToast({
                    title: '请输入正确单号',
                    icon: 'none'
                })
            }
            wx.showLoading({
                mask: true
            })

            this.setWaterMark(loc)
            tss.query({
                url: tss.url('sql') + 'tms_order',
                params: {
                    scode: code,
                    ignore_permission: true
                },
                completion: res => {
                    if (res.failed) {
                        wx.hideLoading()
                        wx.showModal({
                            content: res.errorMsg
                        })
                        return
                    }
                    if (res.data.length == 0) {
                        wx.hideLoading()
                        wx.showModal({
                            content: "未查询到此订单",
                            confirmText: '重新扫描',
                            cancelText: '取消',
                            success: res => {
                                if (res.confirm) {
                                    this.doScan()
                                }
                            }
                        })
                        return
                    }
                    let order1 = [res.data.find(item => item.code == code || item.tcode == code)];
                    const [order] = (order1 && order1.length) ? order1: res.data;
                    var oldReceiptsImg = []
                    console.log(order)
                    if (order['receipt_attachids']) {
                        tss.get({
                            url: tss.url("") + `/xdata/attach/view?ids=${order['receipt_attachids']}`,
                            completion: res => {
                                console.log("回单", res)
                                oldReceiptsImg = res.data.map((i, index) => {
                                    console.log(i)
                                    let url;
                                    if (i.fileSrc.indexOf("https://") != -1) {
                                        url = i.fileSrc
                                    } else {
                                        url = `${_App.app_host}${i.fileSrc}?uName=${_App.user.uName}&uToken=${_App.user.uToken}`
                                    }
                                    return {
                                        id: i.id,
                                        name: `old${index}`,
                                        type: 1,
                                        url
                                    }
                                });
                                this.setData({
                                    order: order,
                                    [`dataList[0].value`]: order.receive_man || '',
                                    location: loc,
                                    showReceive: true,
                                    "uploadList[1].urls": oldReceiptsImg.length ? oldReceiptsImg : []
                                })
                                wx.hideLoading()
                            }
                        })
                        console.log("ssss", oldReceiptsImg)
                        // var receiptIds = order.receipt_attachids.split(',')
                        // if (receiptIds.length) {
                        //     oldReceiptsImg = receiptIds.map((item, index) => {
                        //         console.log(item)
                        //         return {
                        //             id: item,
                        //             name: `old${index}`,
                        //             type: 1,
                        //             url: `https://tms.boudata.com/tss/xdata/attach/download/${item}?uName=${_App.user.uName}&uToken=${_App.user.uToken}`
                        //         }
                        //     })
                        // }
                    } else {
                        this.setData({
                            order: order,
                            [`dataList[0].value`]: order.receive_man || '',
                            location: loc,
                            showReceive: true,
                            "uploadList[1].urls": oldReceiptsImg.length ? oldReceiptsImg : []
                        })
                        wx.hideLoading()
                    }
                }
            })
        })
    },

    setWaterMark(loc) {
        if (_App.DomainConfig.show_receive_position && Number(_App.DomainConfig.show_receive_position.content)) {
            const time = formatDate(new Date().getTime(), 'yyyy-MM-dd hh:mm:ss')
            let waterMark = loc + " " + time + " " + _App.user.uName
            this.setData({
                [`uploadList[0].waterMark`]: waterMark
            })
        }
    }
})
const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
const lc = require('../../../utils/listenerCenter.js')
const QQMapWX = require('../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
const alert = require('../../../utils/alert.js')
const _APP = getApp().globalData;
const plugin = requirePlugin("WechatSI")
var manager = plugin.getRecordRecognitionManager()
import user from '../../../utils/user.js'
import {
    formatDate,
    numberRound10
} from '../../../utils/util'
import {
    $wuxToptips
} from '../../../components/index.js'
var qqmapsdk = new QQMapWX({
    key: Map_Key
});
Page({
    data: {
        distance: 0,
        textarea: "点击智能识别可以自动填入收件人信息,例子：陈大贞 13754729380 浙江省杭州市江干区1号大街68号",
        contentMenu: [{
                icon: 'i-formfill',
                title: '智能黏贴',
                code: 'copy'
            },
            {
                icon: 'i-voicefill',
                title: '语音识别',
                code: 'voice'
            },
            {
                icon: 'i-picfill',
                title: '图片识别',
                code: 'pic'
            }
        ],
        currentSeg: 0,
        orderInfo: {
            _transModeTitle: '零担',
            'send': {

            },
            'receive': {
                info: ['省 / 市 / 区 / 县']
            },
            'customerInfo': {

            }
        },
        list: [{
                title: '件数(件)',
                value: '',
                code: 'amount'
            }, {
                title: `重量(${getApp().globalData.DomainConfig.weight_unit?(getApp().globalData.DomainConfig.weight_unit.content=="kg"?"千克":"吨"):"千克"})`,
                value: '',
                code: 'weight'
            },
            {
                title: '体积(方)',
                value: '',
                code: 'volume'
            },

        ],
        closeCustractor: true,
        custractorPosition: {
            x: 0,
            y: 0
        },
        cargo_list: [],
        cargo_index: 0,
        counterOpacity: 1,
        systemInfo: {},
        cargo: ''
    },
    cargoInput(e) {
        console.log(e)
        this.setData({
            cargo: e.detail.value
        })
    },
    onLoad(options) {
        if (user.domain == 'D006') {
            wx.showModal({
                content: "您目前登录的是测试环境，如您是正式发件客户，请不要下单并联系物流公司处理，是否继续",
                success: res => {
                    if (!res.confirm) {
                        wx.navigateBack()
                    }
                }
            })
        }
        wx.getSystemInfo({
            success: (result) => {
                console.log(result)
                this.setData({
                    systemInfo: result,
                    custractorPosition: {
                        x: result.screenWidth / 2 - 112,
                        y: result.screenHeight / 2 - 275
                    }
                })
            },
        })
        const {
            companyInfo,
            ifHideCompany
        } = _App
        wx.setNavigationBarTitle({
            // title: _App.user.company
            title: (ifHideCompany && companyInfo.name) || ''
        })

        if (_App.user.isCustomer) {
            this.setData({
                isCustomer: true
            })
            this.getCustomerInfo(_App.user.uName)

        }
        this.getCargoList()
        this.setData({
            "orderInfo.send": wx.getStorageSync('send') || {
                info: ['发货地']
            }
        })

        this.data.orderInfo.red_packet = (options.red_packet && JSON.parse(options.red_packet)) || {}
    },
    getCargoList() {
        tss.post({
            url: tss.url("") + '/api/data/sql/customer_cargo?customer_id=&page=1&rows=100',
            completion: res => {
                console.log(res)
                console.log(res.data.rows.length)
                if (res.data.rows.length == 0) {
                    return
                }

                let cargoList = res.data.rows.map(obj => ({
                    ...obj,
                    hidden: false
                }))
                this.setData({
                    cargo_list: cargoList,
                })
            }
        })
    },
    onReady() {
        lc.addListener('orderInfo', this.__wxWebviewId__.toString(), res => {
            this.data.orderInfo = {
                ...this.data.orderInfo,
                [res.type]: res.data
            }
            if (res.type == 'customerInfo') {
                this.getDefaultAddr(res.data.id)
                console.log(_App.user.domain)
                if (_App.user.domain !== 'D768') {
                    this.getLine(res.data.id)
                }
                // this.getCusTransMode(res.data.id)
                this.dealCustomerDefault(res.data)
            }
            if (res.type == 'send' || res.type == 'receive') {
                this.setData({
                    orderInfo: this.data.orderInfo
                })
                //this.getNowDistance()
            }
        })
    },
    getNowDistance() {
        wx.showLoading({
            title: '计算距离中...',
            mask: true
        })
        var {
            orderInfo
        } = this.data
        if (orderInfo.receive.addr && orderInfo.receive.addr.length && orderInfo.send.addr && orderInfo.send.addr.length) {
            this.getDistance(orderInfo).then(distance => {
                this.setData({
                    distance,
                    [`orderInfo.kilometre`]: distance
                })
                wx.hideLoading()
            })
        }
    },
    dealCustomerDefault(data) {
        if (data.order_default == null || data.order_default == "{}") {
            if (_App.DomainConfig.if_visit_none && _App.DomainConfig.if_visit_none.content == 1) {
                this.setData({
                    "orderInfo.customerInfo.if_visit": false,
                    "orderInfo.customerInfo.service_mode": true
                })
            } else {
                this.setData({
                    "orderInfo.customerInfo.if_visit": true,
                    "orderInfo.customerInfo.service_mode": true
                })
            }
        } else {
            let order_default = JSON.parse(data.order_default)
            this.setData({
                "orderInfo.customerInfo.if_visit": order_default.if_visit === "true",
                "orderInfo.customerInfo.service_mode": order_default.service_mode == '派送',
            })
        }
    },

    // 前往地址簿
    goChooseAddr(e) {
        if (this.data.orderInfo.customerInfo && this.data.orderInfo.customerInfo.id) {
            const {
                id: type
            } = e.currentTarget
            const {
                id: customer_id
            } = this.data.orderInfo.customerInfo
            let info = {
                type,
                customer_id
            }
            wx.navigateTo({
                url: `${Pages.customer_addr_list}?info=${JSON.stringify(info)}`
            })
        } else {
            $wuxToptips().warn({
                hidden: false,
                text: '请先选择客户',
                duration: 3000
            })
        }
    },
    nextStep() {
        var orderInfo = this.data.orderInfo
        const [amount, weight, volume] = this.data.list.map(i => i.value)
        //const cargo = this.data.cargo_list[this.data.cargo_index]?.cargo || ''
        const cargo = this.data.cargo
        const line = this.data.line_list ? this.data.line_list[this.data.line_index] : ""
        orderInfo.cargoInfo = {
            weight,
            volume,
            amount,
            cargo
        }
        if (line) {
            orderInfo = {
                ...orderInfo,
                line_id: line.id,
                line_name: line.name
            }
        }

        console.log(orderInfo)
        if (!line && !orderInfo.receive.addr) {
            wx.showToast({
                title: '请填写收货地区',
                icon: 'none'
            })
            return
        }
        if (orderInfo.receive.addr && orderInfo.receive.addr.length == 0) {
            wx.showToast({
                title: '请填写收货地区',
                icon: 'none'
            })
            return
        }
        if (this.data.currentSeg === 1) {
            orderInfo.cargoInfo = {
                weight: '',
                volume: '',
                amount: ''
            }
            this.sendGzhMessage(orderInfo)
            this.getDistance(orderInfo)
            wx.navigateTo({
                url: Pages.order_transmode + '?data=' + JSON.stringify(orderInfo) + '&_from=quote'
            })

        } else {
            if (weight && volume && amount) {
                this.sendGzhMessage(orderInfo)
                wx.navigateTo({
                    url: Pages.order_quote1 + '?data=' + JSON.stringify(orderInfo)
                })
            } else {
                wx.showToast({
                    title: '请确认重量、件数、体积！',
                    icon: 'none'
                })
            }
        }
    },

    // 选择客户
    goChooseCustomer() {
        wx.navigateTo({
            url: Pages.customer_list
        })
    },
    // 关闭
    onClose() {
        this.setData({
            visible: false
        })
    },
    // 收件省市区
    onChange(e) {
        this.setData({
            value_addr: e.detail.value
        })
        if (e.detail.done) {
            this.setData({
                "orderInfo.receive": {
                    obj: {
                        region: e.detail.options.map((n) => n.label)
                    },
                    addr: e.detail.options.map((n) => n.label)
                }
            })
            if (e.detail.options.length) {
                //this.getNowDistance()
            }
        }
    },
    // 输入重量体积件数
    inputCargoInfos(e) {
        this.data.list[e.currentTarget.id].value = e.detail.value
    },
    // 前往编辑地址
    goEditAddr(e) {
        const {
            id: type
        } = e.currentTarget
        if (type == 'receive') {
            this.setData({
                visible: true
            })
        } else {
            wx.navigateTo({
                url: `${Pages.customer_addr_edit}?type=${type}&data=${JSON.stringify(this.data.orderInfo[type] || {})}`
            })
        }
    },
    // 获取默认地址信息
    getDefaultAddr(customer_id) {
        tss.query({
            url: tss.url('data') + 'xcx_tms_contact',
            params: {
                customer_id,
                if_default: 1
            },
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    return
                }
                if (res.data.length == 0) {
                    this.setData({
                        orderInfo: this.data.orderInfo,
                        "orderInfo.send": {
                            info: ['发货地']
                        },
                        "orderInfo.receive": {
                            info: ['省 / 市 / 区 / 县']
                        }
                    }, () => this.getLocation())
                } else {
                    res.data.forEach(item => {
                        this.data.orderInfo[item.type == '寄件' ? 'send' : 'receive'] = {
                            addr: [item.province, item.city, item.district, item.town, item.street_no].filter(i => i),
                            info: [item.name || '', item.phone || ''],
                            obj: {
                                addr_detail: item.street_no || '',
                                name: item.name || '',
                                phone: item.phone || '',
                                region: [item.province || '', item.city || '', item.district || '', item.town || '']
                            },
                            site: item.site
                        }
                    })
                    this.setData({
                        orderInfo: this.data.orderInfo
                    })
                }
            }
        })
    },
    getLocation() {
        let _this = this
        wx.showLoading({
            title: '正在定位中...',
            mask: true
        })
        wx.getLocation({
            success: res => {
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: res => {
                        const {
                            province,
                            city,
                            district
                        } = res.result.address_component
                        _this.setData({
                            "orderInfo.send": {
                                obj: {
                                    region: [province, city, district]
                                },
                                addr: [province, city, district]
                            }
                        })
                    },
                    complete: res => {
                        wx.hideLoading()
                    }
                })
            },
            fail() {
                wx.hideLoading()
                wx.showToast({
                    title: '定位失败,请开启小程序定位权限。',
                    icon: 'none',
                    duration: 5000
                })
            }
        })
    },
    // 获取用户信息
    getCustomerInfo(phone) {
        tss.query({
            url: tss.url('sql') + 'customer',
            params: {},
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    return
                }
                this.setData({
                    'orderInfo.customerInfo': res.data.length && res.data[0]
                })

                // this.getDefaultAddr(res.data[0].id)
                // this.settleTypeChoose(null,res.data[0].settle_type)
                // this.getCusTransMode(res.data[0].id)
                this.getDefaultAddr(res.data[0].id)
                // this.getCusTransMode(res.data[0].id)
                this.dealCustomerDefault(res.data[0])
            }
        })
    },
    // 获取当前业务类型
    getCusTransMode(customer_id) {
        tss.post({
            url: tss.url('') + '/tms/api/customerGetTransMode',
            params: {
                customer_id
            },
            completion: res => {
                // console.log(res)
                if (res.failed) return
                if (res.data.length > 0) {
                    this.setData({
                        transModeList: res.data,
                        "orderInfo.trans_mode": (res.data.find(i => i.selected) || res.data[0]).name,
                        "orderInfo.trans_mode_id": (res.data.find(i => i.selected) || res.data[0]).id
                    })
                }
            }
        })
    },
    // 选择服务
    handleService(e) {
        const id = e.currentTarget.id
        let type = `orderInfo.customerInfo.${id}`
        this.setData({
            [type]: !this.data.orderInfo.customerInfo[id]
        })
    },
    // 选择运输模式
    chooseTransMode() {
        this.setData({
            showPopup: true
        })
    },
    onClosePopup() {
        this.setData({
            showPopup: false
        })
    },
    popupClick(e) {
        const {
            id,
            name
        } = e.currentTarget.dataset
        // console.log(id, name)
        this.setData({
            "orderInfo.trans_mode": name,
            "orderInfo.trans_mode_id": id,
            showPopup: false
        })
    },

    // 发送公众号提醒
    async sendGzhMessage(orderInfo) {
        const {
            data: domainInfo
        } = await this.getDomainConfig()
        const notice_pr = domainInfo.find(i => i.code == 'quote_notice_person')
        const gzh_id = domainInfo.find(i => i.code == 'gzh_appid')
        if (notice_pr) {
            this.data.noticePhone = notice_pr.content
        } else {
            return
        }
        if (gzh_id) {
            this.data.gzh_appid = gzh_id.content
        }
        const {
            data: gzhInfo
        } = await this.getGzhInfos()
        const gzh_appid = JSON.parse(gzhInfo[0].value).gzh_appid

        const cargoInfo = orderInfo.cargoInfo
        const trans_mode = ['零担', '整车'][this.data.currentSeg]
        const data = {
            first: {
                value: `有客户 ${_App.user.uName} 进行【${trans_mode}】的询价`,
                color: 'red'
            },
            keyword1: {
                value: trans_mode == '零担' ? `${cargoInfo.weight}kg ${cargoInfo.amount}件 ${cargoInfo.volume}方` : '暂无'
            },
            keyword2: {
                value: trans_mode
            },
            remark: {
                value: ` ${orderInfo.receive.addr?.join(' ') || ''}`
            }
        }
        tss.sendGZHMsg({
            params: {
                appid: this.data.gzh_appid || gzh_appid,
                phone: this.data.noticePhone,
                template_id: 'GvBaQ2PrZfkYhl2q0mwdtPuxO5vz08To_0b9zyA9wCQ',
                data: data,
                // miniprogram: miniprogram
            },
            completion: res => {
                console.log(res)
            }
        })
    },
    getGzhInfos() {
        return new Promise(completion => {
            tss.post({
                url: tss.url('') + '/param/init/query',
                params: {
                    codes: 'gzh_xcx'
                },
                completion
            })
        })
    },
    getDomainConfig() {
        return new Promise(completion => {
            tss.query({
                url: tss.url('') + '/tms/entity/DomainConfig',
                params: {
                    code: 'quote_notice_person,gzh_appid'
                },
                completion
            })
        })
    },
    onChangeSeg(e) {
        console.log(e)
        this.setData({
            currentSeg: e.detail.key,
            "orderInfo._transModeTitle": ['零担', '整车'][e.detail.key]
        })
    },
    openCustractor() {
        this.setData({
            closeCustractor: false
        })
    },
    showPickCargo() {
        this.setData({
            showPickCargo: true
        })
    },
    showPickLine() {
        this.setData({
            showPickLine: true
        })
    },
    getLine(customer_id) {
        wx.showLoading({
            title: '获取线路中...',
            mask: true
        })
        tss.post({
            url: tss.url("sql") + "/tms_line",
            params: {
                customer_id
            },
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg
                    })
                    return
                }
                this.setData({
                    line_list: res.data,
                    line_index: 0
                })
                wx.hideLoading()
            }
        })
    },
    lineChange(e) {
        console.log(e.detail)
        this.setData({
            line_index: e.detail,
            showPickLine: false
        })
    },
    cargoChange(e) {
        console.log(e.detail)
        this.setData({
            cargo_index: e.detail,
            showPickCargo: false
        })
    },
    touchStart(e) {
        this.setData({
            counterOpacity: 0.5
        })
    },
    touchMove(e) {
        const offset = {
            counter: {
                x: -112.5,
                y: -30,
                width: 225,
                height: 225
            },
            counterIcon: {
                x: -25,
                y: -25,
                width: 50,
                height: 50
            }
        }
        let i = e.changedTouches[0]

        let position = {
            x: i.pageX + offset[e.currentTarget.id].x,
            y: i.pageY + offset[e.currentTarget.id].y
        }
        console.log(position.x, position.y, this.data.systemInfo.windowHeight)
        this.setData({
            custractorPosition: position
        })
    },
    touchEnd(e) {
        console.log(e)
        const systemInfo = this.data.systemInfo
        const offset = {
            counter: {
                x: -112.5,
                y: -30,
                width: 225,
                height: 275
            },
            counterIcon: {
                x: -25,
                y: -25,
                width: 50,
                height: 50
            }
        }
        let i = e.changedTouches[0]
        let position = {
            x: i.pageX + offset[e.currentTarget.id].x,
            y: i.pageY + offset[e.currentTarget.id].y
        }
        if (position.x + offset[e.currentTarget.id].width > systemInfo.windowWidth) {
            position.x = systemInfo.windowWidth - offset[e.currentTarget.id].width
        } else if (position.x < 0) {
            position.x = 0
        }
        if (position.y > systemInfo.windowHeight - offset[e.currentTarget.id].height) {
            position.y = systemInfo.windowHeight - offset[e.currentTarget.id].height
            console.log("超过屏幕下边界")
        } else if (position.y < 0) {
            position.y = 0
        }
        this.setData({
            custractorPosition: position,
            counterOpacity: 1
        })
    },
    calculate(e) {
        var result = e.detail.value.length * e.detail.value.width * e.detail.value.height
        var list = this.data.list
        list[2].value = result.toFixed(2)
        this.setData({
            list: list
        })
    },
    closeCounter() {
        this.setData({
            closeCustractor: true
        })
    },
    clearCounter() {
        let list = this.data.list
        list[1].value = ""
        this.setData({
            list: list
        })
    },
    menuClick(e) {
        let code = e.currentTarget.id
        this[code]();
    },
    addrFinished(e) {
        console.log(e)
        this.data.inputAddr = e.detail.value
    },
    addrInput(e) {
        console.log(e)
        if (this.data.inputAddr) {
            tss.post({
                url: tss.url('/addr/v2/splitNamePhoneAddress'),
                params: {
                    addr: this.data.inputAddr
                },
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        alert.notice(res.errorMsg)
                        return
                    }
                    const data = res.data
                    for (let key in data) {
                        typeof data[key] !== 'string' ? '' :
                            data[key] = data[key].replace(/\n|\\S/g, '')
                    }
                    let receive = {
                        addr: [data.province, data.city, data.district, data.town],
                        info: [data.name, data.phone],
                        obj: {
                            addr_detail: data.street_no,
                            name: data.name,
                            phone: data.phone,
                            region: [data.province, data.city, data.district, data.town]
                        },
                        site: data.province
                    }
                    this.setData({
                        orderInfo: {
                            ...this.data.orderInfo,
                            receive
                        }
                    })
                }
            })
        } else {
            wx.showToast({
                title: '请输入完整信息',
                icon: 'none'
            })
        }
    },
    aiAddressParse(e) {
        console.log(e)
        if (this.data.inputAddr) {
            tss.post({
                url: tss.url('/ai/api/address/parse'),
                params: {
                    address: this.data.inputAddr
                },
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        alert.notice(res.errorMsg)
                        return
                    }
                    const result = res.data
                    if (!result.result) {
                        alert.notice(result.errorMsg)
                        return
                    }
                    const data = result.data
                    for (let key in data) {
                        typeof data[key] !== 'string' ? '' :
                            data[key] = data[key].replace(/\n|\\S/g, '')
                    }
                    let receive = {
                        addr: [data.province, data.city, data.district, data.town],
                        info: [data.name, data.phone],
                        obj: {
                            addr_detail: data.street_no,
                            name: data.name,
                            phone: data.phone,
                            region: [data.province, data.city, data.district, data.town]
                        },
                        site: data.province
                    }
                    this.setData({
                        orderInfo: {
                            ...this.data.orderInfo,
                            receive
                        }
                    })
                }
            })
        } else {
            wx.showToast({
                title: '请输入完整信息',
                icon: 'none'
            })
        }
    },
    copy() {
        wx.getClipboardData({
            success: res => {
                this.setData({
                    inputAddr: res.data
                })
                this.addrInput()
            }
        })
    },
    voice() {

        this.setData({
            voicePop: true
        }, () => {
            manager.start({
                duration: 30000,
                lang: "zh_CN"
            })
        })
        manager.onStop = res => {
            wx.hideLoading()
            this.setData({
                inputAddr: res.result
            })
            this.writeDataToInput(res.result)
        }
    },
    pic() {
        const _this = this;
        wx.chooseImage({
            count: 1,
            success: function (res) {
                const imgurl = (res.tempFilePaths[0])
                console.log(imgurl)
                tss.uploadImagesAsync({
                    recordId: -5,
                    itemId: 4,
                    uName: _APP.user.uName,
                    uToken: _APP.user.uToken,
                    filePaths: res.tempFilePaths,
                    completion: res => {
                        console.log(res)
                        let the_url = '';
                        if (res && res[0] && res[0].success) {
                            var img = res[0].img;
                            if (img) {
                                var simg = img.split('/');
                                img = simg[simg.length - 1]
                                img = img.substr(img.length - 25, 25)
                            }
                            the_url = tss.url('download') + `${res[0].id}?uName=${_APP.user.uName}&uToken=${_APP.user.uToken}`
                        } else {
                            logpool.info(tbName + ' uploadfile fail')
                        }

                        const _getAttachFileName = () =>
                            new Promise(resolve => {
                                tss.query({
                                    url: tss.url('data') + 'xcx_query_attach',
                                    params: {
                                        id: res[0].id
                                    },
                                    completion: res => {
                                        console.log(res)
                                        resolve(res)
                                    }
                                })
                            })

                        _getAttachFileName().then(res => {
                            const filename = res.data[0].filename
                            tss.post({
                                url: tss.url('') + '/baidu/api/ocr',
                                params: {
                                    path: '/home/tssbi/attach/-5/4/' + filename
                                },
                                completion: res => {
                                    console.log(res)
                                    if (res.data.words_result_num) {
                                        let result = '';
                                        res.data.words_result.forEach(i => result += i.words)
                                        _this.setData({
                                            inputAddr: result
                                        })
                                    } else {
                                        alert.notice('提示:图片识别失败。' + (res.error_msg || ''))
                                    }
                                }
                            })
                        })
                    }
                })
            },
        })
    },
    //地址转经纬度->计算距离
    getDistance(e) {
        return new Promise((resolve, reject) => {
            var send = e.send.addr.join('')
            var receive = e.receive.addr.join('')
            var from = {}
            var to = []
            qqmapsdk.geocoder({
                address: send,
                complete: res => {
                    console.log(res)
                    from = {
                        latitude: res.result.location.lat,
                        longitude: res.result.location.lng
                    }
                    qqmapsdk.geocoder({
                        address: receive,
                        complete: res => {
                            console.log(res)
                            to = [{
                                latitude: res.result.location.lat,
                                longitude: res.result.location.lng
                            }]
                            console.log(from, to)
                            qqmapsdk.calculateDistance({
                                mode: "driving",
                                from,
                                to,
                                complete: res => {
                                    if (res.failed) {
                                        wx.showModal({
                                            title: '提示',
                                            content: '获取公里数失败',
                                        })
                                    }
                                    var distance = res.result.elements[0].distance / 1000
                                    console.log(`相距${distance}公里`)
                                    resolve(distance)
                                }
                            })
                        }
                    })
                }
            })
        })
    }
    //https://tms.boudata.com/tss/api/data/sql/customer_cargo?customer_id=&page=1&rows=100
})
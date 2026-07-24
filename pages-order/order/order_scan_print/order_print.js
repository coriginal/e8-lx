const lc = require('../../../utils/listenerCenter.js')
const services_uuid = ["0000EEE0-0000-1000-8000-00805F9B34FB", "0000FF00-0000-1000-8000-00805F9B34FB", "49535343-FE7D-4AE5-8FA9-9FAFD205E455"];
//const ToBase64 = require('../order_print/base64gb2312.js');
const alert = require('../../../utils/alert.js')
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')
const ToBase64 = require('../order_print/base64gb2312')
import {
    formatDate,
    subDate
} from '../../../utils/util'
import {
    printDatas
} from '../order_print/print.js'

function inArray(arr, key, val) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === val) {
            return i;
        }
    }
    return -1;
}
Page({
    data: {
        platform_order: {
            百世快运: require('../order_print/platform_print_data/best.js'),
            安能物流: require('../order_print/platform_print_data/ane.js'),
            韵达快运: require('../order_print/platform_print_data/yunda74_92.js'),
            中通快运01: require('../order_print/platform_print_data/zto.js'),
            中通快运: require('../order_print/platform_print_data/zto76_100.js'),
            汇森速运: require('../order_print/platform_print_data/hssy.js'),
            壹米滴答: require('../order_print/platform_print_data/ymdd.js'),
            京东快运: require('../order_print/platform_print_data/jd.js'),
            顺心捷达: require('../order_print/platform_print_data/sxjd.js'),
            融辉物流: require('../order_print/platform_print_data/rh.js')
        },
        printerList: [],
        lockPrinter: false,
        checkedPrinter: {},
        PackageLength: 10,
        isPrinting: false,
        curOrderId: '',
        curSubCode: '',
        typeList: ['主单', '子单', '平台子单'],
        typeIndex: 2,
        //主单子单打印模块变量
        printData: null,
        choosePrintType: {
            code: 1,
            title: '76*90',
        },
        scanCodeType: 'normal',
        connected: false,
        lcList: [],
        show: false,
        printedList: []
    },
    isEmpty(obj) {
        console.log(判断是否为空)
        return Object.keys(obj).length === 0
    },
    openPageContainer() {
        this.setData({
            show: true
        })
        this.getBluetoothAdapterState()
    },
    getScanCodeType() {
        if (_App.DomainConfig['scan_print_code_type']) {
            if (['box', 'normal'].indexOf(_App.DomainConfig['scan_print_code_type'].content) != -1) {
                this.setData({
                    scanCodeType: _App.DomainConfig['scan_print_code_type'].content
                })
            } else {
                this.setData({
                    scanCodeType: 'normal'
                })
            }
        }
    },
    getPrintModel() {
        wx.showLoading({
            mask: true
        })
        tss.query({
            url: tss.url('') + '/tms/entity/PrintModel',
            params: {
                type: 1
            },
            completion: res => {
                //this.getPlatformInfo()
                wx.hideLoading()
                console.log(res)
                if (res.failed || res.data.length == 0) {
                    this.setData({
                        _options1: ['默认打印'],
                        printMode: []
                    })
                } else {
                    this.setData({
                        _options1: res.data.map(i => i.name),
                        printMode: res.data,
                        "printData.printMode": res.data[0].name,
                        "printData.printModeId": res.data[0].id,
                        "printData.column_info": res.data[0].column_info
                    })
                }
            }
        })
    },
    goPrintOrder(type) {
        const {
            printModeId: print_id,
            ids
        } = this.data.printData
        this.setData({
            PrintType: type
        })
        if (ids) {
            this.queryPrintData({
                print_id,
                ids,
                type
            })
        } else {
            wx.showToast({
                title: '没有打印单号，无法打印',
                icon: 'none'
            })
        }
    },
    queryPrintData({
        ids,
        type,
        print_id
    }) {
        console.log(type)
        tss.post({
            url: tss.url('') + '/tms/order/print',
            params: {
                ids,
                type,
                print_id,
                newModule: true
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: `打印数据获取失败：${res.errMsg}`,
                        showCancel: false
                    })
                    return
                }
                this.setData({
                    "printData.data": res.data.map(i => i.lineData)
                })
                this.goPrint()
            }
        })
    },
    goPrint() {
        wx.showLoading({
            title: '正在连接...',
            mask: true
        })
        let {
            checkedPrinter
        } = this.data
        this.doWriteOther({
            ...checkedPrinter
        })
    },
    //
    onLoad() {
        let orderInfo = {}
        this.getLcInfo()
        this.getScanCodeType()
        //进入直接开始搜索蓝牙设备
        this.initBlueTooth()
        this.getPrintModel()
        //测试 正式删除
    },
    onShow() {
        if (this.data.isPrinting) {
            wx.showLoading({
                mask: true,
                title: '正在传输数据并打印...',
            })
        }
    },
    // lockPrinterSwitch(e) {
    //     this.setData({
    //         lockPrinter: e.detail.value
    //     })
    // },

    //1
    initBlueTooth() {
        if (wx.canIUse('openBluetoothAdapter')) {
            wx.openBluetoothAdapter({
                mode: 'central',
                fail: err => {
                    wx.showModal({
                        title: '提示',
                        content: err.errMsg,
                        showCancel: false,
                        complete: res => {
                            wx.navigateBack()
                        }
                    })
                }
            })
        }
    },
    getBluetoothAdapterState: function () {
        var _this = this;
        wx.getBluetoothAdapterState({
            complete: function (res) {
                console.log(res)
                //mac测试
                //res=res.adapterState
                //
                if (res && res.available) {
                    _this.startBluetoothDevicesDiscovery();
                } else {
                    wx.hideLoading()
                    _this.showTip("蓝牙未开启或未授权", wx.navigateBack)
                }
            }
        })
    },

    //开始搜索外围设备
    startBluetoothDevicesDiscovery() {
        var _this = this
        wx.startBluetoothDevicesDiscovery({
            services: [],
            success: res => {
                console.log(res)
                _this.onBluetoothDeviceFound()
            },
            fail: err => {
                alert.notice(err)
            }
        })
    },
    stopBluetoothDevicesDiscovery() {
        wx.stopBluetoothDevicesDiscovery({
            success: res => {
                console.log(res)
            },
            fail: err => {
                console.log(err)
            }
        })
    },
    //2
    onBluetoothDeviceFound() {
        wx.onBluetoothDeviceFound((res) => {
            res.devices.forEach(device => {
                if (!device.name && !device.localName) {
                    return
                }
                const foundDevices = this.data.printerList
                const idx = inArray(foundDevices, 'deviceId', device.deviceId)
                const data = {}
                if (idx === -1) {
                    data[`printerList[${foundDevices.length}]`] = device
                } else {
                    data[`printerList[${idx}]`] = device
                }
                this.setData(data)
            })
        })
    },
    createBLEConnection(e) {
        const ds = e.currentTarget.dataset
        const deviceId = ds.deviceId
        const name = ds.name
        console.log(deviceId, this.data.checkedPrinter.deviceId)
        if (this.data.connected === true) {
            if (this.data.checkedPrinter.deviceId == deviceId && this.data.checkedPrinter.name == name) {
                this.closeBLEConnection()
                return
            }
            alert.notice('先断开当前连接的蓝牙设备')
            return
        }
        wx.showLoading({
            mask: true,
            title: '连接中...',
        })
        wx.createBLEConnection({
            deviceId,
            success: (res) => {
                console.log(res)
                this.setData({
                    connected: true,
                    checkedPrinter: {
                        name: name
                    }
                })
                this.getBLEDeviceServices(deviceId)
            }
        })
    },
    getBLEDeviceServices(deviceId) {
        var _this = this
        wx.getBLEDeviceServices({
            deviceId,
            success: (res) => {
                let serviceId = _this.filterService(res.services)
                if (serviceId != "") {
                    _this.getBLEDeviceCharacteristics(deviceId, serviceId);
                } else {
                    _this.showTip('没有找到主服务');
                    _this.closeBLEConnection(deviceId);
                }
            },
            fail: function (res) {
                _this.showTip('搜索设备服务失败');
                _this.closeBLEConnection(deviceId);
            }
        })
    },
    filterService(services) {
        let serviceId = "";
        for (let i = 0; i < services.length; i++) {
            let serverid = services[i].uuid.toUpperCase();
            if (serverid.indexOf(services_uuid[0]) != -1 ||
                serverid.indexOf(services_uuid[1]) != -1 ||
                serverid.indexOf(services_uuid[2]) != -1
            ) {
                serviceId = services[i].uuid;
                break;
            }
        }
        return serviceId;
    },
    getBLEDeviceCharacteristics(deviceId, serviceId) {
        wx.getBLEDeviceCharacteristics({
            deviceId,
            serviceId,
            success: (res) => {
                this.data.characteristicId = this.filterCharacter(res.characteristics);
                let characteristicId = this.filterCharacter(res.characteristics);
                if (this.data.characteristicId != '') {
                    let {
                        checkedPrinter
                    } = this.data
                    checkedPrinter['deviceId'] = deviceId
                    checkedPrinter['serviceId'] = serviceId
                    checkedPrinter['characteristicId'] = characteristicId
                    this.setData({
                        checkedPrinter
                    })
                    wx.showToast({
                        title: '连接成功！',
                        icon: 'none',
                        times: 500
                    })
                    wx.onBLEConnectionStateChange((result) => {
                        this.setData({
                            connected: result.connected
                        })
                    })
                } else {
                    this.showTip('获取特征值失败');
                    this.closeBLEConnection(deviceId);
                }
            },
            fail(res) {
                console.error('getBLEDeviceCharacteristics', res)
            }
        })
    },
    filterCharacter(characteristics) {
        let writeId = '';
        for (let i = 0; i < characteristics.length; i++) {
            let charc = characteristics[i];
            if (charc.properties.write) {
                writeId = charc.uuid;
                break;
            }
        }
        return writeId;
    },
    closeBLEConnection() {
        wx.closeBLEConnection({
            deviceId: this.data.checkedPrinter.deviceId,
            success: res => {
                wx.offBLEConnectionStateChange()
                this.setData({
                    connected: false,
                    checkedPrinter: {},
                    chs: [],
                    canWrite: false,
                })
                this.startBluetoothDevicesDiscovery()
            }
        })
    },
    manualScan(e) {
        console.log(e)
        var _this = this
        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['barCode'],
            success: res => {
                let e = {
                    detail: {
                        result: res.result
                    }
                }
                _this.getBoxCode(e)
            }
        })
    },
    checkPrinted(code) {
        return new Promise((resolve, reject) => {
            tss.post({
                url: tss.url("sql") + "/print_log",
                params: {
                    start_date: formatDate(subDate(new Date(), 7), "yyyy-MM-dd"),
                    end_date: formatDate(new Date(), "yyyy-MM-dd")
                },
                completion: res => {
                    if (res.failed) {
                        wx.showModal({
                            title: '提示',
                            content: '无法校验是否已打印，请人工检查',
                            showCancel: false,
                        })
                        resolve([])
                    }
                    resolve(res.data.filter(item => item.type == code))
                }
            })
        })
    },
    toLogs(e) {
        wx.navigateTo({
            url: `../order_scan_print_log/index?order_id=${e.currentTarget.dataset.id}`,
        })
    },
    //todo=>先判断使用的码类型，再按照码类型使用不同的接口，返回的数据基本一致打印无异议
    getBoxCode(e) {
        wx.showLoading({
            title: '请稍等...',
            mask: true
        })
        var _this = this;
        if (_this.data.isPrinting) {
            return
        }
        var boxNo = e.detail.result
        wx.vibrateShort({
            type: 'heavy',
            complete() {
                console.log('得到单号：', boxNo)
                tss.getJSON({
                    url: tss.url('tms') + '/order/anon/scanBackOrder',
                    params: {
                        scanCode: String(boxNo).replace(/[^\x00-\xff]|\s*/g, '')
                    },
                    completion: res => {
                        wx.hideLoading()
                        if (res.failed) {
                            wx.showModal({
                                content: res.errorMsg
                            })
                            return
                        }
                        if (!res.data.data.length) {
                            wx.showModal({
                                title: '提示',
                                content: '未获取到订单信息',
                                showCancel: false
                            })
                            return
                        }
                        var order = res.data.data[0]
                        if (!_this.data.connected) {
                            alert.notice('未连接打印机，仅输出打印进度')
                            _this.updatePrintedList(order)
                            wx.hideLoading()
                            return
                        }
                        switch (_this.data.typeIndex) {
                            case 0:
                                _this.mainPrint(order.id)
                                break;
                            case 1:
                                _this.writeLog(order, boxNo, 'WXE8')
                                _this.mainPrint(order.id)
                                break;
                            case 2:
                                console.log(order);
                                if (order.subOrders.length) {
                                    _this.checkPrinted(order.subOrders[0].sub_tcode).then(r => {
                                        if (r.length) {
                                            wx.showModal({
                                                title: '提示',
                                                content: `此子单已打印${r.length}次，是否继续打印？`,
                                                complete: (c) => {
                                                    if (c.confirm) {
                                                        _this.writeLog(order, order.subOrders[0].sub_tcode)
                                                        _this.startPlatformPrint(order, boxNo)
                                                    } else {
                                                        wx.hideLoading()
                                                    }
                                                }
                                            })
                                        } else {
                                            _this.writeLog(order, order.subOrders[0].sub_tcode)
                                            _this.startPlatformPrint(order, boxNo)
                                        }
                                    })
                                } else {
                                    _this.startPlatformPrint(order, boxNo)
                                }
                                break;
                        }
                    }
                })
            }
        })
    },
    //取得打印日志，用主单号比较可以拿到所有记录，然后再去重即可知道打印进度
    updatePrintedList(order) {
        // this.setData({
        //     curOrderId:'4962790',
        //     curSubCode:'860288608204'
        // })

        // this.writeLog()
        // await this.getOrders(4957407).then(res=>{
        //     console.log(res)
        //     order=res.data[0]
        //     wx.hideLoading()
        // })
        tss.post({
            url: tss.url("sql") + "/print_log",
            params: {
                start_date: formatDate(subDate(new Date(), 3), "yyyy-MM-dd"),
                end_date: formatDate(new Date(), "yyyy-MM-dd")
            },
            completion: res => {
                console.log(res)
                //子单
                let {
                    printedList
                } = this.data
                let index = printedList.findIndex(item => item.id == order.id)
                console.log(index)
                if (index != -1) {
                    printedList.splice(index, 1)
                }
                let e8 = Array.from(new Set(res.data.filter(item => item.type.includes(order.code)).map(item => item.type))).length + '/' + order.sub_order_num
                let platform = '0/0'
                if (order.lc_id && order.platform_subcodes && order.platform_info) {
                    let subcodes = order.platform_subcodes.split(',')
                    platform = Array.from(new Set(res.data.filter(item => item.type.includes(order.tcode)).map(item => item.type))).length + '/' + subcodes.length
                }
                let data = {
                    id: order.id,
                    code: order.code,
                    e8,
                    platform
                }
                printedList.unshift(data)
                this.setData({
                    printedList
                })
            }
        })
    },
    mainPrint(id) {
        this.setData({
            "printData.ids": id,
        }, () => {
            this.goPrintOrder(this.data.typeList[this.data.typeIndex])
        })
    },
    getLcInfo() {
        wx.showLoading({
            title: '获取平台数据中...',
            mask: true
        })
        tss.get({
            url: tss.url("") + `/api/data/sql/lc_info`,
            completion: res => {
                wx.hideLoading()
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: '获取平台信息失败，将使用默认对应模板',
                    })
                }
                this.setData({
                    lcList: res.data
                })
                console.log(this.data.lcList.filter(item => item.id == 2104))
            }
        })
    },
    //开始打印平台子单
    startPlatformPrint(info, boxNo = null) {
        var _this = this
        if (info.real_lc_id) {
            let platforms = this.data.lcList.filter(item => item.id == info['real_lc_id'])
            if (platforms.length) {
                info['real_lc_name'] = platforms[0].platform_name
            } else {
                wx.showModal({
                    title: '提示',
                    content: 'real_lc_id未获取到对应平台信息',
                    showCancel: false
                })
                return
            }
            info.platform_info = JSON.parse(info.platform_info)
            const platform = _this.data.platform_order[info.real_lc_name]
            if (!platform) {
                wx.showToast({
                    title: '暂无模版',
                    icon: 'none'
                })
                return
            }
            const {
                printData
            } = platform
            _this.setData({
                openCamera: false,
                isPrinting: true,
                lockPrinter: true
            })
            wx.showLoading({
                mask: true,
                title: '正在传输数据并打印...',
            })
            if (info.subOrders.length) {
                lc.emitEvent('platformPrintData', {
                    data: [...printData([{
                        ...info
                    }], info.subOrders[0].sub_tcode, _App.user.domain == 'D389' ? boxNo : null)],
                    type: 'platformPrintData'
                })
            } else {
                lc.emitEvent('platformPrintData', {
                    data: [...printData([{
                        ...info
                    }])],
                    type: 'platformPrintData'
                })
            }
        } else {
            if (info.wx_platform_code == null) {
                wx.showModal({
                    content: `未指定平台`
                })
            } else if (info.sub_tcode == null) {
                wx.showModal({
                    content: `未绑定平台子单`
                })
            } else {
                wx.showModal({
                    content: `未知错误`
                })
            }
            wx.hideLoading()
        }
    },
    //记录
    writeLog(order, boxNo, type = 'WX') {
        if (!order.id && !boxNo) {
            return
        }
        tss.getJSON({
            url: tss.url('') + `/tms/order/print/log`,
            params: {
                json: `[{\"order_id\":\"${order.id}\",\"type\":\"${boxNo}\",\"origin\":\"${type}\"}]`
            },
            completion: res => {
                console.log(res);
                this.updatePrintedList(order)
            }
        })
    },
    getOrders(order_id) {
        return new Promise(completion => {
            wx.showLoading({
                mask: true,
                title: '获取数据中...'
            })
            tss.query({
                url: tss.url('sql') + 'tms_order',
                params: {
                    tms_order_id: order_id,
                    addPlatformInfo: true
                },
                completion
            })
        })
    },
    onReady() {
        lc.addListener('platformPrintData', this.__wxWebviewId__.toString(), res => {
            console.log(res)
            if (res.type === 'platformPrintData') {
                setTimeout(() => {
                    let {
                        deviceId,
                        serviceId,
                        characteristicId
                    } = this.data.checkedPrinter
                    this.doWrite({
                        deviceId,
                        serviceId,
                        characteristicId
                    }, res.data)
                }, 500);
            }
        })
    },
    doWriteOther(options, idx = 0) {
        let PrintData = this.data.printData.data
        let printType = this.data.choosePrintType.code
        options.print_data = PrintData
        console.log(options)
        if (PrintData.length === 0) {
            wx.showToast({
                title: '没有数据',
                icon: 'none'
            })
            return
        }
        if (this.data.platformPrint) {
            console.log(PrintData[idx])
            this.cutCommand(PrintData[idx]).then(res => {
                console.log(res)
                this.writeBLECharacteristicValue(options, res, idx)
            })
        } else {
            wx.showLoading({
                title: '正在打印...',
                mask: true
            })
            console.log(PrintData[idx])

            // 判断客户标签换成别的
            const unprint_seq = this.data.printData.column_info && this.data.printData.column_info.indexOf('"field":"c111","value":"${pcode_seq!\'\'}"') == -1
            console.log("unprint_seq", unprint_seq)
            console.log("printType", printType)
            // wx.hideLoading()
            console.log(idx)
            console.log(this.data.PrintType, PrintData[idx], _App, idx, unprint_seq, printType)
            printDatas(this.data.PrintType, PrintData[idx], _App, idx, unprint_seq, printType).then(res => {
                console.log(res)
                this.cutCommand(res).then(res => {
                    this.writeBLECharacteristicValue(options, res, idx)
                })
            }).catch(e => {
                console.log(e)
            })
        }
    },

    doWrite(options, printData, idx = 0) {
        console.log(options)
        let PrintData = printData
        options.print_data = PrintData
        if (PrintData.length === 0) {
            wx.showToast({
                title: '没有数据',
                icon: 'none'
            })
            return
        }
        console.log(PrintData[idx])
        if (PrintData[idx].isBase64) {
            options.print_data = PrintData.map(item => item.base64)
            this.cutCommandBase64(PrintData[idx].base64).then(res => {
                this.writeBLECharacteristicValue(options, res, idx, printData)
            })

            return
        }
        this.cutCommand(PrintData[idx]).then(res => {
            console.log(res)
            this.writeBLECharacteristicValue(options, res, idx, printData)
        })
    },

    // 打印
    writeBLECharacteristicValue(options, sendData64, idx, printData, times = 1) {
        let _this = this
        if (sendData64.length >= times) {
            wx.writeBLECharacteristicValue({
                ...options,
                value: sendData64[times - 1],
                success: res => {
                    _this.writeBLECharacteristicValue(options, sendData64, idx, printData, ++times);
                },
                fail: res => {
                    _this.showTip(`writeBLECharacteristicValue fail:${res.errMsg}`);
                    _this.closeBLEConnection(options.deviceId);
                }
            })
        } else {
            if (idx + 1 < options.print_data.length) {
                idx++
                if (this.data.typeIndex == 2) {
                    this.doWrite(options, printData, idx)
                } else {
                    this.doWriteOther(options, idx)
                }
                return
            }
            wx.showToast({
                title: '打印完成！',
                icon: 'none'
            })
            this.setData({
                isPrinting: false,
                lockPrinter: false
            })
        }
    },
    cutCommand: function (data, PackageLength = this.data.PackageLength) {
        return new Promise(resolve => {
            var sendData64 = [];
            const transfer = wx.base64ToArrayBuffer(ToBase64.encode64gb2312(data))
            for (let i = 0; i < Math.ceil(transfer.byteLength / PackageLength); i++) {
                if (i == 0) {
                    sendData64[i] = transfer.slice(0, PackageLength)
                    continue
                }
                sendData64[i] = transfer.slice(i * PackageLength, (i + 1) * PackageLength)
                // sendData64[i] = wx.base64ToArrayBuffer(ToBase64.encode64gb2312(data.substr(i * PackageLength, PackageLength)));
            }
            resolve(sendData64)
        })
    },
    cutCommandBase64: function (data, PackageLength = 24) {
        return new Promise(resolve => {
            var sendData64 = [];
            for (let i = 0; i < Math.ceil(data.length / PackageLength); i++) {
                sendData64[i] = wx.base64ToArrayBuffer(data.substr(i * PackageLength, PackageLength));
            }
            resolve(sendData64)
        })
    },
    showTip: function (data, fn) {
        wx.hideLoading();
        wx.showModal({
            title: '提示',
            content: data,
            showCancel: false,
            success: res => res.confirm && fn && fn()
        })
    },
    onUnload() {
        wx.closeBluetoothAdapter();
        lc.removeListener('platformPrintData', this.__wxWebviewId__.toString());
    },
    inputBoxCode(e) {
        console.log(e)
        this.setData({
            boxCode: e.detail.value,
            inputHasContent: Boolean(e.detail.value)
        })
    },
    getInputBoxCode() {
        // let {
        //     deviceId,
        //     serviceId,
        //     characteristicId
        // } = this.data.checkedPrinter
        // this.cutCommandBase64(test).then(res => {
        //     this.writeBLECharacteristicValue({
        //         deviceId,
        //         serviceId,
        //         characteristicId
        //     }, res, 1)
        // })
        // return
        if (this.data.boxCode) {
            this.getBoxCode({
                detail: {
                    result: this.data.boxCode
                }
            })
        }
    },
    delInput() {
        this.setData({
            boxCode: "",
            inputHasContent: false
        })
    },
    chooseType(e) {
        console.log(e)
        let index = e.currentTarget.dataset.index
        this.setData({
            typeIndex: index
        })
    }
})
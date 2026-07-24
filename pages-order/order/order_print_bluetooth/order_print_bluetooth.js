const lc = require('../../../utils/listenerCenter.js')
Page({

    data: {
        printList: []
    },

    onLoad: function (options) {
        wx.showNavigationBarLoading()
    },

    onReady: function () {

    },

    onShow: function () {
        this.start()
    },

    onHide: function () {
        wx.stopBluetoothDevicesDiscovery({
            success: function (res) {},
        })
    },
    // 重新搜索
    researchBlueTooth() {
        this.setData({
            printList: []
        })
        wx.showNavigationBarLoading()
        wx.setNavigationBarTitle({
            title: '搜索中...'
        })
        this.start()
    },
    // 初始化蓝牙适配器
    start: function () {
        var _this = this;
        if (!wx.openBluetoothAdapter) {
            _this.showTip("当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。")
            return
        }
        wx.openBluetoothAdapter({
            complete: function (res) {
                _this.getBluetoothAdapterState();
            }
        })
    },
    //获取本机蓝牙适配器状态
    getBluetoothAdapterState: function () {
        var _this = this;
        wx.getBluetoothAdapterState({
            complete: function (res) {
                console.log(res)
                if (!!res && res.available) {
                    _this.startSearch();
                } else {
                    wx.hideLoading()
                    _this.showTip("请开启手机蓝牙", wx.navigateBack)
                }
            }
        })
    },
    //开始搜索
    startSearch: function () {
        var _this = this;
        wx.startBluetoothDevicesDiscovery({
            services: [],
            complete: function (res) {
                console.log(res)
                setTimeout(function () {
                    wx.getBluetoothDevices({
                        complete: function (res) {
                            console.log(res)
                            // wx.hideLoading();
                            let printList = _this.filterPrint(res.devices);
                            // 搜索成功 渲染列表
                            _this.setData({
                                printList
                            });
                            wx.hideNavigationBarLoading()
                            wx.setNavigationBarTitle({
                                title: '搜索完成',
                                success: () => {
                                    if (printList.length == 0) {
                                        wx.showToast({
                                            title: '暂未搜索到蓝牙设备,请重新搜索',
                                            icon: 'none'
                                        })
                                    }
                                }
                            })
                        }
                    });
                }, 4000)
            }
        })
    },
    filterPrint: function (list) {
        var _this = this;
        let printList = [];
        let storageList = _this.data.storageList || [];
        for (let i = 0; i < list.length; i++) {
            let base64 = wx.arrayBufferToBase64(list[i].advertisData);
            let str = Array.prototype.map.call(new Uint8Array(list[i].advertisData), x => ('00' + x.toString(16)).slice(-2)).join('');
            console.log(list[i].name.indexOf('未知'))
            // || 
            if (list[i].name != '未知设备') {
                printList.push(list[i]);
            }
            // if (str.length == 16) {
            //   let has = false;
            //   for (let j = 0; j < storageList.length; j++) {
            //     if (storageList[j].deviceId == list[i].deviceId) {
            //       has = true; break;
            //     }
            //   }
            //   if (!has) {
            //     list[i].address = str.toUpperCase()
            //     printList.push(list[i]);
            //   }
            // }
        }
        return printList;
    },
    // 进行添加连接
    connectDevice: function (res) {

        let _this = this;
        let index = res.currentTarget.id;
        let printList = _this.data.printList;
        wx.createBLEConnection({
            deviceId: printList[index].deviceId,
            success(res) {
                // 连接成功 停止搜索 并返回
                wx.stopBluetoothDevicesDiscovery({
                    success: function (res) {
                        wx.closeBLEConnection({
                            deviceId: printList[index].deviceId,
                            success: function (res) {
                                console.log(res)
                                lc.emitEvent('blueTooth', {
                                    data: printList[index]
                                })
                                wx.navigateBack()
                            },
                        })

                        // wx.navigateBack({
                        //   success:res=>{
                        //     wx.closeBLEConnection({
                        //       deviceId: printList[index].deviceId
                        //     })
                        //   }
                        // })
                    }
                })
            },
            fail(res) {
                wx.hideLoading();
                console.log(res)
                _this.showTip('连接失败');
            }
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
    }
})
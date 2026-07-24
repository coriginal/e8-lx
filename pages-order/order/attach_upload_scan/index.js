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
        this.loadData();
        console.log(_App)
        if (_App.entryParams && _App.entryParams.scene) {
            let scene = decodeURIComponent(_App.entryParams.scene)
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
        wx.showLoading({
            mask: true
        })
        let _this = this;
        tss.save({ //sign提交
            url: tss.url(`/tms/order/attach/upload/scan`),
            //type:'repair_operate',
            useCookie:true,
            params: {
                order_id: _this.data.order.id,
                tempid:_this.data.uploadList[0].tempid,
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        title: '上传失败',
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
                    title: '上传成功',
                    icon: 'none'
                })
                _this.loadData()
                _this.triggerEvent('success')
                wx.hideLoading()
            }
        })
    },
    loadData() {
        const tempid = new Date().getTime()
        let sourceType = ''
        if (_App.DomainConfig.sign_pic_camera_only && Number(_App.DomainConfig.sign_pic_camera_only.content)) {
            sourceType = 'camera'
        }
        this.setData({
            scode: "",
            showReceive: false,
            uploadList: [{
                code: 'sign',
                recordId: '-6',
                title: '附件上传：',
                urls: [],
                tempid: tempid,
                sourceType: sourceType,
            }, ]
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
        if (code.length < 4) {
            return wx.showToast({
                title: '请输入正确单号',
                icon: 'none'
            })
        }
        wx.showLoading({
            mask: true
        })
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
                tss.get({
                    url: tss.url("") + `/xdata/attach/view?ids=${order['receipt_attachids']}`,
                    completion: res => {
                        console.log("回单", res)
                        oldReceiptsImg = res?.data?.map((i, index) => {
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
                        }) || [];
                        this.setData({
                            order: order,
                            [`dataList[0].value`]: order.receive_man || '', 
                            showReceive: true
                            // "uploadList[1].urls": oldReceiptsImg.length ? oldReceiptsImg : []
                        })
                        wx.hideLoading()
                    }
                })
            }
        })
    }
})
import {
    formatDate
} from '../../utils/util'
const tss = require('../../utils/tss.js')
const _APP = getApp().globalData;


// Cpts/order_receive/index.js
Component({
    options: {
        styleIsolation: 'apply-shared',
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        show: {
            type: Boolean,
            value: false,
            observer(a, b) {
                this.observerShow(a, b)
            }
        },
        receiveItem: Object
    },

    /**
     * 组件的初始数据
     */
    data: {
        uploadList: [],
        _tempId: '',
        time: '',
        choosedType: '',
        types: ['送货签收', '自提签收'],
        choosedType2: '正常签收',
        types2: ['正常签收', '部分签收', '异常签收'],
        receive_man: ''
    },
    /**
     * 组件的方法列表
     */
    methods: {
        observerShow(newData, oldData) {
            if (newData === true) {
                const times = new Date().getTime()
                this.setData({
                    _tempId: times,
                    time: formatDate(times, 'yyyy-MM-dd hh:mm:ss'),
                    choosedType2: '正常签收',
                    receive_man: '',
                    choosedType: '',
                    remark: '',
                    urls: []
                })
                if (this.data.receiveItem) {
                    this.queryAttach(this.data.receiveItem.id)
                }
            }
        },
        queryAttach(order_id) {
            let ssr = ['SignOrder', 'Receipt'].map(i =>
                new Promise(completion =>
                    tss.query({
                        url: tss.url('ENTITY') + i,
                        params: {
                            order_id,
                            showAttach: true
                        },
                        completion
                    })
                ))
            // 查询签收表和回单表
            Promise.all(ssr).then(res => {
                console.log(res)

                let uploadList = []
                // 如果记录为空则新增一条
                const _result = res.map((i, index) =>
                    new Promise(completion => {
                        if (i.data.length == 0) {
                            tss.post({
                                url: tss.url('ENTITY') + ['SignOrder', 'Receipt'][index],
                                params: {
                                    order_id: this.data.receiveItem.id,
                                    showAttach: true
                                },
                                completion
                            })
                        } else {
                            completion({
                                data: i.data[0]
                            })
                        }
                    }))

                Promise.all(_result).then(result => {
                    result.forEach((item, _idx) => {
                        console.log(item)
                        switch (_idx) {
                            case 0: {
                                uploadList.push({
                                    code: 'sign',
                                    recordId: '-7',
                                    title: '签收面单：',
                                    itemId: item.data.id,
                                    urls: []
                                })
                            };
                            break;
                        case 1: {
                            uploadList.push({
                                code: 'rcode',
                                recordId: '-3',
                                title: '回单：',
                                itemId: item.data.id,
                                urls: []
                            })
                        };
                        break;
                        }
                    })

                    this.setData({
                        uploadList,
                        showPicUpload: true
                    })
                })
            })
        },
        showReceiveType2() {
            wx.showActionSheet({
                itemList: this.data.types2,
                success: ({
                    tapIndex
                }) => {
                    this.setData({
                        choosedType2: this.data.types2[tapIndex]
                    })
                }
            })
        },
        handleReceiver() {
            if (this.data.receiveItem.receive_man) {
                this.setData({
                    receive_man: this.data.receiveItem.receive_man
                })
                return
            }
            wx.showToast({
                title: '收件人为空',
                icon: 'none'
            })
        },
        showReceiveType() {
            wx.showActionSheet({
                itemList: this.data.types,
                success: ({
                    tapIndex
                }) => {
                    this.setData({
                        choosedType: this.data.types[tapIndex]
                    })
                }
            })
        },
        chooseImg(e) {
            const {
                code
            } = e.currentTarget.dataset
            const idx = this.data.uploadList.findIndex(i => i.code == code)
            wx.chooseImage({
                count: 3 - this.data.uploadList[idx].urls.length,
                success: res => {
                    this.setData({
                        [`uploadList[${idx}].urls`]: this.data.uploadList[idx].urls.concat(res.tempFilePaths)
                    })
                    this.doUploadPicture(idx, res.tempFilePaths)
                }
            })
        },
        doUploadPicture(idx, urls) {
            const item = this.data.uploadList[idx]
            const {
                title,
                code,
                ...other
            } = item
            tss.uploadImagesAsync({
                ...other,
                uName: _APP.user.uName,
                uToken: _APP.user.uToken,
                filePaths: urls,
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        wx.showModal({
                            content: res.errorMsg
                        })
                        return
                    }
                }
            })
        },
        forSubmit(e) {
            if (!this.data.receiveItem.id) {
                return
            }
            wx.showLoading({
                mask: true
            })
            // this.uploadImg().then(res => {
            tss.post({
                url: tss.url('/tms/order/sign'),
                params: {
                    order_id: this.data.receiveItem.id,
                    tempid: this.data._tempId,
                    ...e.detail.value
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
                    wx.showToast({
                        title: '签收成功',
                        icon: 'none'
                    })
                    this.triggerEvent('success')
                    wx.hideLoading()
                }
            })
            // })
        },
        onClose() {
            this.triggerEvent('close')
        }
    }
})
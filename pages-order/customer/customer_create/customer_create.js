const tss = require('../../../utils/tss.js');
const _APP = getApp().globalData;
const lc = require('../../../utils/listenerCenter.js');
const alert = require('../../../utils/alert.js')
Page({

    data: {
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
        nextId: 0,
        region: [],
        needSp: false,
        common: {
            settle_type: '现结',
            avtive: 1,
            origin: '公司自营',
            type: '客户',
            if_path: 1,
            fee_visible: 0,
            unreceived_weekend: 0,
            form: 0,
            service_mode: '派送'
        },
        list: [{
                title: '客户名称 ：',
                code: 'name',
                defaultInput: '请填写客户名称',
                value: '',
                required: true
            },
            {
                title: '联系方式 ：',
                code: 'phone',
                defaultInput: '请输入客户联系方式',
                value: '',
                required: true
            },
        ],
        otherList: [
            //   {
            //   title: '别名 ：',
            //   code: 'nick_name',
            //   defaultInput: '多个请用逗号分隔',
            //   value: '',
            //   required: false
            // }
        ],
        textarea: "例子：客户名称 18888888888 浙江省杭州市江干区8号大街88号"
    },
    addrFinished(e) {
        this.data.inputAddr = e.detail.value
    },
    menuClick(e) {
        let code = e.currentTarget.id
        this[code]();
    },
    addrInput() {
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
                    this.setData({
                        region: [data.province || '', data.city || '', data.district || '', data.town || ''],
                        street_no: data.street_no || '',
                        ["list[0].value"]: data.name || '',
                        ["list[1].value"]: data.phone || ''
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
    aiAddressParse() {
        if (this.data.inputAddr) {
            tss.post({
                url: tss.url('/ai/api/address/parse'),
                params: {
                  address: this.data.inputAddr
                },
                completion: res => {
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
                    this.setData({
                        region: [data.province || '', data.city || '', data.district || '', data.town || ''],
                        street_no: data.street_no || '',
                        ["list[0].value"]: data.name || '',
                        ["list[1].value"]: data.phone || ''
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
    onLoad() {
        console.log(_APP)
        this.getCustomerSp();
    },
    getCustomerSp() {
        tss.query({
            url: tss.url('/tms/customer/needSp'),
            completion: res => {
                const {
                    data,
                    failed
                } = res;
                if (failed) {
                    return false
                }
                // 新增客户需要审批
                this.setData({
                    needSp: !!data
                })
            }
        })
    },

    formSubmit(e) {
        wx.showLoading({
          mask:true
        })
        if (e.detail.value.name == '' || e.detail.value.phone == '') {
            wx.hideLoading()
            wx.showToast({
                title: '请完善必填信息！',
                icon: 'none'
            })
            return
        }
        // let [province='', city='', district='', town=''] = [...this.data.region,]
        let params = {
            clerk: _APP.user.uName,
            address: [...this.data.region, e.detail.value.street_no || ''].join(''),
            ...e.detail.value,
            ...this.data.common
        }
        console.log(e.detail.value, params)
        tss.post({
            url: tss.url('') + '/tms/customer',
            params,
            completion: res => {
                wx.hideLoading()
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg
                    })
                    return
                }
                this.successCreate(res.data, params)
            }
        })
    },

    successCreate(data, params) {
        if (this.data.needSp) {
            // 需要审批
            wx.showModal({
                title: "新增成功",
                content: "新增客户需要前往电脑进行审批！",
                showCancel: false,
                success: () => {
                    wx.navigateBack();
                }
            })
            return
        }

        if (data.id) {
            let _backData = {
                id: data.id,
                settle_type: data.settle_type,
                name: data.name,
                phone: data.phone
            }
            lc.emitEvent('orderInfo', {
                type: 'customerInfo',
                data: _backData
            })
            wx.navigateBack()
        }
    },
    formClear() {

    },
    // 打开行政区划选择列表
    onOpen() {
        this.setData({
            visible: true
        })
    },

    onClose() {
        this.setData({
            visible: false
        })
    },

    onChange(e) {
        this.setData({
            value_addr: e.detail.value,
            region: e.detail.done && e.detail.options.map((n) => n.label)
        })
    }
})
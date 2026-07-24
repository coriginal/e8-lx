import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')
const app = getApp().globalData

Page({

    data: {
        subOrders: [],
        v: [{
            title: '长(cm)',
            code: 'long'
        }, {
            title: '宽(cm)',
            code: 'width'
        }, {
            title: '高(cm)',
            code: 'height'
        }, {
            title: '件数',
            code: 'c_amount'
        }],
        volumeList: [],
        v_list_value: [{
            long: '',
            width: '',
            height: '',
            amount: '',
            volume: ''
        }],
        showMark: app.user.domain == 'D1005'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    goVolumeComputed(e) {
        const {
            id
        } = e.currentTarget;
        this.setData({
            backVolumeIndex: id
        })
        wx.navigateTo({
            url: '../order_cargo_computed/order_cargo_computed',
        })
    },
    addVolumeItem(e) {
        const {
            index
        } = e.currentTarget.dataset;
        let {
            long,
            width,
            height,
            c_amount,
            volume
        } = this.data.v_list_value[index]
        let {
            volumeList
        } = this.data
        if (long && width && height && c_amount && volume) {
            volumeList[index] = volumeList[index] ? volumeList[index].concat({
                long,
                width,
                height,
                c_amount,
                volume
            }) : [{
                long,
                width,
                height,
                c_amount,
                volume
            }];
            console.log("数组变化",volumeList[index].length)
            if (volumeList[index].length) {
                let volume = volumeList[index].reduce((a, b) => {
                    a += Number(b.volume * 1000);
                    return a
                }, 0);
                /*let amount = volumeList[index].reduce((a,b)=>{
                    a += Number(b.c_amount);
                    return a
                },0)*/
                this.setData({
                    [`subOrders[${index}].volume`]: (volume / 1000).toFixed(3),
                    //[`subOrders[${index}].amount`]: amount
                })
                if (getApp().globalData.DomainConfig.auto_specs && getApp().globalData.DomainConfig.auto_specs.content == "1") {
                    let specs = [];
                    console.log(volumeList)
                    volumeList[index].forEach((item) => {
                        specs.push(item.long + "*" + item.width + "*" + item.height + "*" + item.c_amount)
                    })
                    this.setData({
                        [`subOrders[${index}].specs`]: specs.join('+')
                    })
                    console.log("当前值",this.data.subOrders)
                }
            }
            this.setData({
                volumeList,
                [`v_list_value[${index}]`]: {
                    long: '',
                    width: '',
                    height: '',
                    c_amount: '',
                    volume: ''
                }
            })
        }
    },
    computedListVolume(e) {
        let {
            name,
            index
        } = e.currentTarget.dataset
        console.log(e)
        console.log(name)
        if (name == 'c_amount') {
            if (e.detail.value == '') {
                this.setData({
                    [`v_list_value[${index}].${name}`]: '',
                    [`v_list_value[${index}].volume`]: 0
                })
                return
            }
            if (Number(e.detail.value) <= 0) {
                wx.showModal({
                    title: '提示',
                    content: '至少为1件',
                    showCancel: false
                })
                this.setData({
                    [`v_list_value${index}.${name}`]: 1
                })
                this.computedListVolume({
                    detail: {
                        value: 1
                    },
                    currentTarget: {
                        dataset: {
                            type: "c_amount"
                        }
                    }
                })
                return
            }
        } else {
            if (e.detail.value == '') {
                return
            }
        }
        this.setData({
            [`v_list_value[${index}].${name}`]: Number(e.detail.value)
        })
        console.log(this.data.v_list_value)
        let {
            long,
            width,
            height,
            c_amount
        } = this.data.v_list_value[index]
        if (long && width && height && c_amount) {
            this.setData({
                [`v_list_value[${index}].volume`]: ((long * width * height * c_amount) / 1000000).toFixed(3)
            })
        }

    },
    onReady() {
        this.setData({
            weight_unit: getApp().globalData.DomainConfig.weight_unit ? (getApp().globalData.DomainConfig.weight_unit.content == "kg" ? "千克" : "吨") : "千克"
        })
        lc.addListener("back-volume", this.__wxWebviewId__.toString(), res => {
            console.log(res)
            const {
                value
            } = res;
            this.setData({
                [`subOrders[${this.data.backVolumeIndex}].volume`]: value
            })
        })
    },
    onLoad: function (options) {
        let subOrders = JSON.parse(options.subOrders || "[]")
        if (subOrders.length == 0) {
            subOrders
                .push({
                    amount: '',
                    weight: '',
                    volume: '',
                    pack: '',
                    cargo: '',
                    code: ''
                })
        }
        this.setData({
            subOrders,
            type: options.type || 'cargo'
        })
    },
    // 确认子单信息并返回
    formSubmit(e) {
        console.log(this.data.subOrders)
        let subOrders = this.data.subOrders
        let getMessage = (form) => [form.cargo || '', form.amount ? `${form.amount}件` : '', form.weight ? `${form.weight}kg` : '', form.volume ? `${form.volume}m³` : '', form.pack || ''].filter(i => i).join(' ')

        lc.emitEvent('orderInfo', {
            type: this.data.type,
            data: {
                subOrders,
                message: subOrders.length == 1 ? getMessage(subOrders[0]) : `包含子单${subOrders.length}份 点击查看`
            }
        })
        wx.navigateBack()
    },
    // 添加子单
    addSubOrder() {
        this.data.subOrders
            .push({
                id: '',
                amount: '',
                weight: '',
                volume: '',
                pack: '',
                cargo: '',
                code: ''
            })
        this.data.v_list_value.push({
            long: '',
            width: '',
            height: '',
            amount: '',
            volume: ''
        })
        this.setData({
            subOrders: this.data.subOrders,
            v_list_value: this.data.v_list_value
        })
    },
    // 获取数据
    changeValue(e) {
        let {
            index,
            id
        } = e.currentTarget.dataset
        this.data.subOrders[index][id] = e.detail.value
    },
    // 删除子单
    deleteSubOrder(e) {
        const index = e.currentTarget.id
        this.data.subOrders.splice(index, 1)
        this.setData({
            subOrders: this.data.subOrders
        })
    }
})
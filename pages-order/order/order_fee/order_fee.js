import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')
const _App = getApp().globalData
import {
    getList,
    fieldMap
} from './fee.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //非必要不刺激用户感官
        hasMark: false
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        const {
            data
        } = await this.queryConfigForCode()
        const [{
            content
        }] = data
        let list = JSON.parse(content)
            .filter(i => i.belong_title == '增值服务' && !i.hidden && i.field !== 'arrive_pay');
        if (_App.DomainConfig.vas_seq && _App.DomainConfig.vas_seq.content) {
            let vas_seq = JSON.parse(_App.DomainConfig.vas_seq.content);
            list.forEach(item => {
                let idx = vas_seq.findIndex(i => i.code === item.field)
                if (idx !== -1) {
                    item['seq'] = vas_seq[idx].seq;
                }
            })
            let _list1 = list.filter(item => item.seq);
            let _list2 = list.filter(item => !item.seq);
            _list1.sort((a, b) => a.seq - b.seq);
            list = _list1.concat(_list2);
        }

        let feeList = {};
        list.forEach((item, idx) => {
            feeList[item.field] = {
                title: item.title,
                placeholder: Boolean(item.required) ? '必填' : '选填',
                value: '',
                type: this.dealType(item.type),
                children: this.dealChild(item.type, item.value_list),
                required: Boolean(item.required),
                mark: false
            }
        })
        let fromFee = JSON.parse(options.data || "{}") || {}
        // let list = getList()
        for (let key1 in fromFee) {
            for (let key2 in feeList) {
                if (key1 == key2) {
                    if (feeList[key2].children.length > 0) {
                        feeList[key2].children.forEach(item => {
                            if (item.name == fromFee[key1]) {
                                item.checked = true
                            }
                        })
                    } else {
                        feeList[key2].value = fromFee[key1]
                    }
                }
            }
        }
        this.setData({
            list: feeList,
            type: options.type || 'fee',
        })
    },
    dealChild(type, list) {
        if (type == 'checkbox') {
            return [{
                name: '是',
                checked: ''
            }, {
                name: '否',
                checked: ''
            }]
        } else {
            return list ? list.map(i => ({
                ...i,
                check: ''
            })) : []
        }
    },
    dealType(type = 'input') {
        return fieldMap.get(type)
    },
    chooseFeeItem(e) {
        const {
            item,
            listItem
        } = e.target.dataset;
        let _list = this.data.list[listItem]
        for (let i = 0; i < _list.children.length; i++) {
            if (item.name == _list.children[i].name && !item.checked) {
                _list.children[i].checked = true
            } else {
                _list.children[i].checked = false
            }
        }
        let writeList = `list.${listItem}.children`;
        let mark = `list.${listItem}.mark`
        this.setData({
            [writeList]: _list.children,
        })
        this.hasRequired()
    },
    formSubmit() {
        let aoe = {
            ...{},
            ...this.data.list
        };
        let data = {};
        let _fees = [];
        let hasRequired = this.hasRequired()
        if (hasRequired.hasRequired) {
            wx.showModal({
                showCancel: false,
                content: `${hasRequired.filed}未填写！`
            })
            this.setData({
                hasMark: true
            })
            return
        }
        for (let key in aoe) {
            const checked = aoe[key].children.filter(item => item.checked)
            if (aoe[key].value) {
                aoe[key] = {
                    code: key,
                    title: aoe[key].title,
                    value: aoe[key].value
                }
                _fees.push(`${aoe[key].title}:${aoe[key].value}`)
            } else if (checked.length > 0) {
                const [data] = checked.map(i => ({
                    title: aoe[key].title,
                    code: key,
                    value: i.name
                }))
                aoe[key] = {
                    code: data.code,
                    title: data.title,
                    value: data.value
                }
                _fees.push(`${data.title}:${data.value}`)
            } else {
                delete aoe[key]
            }
        }
        for (let key in aoe) {
            data[aoe[key].code] = aoe[key].value
        }
        lc.emitEvent('orderInfo', {
            type: this.data.type,
            data: {
                ...data,
                _fees
            }
        })
        wx.navigateBack()
    },
    inputValue(e) {
        const {
            id
        } = e.currentTarget
        this.setData({
            [`list.${id}.value`]: e.detail.value
        })
        this.hasRequired()
    },
    codInput(e) {
        this.setData({
            cod: Number(e.detail.value)
        })
    },
    arrivePayInput(e) {
        this.setData({
            arrive_pay: Number(e.detail.value)
        })
    },
    // 是否自定义单号配置
    queryConfigForCode() {
        return new Promise(completion => {
            tss.get({
                url: tss.url('data') + 'xcx_order_write',
                completion
            })
            // tss.query({
            //   url: tss.url('ENTITY') + 'DomainConfig',
            //   params: {
            //     code: 'order_write_required_fields'
            //   },
            //   completion
            // })
        })
    },
    hasRequired() {
        let {
            list
        } = this.data, notHasValue = [],
            reData = (i) => {
                return {
                    hasRequired: true,
                    filed: i
                }
            },
            mark = (i, value) => {
                this.setData({
                    [`list.${i}.mark`]: value
                })
            }
        for (let i in list) {
            if (list[i].required) {
                switch (list[i].type.fieldType) {
                    case "input":
                        if (!list[i].value) {
                            notHasValue.push(list[i])
                            mark(i, true)
                        } else {
                            mark(i, false)
                        }
                        break;
                    default:
                        if (list[i].children.filter(item => {
                                return item.checked
                            }).length == 0) {
                            notHasValue.push(list[i])
                            mark(i, true)
                        } else {
                            mark(i, false)
                        }
                        break;
                }
            }
        }
        if (notHasValue.length == 0) {
            return {
                hasRequired: false
            }
        } else {
            return reData(notHasValue[0].title)
        }
    }
})
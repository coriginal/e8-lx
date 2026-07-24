const lc = require('../../../../utils/listenerCenter.js')
const tss = require('../../../../utils/tss.js')
import {
    formatDate
} from '../../../../utils/util.js'
import user from '../../../../utils/user.js'
const alert = require('../../../../utils/alert.js')
const PC = getApp().globalData

Page({

    /**
     * 页面的初始数据
     */
    data: {
        form: {},
        attachURLs: [],
        id: '',
        type: '',
        wfstatus: '',
        mystatus: '',
        opinion: '',
        ud_phred: 'false',
        recordid: '',
        define: [],
        ud_show: '',
        title: '',
        requiredCol: {},
        showmodal: false,
        notice_content: '',
        regCol: {},
        fileCol: {},
        need_alert: false,
        wf_logs: [],
        alert_phone: '',
        color: getApp().globalData.btnColor || '#224b9b'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        if (PC.tx_muban_id) {
            this.setData({
                need_alert: true
            })
        }
        wx.showLoading({
            title: '加载中',
        })
        const _this = this;
        if (options.pid) {
            this.getDefine(options.recordid)
                .then(function (res) {
                    for (var i = 0; i < res.length; i++) {
                        const item = res[i]
                        if (item.defaultValue && item.defaultValue.indexOf('xxx') >= 0) {
                            item.qhq = true
                        }
                        if (item.code.indexOf('wf_') == 0) {
                            item.wfeditable = true
                        }
                        if ((item.type == 'date' || item.type == 'datetime') && item.defaultValue) {
                            var today = new Date();
                            const day = item.defaultValue;
                            if ((/today[\s]*-/gi).test(day)) {
                                var delta = parseInt(day.split("-")[1]);
                                today.setDate(today.getDate() - delta);
                            } else if ((/today[\s]*\+/gi).test(day)) {
                                var delta = parseInt(day.split("+")[1]);
                                today.setDate(today.getDate() + delta);
                            } else if ('cur_year_01' == day) {
                                today = new Date(today.getYear() + 1900, 0, 1)
                            } else if ('cur_month_01' == day) {
                                today = new Date(today.getYear() + 1900, today.getMonth(), 1)
                            } else if ('cur_week_01' == day) {
                                var weekday = today.getDay() || 7; //获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
                                today.setDate(today.getDate() - weekday + 1)
                            } else {
                                today = item.defaultValue
                            }
                            item.defaultValue = formatDate(new Date(today), 'yyyy-MM-dd') + (item.type == "datetime" ? " 00:00:00" : "");
                        }
                        if (!item.option) {
                            _this.data.form[item.code] = (item.defaultValue && !item.qhq) ? item.defaultValue : '';
                        }
                        if (item.nullable == 'true') {
                            delete item.nullable;
                        }
                        if (item.nullable && !item.wfeditable && !item.qhq) {
                            _this.data.requiredCol[item.code] = item.label;
                        }
                        if (item.checkReg) {
                            _this.data.regCol[item.code] = {
                                value: item.checkReg,
                                name: item.label,
                                errorMsg: item.errorMsg
                            };
                        }
                        if (item.options) {
                            item.options = item.options.codes.split('|')
                            for (var j = 0; j < item.options.length; j++) {
                                item.options[j] = {
                                    name: item.options[j]
                                }
                            }
                        }
                        if (item.jsonUrl) {
                            var a = item
                            _this.urlGetData(item.jsonUrl)
                                .then(function (r) {
                                    _this.init(res, options)
                                    wx.hideLoading()
                                })
                        } else if (i == res.length - 1) {
                            _this.init(res, options)
                            wx.hideLoading()
                        }
                    }
                })
        } else {
            const define = getApp().globalData.wf_define
            this.init(define, options)
        }
        lc.addListener(lc.event.refresh, this.__wxWebviewId__.toString(), res => {
            this.getData(this.data.id)
        })

    },
    init: function (define, options) {
        let num = 0
        console.log('before', define)
        if (options.recordid == '122') {
            define = define.slice(0, 8).concat([{
                label: '订单收入',
                code: 'order_income',
                type: 'number',
                width: '60',
                show: 'true'
            }, {
                label: '订单成本',
                code: 'order_cost',
                type: 'number',
                width: '60',
                show: 'true'
            }, {
                label: '毛利率',
                code: 'gross_profit',
                type: 'number',
                width: '60',
                show: 'true'
            }]).concat(define.slice(8, 24))
        }
        for (var i = 0; i < define.length; i++) {
            num = Math.max(define[i].label.length, num)
            if (define[i].nullable == 'true') {
                delete define[i].nullable;
            }
            if (define[i].nullable && define[i].wfeditable) {
                this.data.requiredCol[define[i].code] = define[i].label;
            }
            if (define[i].type == 'file') {
                this.data.fileCol[define[i].code] = define[i].label;
            }
        }
        this.setData({
            recordid: options.recordid,
            id: options.id,
            type: options.type,
            mystatus: options.mystatus,
            title: options.title,
            define: define,
            ud_show: 'ud_show' + num
        })
        console.log(define)
        this.getData(options.id)
    },
    onUnload: function () {
        lc.removeListener(lc.event.refresh, this.__wxWebviewId__.toString())
    },
    getData: function (id) {
        wx.showLoading({
            title: '数据加载中'
        })
        const tbName = this.data.recordid
        tss.get({
            url: tss.recordURLs(tbName).GET,
            itemId: id,
            completion: res => {
                wx.hideLoading()
                if (res.failed) {
                    alert.error()
                    reject()
                    return
                }
                console.log('data:', res)
                if (this.data.recordid == '122') {
                    console.log(this.data.type)
                    let data = `?code=${res.data.code}`
                    switch (this.data.type) {
                        case 'submit':
                            data += '&my_applier=true'
                            break;
                        case 'approval':
                            switch (this.data.mystatus) {
                                case 'wait':
                                    data += '&my_wait=true'
                                    break;
                                case 'done':
                                    data += '&my_approved=true'
                                    break;
                                case 'copyto':
                                    data += '&my_cc=true'
                                    break;
                            }
                            break;
                    }
                    tss.get({
                        url: tss.url('') + '/api/data/sql/tms_sp_order_fee' + data,
                        completion: result => {
                            if (result.failed) return
                            console.log(result)
                            if(result.data.length==0){
                                let {define}=this.data
                                define=(define.slice(0,8)).concat(define.slice(11,27))
                                console.log(define)
                                this.setData({
                                    define
                                })
                                return
                            }
                            let {
                                order_income,
                                order_cost,
                                gross_profit
                            } = result.data[0]
                            Object.assign(res.data, {
                                order_income,
                                order_cost,
                                gross_profit:Math.round(gross_profit*10000)/100+'%'
                            })
                            this.setData({
                                form:res.data
                            })
                            console.log(res.data)
                        }
                    })
                }
                var is_urge = false;
                for (var i = 0; i < res.data.wf_logs.length; i++) {
                    const item = res.data.wf_logs[i];
                    const pt = item.processTime
                    if (pt) {
                        item.processTime = formatDate(pt, 'MM-dd hh:mm')
                        if ((item.processorCode == user.uName || item.processorCode == user.mobile) && this.data.mystatus == 'wait') {
                            this.setData({
                                mystatus: 'done'
                            })
                        }
                    } else if (!is_urge && PC.cp_muban_id) {
                        item['is_urge'] = true;
                        is_urge = true;
                    }
                    if (!pt && (item.processorCode == user.uName || item.processorCode == user.mobile) && this.data.mystatus == 'done') {
                        this.setData({
                            mystatus: 'wait'
                        })
                    }
                }
                for (var i = 0; i < res.data.wf_msgs.length; i++) {
                    var item = res.data.wf_msgs[i];
                    item.sendTime = formatDate(new Date(item.sendTime), 'MM-dd hh:mm')
                }
                var _urls = [];
                for (var i = 0; i < res.data.attachList.length; i++) {
                    const item = res.data.attachList[i];
                    const url = tss.url('download') + `${item.id}?uName=${user.uName}&uToken=${user.uToken}`;
                    _urls.push({
                        url: url,
                        type: item.type,
                        name: item.name,
                        id: item.id
                    })
                }
                for (var key in res.data) {
                    if (this.data.fileCol[key]) {
                        var content = res.data[key];
                        var content_urls = [];
                        if (content) {
                            for (var i = 0; i < content.split(',').length; i++) {
                                var item = content.split(',')[i].split('#');
                                content_urls.push({
                                    url: tss.url('download') + item[item.length - 1] + `?uName=${user.uName}&uToken=${user.uToken}`,
                                    type: 1,
                                    name: item[i],
                                    id: item[item.length - 1]
                                })
                            }
                        }
                        res.data[key] = content_urls;
                    }
                }
                this.setData({
                    form: res.data,
                    attachURLs: _urls,
                    wfstatus: res.data.wfstatus
                })
            }
        })
        wx.setNavigationBarTitle({
            title: this.data.title + '详情'
        })
    },
    submit: function (e) {
        const status = e.detail.target.dataset.status
        const opinion = e.detail.value.opinion
        if (status == '驳回' && !opinion) {
            alert.notice('请填写审批意见')
            this.setData({
                ud_phred: 'true'
            })
            return
        } else if (status == '修改') {
            wx.navigateTo({
                url: `../workflow/index?hideIconTab=true&itemid=${this.data.form.id}&recordid=${this.data.recordid}`,
            })
            return
        } else if (status == '转审') {
            wx.navigateTo({
                url: `../transfer/index?itemid=${this.data.form.id}&recordid=${this.data.recordid}`,
            })
            return
        }
        const obj = Object.assign(this.data.form, e.detail.value)
        for (var key in obj) {
            if (!obj[key] && key in this.data.requiredCol) {
                alert.notice(this.data.requiredCol[key] + '不能为空')
                wx.hideLoading()
                return
            } else if (key in this.data.fileCol && obj[key].length) {
                var content = [];
                for (var i = 0; i < obj[key].length; i++) {
                    content.push(obj[key][i].name + '#' + obj[key][i].id)
                }
                obj[key] = content.join(',')
            } else if (!obj[key] || key == 'id') {
                delete obj[key]
            }
        }
        let _url, type = '';
        alert.notice('是否确认' + status + '此申请？', {
            text: '是',
            handler: () => {
                if (status == '驳回') {
                    _url = 'reject'
                } else if (status == '通过') {
                    _url = 'approve'
                } else if (status == '撤回') {
                    _url = 'cancel'
                } else if (status == '重新提交') {
                    _url = 'reapply';
                    type = 'reapply'
                }
                this.changestatus(_url, obj, type)
            }
        }, {
            text: '否',
            handler: () => {
                return
            }
        })
    },
    changestatus: function (_url, obj, type) {
        for (var key in obj) {
            if (!obj[key]) {
                delete obj[key]
            }
        }
        wx.showLoading({
            title: '正在提交'
        })
        const tbName = this.data.recordid
        tss.save({
            url: tss.url('xdata') + _url + '/' + tbName,
            params: Object.assign({
                id: this.data.id
            }, obj),
            completion: res => {
                wx.hideLoading()
                if (res.failed) {
                    alert.error(res.errorMsg)
                    return
                }
                if (type == 'reapply') {
                    alert.notice('重新提交成功，是否前往修改此申请？', {
                        text: '是',
                        handler: () => {
                            wx.navigateTo({
                                url: `../workflow/index?hideIconTab=true&itemid=${this.data.id}&status=fix&recordid=${this.data.recordid}`,
                            })
                        }
                    }, {
                        text: '否',
                        handler: () => {
                            lc.emitEvent(lc.event.refresh)
                            wx.navigateBack()
                        }
                    })
                } else {
                    if (getCurrentPages().length == 1) {
                        wx.reLaunch({
                            // url: '../../../tabBar/worktable/index',
                            url: '../../workflows/index',
                            complete: function () {}
                        })
                    } else {
                        lc.emitEvent(lc.event.refresh)
                        wx.navigateBack()
                    }
                }
            }
        })
    },
    pickerChange: function (e) {
        const field = e.target.dataset.field;
        const key = 'form.' + field;
        const index = e.target.dataset.index;
        const type = e.target.dataset.type;
        var value = e.detail.value;
        const getnext = e.target.dataset.getnext;
        if (type != 'date') {
            value = this.data.define[index].options[value].name
        }
        this.setData({
            [key]: value
        })
        if (getnext) {
            const nextcol = getnext.split('(^')[1].split('^')[0];
            const url = getnext.split(',')[1].split('^')[1];
            const param = getnext.split(',')[2].split('^')[1];
            this.data.form[nextcol] = ''
            let _url, symbol = '?';
            if (url.indexOf('?') > -1) {
                symbol = '&'
            }
            _url = url + symbol + param + '=' + value
            const _this = this
            this.urlGetData(_url)
                .then(function (r) {
                    const define = _this.data.define
                    for (var i = 0; i < define.length; i++) {
                        if (define[i].code == nextcol) {
                            define[i].options = r
                            break;
                        }
                    }
                    _this.setData({
                        define: define,
                        form: _this.data.form
                    })
                })
        }
    },

    getDefine: function (recordid) {
        return new Promise((resolve, reject) => {
            tss.getJSON({
                url: tss.url('xdata') + 'define/' + recordid,
                completion: res => {
                    if (res.failed) {
                        alert.error()
                        completion && completion()
                        reject()
                        return
                    }
                    this.data.title = res.data[5]
                    resolve(res.data[0])
                }
            })
        })
    },
    urlGetData: function (url) {
        var url = url.replace('auth/', '')
        return new Promise((resolve, reject) => {
            tss.query({
                url: PC.app_host + url,
                completion: res => {
                    if (res.failed) {
                        alert.error()
                        completion && completion()
                        reject()
                        return
                    }
                    resolve(res.data)
                }
            })
        })
    },
    openMsgDlg: function (e) {
        const key = e.target.dataset.key;

        if (key == 'showalertmodal') {
            var obj = {},
                logs = [];
            for (var i = 0; i < this.data.form.wf_logs.length; i++) {
                var item = this.data.form.wf_logs[i];
                if (!obj[item.processorCode]) {
                    logs.push(item);
                    obj[item.processorCode] = '1';
                }
            }
            this.setData({
                wf_logs: logs
            })
        }
        this.setData({
            [key]: true
        })
    },
    clickCell: function (e) {
        const phone = e.target.dataset.phone;
        for (var i = 0; i < this.data.wf_logs.length; i++) {
            var item = this.data.wf_logs[i];
            if (item.processorCode == phone) {
                this.data.alert_phone = phone
                item.selected = 1
            } else {
                item.selected = '';
            }
        }
        this.setData({
            wf_logs: this.data.wf_logs
        })
    },
    sendAlertMsg: function (e) {
        var phone = this.data.alert_phone;
        if (phone) {
            this.setData({
                showalertmodal: false
            })
            tss.query({
                url: tss.url('data') + 'gzh_bind',
                params: {
                    phone: phone
                },
                completion: res => {
                    if (res.failed) {
                        alert.error()
                        return
                    }
                    const _this = this;
                    if (res.data) {
                        if (res.data.length) {
                            sendMsg()
                        } else {
                            tss.query({
                                url: tss.url('data') + 'xcx_unionid',
                                params: {
                                    phone: phone
                                },
                                completion: res => {
                                    console.log(res)
                                    if (res && res.data && res.data[0] && res.data[0].unionid) {
                                        sendMsg(res.data[0].unionid)
                                    } else {
                                        alert.notice('该账号未关注公众号，无法催批')
                                    }
                                }
                            })
                        }

                        function sendMsg(unionid) {
                            console.log(unionid)
                            const form = _this.data.form;
                            var data = {
                                first: {
                                    value: user.cnName + '提醒您查看' + (form.code || '') + '流程'
                                },
                                keyword1: {
                                    value: form.applier
                                },
                                keyword2: {
                                    value: _this.data.title
                                },
                                keyword3: {
                                    value: form.wfstatus
                                },
                                remark: {
                                    value: '请点击进入小程序查看',
                                    color: '#173177'
                                }
                            }
                            let p = {
                                recordid: _this.data.recordid,
                                id: _this.data.id,
                                mystatus: 'wait',
                                type: 'approval',
                                title: _this.data.title
                            }
                            var miniprogram = {
                                appid: PC.app_id,
                                pagepath: 'pages/redirect-work/index?pid=13,recordid=' + _this.data.recordid + ',id=' + _this.data.id + ',mystatus=wait,type=approval,title=' + _this.data.title
                                // pagepath:'pages/redirect/redirect?pid=0&params=' + JSON.stringify(p)
                                // pagepath:'pages/redirect/redirect?pid=&recordid=' + this.data.recordid + '&id=' + this.data.id + '&mystatus=wait&type=approval&title=' + this.data.title
                            }
                            tss.sendGZHMsg({
                                params: {
                                    appid: PC.gzh_appid,
                                    phone: phone,
                                    template_id: PC.tx_muban_id,
                                    data: data,
                                    miniprogram: miniprogram,
                                    unionid: unionid || ''
                                },
                                completion: res => {
                                    if (res.data && res.data.code == 'success') {
                                        alert.notice('已发送流程审批提醒至公众号')
                                    } else {
                                        alert.notice('发送失败。' + (res.errorMsg || ''))
                                    }
                                }
                            })
                        }
                    }
                }
            })

        } else {
            alert.notice('请先选择需要提醒的人员')
        }
    },
    urge_sp: function (e) {
        const pc = e.currentTarget.dataset.processorcode;
        tss.query({
            url: tss.url('data') + 'gzh_bind',
            params: {
                phone: pc
            },
            completion: res => {
                if (res.failed) {
                    alert.error()
                    return
                } else if (res.data) {
                    if (res.data.length) {
                        alert.notice('确认催批？', {
                            text: '是',
                            handler: () => {
                                const form = this.data.form;
                                var data = {
                                    first: {
                                        value: '您有一个流程待审批',
                                        color: '#173177'
                                    },
                                    keyword1: {
                                        value: this.data.title
                                    },
                                    keyword2: {
                                        value: form.applier
                                    },
                                    keyword3: {
                                        value: form.createtime
                                    },
                                    keyword4: {
                                        value: form.content || '无'
                                    },
                                    remark: {
                                        value: '请及时处理!点击可直接审批'
                                    }
                                }
                                var miniprogram = {
                                    appid: PC.app_id,
                                    pagepath: 'pages/redirect-work/index?pid=13,recordid=' + this.data.recordid + ',id=' + this.data.id + ',mystatus=wait,type=approval,title=' + this.data.title
                                }
                                tss.sendGZHMsg({
                                    params: {
                                        appid: PC.gzh_appid,
                                        phone: pc,
                                        template_id: PC.cp_muban_id,
                                        data: data,
                                        miniprogram: miniprogram
                                    },
                                    completion: res => {
                                        if (res.data && res.data.code == 'success') {
                                            alert.notice('已发送流程审批提醒至审批人公众号')
                                        } else {
                                            alert.notice('催批失败。' + (res.errorMsg || ''))
                                        }
                                    }
                                })
                            }
                        }, {
                            text: '否',
                            handler: () => {
                                return
                            }
                        })
                    } else {
                        alert.notice('该审批人未关注公众号，无法催批')
                    }
                }
            }
        })

    },
    cancel: function (e) {
        const key = e.target.dataset.key;
        this.setData({
            [key]: false
        })
    },
    confirm: function (e) {
        if (this.data.notice_content) {
            wx.showLoading({
                title: '提交中'
            })
            tss.save({
                url: tss.url('xdata') + 'wfmsg',
                params: {
                    wfId: this.data.recordid,
                    itemId: this.data.id,
                    wfMsg: this.data.notice_content
                },
                completion: res => {
                    wx.hideLoading()
                    if (res.failed) {
                        alert.error(res.errorMsg)
                        return
                    }
                    this.getData(this.data.id)
                    this.setData({
                        showmodal: false,
                    })
                }
            })

        } else {
            alert.notice('请填写提醒内容')
        }
    },
    fieldChange: function (e) {
        this.data.notice_content = e.detail.detail.value;
    },
    addattach: function (e) {
        const col = e.currentTarget.dataset.col;
        if (col) {
            var list = e.detail.attachURLs;
            this.data.form[col] = list;
        }
    }
})
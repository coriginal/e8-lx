const lc = require('../../../utils/listenerCenter.js');
const QQMapWX = require('../../../utils/txmap.js');
const tss = require('../../../utils/tss.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
const plugin = requirePlugin("WechatSI")
var manager = plugin.getRecordRecognitionManager()
const alert = require('../../../utils/alert.js')
const _APP = getApp().globalData;


var qqmapsdk = new QQMapWX({
    key: Map_Key
});

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
        form: {
            region: []
        },
        townRequired: false,
        isLeaf: false,
        searchList: [],
        keywords: '',
        showSearchList: true,
        nomore: false,
        page: 1,
        customer_id: ""
    },
    getAddrUsed(e) {
        //console.log(e)
        const item = e.detail
        let data = {
            obj: {
                addr_detail: item.street_no || '',
                name: item.name || '',
                company: item.company || '',
                phone: item.phone || '',
                region: [item.province || '', item.city || '', item.district || '', item.town || '']
            },
            site: item.site,
            info: [item.company || '', item.name || '', item.phone || ''],
            addr: [item.province, item.city, item.district, item.town, item.street_no].filter(i => i)
        }
        lc.emitEvent('orderInfo', {
            type: this.data.type,
            data
        })
        wx.navigateBack()
    },
    onLoad: function (options) {
        console.log(options)
        let config = _APP.DomainConfig
        this.setData({
            type: options.type || 'send',
            customer_id: options.customer_id,
            form: JSON.parse(options.data || "{}").obj || this.data.form,
            textarea: "例子：皓景 18988826656 广东省佛山市三水区白坭镇汇金路43号1栋",
            ...((config?.xcx_edit_customer?.content=='true' && options.type == 'send') && {
                companyName: options.companyName
            })
        })
        if (options.menu) {
            this[options.menu]()
        }
        this.getRequiredTown()
    },
    getRequiredTown() {
        let owrf = _APP.DomainConfig['order_write_required_fields']
        let {
            townRequired,
            isLeaf
        } = this.data
        isLeaf = _APP.DomainConfig["need_town"] ? (_APP.DomainConfig["need_town"].content == "1" ? false : true) : true
        if (owrf && !townRequired) {
            if (owrf.content) {
                let config = JSON.parse(owrf.content).filter(item => item.field == `${this.data.type}_town`)[0]
                if (config) {
                    townRequired = Boolean(config.required)
                }
            }
        }
        this.setData({
            townRequired,
            isLeaf
        })
    },
    // 获取省市区
    bindRegionChange(e) {
        this.setData({
            "form.region": e.detail.value
        })
    },
    // 提交表单su
    formSubmit(e) {
        this.data.form = {
            ...this.data.form,
            ...e.detail.value
        }
        for (let key in this.data.form) {
            if (_APP.user.domain == 'D556' && key == 'region') {
                continue
            }
            if (_APP.user.domain == 'D063' && key == 'region') {
                continue
            }
            if (key == 'addr_detail' && (this.data.form[key].indexOf('?') != -1 || this.data.form[key].indexOf('&') != -1)) {
                wx.showToast({
                    title: "详细地址不能使用英文状态'?'和'&'字符",
                    icon: 'none'
                })
                return
            }
            if (this.data.form[key].length == 0 && key != 'addr_detail' && key != 'company') {
                //D556
                wx.showToast({
                    title: '请填写完整信息',
                    icon: 'none',
                    duration: 2000
                })
                return
            }
            if (key == "region") {
                let count = this.data.townRequired ? 4 : 3
                for (let j = 0; j < count; j++) {
                    if (!this.data.form["region"][j]) {
                        if (j == 3) {
                            wx.showToast({
                                title: '地区信息请精确到乡镇',
                                icon: 'none'
                            })
                            return
                        }
                        wx.showToast({
                            title: '请完整填写地区信息',
                            icon: 'none'
                        })
                        return
                    }
                }
            }
        }

        this.doEditAddr(this.data.form)
            .then(res => {
                this.goBack()
            })
            .catch(res => {
                wx.showModal({
                    title: '提示',
                    content: res,
                    showCancel: false
                })
            })
    },
    // 清除表单
    formClear() {
        this.setData({
            value_addr: []
        })
    },
    // 返回
    goBack(type = this.data.type, form = this.data.form) {
        lc.emitEvent('orderInfo', {
            type,
            data: {
                obj: form,
                info: [form.name, form.phone],
                addr: [...form.region, form.addr_detail]
            }
        })
        wx.navigateBack()
    },

    // 更新地址
    doEditAddr(data) {
        return new Promise((resolve, reject) => {
            const {
                name,
                company,
                phone,
                addr_detail: street_no,
                region
            } = data
            const [province, city, district, town] = region
            if (data.id) {
                tss.save({
                    url: tss.recordURLs('tms_contact').UPDATE,
                    params: {
                        id: data.id,
                        name,
                        company,
                        phone,
                        province,
                        city,
                        district,
                        town,
                        street_no
                    },
                    completion: res => res.failed ? reject(res.errorMsg) : resolve(res)
                })
            } else {
                tss.post({
                    url: tss.url("ENTITY") + 'Contact',
                    params: {
                        customer_id: this.data.customer_id,
                        type: this.data.type == 'send' ? '寄件' : '收件',
                        name,
                        phone,
                        province,
                        city,
                        district,
                        town,
                        street_no,
                        company
                    },
                    completion: res => {
                        if (res.failed) {
                            reject(res.data)
                            return
                        } else {
                            resolve()
                        }
                    }
                })
            }
        })
    },

    // 打开行政区划选择列表
    onOpen() {
        this.setData({
            visible: true
        })
    },
    // 关闭
    onClose() {
        this.setData({
            visible: false
        })
    },
    onChange(e) {
        this.setData({
            value_addr: e.detail.value,
            "form.region": e.detail.done && e.detail.options.map((n) => n.label)
        })
    },
    // 打开地图选点
    getUserSetting(e) {
        var this_ = this;
        wx.getSetting({
            success(res) {
                if ('scope.userLocation' in res.authSetting) {
                    if (!res.authSetting['scope.userLocation']) {
                        wx.openSetting({
                            success(res) {
                                this_.addAddress()
                            }
                        })
                    } else {
                        this_.addAddress()
                    }
                } else {
                    this_.addAddress()
                }
            }
        })
    },
    // 位置选择
    addAddress() {
        wx.chooseLocation({
            success: res => {
                console.log(res)
                let street_no = res.name
                this.dealAddr(res.address, street_no)
            },
        })
    },
    // 富文本填写
    addrFinished(e) {
        this.data.inputAddr = e.detail.value
    },
    // 识别地址
    // 拆出地址最长的一条作为地区信息进行解析 然后正则匹配电话 剩下的作为联系人姓名
    addrInput() {
        if (this.data.inputAddr) {
            tss.post({
                url: tss.url('/tms/splitNamePhoneAddress'),
                params: {
                    addr: this.data.inputAddr
                },
                completion: res => {
                    if (res.failed) {
                        tss.post({
                            url: tss.url("/addr/split"),
                            params: {
                                addr: this.data.inputAddr
                            },
                            completion: res => {
                                if (res.failed) {
                                    alert.notice(res.errorMsg)
                                    return
                                }
                                let data = res.data
                                this.setData({
                                    "form.region": [data[0] || '', data[1] || '', data[2] || '', data[3] || ''],
                                    "form.addr_detail": data[4] || '',
                                })
                            }
                        })
                        //alert.notice(res.errorMsg)
                        return
                    }
                    const data = res.data
                    for (let key in data) {
                        typeof data[key] !== 'string' ? '' :
                            data[key] = data[key].replace(/\n|\\S/g, '')
                    }
                    this.setData({
                        "form.region": [data.province || '', data.city || '', data.district || '', data.town || ''],
                        "form.addr_detail": data.street_no || '',
                        "form.name": data.name || '',
                        "form.phone": data.phone || ''
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
                        "form.region": [data.province || '', data.city || '', data.district || '', data.town || ''],
                        "form.addr_detail": data.street_no || '',
                        "form.name": data.name || '',
                        "form.phone": data.phone || ''
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
    // 地址处理
    dealAddr(data, street_no = '') {
        qqmapsdk.geocoder({
            address: data,
            success: res => {
                if (res.status == 0) {
                    let addr = res.result.address_components
                    let reg = new RegExp(`${addr.province}|${addr.city}|${addr.district}`, "g")
                    //console.log(reg)
                    this.setData({
                        "form.region": [addr.province, addr.city, addr.district],
                        "form.addr_detail": street_no ? [res.result.title, street_no].join('') : data.replace(reg, '')
                    })
                } else {
                    wx.showModal({
                        content: res.message,
                        showCancel: false
                    })
                }
            }
        })
    },
    // 按钮三兄弟
    menuClick(e) {
        let code = e.currentTarget.id
        this[code]();
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
    writeDataToInput(res) {
        // let reg_addr = res.data.split(/,|，|\s/g).filter(x => x)
        // if (reg_addr.length == 3) {
        //   this.dealAddr(reg_addr[2])
        //   this.setData({
        //     "form.name": reg_addr[0],
        //     "form.phone": reg_addr[1]
        //   })
        // }
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
        // wx.showToast({
        //   title: '暂未开放...',icon:'none'
        // })
        const _this = this;
        wx.chooseImage({
            count: 1,
            success: function (res) {
                const imgurl = (res.tempFilePaths[0])
                //console.log(imgurl)
                tss.uploadImagesAsync({
                    recordId: -5,
                    itemId: 4,
                    uName: _APP.user.uName,
                    uToken: _APP.user.uToken,
                    filePaths: res.tempFilePaths,
                    completion: res => {
                        //console.log(res)
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
                                    // url: tss.url('sql') + 'attach_num',
                                    url: tss.url('data') + 'xcx_query_attach',
                                    params: {
                                        id: res[0].id
                                    },
                                    completion: res => {
                                        //console.log(res)
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
                                    //console.log(res)
                                    if (res.data.words_result_num) {
                                        let result = '';
                                        // for (var i = 0; i < res.data.words_result.length; i++) {
                                        //   result += res.data.items[i].text;
                                        // }
                                        res.data.words_result.forEach(i => result += i.words)
                                        _this.setData({
                                            inputAddr: result
                                        })
                                        _this.writeDataToInput(result)
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
    onClosePop() {
        wx.showLoading()
        this.setData({
            voicePop: false
        }, () => {
            manager.stop()
        })
    },
    search(e) {
        let _this = this;
        this.setData({
            keywords: e.detail.value
        })
        if (!e.detail.value) {
            _this.setData({
                searchList: []
            })
            return
        }
        tss.debounce(function () {
            //console.log('防抖')
            tss.query({
                url: tss.url('sql') + 'customer_contact',
                params: {
                    customer_id: _this.data.customer_id,
                    type: _this.data.type == 'send' ? '寄件' : '收件',
                    q: e.detail.value,
                    page: 1,
                    rows: 5
                },
                completion: res => {
                    if (res.failed) return
                    _this.setData({
                        searchList: res.data.rows,
                        showSearchList: true,
                        page: 1,
                        nomore: false
                    })
                    //console.log(_this.data.searchList.length == res.data.total)
                    if (_this.data.searchList.length == res.data.total) {
                        _this.setData({
                            nomore: true
                        })
                    }
                }
            })
        }, 500)()
    },
    closeSearchList() {
        this.setData({
            showSearchList: false
        })
    },
    loadMore() {
        if (!this.data.nomore) {
            this.setData({
                page: this.data.page + 1
            })
            tss.query({
                url: tss.url('sql') + 'customer_contact',
                params: {
                    customer_id: this.data.customer_id,
                    type: this.data.type == 'send' ? '寄件' : '收件',
                    q: this.data.keywords,
                    page: this.data.page,
                    rows: 5
                },
                completion: res => {
                    if (res.failed) return
                    this.setData({
                        searchList: this.data.searchList.concat(res.data.rows),
                        showSearchList: true,
                    })
                    if (this.data.searchList.length == res.data.total) {
                        this.setData({
                            nomore: true
                        })
                    }
                }
            })
        } else {
            //console.log("已无更多")
        }
    },
    selectCustomer(e) {
        //console.log(e)
        let data = e.currentTarget.dataset.detail
        let region = [data.province, data.city, data.district, data.town]
        let form = {
            name: data.name,
            region,
            addr_detail: data.street_no,
            company: data.company,
            phone: data.phone
        }
        this.setData({
            form,
            showSearchList: false
        })
    }
})
// pages-order/order/order_print/custom_print/index.js
import out from './out'
const tss = require('../../../../utils/tss.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        height: 0,
        width: 0,
        hide: false,
        tools: [{
                name: "横线",
                type: 'row_line',
                color: "red"
            }, {
                name: "竖线",
                type: 'col_line',
                color: "orange"
            }, {
                name: '文本',
                type: 'text',
                color: 'yellow'
            },
            {
                name: "条形码",
                type: 'barcode'
            },
        ],
        open: false,
        rowLineList: [],
        colLineList: [],
        textList: [],
        barCodeList: [],
        cur: {
            type: 'rl',
            index: 0
        },
        copy: {},
        loadingOrder: '',
        orderInfo: null,
        platformInfo: null,
        openbind: false,
        fieldList: [],
        platformFieldList: [],
        textNumber: 0,
        historyList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },
    whChange(e) {
        let {
            type
        } = e.currentTarget.dataset
        console.log(e)
        this.data[type] = Number(e.detail.value)
        console.log(this.data.height, this.data.width)
    },
    create() {
        console.log(this.data.height)
        if(this.data.height>0 && this.data.width>0){
            if(this.data.height>200||this.data.width>200){
                wx.showModal({
                    title: '提示',
                    content: '长宽不能大于200毫米',
                    showCancel:false
                  })
                  return
            }
            this.setData({
                hide: true,
                height: this.data.height,
                width: this.data.width
            })
        }else{
            wx.showModal({
              title: '提示',
              content: '长宽必须大于0',
              showCancel:false
            })
        }
    },
    cc(e) {
        let {
            type
        } = e.currentTarget.dataset
        console.log(type)
        switch (type) {
            case "row_line":
                let {
                    rowLineList
                } = this.data;
                rowLineList.push({
                    x0: 0,
                    y0: 10,
                    x1: this.data.width,
                    y1: 10,
                    width: 2,
                    type: 'rl',
                })
                this.setData({
                    rowLineList
                })
                break;
            case "col_line":
                let {
                    colLineList
                } = this.data
                colLineList.push({
                    x0: 10,
                    y0: 0,
                    x1: 10,
                    y1: this.data.height,
                    width: 2,
                    type: 'cl'
                })
                this.setData({
                    colLineList
                })
                break;
            case "text":
                let {
                    textList,
                    textNumber
                } = this.data
                textNumber++
                textList.push({
                    fontsize: 12,
                    x: 0,
                    y: 0,
                    data: "TEXT" + textNumber,
                    size: 0,
                    type: "text",
                    center_width: 0,
                    mag: 1,
                    wrap: 0
                })
                this.setData({
                    textList,
                    textNumber
                })
                break;
            case "barcode":
                let {
                    barCodeList
                } = this.data
                barCodeList.push({
                    mode: 128,
                    width: 1,
                    ratio: 1,
                    height: 10,
                    x: 0,
                    y: 0,
                    data: '1234567890',
                    type: 'barcode'
                })
                this.setData({
                    barCodeList
                })
                break;
        }
    },
    toCenter() {

    },
    design(e) {
        let {
            index,
            type,
            copy
        } = e.currentTarget.dataset
        console.log(type)
        switch (type) {
            case 'rl':
                copy = JSON.stringify(this.data.rowLineList)
                break;
            case 'cl':
                copy = JSON.stringify(this.data.colLineList)
                break;
            case 'text':
                copy = JSON.stringify(this.data.textList)
                break;
            case 'barcode':
                copy = JSON.stringify(this.data.barCodeList)
                break;
            default:
                break;
        }
        this.setData({
            copy,
            open: true,
            cur: {
                type: type,
                index: index
            }
        })
    },
    editDesign(e) {
        console.log(e)
        let {
            type
        } = e.detail.target.dataset, value = e.detail.value
        var {
            cur
        } = this.data
        switch (this.data.cur.type) {
            case "rl":
                let {
                    rowLineList
                } = this.data
                for (let key in value) {
                    console.log(value[key])
                    rowLineList[cur.index][key] = value[key]
                    if(key=='y0'){
                        rowLineList[cur.index]['y1'] = value[key]
                    }
                }
                this.setData({
                    rowLineList
                })
                break;
            case "cl":
                let {
                    colLineList
                } = this.data
                for (let key in value) {
                    console.log(value[key])
                    colLineList[cur.index][key] = value[key]
                    if(key=='x0'){
                        colLineList[cur.index]['x1'] = value[key]
                    }
                }
                this.setData({
                    colLineList
                })
                break;
            case "text":
                let {
                    textList
                } = this.data
                console.log(textList[cur.index]['need_cut'])
                for (let key in value) {
                    console.log(value[key])
                    if(key=='tail'){
                        if(value[key]){
                            textList[cur.index]['tail']=value[key]
                        }else{
                            delete textList[cur.index]['tail']
                        }
                    }
                    if(key=="deliver"){
                        if(value[key]){
                            textList[cur.index]['deliver']=value[key]
                            delete textList[cur.index]['bind']
                        }else{
                            delete textList[cur.index]['deliver']
                        }
                        continue
                    }
                    if (key == "cut_char") {
                        if (textList[cur.index]['need_cut'].wrap) {
                            let __data = textList[cur.index].data.split(textList[cur.index]['need_cut']['char'])
                            var _data = ""
                            if (__data.length > 1) {
                                for (let k in __data) {
                                    _data += __data[k] + (k != __data.length + 1 ? '\n' : '')
                                }
                                textList[cur.index]['_data'] = _data
                            }
                        }
                        continue
                    }
                    if (key == "wrap") {
                        if (value[key] > 0 && Number(value[key]) < value['data'].length) {
                            let _data = ""
                            for (let i in value['data']) {
                                if (i % value[key] == 0 && i != 0) {
                                    _data += '\n'
                                }
                                _data += value['data'][i]
                            }
                            textList[cur.index]['_data'] = _data
                        } else {
                            textList[cur.index].wrap = 0
                            textList[cur.index]['_data'] && delete textList[cur.index]['_data']
                            continue
                        }
                    }
                    if (key == "center_width") {
                        let a = 0,
                            reg = /^[\u4e00-\u9fa5]$/
                        console.log(value.data)
                        if (!value.data) {
                            value.data = textList[cur.index].data
                        }
                        let _vdata = (value['wrap'] > 0 && Number(value['wrap']) < value['data'].length) ? value.data.substring(0, value['wrap']) : (textList[cur.index]['need_cut'] ? (textList[cur.index]['need_cut']['wrap'] ? value.data.split(textList[cur.index]['need_cut'].char)[0] : value.data) : value.data)
                        console.log(_vdata)
                        for (let j in _vdata) {
                            if (reg.test(value.data[j])) {
                                a += Number(value.fontsize * value.mag)
                            } else {
                                a += value.fontsize * value.mag / 2
                            }
                        }
                        console.log("文本宽度", a)
                        if (a < value.center_width * 8) {
                            textList[cur.index]["center"] = (Number(value.x) * 8 + Number(value.center_width / 2) * 8) - a / 2
                        } else {
                            textList[cur.index]["center"] && delete textList[cur.index]["center"]
                        }
                    }
                    textList[cur.index][key] = value[key]
                    console.log(textList)
                }
                this.setData({
                    textList
                })
                break;
            case "barcode":
                let {
                    barCodeList
                } = this.data
                for (let key in value) {
                    if(key=="deliver"){
                        if(value[key]){
                            barCodeList[cur.index]['deliver']=value[key]
                            delete barCodeList[cur.index]['bind']
                        }else{
                            delete barCodeList[cur.index]['deliver']
                        }
                        continue
                    }
                    console.log(value[key])
                    barCodeList[cur.index][key] = value[key]
                }
                this.setData({
                    barCodeList
                })
                break;
            default:
                break;
        }
        if (type == "preview") {
            this.setData({
                maskOpacity: 0.2
            })
            setTimeout(() => {
                this.setData({
                    maskOpacity: 1
                })
            }, 2000)
        } else {
            this.setData({
                open: false
            })
        }
    },
    closeMask() {
        let {
            cur,
            copy
        } = this.data
        if (copy.length) {
            switch (cur.type) {
                case "rl":
                    this.setData({
                        rowLineList: JSON.parse(copy)
                    })
                    break;
                case "cl":
                    this.setData({
                        colLineList: JSON.parse(copy)
                    })
                    break;
                case "text":
                    this.setData({
                        textList: JSON.parse(copy)
                    })
                    break;
                case "barcode":
                    this.setData({
                        barCodeList: JSON.parse(copy)
                    })
                    break;
                default:
                    break;
            }
        }
        this.setData({
            open: false
        })
    },
    save(e) {
        console.log(e)
        let mb_dic=wx.getStorageSync('mb_dic')?JSON.parse(wx.getStorageSync('mb_dic')):[]
        let {
            width,
            height,
            rowLineList,
            colLineList,
            textList,
            barCodeList
        } = this.data
        var name=e.detail.value['name']
        let mb_data=JSON.stringify({
            init:{
                width,
                height
            },
            rowLineList,
            colLineList,
            textList,
            barCodeList
        })
        console.log(name)
        wx.setStorageSync(name,mb_data)
        if(mb_dic.indexOf(name)==-1){
            wx.setStorageSync('mb_dic',JSON.stringify([...mb_dic,name]))
        }
    },
    delete() {
        let {
            cur
        } = this.data
        console.log(cur)
        switch (cur.type) {
            case "rl":
                cur.type = "rowLineList"
                break;
            case "cl":
                cur.type = "colLineList"
                break;
            case "text":
                cur.type = "textList"
                break;
            case "barcode":
                cur.type = "barCodeList"
            default:
                break;
        }
        let data = this.data[cur.type]
        data.splice(cur.index, 1)
        console.log(data)
        this.setData({
            [`${cur.type}`]: data,
            open: false
        })
    },
    loadOrder() {
        this.setData({
            open: true,
            "cur.type": "load_order"
        })
    },
    unLoadOrder() {
        let {
            textList
        } = this.data
        for (let i in textList) {
            delete textList[i]['bind']
        }
        this.setData({
            orderInfo: null,
            platformInfo: null,
            platformFieldList: [],
            textList
        })
    },
    openBindWindow() {
        this.setData({
            openbind: true
        })
    },
    inputLoadOrder(e) {
        let {
            loadingOrder
        } = this.data
        loadingOrder = e.detail.value
        this.setData({
            loadingOrder
        })
        console.log(this.data.loadingOrder)
    },
    startloadOrder() {
        if (!this.data.loadingOrder) {
            return
        }
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        tss.query({
            url: tss.url('sql') + 'tms_order',
            params: {
                code: this.data.loadingOrder,
                addPlatformInfo: true
            },
            completion: res => {
                wx.hideLoading()
                if (res.failed || !res.data.length) {
                    return
                }
                let platformInfo = null,
                    platformFieldList = [],
                    fieldList = []
                if (res.data[0].real_lc_id) {
                    platformInfo = JSON.parse(res.data[0].platform_info)
                }
                for (let key in platformInfo) {
                    platformFieldList.push(key)
                }
                for (let key in res.data[0]) {
                    if (key == 'platform_info' || !res.data[0][key]) {
                        continue
                    }
                    fieldList.push(key)
                }
                this.setData({
                    orderInfo: res.data[0],
                    platformInfo,
                    platformFieldList,
                    fieldList,
                    open: false
                })
                console.log(res)
            }
        })
    },
    bindField(e) {
        let {
            cur,
            textList,
            barCodeList,
            orderInfo
        } = this.data
        switch (cur.type) {
            case 'text':
                textList[cur.index]['bind'] = {
                    type: "normal",
                    field: e.currentTarget.dataset.field
                }
                textList[cur.index].data = orderInfo[e.currentTarget.dataset.field]
                this.setData({
                    textList,
                    openbind: false
                })
                break;
            case "barcode":
                barCodeList[cur.index]['bind'] = {
                    type: "normal",
                    field: e.currentTarget.dataset.field
                }
                barCodeList[cur.index].data = orderInfo[e.currentTarget.dataset.field]
                this.setData({
                    barCodeList,
                    openbind: false
                })
                break;
            default:
                break;
        }
    },
    bindPlatformField(e) {
        let {
            cur,
            textList,
            barCodeList,
            platformInfo
        } = this.data
        switch (cur.type) {

            case 'text':
                textList[cur.index]['bind'] = {
                    type: "platform",
                    field: e.currentTarget.dataset.field
                }
                textList[cur.index].data = platformInfo[e.currentTarget.dataset.field]
                this.setData({
                    textList,
                    openbind: false
                })
                break;
            case 'barcode':
                barCodeList[cur.index]['bind'] = {
                    type: "platform",
                    field: e.currentTarget.dataset.field
                }
                barCodeList[cur.index].data = platformInfo[e.currentTarget.dataset.field]
                this.setData({
                    barCodeList,
                    openbind: false
                })
                break;
        }
    },
    cancelBind() {
        let {
            cur,
            textList,
        } = this.data
        delete textList[cur.index]['bind']
        this.setData({
            textList
        })
    },
    closeLoadOrder() {
        this.setData({
            open: false
        })
    },
    needCut(e) {
        console.log(e)
        let {
            textList,
            cur
        } = this.data
        if (e.detail.value.indexOf('need_cut') != -1) {
            textList[cur.index]["wrap"] = 0
            textList[cur.index]["need_cut"] = {
                char: '',
                wrap: false
            }
        } else {
            textList[cur.index]["need_cut"] && delete textList[cur.index]["need_cut"]

        }
        this.setData({
            textList
        })
    },
    hasText(e){
        let {barCodeList,cur}=this.data
        if (e.detail.value.indexOf('hastext') != -1) {
            barCodeList[cur.index]["hastext"] = true
        } else {
            barCodeList[cur.index]["hastext"] && delete barCodeList[cur.index]["hastext"]
        }
        this.setData({
           barCodeList
        })
    },
    cutWrap(e) {
        let {
            cur,
            textList
        } = this.data
        console.log(e.detail.value)
        if (e.detail.value.indexOf('wrap') != -1) {
            textList[cur.index]['need_cut'].wrap = true
        } else {
            textList[cur.index]['need_cut'].wrap = false
        }
        console.log(textList)
        this.setData({
            textList,
        })
    },
    cutCharChange(e) {
        let {
            cur,
            textList
        } = this.data
        textList[cur.index]['need_cut'].char = e.detail.value
        this.setData({
            textList
        })
    },
    openSave(){
        let {cur}=this.data
        cur.type='save_mb'
        cur.index=0
        this.setData({
            cur,
            open:true
        })
    },
    closeSave(){
        this.setData({
            open:false
        })
    },
    loadMb(){
        let {cur,historyList}=this.data
        historyList=JSON.parse(wx.getStorageSync('mb_dic'))
        cur.type='load_mb'
        cur.index=0
        this.setData({
            cur,
            open:true,
            historyList
        })
    },
    loadRealMb(e){
        let name=e.currentTarget.dataset.name
        let data=JSON.parse(wx.getStorageSync(name))
        this.setData({
            ...data.init,
            ...data,
            hide:true,
            open:false
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
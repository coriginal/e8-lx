const _App = getApp().globalData
import Pages from '../../pages.js'
const tss = require('../../utils/tss.js')

Component({

    options: {
        styleIsolation: 'apply-shared',
    },
    properties: {

    },

    data: {
        bannerUlr: _App.aliyun_host + '/banner.jpg',
        blankUrl: _App.aliyun_host + '/blank.png',
        searchParam: '搜索我的单号、物流单号、客户单号、子单号',
        topHeight: _App.menuRect.bottom + _App.menuRect.top - 20,
        page: 1,
        datalist: [],
        _height: "",
        hideSubOrderRoute:false,
        showQRcodeButton:false,
        domain: ''
    },
    lifetimes: {
        attached: function () {
            /* let _this = this;
            wx.getClipboardData({
              success (res){
                if(res.data){
                  let searchValue = res.data;
                  wx.showModal({
                    title: '您是否要查询以下单号',
                    content: searchValue,
                    showCancel: true,
                    confirmText: '确认',
                    cancelText: '取消',
                    success: res => {
                      wx.setClipboardData({
                        data: ''
                      })
                      if (res.confirm) {
                        _this.setData({
                          searchValue
                        }, () => {
                          _this.queryOrderData(searchValue)
                        })
                        return
                      }
                      if (res.cancel) {
                        return
                      }
                    }
                  })
                }
              }
            }) */
            console.log(_App)
            this.setData({
                hideCargoInfo: Boolean(_App.user.roles.indexOf("客户") != -1 && (_App.user.domain == "D574" || (_App.DomainConfig.show_cargo_info && _App.DomainConfig.show_cargo_info.content == '0'))),
                _height: `100vh - 536rpx - ${this.data.topHeight}px`,
                dzsf:!Boolean(_App.user.roles.indexOf("客户") != -1 && _App.user.domain == "D075"),
                ifHideCompany: _App.ifHideCompany,
                showQRcodeButton: _App.user.domain=='D168'
            })
            //console.log(this.data.hideCargoInfo)
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    },

    methods: {
        getQRcodeImg(e) {
            tss.post({
                url: tss.url('') + '/tms/order/dh/QRcode',
                params: {
                    order_id: e.currentTarget.dataset.id
                },
                completion: res => {
                    if(res.failed){
                        wx.showModal({
                          title: "提示",
                          content: res.errorMsg,
                          showCancel:false
                        })
                        return
                    }
                    const imgPath = wx.env.USER_DATA_PATH + `/${new Date().getTime()}.png`
                    const imageData = res.data.msg.replace(/^data:image\/\w+;base64,/, "")
                    const fs = wx.getFileSystemManager()
                    fs.writeFileSync(imgPath, imageData, "base64")
                    fs.close()
                    wx.previewImage({
                        urls: [imgPath],
                    })
                }
            })
        },
        inputBlur(e) {

        },
        onLoad(options) {
            this.setData({
                domain: _App.user.domain,
                _height: `100vh - 444rpx`
            })
            // 扫描普通二维码进入
            if (options.q) {
                let reg = /\?_queryCode=|\?code=/g
                let searchValue = decodeURIComponent(options.q).split(reg)[1]
                this.setData({
                    searchValue
                }, () => {
                    this.goSearch()
                })
            }
            if (options.query && options.code) {
                this.setData({
                    searchValue: options.code
                }, () => {
                    this.goSearch()
                })
            }
            console.log(options.domain)
            if (options.scene) {
                let scene = decodeURIComponent(options.scene);
                let infos = scene.split(",");
                if (infos.length > 4 && infos[3] == 'os') {
                    this.setData({
                        searchValue: infos[4]
                    }, () => {
                        this.goSearch()
                    })
                }
                // logpool.info("eff.homepage.onLoad:" + scene + " | " + user.belong)
            }
        },
        onShareAppMessage() {
            return {
                title: '有人@您，邀您查看订单最新轨迹。',
                path: `${Pages.order_query_route}?_queryCode=${this.data.searchValue}`,
                imageUrl: _App.aliyun_host + '/share.png'
            }
        },
        // 输入框
        getSearchValue(e) {
            var reg = /(\r\n)|(\n)/g
            let searchValue = e.detail.value
            this.setData({
                searchValue
            })
        },
        // 搜索按钮
        goSearch(e, code = this.data.searchValue) {

            if (code && code.replace(/[^\x00-\xff]|\s*/g, '').length) {
                // 初始化page,list
                this.initData().then(res => {
                    this.queryOrderData(code)
                })
            } else {
                wx.showToast({
                    title: '请检查查询条件.',
                    icon: 'none'
                })
            }
        },
        // 查询
        queryOrderData(code) {
            console.log(this.data.ifHideCompany)
            wx.showLoading({
                title: '查询中',
                mask: true
            })
            tss.getJSON({
                url:tss.url('tms')+'/order/anon/scanBackOrder',
                params:{
                    scanCode: code.replace(/[^\x00-\xff]|\s*/g, ''),
                    isSubOrderPaths:true
                },
                completion:res=>{
                    wx.hideLoading()
                    if (res.failed) {
                        if(this.data.domain === 'D742' && res.errorMsg === '未匹配系统内的订单'){
                            console.log("跳转下单页")
                            return
                        }
                        wx.showModal({
                            content: res.errorMsg,
                            showCancel: false
                        })
                        return
                    }
                    if (res.data.data.length == 0) {
                        wx.showToast({
                            title: '未查询到结果',
                            icon: 'none'
                        })
                    }
                    this.data.list_total = res.data.data.length
                    let {datalist} = this.data;
                    datalist = res.data.data.map(item=>{
                        let subPaths = item.sub_order_paths;
                        if(code==subPaths[1].code){
                            console.log("查询的是主单轨迹")
                            item.hideSubOrderPaths=true
                        }else{
                            item.hideSubOrderPaths=false
                        }
                        item.newpath = subPaths[1]?.paths[0]?.description || ''
                        subPaths.splice(0,2)
                        return item
                    })
                    console.log(datalist)
                    this.setData({
                        datalist
                    })
                }
            })
        },
        // scroll-view触底进行次页查询
        scrollReachBottom(e) {
            if (this.data.list_total == this.data.datalist.length) {
                return
            }
            this.data.page++
            this.queryOrderData(this.data.searchValue)
        },
        initData() {
            return new Promise(init => {
                this.setData({
                    page: 1,
                    datalist: []
                }, () => {
                    init()
                })
            })
        },
        resetInput(e, searchValue = '') {
            this.setData({
                searchValue
            })
        },
        scanCode() {
            wx.scanCode({
                success: res => {
                    let searchValue = res.result
                    this.setData({
                        searchValue
                    }, () => {
                        this.queryOrderData(searchValue)
                    })
                }
            })
        },
        focusOn() {
            this.setData({
                _focus: true
            })
        },
        goRoutes(e) {
            const {
                id,
                code,
                domain,
                item
            } = e.currentTarget.dataset
            const {
                rcode_type
            } = item
            wx.navigateTo({
                url: `${Pages.order_routes}?hideSubOrderRoute=${this.data.hideSubOrderRoute}&id=${id}&code=${code}&domain=${domain}&rcode_type=${JSON.stringify(rcode_type||false)}`,
            })
        }
    }
})
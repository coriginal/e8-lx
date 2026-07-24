const _App = getApp().globalData;
const tss = require('../../../utils/tss.js');
import User from '../../../utils/user.js';
import Pages from '../../../pages.js';
import initFn from '../../init';
const showModal = (msg, fn) => wx.showModal({
    title: '提示',
    content: msg,
    showCancel: false,
    complete: fn && fn(),
});
Page({
    data: {
        height: wx.getMenuButtonBoundingClientRect().bottom + wx.getMenuButtonBoundingClientRect().top - 20,
        _index: 0,
        swiperList: [],
        TitleImgUrl: `${_App.aliyun_host}/logo.png`,
        ImgList: [`${_App.aliyun_host}/wx_login/login1.png`],
        loading: true
    },

    onLoad(options) {
        // if(!_App.user.uToken){
        //     User.getWechatCode().then(res => {
        //         User.login({
        //             completion: res => {
        //                 if (res.noregister) {
        //                     this.setData({
        //                         loading:false
        //                     })
        //                     return
        //                 }
        //                 wx.reLaunch({
        //                     url: '../../login/login',
        //                 })
        //             }
        //         })
        //     })
        // }else{
        //     this.setData({
        //         loading:false
        //     })
        // }
        //
        //
        // 初始化tabbar
        const {
            tabbarList,
            menuRect,
            user
        } = _App
        this.getBanner()
        this.setData({
            tabbarList,
            menuRect,
            user,
            code: tabbarList[0] && tabbarList[0].code || 'home',
            name: tabbarList[0] && tabbarList[0].name || '首页',
        })
        const onTabChange = (code, fn) => {
            const menu = tabbarList.find(i => i.code == code)
            const idx = tabbarList.findIndex(i => i.code == code)
            if (menu) {
                this.setData({
                    code: menu.code,
                    name: menu.name,
                    _index: idx
                }, fn)
            }
        }
        if (options.code) {
            const code = options.code
            onTabChange(code)
        }
        if (_App.entryParams.code) {
            const code = _App.entryParams.code
            onTabChange(code, () => _App.entryParams = {})
        }
        // 公众号消息进入
        if (_App.orderInfo.RedPacketId) {
            const RedPacketId = _App.orderInfo.RedPacketId
            this.showRedpacketPop(RedPacketId)
        }

        this.goRoleForPage(user)
        this.getIfHideCompany()
    },
    setMenu() {

    },
    // 对应的角色进入对应的page
    goRoleForPage({
        roleIds
    }) {
        const roleIdsArray = roleIds && roleIds.split(',')
        if (!roleIds) {
            return
        }
        if (roleIds.startsWith('-10000') && roleIds.endsWith('11')) {
            const centerRole = roleIdsArray.slice(1, -1)
            if (centerRole.length == 1 && centerRole[0] == '9') {
                // 有且只有司机
                wx.navigateTo({
                    url: Pages.task
                })
            }
        }
        if (roleIds.includes('23') || _App.user.groups.indexOf("operator") > -1) {
            // const centerRole = roleIdsArray.slice(1, -1)
            // if (centerRole.length == 1 && centerRole[0] == '9') {
            // 外部操作工
            wx.redirectTo({
                url: Pages.orderOc
            })
        }
        // }
        // switch()
    },
    getIfHideCompany() {
        tss.query({
            url: tss.url('ENTITY') + 'DomainConfig',
            params: {
                code: 'all_company_hide'
            },
            completion: res => {
                if (res.failed) {
                    return
                }
                const [ifHideCompany] = res.data
                if (ifHideCompany && ifHideCompany.content == 1) {
                    // 隐藏
                    _App.ifHideCompany = false
                } else {
                    // 不隐藏
                    _App.ifHideCompany = true
                }
            }
        })
    },
    async getBanner() {
        let swiperList = [{
                code: 'image1',
                url: `${_App.aliyun_host}/wx_index/bg-1.png`
            },
            {
                code: 'image2',
                url: `${_App.aliyun_host}/wx_index/bg-2.png`
            },
            {
                code: 'image3',
                url: `${_App.aliyun_host}/wx_index/bg-3.png`
            }
        ]

        if (!_App.user.uToken) {
            this.setData({
                swiperList
            })
            return
        }
        // tss.post({
        //     url:tss.url('')+'/tms/order/dh/QRcode',
        //     params:{
        //         order_id:6353965
        //     },
        //     completion:res=>{
        //         console.log(res)
        //         const imgPath = wx.env.USER_DATA_PATH + `/${new Date().getTime()}.png`
        //         const imageData = res.data.msg.replace(/^data:image\/\w+;base64,/, "")
        //         const fs = wx.getFileSystemManager()
        //         fs.writeFileSync(imgPath,imageData,"base64")
        //         fs.close()
        //         wx.previewImage({
        //           urls: [imgPath],
        //         })
        //     }
        // })
        tss.query({
            url: tss.url('sql') + 'tms_x_domain',
            completion: res => {
                if (res.failed) {
                    this.setData({
                        swiperList
                    })
                    return
                }
                let data = res.data[0]
                _App.companyInfo = data
                if (data.banner) {
                    let list = []
                    let nameList = data.banner.split(',').map(i => i.split('#')[0]);
                    let ImagesUrl = data.banner.split(',').map(i => `${_App.app_host}/tss/xdata/attach/download/${i.split('#')[1]}`)
                    for (let i = 0; i < ImagesUrl.length; i++) {
                        list.push({
                            code: i,
                            name: nameList[i],
                            url: `${ImagesUrl[i]}?uName=${_App.user.uName}&uToken=${_App.user.uToken}`
                        })
                    }
                    this.setData({
                        swiperList: list
                    })
                } else {
                    this.setData({
                        swiperList
                    })
                }
            }
        })
        // tss.query({
        //     url: tss.url('ENTITY') + 'DomainConfig',
        //     params: {},
        //     completion: res => {
        //         if (res.failed) return
        //         if (res.data && res.data.length) {
        //             let map = {};
        //             for (let i = 0; i < res.data.length; i++) {
        //                 map[res.data[i].code] = res.data[i]
        //             }
        //             _App.DomainConfig = map;
        //         }

        //     }
        // })
    },

    // 切换tabbar
    onChange(e) {
        let _index = e.detail.key
        const {
            code,
            name
        } = this.data.tabbarList[e.detail.key]
        this.setData({
            code,
            name,
            _index
        })
        if (code == 'my') {
            if (this.data.user.openid == 'testing') {
                this.setData({
                    name: '我的'
                })
                return
            }
            const {
                companyInfo,
                ifHideCompany
            } = _App
            this.setData({
                name: (ifHideCompany && companyInfo.name) || ''
            })
        }
    },

    // 体验登陆提醒
    onReady() {
        // if (_App.testLogin) {
        //     wx.showModal({
        //         title: '温馨提醒',
        //         content: '您当前是体验者登陆，如需退出体验，请前往【我的】',
        //         showCancel: false
        //     })
        // }
        // tabbar初始化各个页面事件
        this.data.tabbarList.forEach(item => {
            switch (item.code) {
                case 'table':
                    this.getReports();
                    break;
                case 'work': {
                    this.getRoles();
                    // this.getFinWorks()
                };
                break;
            default:
            }
        })
    },

    getOptionsMessage() {
        tss.post({
            url: tss.url('') + '/auth/api/message/level2',
            completion: res => {
                if (res.failed) return
                this.setData({
                    ifDot: res.data.length > 0 ? true : false
                })
            }
        })
    },

    onShow() {

        // 获取消息盒子
        this.getOptionsMessage()

        // 获取eff待接单
        this.getAcceptOrder()

    },
    // 带审批
    getFinWorks() {
        const date = new Date()
        const [year, month] = [date.getFullYear(), date.getMonth()]
        const days = new Date(year, month + 1, 0).getDate()
        const order_date1 = `${year}-${month + 1}-1`
        const order_date2 = `${year}-${month + 1}-${days}`

        tss.query({
            url: tss.url('sql') + 'query_fin_orders',
            params: {
                order_date1,
                order_date2,
                work_order_filter: 'my_approving',
                status_code: '_999'
            },
            completion: res => {
                if (res.failed) return
            }
        })
    },

    // 待接单
    getAcceptOrder() {
        if (_App.user.isEff) {
            tss.query({
                url: tss.url('sql') + 'tms_order',
                params: {
                    status: '待接单'
                },
                completion: res => {
                    if (res.failed) return
                    if (res.data.length > 0) {
                        this.setData({
                            showDot: true,
                            eff_oc_count: res.data.length
                        })
                    } else {
                        this.setData({
                            showDot: false,
                            eff_oc_count: res.data.length
                        })
                    }
                }
            })
        }
    },

    // 获取报表
    getReports() {
        tss.getJSON({
            url: tss.url('wxapi') + 'wxreports',
            completion: res => {
                if (res.failed) {
                    alert.error()
                    return
                }
                res.data = res.data.map(item => {
                    item.wxicon = 'tongji'
                    return item
                })
                let showCustomerReport = _App.DomainConfig['show_customer_report'] ? JSON.parse(_App.DomainConfig['show_customer_report'].content) : false
                if (!showCustomerReport) {
                    res.data = res.data.filter(item => item.name != "客户表")
                }
                console.log(this.data.tabbarList)
                if (!res.data.length) {
                    this.setData({
                        tabbarList: this.data.tabbarList.filter(item => item.code != 'table')
                    })
                }
                this.setData({
                    table_list: res.data
                })
            }
        })
    },

    // 获取所有角色
    getRoles() {
        tss.get({
            url: tss.url('wxapi') + 'roles',
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg
                    })
                    return
                }
                _App.roleList = res.data
            }
        })
    },
    // 获取优惠券
    showRedpacketPop(RedPacketId) {
        wx.showLoading({
            mask: true,
            title: '正在加载....'
        })
        tss.get({
            url: tss.url('') + '/tms/redpacket/receive/' + RedPacketId,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false,
                        complete: res => {
                            _App.orderInfo.RedPacketId = ''
                        }
                    })
                    wx.hideLoading()
                    return
                }
                const {
                    redPacket
                } = res.data
                this.showRedpacket(redPacket)
            }
        })
    },

    showRedpacket(data) {
        this.setData({
            painting: {
                width: 400,
                height: 500,
                clear: true,
                views: [{
                        // 背景图
                        type: 'image',
                        url: `${_App.aliyun_host}/wx_account/redpacket_bg.png`,
                        top: 0,
                        left: 0,
                        width: 400,
                        height: 500
                    },
                    {
                        type: 'text',
                        content: `${data.money}`,
                        fontSize: 80,
                        color: '#fff',
                        top: 100,
                        left: 150,
                        textAlign: 'center',
                        // width: 245,
                        bolder: true
                    },
                    {
                        type: 'text',
                        content: `【 ${data.type} 】`,
                        fontSize: 30,
                        color: '#fff',
                        top: 450,
                        left: 200,
                        textAlign: 'center',
                        // width: 245,
                        bolder: true
                    },
                ]
            }
        })
    },
    eventGetImage(e) {
        const {
            tempFilePath,
            errMsg
        } = e.detail
        if (errMsg === 'canvasdrawer:ok') {
            this.setData({
                imgUrl: tempFilePath,
                visible: true
            })
        }
        wx.hideLoading()
    },
    goRedpacketPage() {
        // const { item } = e.currentTarget.dataset
        // wx.navigateTo({
        //   url: `${Pages.order_quote}?red_packet=${JSON.stringify(item)}`
        // })
        wx.navigateTo({
            url: Pages.redpacket,
            success: () => {
                setTimeout(() => {
                    this.onClosePop()
                }, 1000);
            }
        })
    },
    onClosePop() {
        this.setData({
            visible: false
        })
    },
    onShareAppMessage(){
      return {
        title: "立迅物流",
        path:'/pages/homepage/index/index'
      }
    }
})
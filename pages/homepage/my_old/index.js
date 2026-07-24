import Pages from '../../../pages.js'
import user from '../../../utils/user.js';
const _App = getApp().globalData
const tss = require('../../../utils/tss.js');

Component({
    options: {
        styleIsolation: 'apply-shared',
    },
    data: {
        joinE8: Pages.joinE8_1,
        myImg: `${_App.aliyun_host}/wx_my/bg.png`,
        wave: `${_App.aliyun_host}/wx_my/wave.gif`,
        _options: [],
        _options2: [],
        system_options: [
            // { title: '学习教程', notice: '', icon: 'video', url: 'learning' },
            // { title: '问题建议', notice: '', icon: 'question', url: 'question' },
            {
                title: '设置',
                notice: '',
                icon: 'settings',
                url: 'settings'
            },
            // { title: '关于我们', notice: '', icon: 'group_fill', url: 'web',param:'aboutus' },
            {
                title: '开发者中心',
                notice: '',
                icon: 'settingsfill',
                url: 'admin',
                roles: '开发者'
            },
            // { title:'客服',notice:'',icon:'',url:'customer_service'}
            // {
            //     title: '联系客服',
            //     notice: '',
            //     icon: 'service',
            //     url: 'service'
            // },
        ],
        foot_img: `${_App.aliyun_host}/wx_my/foot_img.jpg`,
        qrcodeUrl: `${_App.aliyun_host}/wx_my/top_qrcode.png`,
        user: _App.user,
        app_name: _App.app_name
    },
    properties: {

    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        created() {
            this.setData({
                app_name: _App.app_name
            })
            console.log(_App)
        },
        attached() {
            // 初始化菜单
            this.setMenu(_App.tabbarList)
            // 缓存图片
            // let foot_img = wx.getStorageSync('foot_img')
            // if (foot_img) {
            //   this.setData({ foot_img })
            //   return
            // } else {
            //   this.setData({
            //     foot_img: `${_App.aliyun_host}/wx_my/foot_img.jpg`
            //   }, () => {
            //     let strong = [this.data.foot_img].map(i => this.getImageInfo(i).then(i => i.path))
            //     Promise.all(strong).then(res => {
            //       wx.setStorage({ key: 'foot_img', data: res[0] })
            //     })
            //   })
            // }
        },
        detached: function () {

        },
        ready: function () {
            const {
                companyInfo,
                ifHideCompany
            } = _App
            this.setData({
                user: _App.user,
                companyName: (ifHideCompany && companyInfo.name) || ''
            })
            this.dealRoles(_App.user.roles)
        },
    },
    methods: {
        drawQrcode() {
            wx.getImageInfo({
                src: `${_App.app_host}/tss/wx/api/acode?uName=${_App.user.uName}&uToken=${_App.user.uToken}&appId=wx9b75ba40fdf9b921&page=pages/homepage/home_gzh/index&qrCode=true`,
                success: res => {
                    console.log(res)
                    wx.previewImage({
                        urls: [res.path]
                    })
                },
                fail: res => {
                    wx.showModal({
                        content: res.errMsg,
                        showCancel: false
                    })
                }
            })

        },
        getImageInfo(src) {
            return new Promise(success => wx.getImageInfo({
                src,
                success
            }))
        },
        // 角色处理
        dealRoles(data) {
            let roleArray = data.split(',');
            let role = roleArray.filter(item => item != '$匿名角色' & item != '普通员工')

            this.setData({
                "user.role": role.join(',')
            })
        },
        //获取域配置
        getQYWX() {
            console.log(_App.DomainConfig)
            const config = _App.DomainConfig
            if (config.qywx_company_id && config.qywx_extinfo) {

            }
        },
        // 前往默认菜单
        //卜数官方：https://work.weixin.qq.com/kfid/kfc3f904576096112dc
        //wwf5ddfc6458f67e54
        //必须同一主体
        goSystemPage(e) {
            //获取域配置
            const config = _App.DomainConfig
            let type = e.currentTarget.dataset.param
            //调用拉起微信客服
            if (e.currentTarget.id == "service") {
                if (true) {
                    wx.openCustomerServiceChat({
                        extInfo: {
                            url: 'https://work.weixin.qq.com/kfid/kfc3f904576096112dc'
                        },
                        corpId: 'wwf5ddfc6458f67e54',
                        success: res => {
                            console.log(res)
                        },
                        fail: err => {
                            console.log(err)
                            wx.showToast({
                                title: '出错了',
                                icon: 'none'
                            })
                        }
                    })
                } else {
                    wx.showToast({
                        title: '企业未绑定客服',
                        icon: 'none'
                    })
                }
                return
            }
            wx.navigateTo({
                url: `${Pages[e.currentTarget.id]}?type=${type||''}`,
                fail: () => {
                    wx.showToast({
                        title: '该页面暂未开放...',
                        icon: 'none'
                    })
                }
            })
        },
        // 前往从系统请求回来的菜单
        goOptionsMenu(e) {
            const {
                id: code
            } = e.currentTarget
            wx.navigateTo({
                url: Pages[code],
                fail: () => {
                    wx.showToast({
                        title: '该页面暂未开放...',
                        icon: 'none'
                    })
                }
            })
        },
        // 渲染菜单 第一排最多四个 剩余平铺
        setMenu(menu) {
            console.log(menu,user)
            let my = menu.length && menu.filter(m => m.code == 'my')[0].children || []
            if(user.openid=="testing"){
                my=[]
            }
            this.setData({
                _options: my.slice(0, 4),
                _options2: my.slice(4)
            })
        },
        // 前往个人信息中心
        goPersonInfo() {
            wx.navigateTo({
                url: Pages.person_info,
            })
        },
        // 注销登陆
        logOut() {
            wx.showModal({
                content: '您确定注销登陆？',
                success: res => {
                    if (res.confirm) {
                        this.clearnUtoken().then(res => {
                            console.log(res)
                            res.failed ?
                                wx.showModal({
                                    content: '注销失败',
                                    showCancel: false
                                }) : wx.reLaunch({
                                    url: `${Pages.login}?logout=true`,
                                    complete: () => {
                                        _App.user = {}
                                        // user = {}
                                        // console.log(user,_App.user)
                                    }
                                })
                        })
                    }
                }
            })
        },
        clearnUtoken(params = {
            openid: _App.user.uToken
        }) {
            return new Promise(completion => {
                tss.post({
                    url: `${tss.url('wxapi')}logout`,
                    params,
                    completion
                })
            })
        },
        toLogin(){
            console.log('跳转登陆界面')
            console.log(this.data.user.openid)
            if(this.data.user.openid=='testing'){
                wx.showLoading({
                  title: '请稍后...',
                  mask:true
                })
                console.log(_App)
                _App.user={}
                this.clearnUtoken().then(res => {
                    console.log(res)
                    wx.hideLoading()
                    res.failed ?
                        wx.showModal({
                            content: '请稍后再试',
                            showCancel: false
                        }) : wx.reLaunch({
                            url: `${Pages.login}?logout=true`,
                            complete: () => {
                                _App.user = {}
                                // user = {}
                                // console.log(user,_App.user)
                            }
                        })
                })
            }
        },
    },
    observers: {

    },
})
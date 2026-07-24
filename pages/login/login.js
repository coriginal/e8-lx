const _App = getApp().globalData
const tss = require('../../utils/tss.js')
import user from '../../utils/user.js'
import Pages from '../../pages.js'
import localStorage from '../../utils/localStorage'
import initFn from '../init';

//  设置体验者账号
const TestLoginAccount = {
    tag: true,
    uName: 'testing123',
    uToken: 'testing'
};

// const Menu = { "EFF": "EFF_XCX", "E8": "E8_XCX" }
const MenuId = 'E8_XCX';

const showModal = (msg, fn) => wx.showModal({
    title: '提示',
    content: msg,
    showCancel: false,
    complete: fn && fn()
});
const showLoading = title => wx.showLoading({
    title: title,
    mask: true
});

Page({

    data: {
        height: _App.menuRect.bottom + _App.menuRect.top - 20,
        // TitleImgUrl: `${_App.aliyun_host}/eff-logo.png`,
        TitleImgUrl: '/images/logo.jpg',
        ImgPath: [],
        obj: {},
        hide: true,
        agreement: false
    },

    onLoad: function (options) {
        if (options.logout == "true") {
            user.domain = ""
        }
        this.getLoginImg()
        const _domain = options.domain || localStorage.getItem("domain"),
            _group = localStorage.getItem("group"),
            _belong = localStorage.getItem("belong"),
            _pid = localStorage.getItem("pid")
        if (_domain) {
            this.data.obj.domain = _domain
        }
        if (_group) {
            this.data.obj.group = _group
        }
        if (_belong) {
            this.data.obj.belong = _belong
        }
        if (_pid) {
            this.data.obj.pid = _pid
        }
        this.data.obj = Object.assign(this.data.obj, JSON.parse(options.json || "{}"))
        this.data.logout = options.logout
        this.setData({
            ifShowTest: this.ifFromGzh(wx.getLaunchOptionsSync().scene)
        })
        if (_App.sourceShare && _App.sourceShare.source) {
            this.setData({
                ifShowTest: false
            })
        }
        // 菜单页面
        if (options.code) {
            this.data.menuCode = options.code
        }
    },
    ifFromScan(scene) {
        //,1047,1048,1049
        if ([1011, 1012, 1013, 1047, 1048, 1049].includes(Number(scene))) {
            return false
        }
        return true
    },
    // 判断是否来源公众号
    ifFromGzh(scene) {
        if ([1020, 1035, 1043, 1058, 1067, 1074, 1082, 1091].includes(Number(scene))) {
            return false
        }
        _App.ifFromGzh = true
        return true
    },
    onShareAppMessage(){
        wx.showShareMenu({
            url:'pages/login/login',
            title: "分享"
        })
    },
    onReady() {
        //this.toLogin()
    },

    async onShow(){
        await this.getWechatCode()
        console.log(this.data.jsCode)
        this.toLogin()
    },
    getWechatCode() {
        return user.getWechatCode()
            .then(jsCode => {
                this.setData({
                    jsCode
                })
            })
    },

    // 获取登陆页swiper图片
    getLoginImg: function () {
        let ImgList = wx.getStorageSync('ImgList')
        if (ImgList) {
            this.setData({
                ImgList
            })
            return
        }
        const getImageInfo = src => new Promise(complete => wx.getImageInfo({
            src,
            complete
        }))
        ImgList = [1, 2, 3].map(i => `${_App.aliyun_host}/wx_login/login${i}.png`)
        this.setData({
            ImgList
        }, () => {
            ImgList = ImgList.map(src => getImageInfo(src).then(i => i.path))
        })
        Promise.all(ImgList).then(ImgList => {
            wx.setStorage({
                key: 'ImgList',
                data: ImgList
            })
        })
    },


    // 体验账号登陆
    loginByTest() {
        wx.reLaunch({
            url: '../homepage/index/index',
        })
    },
    cantLogin() {
        wx.showModal({
            showCancel: false,
            title: '提示',
            content: '请先阅读并同意《用户协议》和《隐私协议》'
        })
    },
    // 注册 获取手机号码-->注册登陆
    getPhoneNumber: function (e) {
        const _this = this
        if (e.detail.encryptedData) {
            wx.checkSession({
                success: () => {
                    _this.doRegister(_this.data.obj, e.detail)
                },
                fail: () => {
                    user.getWechatCode()
                        .then(jsCode => {
                            _this.setData({
                                jsCode
                            }, () => {
                                _this.doRegister(_this.data.obj, e.detail)
                            })
                        })
                }
            })
        }
    },
    //  注册
    doRegister: function (obj, ops) {
        showLoading('注册中...');
        user.getPhoneNumber({
            ...ops,
            jsCode: this.data.jsCode,
            completion: res => {
                if (res.failed) {
                    wx.hideLoading()
                    showModal(res.msg + res.errorMsg, () => {
                        this.getWechatCode()
                    })
                    return
                }
                // 如果注册没有域 就指定当前小程序默认域
                if (!obj.domain) {
                    obj.domain = _App.register.domain;
                }
                user.register({
                    data: {
                        ...obj,
                        mode: 'wx',
                        mobile: res.mobile
                    },
                    completion: res => {
                        if (res.failed) {
                            showModal(res.errorMsg)
                            wx.hideLoading()
                            // this.getWechatCode()
                            return
                        }
                        
                        // 注册成功 --> 登陆
                        this.toLogin()
                    }
                })
            }
        })
    },
    checkChange(e) {
        let {
            value
        } = e.detail
        this.setData({
            agreement: value.indexOf('agree') != -1 ? true : false
        })
    },
    // 登陆
    toLogin: function (testLogin = false) {
        showLoading('登陆中...')
        user.login({
            testLogin,
            completion: async res => {
                if (res.failed) {
                    showModal(`${res.msg}.${res.errorMsg}`,()=>{
                        // wx.redirectTo({
                        //     url: '../homepage/index/index',
                        // })
                        wx.hideLoading();
                        this.setData({
                            hide: false
                        })
                    })
                    return
                }
                // console.log(res.modules?.substring(1,res.modules.length-1).replaceAll(' ','').split(','))
                if (res.openId) {
                    // 私有部署，domain和group优先取
                    if (res.noregister && !this.data.logout) {
                        wx.redirectTo({
                            url: '../homepage/index/index',
                        })
                        return
                    }
                    if (_App.app_name == 'eff') {
                        user.domain = _App.register.domain;
                        // user.group = _App.register.group;
                    }
                    this.data.obj = {
                        ...this.data.obj,
                        ..._App.user,
                        openid: res.openId
                    }
                    wx.hideLoading()
                    if (this.data.logout || !this.ifFromGzh(wx.getLaunchOptionsSync().scene) || !this.ifFromScan(wx.getLaunchOptionsSync().scene)) {
                        this.setData({
                            hide: false,
                        })
                        return
                    }
                    //this.toLogin(TestLoginAccount)
                    // Testing,体验者退出则不再进行登陆
                    // this.data.logout ? '' : this.loginByTest()
                    return
                }
                await initFn()
                var domain = res.domain
                // wx.hideLoading()
                // 获取菜单信息，如有pid则优先跳转
                _App.testLogin = testLogin
                tss.query({
                    url: `${tss.url('')}/api/menu/json`,
                    params: {
                        name: MenuId
                    },
                    completion: res => {
                        _App.tabbarList = res.data.slice(0, 5)
                        let source = this.ifHasShareId()
                        // 有邀请成为上下游的信息
                        console.log(source.source)
                        if (source.source) {
                            // 进行信息绑定
                            // 是客户的话去购买绑定 否则直接接受邀请并绑定
                            if (_App.user.isCustomer) {
                                // 去购买
                                this.doRedirectTo()
                            } else {
                                wx.hideLoading()
                                wx.showModal({
                                    title: '提示',
                                    content: '你确认接受邀请吗',
                                    cancelText: '不接受',
                                    confirmText: '接受',
                                    success: res => {
                                        // 接受邀请
                                        if (res.confirm) {
                                            // 直接绑定
                                            this.acceptShare(source)
                                                .then(res => {
                                                    wx.hideLoading()
                                                    if (res.failed) {
                                                        // 接受失败 清除source
                                                        wx.showModal({
                                                            content: res.errorMsg,
                                                            showCancel: false,
                                                            confirmText: '前往首页',
                                                            complete: () => {
                                                                _App.sourceShare = {}
                                                                wx.redirectTo({
                                                                    url: Pages.index + '?code=' + this.data.menuCode
                                                                })
                                                            }
                                                        })
                                                        return
                                                    }
                                                    wx.showModal({
                                                        content: '绑定成功！',
                                                        showCancel: false,
                                                        confirmText: '前往首页',
                                                        success: () => {
                                                            _App.sourceShare = {}
                                                            wx.redirectTo({
                                                                url: Pages.index + '?code=' + this.data.menuCode
                                                            })
                                                        }
                                                    })
                                                })
                                        } else {
                                            // 不接受邀请
                                            _App.sourceShare = {}
                                            wx.redirectTo({
                                                url: Pages.index + '?code=' + this.data.menuCode
                                            })
                                        }
                                    }
                                })
                            }
                        } else {
                            if (domain == "D006") {
                                wx.hideLoading()
                                wx.showModal({
                                    showCancel: false,
                                    content: "您目前登录的为测试环境，如您是正式发件客户，请不要下单并联系物流公司处理",
                                    success: res => {
                                        wx.showLoading({
                                            title: '登陆中...',
                                        })
                                        if (res.confirm) {
                                            this.doRedirectTo()
                                        }
                                    }
                                })
                            } else {
                                this.doRedirectTo()
                            }
                        }
                    }
                })
            }
        })
    },
    toProtocal(e) {
        let url = tss.url('') + e.currentTarget.dataset.type
        if (_App.app_name == '中铁快运') {
            url += '&company=北京中顺铁航物流有限公司&pname=中铁货运'
        }
        console.log(url)
        wx.navigateTo({
            url: `./web/index?url=${url}`,
        })
    },
    doRedirectTo() {
        wx.hideLoading()
        wx.redirectTo({
            url: this.data.obj.jumpToUrl ? decodeURIComponent(this.data.obj.jumpToUrl) : Pages.index + '?code=' + this.data.menuCode,
            complete: res => {
                this.cleanStrong(MenuId)
            }
        })
    },

    // 判断是否携带 customer_id、logistics_id
    ifHasShareId() {
        // return { source:'customer_id',sourceId:123123 }
        if (_App.sourceShare && _App.sourceShare.source) {
            user[_App.sourceShare.source] = _App.sourceShare.sourceId
            return _App.sourceShare
        }
        return {}
    },

    // 绑定
    acceptShare({
        source,
        sourceId
    }) {
        wx.showLoading()
        return new Promise(completion => {
            tss.post({
                url: tss.url('') + '/tms/api/createIdkLink',
                params: {
                    source,
                    sourceId
                },
                completion
            })
        })
    },

    // 清除菜单缓存
    cleanStrong(MenuId) {
        let key = `com.boubei.tss.portal.dao.INavigatorDao.getMenuItems(105, ${_App.user.userId})`;
        wx.request({
            url: tss.url('') + '/cache/item/SHORT?key=' + key,
            method: 'DELETE',
            complete: res => {}
        })
    }
})
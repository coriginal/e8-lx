import Pages from '../../pages.js';
import user from '../../utils/user.js';
import {
    formatUrl
} from '../../utils/util'
import initFn from '../init';
const _App = getApp().globalData;
const tss = require('../../utils/tss.js')

Page({

    data: {
        pageList: {
            // 1: { "url": Pages.order },
        },
        showChooseDomain: false,
        loadingUrl: `${_App.aliyun_host}/loading.gif`
    },

    onLoad: function (options, pageList = {}) {
        //const menuRect = wx.getMenuButtonBoundingClientRect()
        //_App.globalData.menuRect={...menuRect}
        console.log("onLoad Options:", options)
        // 遍历Pages.js将页面加入到这里，然后合并 pageList 此页面的pageList会覆盖Pages.js
        Object.values(Pages).forEach((v, i) => {
            pageList[i] = {
                url: v
            }
        })
        this.setData({
            pageList: {
                ...pageList,
                ...this.data.pageList
            },
            params: options.params || '',
        })
        // 获取参数
        console.log(this.data.pageList)
        let {
            type = '', pid = '', qparam = 1, customParams, ...entryParams
        } = options
        _App.entryParams = entryParams
        if (options.scene && options.scene.length > 2) {
            let scene = decodeURIComponent(options.scene);
            console.log(scene)
            let infos = scene.split(",")
            user.domain = infos[0];
            user.group = infos[1];
            user.belong = infos[2];
            if (infos.length > 3) {
                pid = infos[3];
                if (pid == 93 && !user.group) {
                    user.group = "operator"
                }
            }
            // 邀请下游承运商
            user.logistics_id = infos[4] || ''

            // 邀请上游承运商
            user.customer_id = infos[5] || ''

            if (infos[4]) {
                _App.sourceShare = {
                    source: 'logistics_id',
                    sourceId: infos[4]
                }
                // this.setData({ hasLogisticId: true })
            }

            if (infos[5]) {
                _App.sourceShare = {
                    source: 'customer_id',
                    sourceId: infos[5]
                }
                // this.setData({ hasCustomerId: true })
            }

            // 红包id
            if (infos[6]) {
                _App.orderInfo.RedPacketId = infos[6]
            }
        }
        // 公众号录单菜单进来
        if (options.domain) {
            user.domain = options.domain
        }

        if (options.group) {
            user.group = options.group
        }

        if (options.belong) {
            user.belong = options.belong;
        }

        if (options.domain_group) {
            user.domain_group = options.domain_group
        }

        // 扫描配置普通二维码进入
        if (options.q) {
            const queryUrl = decodeURIComponent(options.q)
            const queryParams = formatUrl(queryUrl);
            console.log(queryParams)
            //只有一个code参数时候跳转查单
            if (Object.keys(queryParams).length === 1 && queryParams.code) {
                wx.redirectTo({
                    url: `${this.data.pageList[19].url}?code=${queryParams.code}&query=1`
                })
                return
            }
            if (queryParams.domain == 'D742') {
                console.log("指定域")
                wx.showLoading()
                tss.getJSON({
                    url: tss.url('tms') + '/order/anon/scanBackOrder',
                    params: {
                        scanCode: queryParams.domain,
                    },
                    completion: res => {
                        wx.hideLoading()
                        if (res.failed) {
                            if (res.errorMsg === '未匹配系统内的订单' || res.data.data.length == 0) {
                                wx.redirectTo({
                                  url: `/pages/redirect/redirect?q=${encodeURIComponent(`https://tms.boudata.com?domain=D522&code=${queryParams.code}&pageId=47`)}`,
                                })
                            }
                        }
                    }
                })
                return
            }
            if (!queryParams.pageId) return;
            let {
                ifLogin,
                pageId,
                domain,
                uName,
                uToken,
                ...params
            } = queryParams;
            if (domain === 'D742') {
                domain = 'D522';
            }
            console.log("携带的参数输出", queryParams.code)
            if (ifLogin * 1 === 0 || pageId == 19) {
                //不需要登录
                const jump = this.data.pageList[pageId];
                if (jump) {
                    console.log(queryParams.domain)
                    wx.redirectTo({
                        url: `${jump.url}?code=${queryParams.code}&query=1&domain=${queryParams.domain}`
                    })
                    return
                }
            }
            pid = pageId
            if (domain) {
                user.domain = domain
            }
            if (uName) {
                user.uName = uName
            }
            if (uToken) {
                user.domain = uToken
            }
            this.jumpUrlParamsStr = Object.entries(params).reduce((a, [key, value]) => `${a}&${key}=${value}`, '')
            this.setData({
                params: JSON.stringify(params || {})
            })
        }
        //跳转修改页
        if (pid == 18 && customParams) {
            this.setData({
                params: JSON.stringify({
                    orderId: customParams
                })
            })
        }
        //跳转调度指派此时cutomParams的参数是tab的下标
        if (pid == 38 && customParams) {
            this.setData({
                params: JSON.stringify({
                    TabCur: customParams
                })
            })
        }

        //支付界面，此时customParams的参数是订单的id
        //新建一个支付界面，展示订单信息，并在进入页面时发起支付，
        //需要判断订单的状态，若已支付则不发起
        //to do
        if (pid == 119 && customParams) {
            this.setData({
                params: JSON.stringify({
                    orderId: customParams
                })
            })
        }

        if (pid == 120) {
            let {
                customer_id
            } = options;
            this.setData({
                params: JSON.stringify({
                    customer_id
                })
            })
        }
        this.relogin(pid || qparam, type)
    },

    chooseDomain(e) {
        console.log("chooseDomain", e.detail)
        user.domain = e.detail
        this.setData({
            showChooseDomain: false
        })
        const {
            pid,
            type,
            openId,
            jumpToUrl
        } = this.data.domainParams
        // this.relogin(pid, type, pageList)

        var type_ = pid <= 3 ? 'tab' : type;
        let json = JSON.stringify({
            openid: openId,
            pid: pid,
            type: type_,
            jumpToUrl,
            domain: user.domain,
            group: user.group
        })
        console.log("json", json)
        wx.redirectTo({
            url: `${Pages.login}?json=${json}`
        })
    },

    async relogin(pid, type, pageList = this.data.pageList) {
        console.log("relogin方法", pid, type)
        pid = Number(pid)
        if (pageList[pid]) {
            var jumpToUrl = pageList[pid].url
            user.login({
                completion: async res => {
                    if (res.failed) {
                        wx.showModal({
                            content: `用户登陆失败(${res.errorMsg})`,
                            showCancel: false,
                            success: res => res.confirm ? wx.redirectTo({
                                url: Pages.login
                            }) : ''
                        })
                        return
                    }

                    // 未登录
                    if (res.openId) {
                        // let domain = user.domain
                        if (user.domain_group) {
                            this.setData({
                                showChooseDomain: true,
                                domainParams: {
                                    pid,
                                    type,
                                    openId: res.openId,
                                    jumpToUrl
                                }
                            })
                            return
                        }
                        var type_ = pid <= 3 ? 'tab' : type;
                        let json = JSON.stringify({
                            openid: res.openId,
                            pid: pid,
                            type: type_,
                            jumpToUrl: encodeURIComponent(`${jumpToUrl}?1=1${this.jumpUrlParamsStr||''}`),
                            domain: user.domain,
                            group: user.group
                        })
                        console.log("参数携带", json)
                        wx.redirectTo({
                            url: `${Pages.login}?json=${json}&logout=true`
                        })
                        return
                    }

                    await initFn();
                    // 已登陆
                    let _params = this.data.params
                    let url = jumpToUrl.includes('?') ? `${jumpToUrl}&_params=${_params}` : `${jumpToUrl}?_params=${_params}`

                    // 邀请上游或者下游
                    if (_App.sourceShare && _App.sourceShare.source) {
                        // 判断是否客户 是直接去购买 否则是否接受邀请
                        if (_App.user.isCustomer) {
                            wx.redirectTo({
                                url
                            })
                        } else {
                            wx.showModal({
                                title: '提示',
                                content: '你确认接受邀请吗',
                                cancelText: '不接受',
                                confirmText: '接受',
                                success: res => {
                                    if (res.confirm) {
                                        const source = this.data.hasCustomerId ? 'customer_id' : 'logistics_id'
                                        const sourceId = this.data.hasCustomerId ? user.customer_id : user.logistics_id
                                        this.acceptShare(source, sourceId)
                                            .then(res => {
                                                wx.hideLoading()
                                                if (res.failed) {
                                                    // 接受报错 去首页
                                                    wx.showModal({
                                                        content: res.errorMsg,
                                                        showCancel: false,
                                                        confirmText: '前往首页',
                                                        complete: () => {
                                                            _App.sourceShare = {}
                                                            wx.redirectTo({
                                                                url: Pages.login
                                                            })
                                                        }
                                                    })
                                                    return
                                                }
                                                wx.showModal({
                                                    content: '绑定成功！',
                                                    showCancel: false,
                                                    confirmText: '前往首页',
                                                    success: res => {
                                                        _App.sourceShare = {}
                                                        wx.redirectTo({
                                                            url: Pages.login
                                                        })
                                                    }
                                                })
                                            })
                                    } else {
                                        // 不接受邀请
                                        _App.sourceShare = {}
                                        wx.redirectTo({
                                            url: Pages.login
                                        })
                                    }
                                }
                            })
                        }
                    } else {
                        wx.redirectTo({
                            url
                        })
                    }
                }
            })
        } else {
            wx.showModal({
                title: '提示',
                content: '页面暂未开放！',
                showCancel: false,
                success: res => {
                    if (res.confirm) {
                        wx.redirectTo({
                            url: Pages.login
                        })
                    }
                }
            })
            return
        }
    },
    acceptShare(source, sourceId) {
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
    }
})
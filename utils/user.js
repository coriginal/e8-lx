const tss = require('./tss.js')
import logpool from './log.js'
const E8 = getApp().globalData

const User = function () {
    this.timestamp = (new Date()).getTime()
    this.domain = ''
}

Object.defineProperties(User.prototype, {
    uToken: {
        enumerable: true,
        configurable: false,
        writable: true
    },
    uName: {
        enumerable: true,
        configurable: false,
        writable: true
    }
})

User.prototype.getPhoneNumber = function ({
    encryptedData,
    jsCode,
    iv,
    completion
}) {
    const _url = tss.url('wxphone')
    console.log(jsCode)
    tss.post({
        url: _url,
        requestBody: {
            jscode: jsCode,
            encryptedData,
            iv,
            appId: E8.app_id
        },
        completion: res => {
            if (res.failed) {
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg,
                    msg: '获取手机号失败'
                })
                return
            }

            if (res.data.code == '402') {
                logpool.error({
                    method: 'getPhoneNumber',
                    errorMsg: res.data.error,
                    api: {
                        url: _url,
                        requestBody: {
                            jsCode,
                            encryptedData,
                            iv,
                            app_id: E8.app_id
                        }
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.data.error,
                    msg: '获取手机号失败'
                })
                return
            }

            completion && completion({
                failed: false,
                mobile: res.data.phoneNumber
            })
        }
    })
}

User.prototype.getWechatCode = function () {
    return new Promise((resolve, reject) => {
        this.__wxCode({
            completion: function (res) {
                if (res.failed) {
                    logpool.error({
                        method: 'getWechatCode',
                        errorMsg: res.errorMsg
                    })
                    reject(res.errorMsg)
                    return
                }
                resolve(res.code)
            }
        })
    })
}
/** 调用接口wx.login() 获取临时登录凭证（code）：jsCode */
User.prototype.__wxCode = function ({
    completion
}) {
    var result
    wx.login({
        success: res => {
            const code = res.code
            result = code ? {
                failed: false,
                code: code
            } : {
                failed: true,
                errorMsg: res.errMsg
            }
        },
        fail: res => {
            result = {
                failed: true,
                errorMsg: 'invoke api(wx.login) failed'
            }
        },
        complete: res => {
            completion && completion(result)
        }
    })
}

User.prototype.login = function ({
    completion,
    testLogin
}) {
    this.__wxCode({
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'login',
                    errorMsg: res,
                    errorMsg
                })
                completion && completion({
                    failed: true,
                    msg: '用户登录失败',
                    errorMsg: res.errorMsg
                })
                return
            }
            // 后台登录接口
            var _url = tss.url('wxlogin'),
                params = {
                    jscode: res.code,
                    appId: E8.app_id
                };
            if (testLogin) {
                _url = tss.url('/wxlogin_test.in');
                params = testLogin
            }
            if (this.domain) {
                params.domain = this.domain
            }

            if (this.belong) {
                params.belong = this.belong
            }

            tss.post({
                url: _url,
                params: params,
                completion: res => {
                    if (res.failed) {
                        completion && completion({
                            failed: true,
                            msg: '用户登录失败',
                            errorMsg: res.errorMsg
                        })
                        return
                    }
                    const data = res.data
                    switch (data.code) {
                        // login success

                        case '200': {
                            const app = getApp().globalData
                            for (let key in data) {
                                if (key == 'openid') {
                                    this.uToken = data[key]
                                }
                                this[key] = data[key]
                            }
                            const groups = data.groups.split(',')
                            this.company = groups[groups.length - 1] || ''
                            this.isTest = testLogin && testLogin.uToken == 'testing' && true
                            this.isEff = data.modules && data.modules.includes('eff')
                            this.isCustomer = data.groups.includes('customer')
                            app.user = this
                            //将需要的缓存重新存储
                            var p = wx.getStorageSync('printType')
                            var mb_dic = wx.getStorageSync('mb_dic') ? JSON.parse(wx.getStorageSync('mb_dic')):null
                            var mb = null
                            if (mb_dic) {
                                for (let i in mb_dic) {
                                    mb = {
                                        ...mb,
                                        [`${mb_dic[i]}`]: wx.getStorageSync(mb_dic[i])
                                    }
                                }
                            }
                            var workflows=wx.getStorageSync('workflows')
                            wx.clearStorage()
                            if (p) {
                                wx.setStorageSync('printType', p)
                            }
                            if (mb) {
                                for (let key in mb) {
                                    wx.setStorageSync(key, mb[key])
                                }
                                wx.setStorageSync('mb_dic', JSON.stringify(mb_dic))
                            }
                            if(workflows){
                                wx.setStorageSync('workflows',workflows)
                            }
                            //wx.clearStorage()
                            ///
                            completion && completion({
                                failed: false,
                                roles: data.roles,
                                groups: data.groups,
                                assistGroups: data.assistGroups,
                                domain: data.domain,
                                modules: data.modules
                            })
                            break
                        }
                        // user not registered
                        case '101': {
                            completion && completion({
                                noregister:true,
                                failed: false,
                                openId: data.openid
                            })
                            break
                        }
                        // 获取openid失败
                        case '503':
                        default: {
                            logpool.error({
                                method: 'login',
                                errorMsg: res.data.error,
                                api: {
                                    url: _url,
                                    params
                                }
                            })
                            completion && completion({
                                failed: true,
                                msg: '用户登录失败',
                                errorMsg: res.data.error
                            })
                            break
                        }
                    }
                }
            })
        }
    })
}

User.prototype.register = function ({
    data,
    completion
}) {
    const _url = tss.url('wxreg')
    if (this.belong) {
        data.belong = this.belong
    }
    // if (this.domain) {
    //   data.domain = this.domain
    // }
    tss.post({
        url: _url,
        params: data,
        completion: res => {
            if (res.failed) {
                completion && completion({
                    failed: true,
                    msg: '用户注册失败',
                    errorMsg: res.errorMsg
                })
                return
            }
            switch (res.data.code) {
                case '100':
                case '102':
                case '104': {
                    if (res.data.openid) {
                        this.uToken = res.data.openid
                    }
                    if (res.data.mobile) {
                        this.uName = res.data.mobile
                    }
                    completion && completion({
                        failed: false
                    })
                    break
                }
                default: {
                    logpool.error({
                        method: 'register',
                        errorMsg: res.data.error,
                        api: {
                            url: _url,
                            params: data
                        }
                    })
                    completion && completion({
                        failed: true,
                        msg: '用户注册失败',
                        errorMsg: res.data.error
                    })
                }
            }
        }
    })
}

export default new User()
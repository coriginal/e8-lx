import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
import {
    $wuxDialog
} from '../../../components/index'
import initFn from '../../../pages/init.js';
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')


Page({

    /**
     * 页面的初始数据
     */
    data: {
        menu_list: [{
                name: '切换账号',
                code: 'account',
                icon: 'refresh',
                notice: '【开发者】'
            },
            {
                name: '页面跳转',
                code: 'topage',
                icon: 'copy',
                notice: '【开发者】'
            }
        ],
        _menu_list: [{
            name: '环境切换',
            code: 'env',
            icon: 'apps',
            notice: _App.app_host
        }, ],
        currentSize: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            user: _App.user
        })
    },


    clickSettingMenu(e) {
        const {
            id: code
        } = e.currentTarget
        switch (code) {
            case 'account':
                this.chooseAccount();
                break;
            case 'topage':
                this.goPages();
                break;
            case 'env':
                this.changeEnv();
                break;

        }
    },
    changeEnv() {
        let itemList = ['v3_prod', 'v3_dev']
        wx.showActionSheet({
            itemList,
            success: res => {
                // let url = itemList.map(i =>`${_App.aliyun_host}/wx_my/${i}.png`)[res.tapIndex]
                let url = itemList.map(i => `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&page=pages/login/login&onlyQparam=true&qparam=1,2,3,4,5,6,7`)
                this.setData({
                    visible: true,
                    URL: url[0]
                })
            }
        })
    },
    goPages() {
        let _this = this
        $wuxDialog().prompt({
            resetOnClose: true,
            maskClosable: false,
            focus: true,
            title: '开发者',
            content: '请输入需要跳转的页面ID',
            fieldtype: 'number',
            maxlength: 10,
            onConfirm(e, response) {
                console.log(e, response)
                wx.reLaunch({
                    url: `${Pages.redirect}?pid=${response}`,
                })
            },
        })
    },
    chooseAccount() {
        let _this = this
        $wuxDialog().prompt({
            resetOnClose: true,
            maskClosable: false,
            focus: true,
            title: '开发者',
            content: '请输入需要切换的账号',
            fieldtype: 'number',
            maxlength: 20,
            placeholder: '手机号码',
            onConfirm(e, response) {
                console.log(e, response)
                let Account = {
                    tag: true,
                    uCode: response
                }
                _this.toLogin(Account)
            },
        })
    },
    toLogin(testLogin) {
        user.login({
            testLogin,
            completion: async res => {
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.errorMsg || res.msg,
                        showCancel: false
                    })
                    return
                } else {
                    let MenuId = 'E8_XCX'
                    await initFn();
                    tss.query({
                        url: `${tss.url('')}/api/menu/json`,
                        params: {
                            name: MenuId
                        },
                        completion: res => {
                            console.log(res)
                            _App.tabbarList = res.data && res.data.slice(0, 5)
                            wx.redirectTo({
                                url: Pages.index
                            })
                        }
                    })
                }
            }
        })
    },
    //关闭
    onClosePop() {
        this.setData({
            visible: false
        })
    },
    priviewImg() {
        wx.previewImage({
            urls: [this.data.URL],
        })
    }
})
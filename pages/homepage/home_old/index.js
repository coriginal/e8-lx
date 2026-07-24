//import { TickSystem } from 'WechatXrFrame/systems';
import Pages from '../../../pages.js';
import user from '../../../utils/user.js';
const _App = getApp().globalData;
const source = require('./source.js');

const tss = require('../../../utils/tss.js');
Component({
    options: {
        styleIsolation: 'apply-shared',
    },
    data: {
        user: _App.user,
        cardCur: 0,
        productList: [{
                url: `${_App.aliyun_host}/wms.jpg`,
                title: 'WMS',
                name: '仓储管理系统'
            },
            {
                url: `${_App.aliyun_host}/wx.jpg`,
                title: 'TMS',
                name: '运输管理系统'
            },
            {
                url: `${_App.aliyun_host}/e8.jpg`,
                title: 'E发发',
                name: 'E发发一票通'
            }
        ],
        menuList: source.getMenuList(Pages),
        // swiperList: [
        //   { code: 'image1', url: `${_App.aliyun_host}/wx_index/bg-1.png` },
        //   { code: 'image2', url: `${_App.aliyun_host}/wx_index/bg-2.png` },
        //   { code: 'image3', url: `${_App.aliyun_host}/wx_index/bg-3.png` }],
        gridList: source.getGridList(Pages),
        showHotProduct: true,
        logoUrl:""
    },
    properties: {
        name: String,
        home: String,
        user: Object,
        tabbarList: Array,
        swiperList: {
            type: Array,
            value: []
        },
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        created() {
        },
        attached() {
            this.setMenu(_App.tabbarList)
        },
        detached: function () {
        },
        ready: function () {
            console.log(user)
            let logoUrl=`https://tms.boudata.com/tss/aapi/domain/pic?domain=${user.domain}&field=logo&uName=${user.uName}&uToken=${user.uToken}`
            this.setData({
                logoUrl,
                app_host: _App.app_host,
                app_name: _App.app_name
            })
        },
    },
    methods: {
        // 设置菜单
        setMenu(menu) {
            let list = menu.find(item => item.code == 'home').children
            let list1 = list.find(item => item.code == 'home_1')
            let list2 = list.find(item => item.code == 'home_2')
            //D511
            let menuList1 = list1 ? list1.children.map(i => ({
                ...i,
                url: Pages[i.url]
            })) : []
            console.log(menuList1)
            let menuList2 = list2 ? list2.children.map(i => ({
                ...i,
                url: Pages[i.url]
            })) : []
            if (_App.user.modules&&_App.user.modules.includes('eff') && (_App.app_name != "e8_prod" && _App.app_name != "中铁快运")) {
                menuList1 = menuList1.filter(i => i.code !== '询价')
            }
            /*
            wx.chooseLocation、wx.getLocation、wx.onLocationChange */
            if (_App.user.domain == "D511") {
                menuList1 = menuList1.filter(i => i.code !== '询价')
                var showHotProduct = false
            }
            this.setData({
                menuList1,
                menuList2,
                showHotProduct
            })
        },
        // 首页轮播图
        cardSwiper(e) {
            this.setData({
                cardCur: e.detail.current
            })
        },
        // 点击轮播图
        swiperItemTap(e) {
            const {
                id
            } = e.currentTarget;
            const {
                code
            } = e.currentTarget.dataset;
            // D006定制
            switch (code) {
                case 'D006-toWMS.png': {
                    wx.navigateToMiniProgram({
                        appId: 'wx6f5e8e3f5b6b45d8',
                    });
                    break;
                };
            case 'D006-toBD.png': {
                wx.navigateToMiniProgram({
                    appId: 'wx5255074da90a4dca',
                    path: 'pages/productList/productList'
                });
                break;
            };
            default: {
                wx.previewImage({
                    urls: [this.data.swiperList[id].url],
                })
            }
            }
            // wx.navigateTo({ url: `${Pages.webview}?code=${code}` })
        },

        // 红蓝按钮两兄弟
        goList(e) {
            console.log(e)
            const {
                id: url
            } = e.currentTarget
            wx.navigateTo({
                url: url
            })
        },

        // 作为页面的生命周期
        onLoad(options) {
            wx.setNavigationBarTitle({
                title: this.data.name
            })
        },
        onReady() {
        },
        onShow() {
        },
        bindtapMessage(e) {
            // wx.requestSubscribeMessage({
            //   tmplIds: ['EMcqjzdXO9PEb9iJGUNaS9-wS7won3BhnOryYF8VIiI', '0WzhDK177K935P1dIG018egvbfmCrHbPzxj6A6YyWVg', 'gVYSKpL454iIVArPM_PXh1TQIy4o7Ccnrx9N7cBGRVY'],
            //   success(res) {
            //     console.log(res)
            //   },
            //   complete: res => {
            //     console.log(res)
            //   }
            // })
            wx.navigateTo({
                url: `${Pages.web}?type=changelog`,
            })
        },
        showExplain(e) {
            const {
                code
            } = e.currentTarget.dataset
            this.setData({
                pressLongCode: code
            })
        },
        startTest() {
            wx.sendSms({
                success:res=>{
                    console.log(res)
                },
                fail:res=>{
                    console.log(res)
                }
            })
        },
        toMdbjq(){
            wx.navigateTo({
              url: '/pages-order/order/order_print/custom_print/index',
            })
        }
    },
    observers: {

    },
})
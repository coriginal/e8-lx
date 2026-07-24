import dayjs from 'dayjs';
import Pages from '../../../pages.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js');
Component({
    /**
     * 组件的属性列表
     */
    options: {
        styleIsolation: 'apply-shared',
    },
    properties: {
        eff_oc_count: {
            type: Number,
            value: '',
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        someData: null,
        showCountData: false
    },
    lifetimes: {
        // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
        created() {},
        attached() {
            this.setMenu(_App.tabbarList)
        },
        detached: function () {

        },
        ready: function () {
            if (_App.user.domain === 'D948') {
                this.getCountData();
                this.setData({
                    showCountData:true
                })
            }
        },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        toList(e) {
            console.log(e)
            let {
                type
            } = e.currentTarget.dataset
            let pageTitle = ''
            let ids = ''
            switch (type) {
                case 'unUploadOrder':
                    pageTitle = '待上传';
                    ids = this.data.someData['unUploadOrderIds'].join(',')
                    break;
                case 'uploadOrder':
                    pageTitle = '已上传';
                    ids = this.data.someData['uploadOrderIds'].join(',')
                    break;
            }
            wx.navigateTo({
                url: `/pages-order/order/platform_order_list/index?orderIds=${ids}&pageTitle=${pageTitle}`,
            })
        },
        getCountData() {
            const start = dayjs().startOf('day')
            const end = dayjs().endOf('day')
            tss.post({
                method: 'GET',
                url: tss.url('') + `/tms/order/platform/data/count?platformKey=5&startDate=${start.format('YYYY-MM-DD HH:mm:ss')}&endDate=${end.format('YYYY-MM-DD HH:mm:ss')}`,
                useCookie: true,
                completion: res => {
                    console.log(res)
                    if (res.failed) {
                        return
                    }
                    this.setData({
                        someData: res.data.data
                    })
                }
            })
        },
        // 设置菜单
        setMenu(menu) {
            let list = menu.find(item => item.code == 'oc')
            let oc = list ? list.children : []
            this.setData({
                oc
            })
        },

        goList(e) {
            console.log(JSON.parse(e.target.dataset.description))
            let url_p = '';
            if (e.target.dataset.description) {
                const params = JSON.parse(e.target.dataset.description);
                url_p = '?listid=' + e.target.dataset.listid
                for (let key in params) {
                    url_p += '&' + key + '=' + params[key]
                }
                console.log(url_p, e.currentTarget.id)
            }
            console.log(Pages[e.currentTarget.id] + url_p)
            wx.navigateTo({
                url: Pages[e.currentTarget.id] + url_p
            })
        }
    }
})
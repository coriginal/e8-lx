/*
 * @Author: Droganc
 * @Date: 2022-03-12 14:07:31
 * @LastEditTime: 2022-03-12 14:17:45
 * @LastEditors: Droganc
 * @Description: 
 * @FilePath: /e8v3/pages/homepage/table/table.js
 */
import Pages from '../../../pages.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js');

Component({
    options: {
        styleIsolation: 'apply-shared',
    },
    data: {
        tableList: [
            // { wxicon: 'i-deliver', name: '测试' }
        ]
    },
    properties: {
        tableList: {
            type: Array,
            value: [{
                wxicon: 'i-deliver',
                name: '测试报表'
            }]
        }
    },
    lifetimes: {
        ready: function () {

        },
    },
    methods: {
        goList(e) {
            const {
                currentTarget: {
                    id,
                    dataset: {
                        url,
                        code,
                        coldefs
                    }
                }
            } = e;
            if (code == 'h5-dashboard') {
                console.log(url)
                wx.navigateTo({
                    url: `${Pages.web}?type=dashboard&path=${url}`,
                })
                return
            }
            if (code == 'xcx_report1' || code == 'xcx_report2') {
                wx.navigateTo({
                    url: `${Pages.web}?type=reports&code=${code}`,
                })
                return
            }
            if (code == 'xcx_report3') {
                wx.navigateTo({
                    url: `${Pages.driver_chart}?code=${code}`,
                })
                return
            }
            if (code == 'xcx_report4') {
                wx.navigateTo({
                    url: `${Pages.customer_chart}?code=${code}`,
                })
                return
            }
            tss.query({
                url: tss.url('sql') + 'tms_x_domain',
                completion: (e) => {
                    console.log(e)
                    wx.navigateTo({
                        url: `${Pages.report}?reportid=${id}&coldefs=${coldefs}`,
                    })
                }
            })
        },
    }
})
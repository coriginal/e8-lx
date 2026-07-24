const tss = require('../../../utils/tss.js')
const alert = require('../../../utils/alert.js')
const _App = getApp().globalData

Component({
    options: {
        styleIsolation: 'apply-shared',
    },
    data: {
        tableList: [],
        cellHeight: '',
        app_host: _App.app_host,
        iconDic: {
            '请假': 'qingjiashenqing',
            '增补员申请': 'renlizhaopin',
            '离职申请': 'lizhishenqing',
            '考核提成方案': 'yuangongyeji',
            '人事申请': 'zhanghaoguanli',
            '预付款': 'zichan',
            '报备申请': 'bianji',
            '场地成本': 'wuyefei',
            '其他成本': 'yue',
            '车辆相关费用': 'wuliu',
            '物料成本': 'licaibao',
            '财务费用': 'yue',
            '资金类申请': 'shenpi',
            '订单费用报销': 'baoxiao',
            '运输单费用报销': 'baoxiao',
            '加盟支出': 'fapiao',
            '开票申请(临时)': 'shenpi',
            '财务数据提交工作流': 'shenpi',
            '仓配部相关费用': 'yue',
            '销售成本相关流程': 'liuchengshenpi',
            '订单费用报备': 'bianji',
            '运输单费用报备': 'bianji',
            '开票申请': 'shenpi',
            '人力成本': 'yue',
            '考勤打卡': 'dakaqiandao'
        }
    },
    lifetimes: {
        // onPullDownRefresh: function () {
        //     this.getWorkflows()
        //     wx.stopPullDownRefresh()
        // },
        ready() {
            const _this = this;
            wx.getSystemInfo({
                success: function (res) {
                    var windowWidth = res.windowWidth;
                    _this.setData({
                        cellHeight: (windowWidth / 3) + 'px',
                        imageHeight: (windowWidth / 12) + 5
                    })
                },
                complete: function () {
                    if (wx.getStorageSync('workflows')) {
                        _this.setData({
                            tableList: wx.getStorageSync('workflows')
                        })
                    } else {
                        wx.showLoading()
                    }
                    _this.getWorkflows()
                }
            });
        },
    },
    methods: {
        getWorkflows: function () {
            const url = tss.url('wxapi') + 'wftables'
            tss.getJSON({
                url,
                params: {
                    noCache: true
                },
                completion: res => {
                    if (res.failed) {
                        return alert.error()
                    }
                    var _complete = []
                    res.data.push({
                        id: -1,
                        name: "考勤打卡",
                        pid: 140,
                        table: "s_advance_fee",
                        wfingCount: null,
                        wxicon: "/tss/images/advance.png",
                        wxurl: '../clockin/index'
                    })
                    if (res.data.length < 12) {
                        _complete.length = 12 - res.data.length
                    }
                    res.data = res.data.map(item => {
                        item['wxicon'] = this.data.iconDic[item.name]
                        return item
                    })
                    if (JSON.stringify(res.data.concat(_complete)) == JSON.stringify(wx.getStorageSync('workflows'))) {
                        wx.hideLoading()
                        return
                    }
                    this.setData({
                        tableList: res.data.concat(_complete)
                    })
                    wx.setStorageSync('workflows', res.data.concat(_complete))
                    wx.hideLoading()
                }
            })
        },
        openWorkflow: function (e) {
            console.log(e)
            const ds = e.currentTarget.dataset
            const recordid = ds.recordid;
            const wfingCount = ds.wfingcount || 0;
            const wxurl = ds.wxurl;
            if (!recordid) return;
            if (wxurl) {
                wx.navigateTo({
                    url: wxurl
                })
            } else {
                wx.navigateTo({
                    url: `../../../pages-work/tss/workflows/workflow/index?recordid=${recordid}&wfingCount=${wfingCount}`,
                })
            }
        }
    }
})
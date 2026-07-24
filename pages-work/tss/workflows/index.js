const tss = require('../../../utils/tss.js')
const alert = require('../../../utils/alert.js')
const _App = getApp().globalData

Page({
    data: {
        tableList: [],
        cellHeight: '',
        app_host: _App.app_host
    },
    onLoad(options) {
        const _this = this;
        wx.getSystemInfo({
            success: function (res) {
                var windowWidth = res.windowWidth;
                _this.setData({
                    cellHeight: (windowWidth / 3) + 'px',
                    imageHeight: (windowWidth / 12) + 'px'
                })
            },
            complete: function () {
                wx.showLoading()
                _this.getWorkflows()
            }
        });
    },

    onPullDownRefresh: function () {
        this.getWorkflows()
        wx.stopPullDownRefresh()
    },
    getWorkflows: function () {
        const url = tss.url('wxapi') + 'wftables'
        tss.getJSON({
            url,
            completion: res => {
                if (res.failed) {
                    return alert.error()
                }

                var _complete = []
                if (res.data.length < 12) {
                    _complete.length = 12 - res.data.length
                }
                this.setData({
                    tableList: res.data.concat(_complete)
                })
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
            console.log("无wxurl跳转", recordid, `workflow/index?recordid=${recordid}&wfingCount=${wfingCount}`)
            wx.navigateTo({
                url: `../../workflows-child/workflow/index?recordid=${recordid}&wfingCount=${wfingCount}`,
            })
        }
    }
})
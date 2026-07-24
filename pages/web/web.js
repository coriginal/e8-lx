// 外部h5

const _App = getApp().globalData;

Page({
    /**
     * 页面的初始数据
     */
    data: {
        srcList: {
            learning: `${_App.app_host}/tss/pages/web-view/xcx_learning.html`,
            aboutus: "https://www.boudata.com/about.html",
            register: "https://e8.boudata.com/tss/pages/eff/agree_salesman.html",
            changelog: `${_App.app_host}/tss/pages/web-view/xcx_changelog.html`,
            reports: `${_App.app_host}/tss/pages/web-view/h5-report/h5-customer.html`,
            dashboard: `${_App.app_host}/tss/pages/web-view/h5-report/report/index.html#/home`,
            pdf: `${_App.app_host}/pdfViewer/web/viewer.html?title=服务协议&file=https://tms.boudata.com/tss/xdata/attach/download/`,
            //高铁快运
            gtky: 'https://www.dsdgtky.com/news-info.php?classID=1&id=35'
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(_App.companyInfo);
        console.log(options);
        let src = this.data.srcList[options.type];
        if (options.attachId) {
            src += `${options.attachId}`;
        }
        if (options.path) {
            console.log(_App.user)
            src += `?uName=${_App.user.uName}&uToken=${_App.user.uToken}&company=${encodeURI(encodeURI(_App.user.company))}`;
        }
        // reports
        if (options.code) {
            src += `?uName=${_App.user.uName}&uToken=${_App.user.uToken}`;
            src += `&name=${options.code || ""}`;
        }
        this.setData({
            src
        });
    },

    // 网页向小程序post一个message
    getWebMessage(e) {
        console.log(e);
    },
    // 网页加载成功
    webLoad(e) {
        console.log(e);
    },
    // 网页加载失败
    webLoadFailed(e) {
        console.log(e);
    }
});
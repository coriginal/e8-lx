//关于缓存：调用登录时user.js会将缓存清空
App({
    globalData: {
        user: {
            openid:'testing',
            roles:'$匿名角色'
        },
        companyInfo: {},
        tabbarList: [{
            "id": 106,
            "name": "查单",
            "code": "router",
            "icon": "location|locationfill",
            "parentId": 105,
            "url": "1",
            "target": "_self",
            "methodName": null,
            "params": null,
            "description": null,
            "children": []
        }, {
            "id": 122,
            "name": "我的",
            "code": "my",
            "icon": "people|peoplefill",
            "parentId": 105,
            "url": "url",
            "target": "_self",
            "methodName": null,
            "params": null,
            "description": null,
            "children": []
        }],
        entryParams: {},
        systemInfo: '',
        init_pid: 1,
        writeLocTime: '',
        orderInfo: {},
        ifHideCompany: 1,
        DomainConfig: {}
    },

    onLaunch: function (options) {
        //console.log(options)
        // this.getQueryParams(options)
        const {
            _host = 'e8_prod'
        } = options.query
        // 默认环境e8_prod
        const app = require('./project.config.js').getAppHost(_host)
        const menuRect = wx.getMenuButtonBoundingClientRect()
        //console.log(app)
        //console.log(menuRect)
        const systemInfo = wx.getSystemInfoSync()
        this.globalData = {
            ...this.globalData,
            ...app,
            menuRect,
            systemInfo
        }
        this.globalData._options = JSON.stringify(options)
        // 微信冷启动自动更新
        wx.getUpdateManager().onCheckForUpdate()
    },
    onShow: function (options) {
        // 强制使用新版本
        let updateManager = wx.getUpdateManager()
        updateManager.onUpdateReady(() => {
            // wx.clearStorage()
            updateManager.applyUpdate()
        })
    },
    onHide: function () {

    },
    // 查询不到页面的时候 默认一个进入页
    onPageNotFound(e) {
        let options = JSON.parse(this.globalData._options)
        this.getQueryParams(options)
    },
    getQueryParams(options) {
        // console.log(decodeURIComponent(options.query.scene).split(","))
        //console.log(options)
        // return new Promise(resolve=>{
        if (options.query.scene && options.query.scene.length > 2) {
            let global = this.globalData
            let scene = decodeURIComponent(options.query.scene);
            let infos = scene.split(",")
            //console.log(scene, infos)
            global.user.domain = infos[0];
            global.user.group = infos[1];
            global.user.belong = infos[2];
            if (infos.length > 3) {
                global.init_pid = infos[3] == 2 ? 18 : 1;
            }
        }

        if (options.domain) {
            global.user.domain = options.domain;
        }

        if (options.group) {
            user.group = options.group
        }

        if (options.belong) {
            global.user.belong = options.belong;
        }

        wx.redirectTo({
            url: `/pages/redirect/redirect?pid=${this.globalData.init_pid}`
        })
        // resolve()
        // })
    }
})
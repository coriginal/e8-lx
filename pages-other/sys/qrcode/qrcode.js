const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')

Page({
    data: {
        painting: {},
        shareImage: '',
        page: 'pages/redirect/redirect&qparam=18',
        tableList: [{
                title: '公司名称 ：',
                code: 'name',
                defaultInput: '',
            },
            {
                title: '联系方式 ：',
                code: 'phone',
                defaultInput: _App.user.uName,
            }
        ],
        swiperList: [

        ],
        urls: [
            // { pid:66, title:'询价录单' },
            // { pid:18, title:'快速录单' }
        ]
    },
    onLoad() {
        // this.towerSwiper('swiperList');

        let qrcode_url = `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&uName=${_App.user.uName}&uToken=${_App.user.uToken}&isHyaline=true`
        // let qrcode_url = `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&uName=${_App.user.uName}&uToken=${_App.user.uToken}&isHyaline=true&onlyQparam=true&qparam=D0341,outerOperator`
        this.setData({
            qrcode_url,
            isTest: _App.user.isTest
        })
        const isFin = _App.user.modules.replace(/\[|\]|\s+/g, '').split(',').includes('tms-ce')
        if (isFin) {
            this.setData({
                isFin,
                urls: [{
                        pid: 66,
                        title: '询价录单'
                    },
                    {
                        pid: 18,
                        title: '快速录单'
                    },
                    {
                        pid: 110,
                        title: "比价下单"
                    }
                ]
            })
        } else {
            this.setData({
                isFin,
                urls: [{
                    pid: 18,
                    title: '快速录单'
                }]
            })
        }

        this.queryCompanyDetail()
    },
    queryCompanyDetail() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })

        tss.query({
            url: tss.url('sql') + 'tms_x_domain',
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        showCancel: false,
                        content: res.errMsg
                    })
                    wx.hideLoading()
                    return
                }
                let data = res.data[0]
                console.log(data)
                wx.hideLoading()
                var swiperList = [],
                    _left = 1,
                    _right = 1;
                // swiperList.push({
                //   code: 'bg-q1',
                //   url: `${ _App.aliyun_host }/bg_ercode.png`,
                //   zIndex: 4,
                //   mLeft: 0
                // })
                swiperList.push({
                    code: 'bg-q1',
                    url: 'https://tongnet-file.oss-cn-hangzhou.aliyuncs.com/wx/vCard/bg4.png'
                })
                swiperList.push({
                    code: 'bg-q1',
                    url: 'https://tongnet-file.oss-cn-hangzhou.aliyuncs.com/wx/vCard/bg5.png'
                })
                // if (data.ggpic) {
                //     let ImagesUrl = data.ggpic.split(',').map(i => `${_App.app_host}/tss/xdata/attach/download/${i.split('#')[1]}`)
                //     for (let i = 0; i < ImagesUrl.length; i++) {
                //         swiperList.push({
                //             type: 'image',
                //             code: i,
                //             url: `${ImagesUrl[i]}?uName=${_App.user.uName}&uToken=${_App.user.uToken}`
                //         })
                //     }
                // }
                // [1, 2].forEach(item => {
                //     swiperList.push({
                //         type: 'image',
                //         code: `bg-common${item}`,
                //         url: `${_App.aliyun_host}/wx_share_qrcode/bg-common${item}.png`
                //     })
                // })
                // swiperList.push({
                //   type: 'image',
                //   code: 'bg-q1',
                //   url: `${_App.aliyun_host}/bg_ercode.png`
                // })
                this.data.swiperList = swiperList
                this.towerSwiper('swiperList');
                this.setData({
                    domainInfo: data,
                    // swiperList,
                    "tableList[0].value": data.name || this.data.tableList[0].defaultInput,
                    "tableList[1].value": data.phone || this.data.tableList[1].defaultInput
                })
            }
        })
    },

    inputValue(e) {
        this.data[e.currentTarget.id] = e.detail.value
    },

    cardSwiper(e) {
        this.setData({
            cardCur: e.detail.current
        })
    },
    eventDraw() {
        console.log(_App.user.isTest)
        if (_App.user.isTest) {
            wx.showToast({
                title: '体验正暂无体验权限！',
                icon: 'none'
            })
            return
        }
        this.setData({
            showPop: true
        })
    },
    chooseUrlItem(e) {
        const {
            item
        } = e.currentTarget.dataset
        this.setData({
            page: `pages/redirect/redirect&qparam=${item.pid}`,
            showPop: false
        }, () => {
            let bgUrl = this.data.swiperList.find(i => i.mLeft == 0).url
            this.doDraw(bgUrl)
        })
    },
    doDraw(bgUrl) {
        wx.showLoading({
            title: '绘制分享图片中',
            mask: true
        })
        let painting
        if (bgUrl == "https://tongnet-file.oss-cn-hangzhou.aliyuncs.com/wx/vCard/bg5.png" ||bgUrl == "https://tongnet-file.oss-cn-hangzhou.aliyuncs.com/wx/vCard/bg4.png") {
            painting = require('./painting.js').default.paintingNew
        }else{
            painting = require('./painting.js').default.painting
        }
        let url = `${this.data.qrcode_url}&page=${this.data.page}`
        let companyInfo = {
            name: this.data.name || this.data.tableList[0].value,
            phone: this.data.phone || this.data.tableList[1].value,
            words: this.data.words
        }
        console.log(companyInfo)
        this.setData({
            painting: painting(bgUrl, _App.user, url, companyInfo),
            show: true
        })
    },
    onClosePopup() {
        this.setData({
            showPop: false
        })
    },
    eventSave() {
        wx.saveImageToPhotosAlbum({
            filePath: this.data.shareImage,
            success(res) {
                wx.showToast({
                    title: '保存图片成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    },
    eventGetImage(event) {
        wx.hideLoading()
        const {
            tempFilePath,
            errMsg
        } = event.detail
        if (errMsg === 'canvasdrawer:ok') {
            this.setData({
                shareImage: tempFilePath,
                show: true
            })
        }
    },

    closeSave(e) {
        this.setData({
            show: false
        })
    },
    // 上传我的背景
    uploadImage() {
        wx.chooseImage({
            sizeType: 'original',
            count: 1,
            success: (res) => {
                // console.log(res)
                this.doDraw(res.tempFiles[0].path)
            },
        })
    },

    // uploadImage() {
    //   let itemId = new Date().getTime()
    //   wx.chooseImage({
    //     count: 3,
    //     success: res => {
    //       console.log(res)
    //       wx.showLoading({})
    //       tss.uploadImagesAsync({
    //         recordId: 'x_domain',
    //         itemId: `${this.data.domainInfo.id}`,
    //         uName: _App.user.uName,
    //         uToken: _App.user.uToken,
    //         filePaths: res.tempFilePaths,
    //         completion: res => {
    //           console.log(res)
    //           if (res.failed) {
    //             wx.showModal({
    //               content: res.errMsg,
    //               showCancel: false
    //             })
    //             wx.hideLoading()
    //             return
    //           }
    //           res = res.map(i => ({
    //             ...i,
    //             id: i.id.replace(';', '')
    //           }))
    //           tss.post({
    //             url: `${tss.recordURLs('x_domain').UPDATE}${this.data.domainInfo.id}`,
    //             params: {
    //               // ggpic:`${res[0].img.slice(-25)}#${res[0].id}`,
    //               ggpic: this.data.domainInfo.ggpic ? `${res[0].img.slice(-25)}#${res[0].id},${this.data.domainInfo.ggpic}` : `${res[0].img.slice(-25)}#${res[0].id}`,
    //               // _tempID: itemId,
    //             },
    //             completion: res => {
    //               if (res.failed) {
    //                 wx.showModal({
    //                   content: res.errMsg,
    //                   showCancel: false
    //                 })
    //                 wx.hideLoading()
    //                 return
    //               }
    //               this.queryCompanyDetail()
    //             }
    //           })
    //         }
    //       })
    //     },
    //   })
    // },
    // towerSwiper
    // 初始化towerSwiper
    towerSwiper(name) {
        let list = this.data[name],
            _left = 1,
            _right = 1;
        for (let i = 0; i < list.length; i++) {
            if (i == 0) {
                list[i].zIndex = parseInt(list.length / 2) + 1
                list[i].mLeft = 0
            } else if (i % 2 == 0) {
                list[i].zIndex = parseInt(list.length / 2) + 1 - _left
                list[i].mLeft = 0 + _left
                _left++
            } else {
                list[i].zIndex = parseInt(list.length / 2) + 1 - _right
                list[i].mLeft = 0 - _right
                _right++
            }
        }
        this.setData({
            swiperList: list
        })
    },
    // towerSwiper触摸开始
    towerStart(e) {
        this.setData({
            towerStart: e.touches[0].pageX
        })
    },
    // towerSwiper计算方向
    towerMove(e) {
        this.setData({
            direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
        })
    },
    // towerSwiper计算滚动
    towerEnd(e) {
        let direction = this.data.direction;
        let list = this.data.swiperList;
        if (direction == 'left') {
            let mLeft = list[0].mLeft;
            let zIndex = list[0].zIndex;
            for (let i = 1; i < list.length; i++) {
                list[i - 1].mLeft = list[i].mLeft
                list[i - 1].zIndex = list[i].zIndex
            }
            list[list.length - 1].mLeft = mLeft;
            list[list.length - 1].zIndex = zIndex;
            this.setData({
                swiperList: list
            })
        } else {
            let mLeft = list[list.length - 1].mLeft;
            let zIndex = list[list.length - 1].zIndex;
            for (let i = list.length - 1; i > 0; i--) {
                list[i].mLeft = list[i - 1].mLeft
                list[i].zIndex = list[i - 1].zIndex
            }
            list[0].mLeft = mLeft;
            list[0].zIndex = zIndex;
            this.setData({
                swiperList: list
            })
        }
    },
    getMyCard() {
        wx.showLoading({
            title: '名片生成中',
            mask: true
        })
        let painting = require('./painting.js').default.paintingCard
        let url = `${this.data.qrcode_url}&page=pages/redirect/redirect&qparam=18`
        let bgUrl = `${_App.aliyun_host}/wx_share_qrcode/card.png`
        let companyInfo = {
            name: this.data.name || this.data.tableList[0].value,
            phone: this.data.phone || this.data.tableList[1].value,
            person: _App.user.cnName,
            email: this.data.domainInfo.email || '',
            address: this.data.domainInfo.address || ''
        }
        console.log(companyInfo)
        this.setData({
            painting: painting(bgUrl, _App.user, url, companyInfo),
            show: true
        })
    }
})
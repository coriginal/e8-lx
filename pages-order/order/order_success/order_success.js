const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');

Page({

    data: {
        painting: {},
        paySuccess: false,
        income:0,
        data: {
            // ocode: '17788441231',
            // send_city: '杭州市',
            // receive_city: '武汉市',
            // send_man: '陈啊啊',
            // send_phone: '18877887788',
            // send_province: '浙江省',
            // send_city: '杭州市',
            // send_district: '江干区',
            // send_town: '钱塘新区',
            // send_street_no: '请看我就饿剋去年闻鸡起舞',
            // receive_man: '请问企鹅',
            // receive_province: '河南省',
            // receive_city: '杭州市',
            // receive_district: '江干区',
            // receive_town: '新经济技术开发区',
            // receive_street_no: '情侣款问请问呢两块钱我'
        }
    },
    onShow(options){
        if(options?.referrerInfo.extraData?.paySuccess){
            this.setData({
                paySuccess: true
            })
        }
    },
    toPay(){
        wx.navigateToMiniProgram({
            appId:'wxc4267d613d482792',
            extraData: {
                orderId: this.data.data.id,
                asnno: this.data.asnno,
                domain: this.data.data.domain,
                income: this.data.data.income
            },
            envVersion:'develop'
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.setData({
            // data: { ...this.data.data, ...JSON.parse(options.data) },
            orderId: options.orderId,
            shareImgHeight: _App.systemInfo.screenWidth * 0.8,
            shareImgWidth: _App.systemInfo.screenWidth,
            ifScan: options.ifScan,
            pageFrom: options.pageFrom,
            asnno: options.asnno == 'undefined' ? '' : options.asnno,
            income: options.income == 'undefined' ? 0 : options.income  
        })
        this.getOrder(options.orderId)
    },
    getOrder(tms_order_id) {
        tss.query({
            url: tss.url('sql') + 'tms_order',
            params: {
                tms_order_id
            },
            completion: res => {
                if (!res.failed) {
                    this.setData({
                        data: res.data[0],
                        painting: this.painting(res.data[0])
                    })
                }
            }
        })
    },
    takePhotos() {
        wx.chooseImage({
            sizeType: 'compressed',
            success: (res) => {
                console.log(res)
                wx.showLoading({
                    title: '上传中...',
                    mask: true
                })
                tss.uploadImagesAsync({
                    recordId: '-6',
                    itemId: `${this.data.data.id}`,
                    uName: _App.user.uName,
                    uToken: _App.user.uToken,
                    filePaths: res.tempFilePaths,
                    completion: res => {
                        console.log(res)
                        if (res.failed) {
                            wx.showModal({
                                content: res.errorMsg
                            })
                            return
                        }
                        wx.showToast({
                            title: '上传成功！',
                            icon: 'none'
                        })
                    }
                })
            },
            fail: res => {
                wx.hideLoading()
            }
        })
    },
    onReady() {
        // this.setData({ painting: this.painting(this.data.data) })
    },
    copyOcode() {
        wx.setClipboardData({
            data: this.data.data.code,
        })
    },
    eventGetImage(event) {
        const {
            tempFilePath,
            errMsg
        } = event.detail
        if (errMsg === 'canvasdrawer:ok') {
            this.setData({
                shareImage: tempFilePath
            })
        }
    },

    // 分享此单
    onShareAppMessage() {
        return {
            title: '有人@您，分享给您一份物流订单.',
            imageUrl: this.data.shareImage,
            path: `${Pages.order_query_route}?query=true&code=${this.data.data.code}`
        }
    },
    // 前往打印
    goPrint() {
        wx.navigateTo({
            url: `${Pages.order_print}?ids=${this.data.data.id}&code=${this.data.data.code}`,
        })
    },

    painting(data) {
        let imgHeight = this.data.shareImgHeight,
            imgWidth = this.data.shareImgWidth
        return {
            width: imgWidth,
            height: imgHeight,
            clear: true,
            views: [{
                    type: 'image',
                    url: `${_App.aliyun_host}/bg-shareimg.png`,
                    top: 0,
                    left: 0,
                    height: imgHeight,
                    width: imgWidth
                },
                // 订单号
                {
                    type: 'text',
                    content: `No.${data.code}`,
                    fontSize: 18,
                    color: 'red',
                    textAlign: 'left',
                    top: imgHeight * 0.05,
                    left: imgHeight * 0.05
                },
                // 目的地
                {
                    type: 'text',
                    content: `${data.send_city} => ${data.receive_city}`,
                    fontSize: 35,
                    color: 'black',
                    textAlign: 'center',
                    top: imgHeight * 0.15,
                    left: imgWidth * 0.5,
                    bolder: true,
                    width: imgWidth - 20,
                    breakWord: true,
                    MaxLineNumber: 1
                },
                // 寄件信息
                {
                    type: 'image',
                    url: '../../images/send.png',
                    top: imgHeight * 0.35,
                    left: imgWidth / 8 - 10,
                    height: 30,
                    width: 30
                },
                // 寄件信息
                {
                    type: 'text',
                    content: `${data.send_province} ${data.send_city} ${data.send_district} ${data.send_town} ${data.send_street_no} 请问科技请问可请问你家嗯去看我`,
                    color: 'grey',
                    top: imgHeight * 0.35,
                    left: imgWidth / 8 + 30,
                    width: imgWidth / 2 + 60,
                    breakWord: true,
                    MaxLineNumber: 2
                },
                // 收件信息
                {
                    type: 'image',
                    url: '../../images/receive.png',
                    top: imgHeight * 0.55,
                    left: imgWidth / 8 - 10,
                    height: 30,
                    width: 30
                },
                // 收件信息
                {
                    type: 'text',
                    content: `${data.receive_province} ${data.receive_city} ${data.receive_district} ${data.receive_town} ${data.receive_street_no}`,
                    color: 'grey',
                    top: imgHeight * 0.55,
                    left: imgWidth / 8 + 30,
                    width: imgWidth / 2 + 60,
                    breakWord: true,
                    MaxLineNumber: 2
                },
                {
                    type: 'image',
                    url: `${_App.aliyun_host}/bg-sharebutton.png`,
                    top: imgHeight * 0.7,
                    left: imgWidth / 6,
                    height: (imgWidth / 1.5) * 42 / 200,
                    width: imgWidth / 1.5
                },
            ]
        }
    },
    orderAgain() {
        const pagesList = getCurrentPages()
        if (pagesList.find(i => i.route == "pages-order/order/order/order")) {
            let prevPage = pagesList.find(i => i.route == "pages-order/order/order/order")
            console.log(prevPage)
            prevPage.refresh()
            wx.navigateBack()
        } else {
            wx.redirectTo({
                url: Pages[this.data.pageFrom || 'order'],
            })
        }
    }
})
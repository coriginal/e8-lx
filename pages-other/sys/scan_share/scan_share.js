const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')

const bgUrl = "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3/wx_share_qrcode/WechatIMG20529.png";

Page({
  data: {
    painting: {},
    company:{},
    shareImage: '',
    // page: 'pages/redirect/redirect&qparam=18',
  },
  onLoad() {
    // this.towerSwiper('swiperList');

    let qrcode_url = `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&uName=${_App.user.uName}&uToken=${_App.user.uToken}&isHyaline=true`
    // let qrcode_url = `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&uName=${_App.user.uName}&uToken=${_App.user.uToken}&isHyaline=true&onlyQparam=true&qparam=D0341,operator`
    this.setData({
      qrcode_url,
      isTest: _App.user.isTest,
      company:_App.companyInfo
    })
    this.doDraw();
  },

  doDraw() {
    console.log(this.data.company)
    wx.showLoading({
      title: '图片绘制中',
      mask: true
    })
    let painting = require('./painting.js').default.painting
    let url = `${this.data.qrcode_url}&page=pages/redirect/redirect&onlyQparam=true&qparam=` +`${this.data.company.domain},operator` 
    let companyInfo = {
      name: this.data.company.name 
    }
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
  }
})
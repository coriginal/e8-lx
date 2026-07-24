// pages-other/sys/invite_downstream/invite_downstream.js
import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')
import { $wuxDialog } from '../../../components/index'
import { hex_md5 } from './md5.js'
Page({

  data: {
    painting: {
      width: 375,
      height: 667,
      clear: true,
      views: [
        {
          // 背景图
          type: 'image',
          url: 'https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3/yaoqing.png',
          top: 0,
          left: 0,
          width: 375,
          height: 667
        },
        {
          type: 'image',
          url: '',
          top: 220,
          left: 82.5,
          width: 210,
          height: 210
        },
        {
          type: 'text',
          content: '',
          fontSize: 24,
          color: '#3f5b8c',
          textAlign: 'center',
          top: 130,
          left: 187.5,
          bolder: true,
          lineHeight: 20
        },
      ]
    }
  },

  onLoad: function (options) {
    // let appid = 'wx1f18a0c7e9272b40'
    console.log(hex_md5)
    this.getMyLogistic()
  },
  doSomething({ currentTarget }) {
    let { id, idx } = currentTarget.dataset
    let obj = this.data.list.find(i => i.id == id)

    if (obj.customer_idk) return

    if (obj.idk) {
      this.shareQrcode(obj)
    } else {
      this.getKeys(obj, idx)
    }
  },
  // 邀请注册
  shareQrcode(obj) {
    console.log('share')
    let appId = 'wx1f18a0c7e9272b40'
    let src = `${_App.app_host}/tss/wx/api/acode2?appId=${appId}&page=pages/redirect/redirect&onlyQparam=true&qparam=,,,12,${obj.id}`
    wx.showLoading({ title: '图片加载中...', mask: true })
    this.data.painting.views[1].url = src
    this.data.painting.views[2].content = _App.companyInfo.name || ''
    this.setData({
      // landscap_visible: true, src:'https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3/yaoqing.png'
      draw_painting: this.data.painting
    })

    // wx.getImageInfo({
    //   src,
    //   complete: res => {
    //     console.log(res)
    //     wx.hideLoading()
    //     if(res.path){
    //       this.setData({
    //         landscap_visible: true, src: res.path
    //       })
    //     }else{
    //       wx.showToast({
    //         title: '图片加载失败...',icon:'none'
    //       })
    //     }
    //   }
    // })
  },

  eventGetImage(e) {
    console.log(e)
    wx.hideLoading()
    const { tempFilePath, errMsg } = e.detail
    if (errMsg === 'canvasdrawer:ok') {
      this.setData({
        shareImage: tempFilePath,
        landscap_visible: true,
        src: tempFilePath
      })
    } else if (errMsg === 'canvasdrawer:samme params') {
      this.setData({
        shareImage: this.data.shareImage,
        landscap_visible: true,
        src: this.data.src
      })
    }
  },

  // 生成密钥
  getKeys(obj, idx) {
    console.log(idx)
    let md5 = hex_md5(`${new Date().getTime()}${_App.user.uName}`);
    tss.post({
      url: tss.url('') + '/tms/logistics',
      params: {
        ...obj,
        idk: md5
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg, showCancel: false
          })
          return
        }
        this.setData({
          [`list[${idx}].idk`]: md5
        })
      }
    })
  },

  // 关闭分享
  onClosePop() {
    this.setData({
      landscap_visible: false,
      elecImgUrl: '../../../images/modal.png'
    })
  },

  getMyLogistic() {
    wx.showLoading({ mask: true })
    tss.query({
      url: tss.url('sql') + 'lc_info',
      params: {
        justDomain: true,
        show_invite: true,
        joinCustomer: true
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg, showCancel: false
          })
          return
        }
        wx.hideLoading()
        this.setData({
          list: res.data//.filter(i => !i.customer_idk)
        })
        wx.setNavigationBarTitle({
          title: `下游承运商(${res.data.length || ' - '})`,
        })
      }
    })
  },
  showPopup() {
    let _this = this
    $wuxDialog().prompt({
      resetOnClose: true,
      maskClosable: false,
      focus: true,
      maxlength: -1,
      fieldtype: 'text',
      title: '承运商名称',
      content: '请输入需要承运商名称',
      onConfirm(e, response) {
        console.log(e, response)
        if (response.length == 0) {
          wx.showToast({
            title: '请输入名称！',
            icon: 'none'
          })
          return
        }
        _this.createLogistic(response)
      },
    })
  },
  createLogistic(name) {
    wx.showLoading({ mask: true })
    tss.post({
      url: tss.url('') + '/tms/logistics',
      params: {
        name,
        real_name: name,
        type2: '自有',
        status: '在用',
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg, showCancel: false
          })
          wx.hideLoading()
          return
        }
        this.getMyLogistic()
        wx.hideLoading()
      }
    })
  }
})
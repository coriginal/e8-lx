const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')

Page({

  data: {
    scrollTop:0,
    videoList: [],
    list: [],
    // src: `${_App.app_host}/tss/pages/web-view/learning.pdf`
  },

  onLoad: function (options) {
   this.getMenu()
   this.getVideoList()
  },

  getVideoList(){
    // tss.query({
    //   url: tss.recordURLs('s_describe_eff').QUERY,
    //   completion: res => {
    //     if (res.failed) return
    //     let list = res.data[0].video.split(',')
    //     let videoList = list.map(i => i.split('|')[1])
    //     let ecodeList = list.map(i => `https://18.boudata.com/video/${i.split('|')[0]}.mp4`)
    //     this.setData({
    //       videoList,
    //       ecodeList
    //     })
    //   }
    // })
    // const { roles } = app.userObj
    // this.setData({ clerk: roles.includes('业务员') })
  },

  getMenu(){
    tss.post({
      url: `${tss.url('')}/api/menu/json/44`,
      completion: res => {
        if (res.failed) {
          wx.showModal({ content: res.errorMsg })
          return
        }
        this.setData({ list: res.data })
      }
    })
  },
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop,
    })
  },
  goLearningWeb(e){
    let { id: code } = e.currentTarget
    wx.navigateTo({ url: `${Pages.web}?type=learning&code=${code}` })
  },
  chooseVideo(e){
    this.setData({
      clickId: e.currentTarget.id
    })
  }
})
import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
import {
  $wuxDialo
} from '../../../components/index'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(_App)
    this.dealList(_App.tabbarList)
  },
  dealList(list) {
    list.filter(i => i.children.length).forEach(item => {
      if (item.children.filter(i => i.children.length).length) {
        item.children.forEach(child => {
          if (child.children.length) {
            this.data.list.push(child)
          }
        })
      } else {
        
        this.data.list.push(item)
      }
    })
    this.setData({
      list: this.data.list
    })
  },
  setMenus(e){
    const { idx1, idx2 } = e.currentTarget.dataset
    let ifChoose = this.data.list[idx1].children[idx2].choose
    let data = `list[${idx1}].children[${idx2}].choose`
    this.setData({
      [data]: ifChoose ? false : true
    },()=>{
      let gridList = []
      this.data.list.forEach(item => {
        item.children.forEach(item => item.choose ? gridList.push(item):'')
      })
      wx.setStorage({ key: 'gridList', data: gridList })
    })
  }
})
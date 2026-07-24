import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')

Page({

  data: {
    path: Pages.order_list,

    list:{
      // "我的发件":{ url:'order_list',checked:false,params:'' },
      // "工作流": { url: 'workflows', checked: false, params: '' }
    }
  },

  onLoad: function(options) {
    let strong = wx.getStorageSync('_inHomePage')
    let MenuId = _App.user.domain == 'EFF' ? 3 : 16
    tss.get({
      url: `${tss.url('')}/api/menu/json/${MenuId}`,
      completion: res => {
        console.log(res)
        let list = this.data.list
        res.data.forEach(item=>{
          if(strong && item.name == strong.title){
            list[item.name] = { url: item.url, checked: true, params: item.description }
          }else{
            list[item.name] = { url: item.url, checked: false, params: item.description }
          }
        })
        this.setData({list})
      }
    })
  },

  onReady: function() {

  },


  clickRadio(e){
    let { id: index } = e.currentTarget
    console.log(index)
    let x = `list.${index}.checked`
    this.setData({
      [x]: true
    },()=>{
      console.log(this.data.list[index])
      wx.setStorage({
        key: '_inHomePage',
        data: { title: index, path: this.data.list[index].url, params: this.data.list[index].params }
      })
    })
  }
})
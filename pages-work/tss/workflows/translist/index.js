const lc = require('../../../../utils/listenerCenter.js')
const tss = require('../../../../utils/tss.js')
import user from '../../../../utils/user.js'
const alert = require('../../../../utils/alert.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    allPeopleList:[],
    peopleList: [],
    // [{ name: '张三', phone: '13765678982' },
    // { name: '张三三', phone: '13765678982' },
    // { name: '张李四', phone: '13765678762' },
    // { name: '张王五', phone: '13765678985' },
    // { name: '呵呵三', phone: '13765678989' },
    // { name: '张哈哈', phone: '13765678582' }]
    type: '',
    recordid: '',
    itemid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      recordid: options.recordid,
      itemid: options.itemid
    })
    wx.showLoading({ title: '加载中' })
    const tbName = this.data.recordid
    tss.get({
      url: tss.url('xdata') + 'translist/' + tbName + '/',
      itemId: this.data.itemid,
      completion: res => {
        wx.hideLoading()
        if (res.failed) {
          alert.error(res.errorMsg)
          return
        }
        if (res.data.length) {
          this.setData({
            allPeopleList:res.data,
            peopleList: res.data
          })
        }
        else {
          alert.notice('转审名单为空')
        }

      }
    })

  },

  selectpeople: function (e) {
    lc.emitEvent(lc.event.refresh, { type: this.data.type, name: e.target.dataset.name, value: e.target.dataset.value })
    wx.navigateBack()
  },
  bindKeyInput:function(e){
    let allPeopleList = this.data.allPeopleList;
    if(e.detail.value){
      let l = [];
      for(let i=0;i<allPeopleList.length;i++){
        let item = allPeopleList[i];
        if(item.username.indexOf(e.detail.value) > -1){
          l.push(item);
        }
        this.setData({
          peopleList:l
        })
      }
    }else{
      this.setData({
        peopleList:allPeopleList
      })
    }
  }

})
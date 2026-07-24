const _App = getApp().globalData
const lc = require('../../../utils/listenerCenter.js')
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')


Page({

  data: {
    list1: [
      { title: '用户名', code:'username' ,disabled:true},
      { title: '性别',  code: 'sex',disabled:true }
    ],
    list2:[
      { title: '邮箱', code: 'email' ,disabled:true},
      { title: '手机号码',  code: 'telephone',disabled:true },
      { title: '当前角色', code: 'roles', disabled: true }
    ],
    form:{}

  },


  onLoad: function (options) {
    this.getUserInfo()
    this.dealRoles(_App.user.roles)
  },

  getUserInfo(){
    tss.query({
      url: tss.url('data') + 'xcx_userInfo',
      params:{
        phone:_App.user.uName
      },
      completion:res=>{
        console.log(res)
        this.setData({
          form:{...this.data.form , ...res.data[0]}
        })
      }
    })
  },

  dealRoles(data) {
    let roleArray = data.split(',');
    let role = roleArray.filter(item => item != '$匿名角色' & item != '普通员工')
   
    this.setData({
      "form.roles": role.join(',')
    })
  },

  saveForm(e){
    let form = { ...this.data.form,...e.detail.value }
    console.log(form)
    form.udf = JSON.stringify({ sex: form.sex })
    tss.post({
      url:tss.url('xdata') + 'um_user',
      params:form,
      completion:res=>{
        console.log(res)
      }
    })
  },
  chooseSex(){
    wx.showActionSheet({
      itemList: ['男','女'],
      success:res=>{
        this.setData({
          "form.sex":['男','女'][res.tapIndex]
        })
      }
    })
  }
})
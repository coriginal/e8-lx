import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
import { $wuxDialog } from '../../../components/index'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js')
const Menu = { "EFF": 2, "E8": 19 }

Page({

  data: {
    menu_list: [
      {
        name: '客户录单通知手机号',
        code: 'gzh_notice',
        icon: 'remind',
        notice: '设置手机号',
        type:'i-right',
        show: !_App.user.isCustomer,
        show:false
      },
      {
        name: '自定义进入首页',
        code: 'customize',
        icon: 'friendadd',
        notice: '第一次进入到的页面',
        type:'i-right',
        // show: !_App.user.isCustomer
        show:false
      },
      {
        name: '快速入口设置',
        code: 'quickin',
        icon: 'cascades',
        notice: '默认首页的快速入口',
        type: 'i-right',
        show:false
      },
      {
        name: '清除缓存',
        code: 'storage',
        icon: 'delete',
        type:'i-radiobox',
        notice: `${wx.getStorageInfoSync().currentSize / 1000} M`,
        show: true
      }
    ],
    currentSize: 0,
    customer_order_notice_person:{}
  },

  onLoad: function(options) {
    // this.showStorage()
    this.setData({
      user: _App.user,
      // "menu_list[0].show": !_App.user.isCustomer
    })
    _App.user.isCustomer?'':this.getSystemInfo()
  },
  // allow_split_order, 允许拆单
  // need_town, 最小组织到乡镇
  // unwrite_line_name,
  // update_businessid_in_transmode,
  // customer_order_notice_person,
  // task_auto_msg,
  // change_tag_type,
  // show_lc 查单显示承运商 

  getSystemInfo(){
    tss.query({
      url:tss.url('') + '/tms/entity/DomainConfig',
      params:{
        code:'customer_order_notice_person'
      },
      completion:res=>{
        if(res.failed) return
        let customer_order_notice_person = res.data.find(i=>i.code == 'customer_order_notice_person')||{}
        if('content' in customer_order_notice_person){
          this.setData({ 
            customer_order_notice_person,
            "menu_list[0].notice":customer_order_notice_person.content
          })
        }
        console.log(res)
      }
    })
  },

  showStorage() {
    let { keys } = wx.getStorageInfoSync()
    console.log(keys)
    keys.filter(i => i != 'gridList' && i != 'menuList').forEach(item=>{
      console.log(item)
      wx.removeStorageSync(item)
    })
    wx.showToast({
      title: '清除缓存成功！',
      icon: 'none'
    })
    this.setData({
      'menu_list[3].notice': '0 M'
    })
  },

  clickSettingMenu(e) {
    const { id: code } = e.currentTarget
    switch (code) {
      case 'storage':
        this.showStorage('clear');
        break;
      case 'customize':
        wx.navigateTo({ url: Pages.customize })
        break;
      case 'quickin':
        wx.navigateTo({ url: Pages.quickin })
        break;
      case 'gzh_notice':
        this.gzhRemind()
        break;
    }
  },

  gzhRemind(){
    let _this = this
    $wuxDialog().prompt({
      resetOnClose: true,
      maskClosable: false,
      focus:true,
      title: '手机号码',
      content: '注意：此手机号码需要注册公众号！(多个手机号请用“.”隔开)',
      fieldtype: 'digit',
      defaultText:this.data.menu_list[0].notice=='设置手机号'?'':this.data.menu_list[0].notice,
      maxlength: -1,
      onConfirm(e, response) {
        console.log(e, response)
        let phone = response
        // {"code":"customer_order_notice_person","id":325,"content":"17354729380,13735543341,18142024017"}
        let json = [{
          ..._this.data.customer_order_notice_person,
          code:'customer_order_notice_person',
          content:phone
        }]
        _this.updateDomainConfig(JSON.stringify(json))
      },
    })
  },

  updateDomainConfig(json){
    tss.post({
      url:tss.url('') + '/tms/entity/DomainConfig/batch',
      params:{json},
      completion:res=>{
        console.log(res)
        if(res.failed) return
        wx.showToast({ title: '设置成功!',icon:'none' })
        this.getSystemInfo()
      }
    })
  },

  toLogin(testLogin) {
    user.login({
      testLogin,
      completion: res => {
        if (res.failed) {
          wx.showModal({
            title: '提示',
            content: res.errorMsg || res.msg,
            showCancel: false
          })
          return
        } else {
          let MenuId ='E8_XCX'
          tss.query({
            url: `${tss.url('')}/api/menu/json`,
            params: { name: MenuId },
          // tss.get({
          //   url: `${tss.url('')}/api/menu/json/${MenuId}`,
            completion: res => {
              _App.tabbarList = res.data && res.data.slice(0, 5)
              wx.reLaunch({
                url: Pages.index
              })
            }
          })
        }
      }
    })
  },

  logOut() {
    wx.showModal({
      content: '您确定注销登陆？',
      success: res => {
        if (res.confirm) {
          this.clearnUtoken().then(res => {
            console.log(res)
            res.failed ? 
            wx.showModal({
              content: '注销失败',
              showCancel: false
            }) : wx.reLaunch({
              url: `${Pages.login}?logout=true`,
              complete: () => {
                _App.user = {}
                // user = {}
                console.log(user,_App.user)
              }
            })
          })
        }
      }
    })
  },

  clearnUtoken(params = { openid: _App.user.uToken }) {
    return new Promise(completion => {
      tss.post({
        url: `${tss.url('wxapi')}logout`,
        params, completion
      })
    })
  }
})
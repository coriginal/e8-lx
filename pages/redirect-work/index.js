import user from '../../utils/user.js'
const E8 = getApp().globalData

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageList: {
      1: { "url": "../clock/index" },
      2: { "url": "../driverLoc/index", "params": {} },
      3: { "url": "../wholeTruck/index", "params": {}, remark: '整车任务' },
      4: { "url": "../wholeTruck/bdetail/index","params":{},remark:'整车详情页面'},
      5: { "url": "../pickdisp/index", "params": {}, remark: '取派任务' },
      6: { "url": "../pickdisp/pickTaskDetail/index", "params": {}, remark: '取件详情页面' },
      7: { "url": "../pickdisp/dispTaskDetail/index", "params": {}, remark: '派件详情页面' },
      8: { "url": "../worktable/pages/workflow/index", "params":{}, remark: '审批'},
      9: { "url": "../tabBar/worktable/index", "params": {}, remark: '工作流' },
      10: { "url": "../pickdisp/easyDetail/index", "params":{},remark:'简单版取派'},
      11: { "url": "../Porder/place_order/place_order", "params": {}, remark: '录单' },
      12: { "url": "../Corder/code_list/code_list", "params": {}, remark: '查单' },
      // ../worktable/pages/approve/index
      13:{ "url": "../../pages-work/tss/workflows/approve/index", "params": {}, remark: '催批后审批人点击跳到审批页面'},
      14: { "url": "../../pages-B/getMoney/getMoney", "params": {}, remark: '对外报价' },
      15: { "url": "../../pages-A/router/router", "params": {}, remark: '查单' },

    }
  },

  onLoad: function (options) {
    console.log(options)
    if (options.domain) {
      user.domain = options.domain
    }
    if (options.pid && options.pid.indexOf('13,') == 0) {
      console.log('l')
      var a = options.pid.split(',');
      options.pid = 13;
      for (var i = 0; i < a.length; i++) {
        if (i) {
          const item = a[i].split(':');
          options[item[0]] = item[1];
        }
      }
    }
    var pid = options.pid || 1
    var type = options.type || ''
    console.log(options)
    if (options.scene) {
      let scene = decodeURIComponent(options.scene);
      let infos = scene.split(",")
      console.log(infos)
      if (infos.length > 3) {
        pid = infos[3];
      }
    }

    if(pid - 0 == 2){
      if(options.msg_id){
        this.data.pageList[2].params['msg_id'] = options.msg_id;
      }
      else{
        wx.showModal({
          title: '提示',
          content: '传递的参数错误，无法打开页面',
          showCancel: false
        })
        return
      }
    }
    else if(pid - 0 > 3){
      this.data.pageList[pid].params = options
    }
    this.relogin(pid,type)
  },

  relogin: function (pid,type) {
    var pageList = this.data.pageList
    console.log(pid)
    if (!pageList[pid]) {
      wx.showModal({
        title: '提示',
        content: '页面暂未开放！',
        showCancel: false
      })
      return
    }
    var jumpToUrl = pageList[pid].url
    const params = pageList[pid].params;
    if (params){
      jumpToUrl += '?1=1'
      for(var key in params){
        jumpToUrl += '&' + key + '=' + params[key]
      }
    }
    user.login({
      completion: res => {
        if (res.failed) { 
          wx.showToast({ title: '用户登录失败', icon: 'none' })
          return
        }
        if (res.openId ) {
        
          var jumpTo = encodeURIComponent("../redirect-work/index?pid=" + pid)
          var type_ = pid<=3 ? 'tab' : type;
          let json = JSON.stringify({ openid: res.openId, domain: user.domain, group: user.group, pid: pid, type: type_})
          wx.redirectTo({ url: `../redirect/redirect?json=${json}` })
          return
        }
        if (pid <= 7 || type == 'clear'){
          //tabbar页面和需要关闭之前打开的所有页面时用wx.reLaunch跳转
          wx.reLaunch({
            url: jumpToUrl,
            complete:function(){
              wx.showTabBar({})              
            }
          })         
        }
        else{
          wx.redirectTo({
            url: jumpToUrl
          })
        }
      }
    })
  }

})
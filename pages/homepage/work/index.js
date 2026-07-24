import Pages from '../../../pages.js'
const _App = getApp().globalData
const tss = require('../../../utils/tss.js');

Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  data: {
    list: [
      // { code: 'auditing_order', label: '订单费用审批', icon: 'form', shadowColor: 'shadowBlue', iconColor: 'blue' },
      // { code: 'auditing_task', label: '运输单费用审批', icon: 'form', shadowColor: 'shadowRed', iconColor: 'red' },
      { code: 'workflow', label: '工作流', icon: 'post', shadowColor: 'shadowOrange', iconColor: 'orange' },
    ],
    src: `${_App.aliyun_host}/checklist.png`
  },
  properties: {
  
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created() {
      console.log('created')

    },
    attached: function () {

    },
    detached: function () {
      console.log('detached')
    },
    ready: function () {
      console.log('ready')
    },
  },
  methods: {
    goAuditing(e) {
      wx.navigateTo({
        url: Pages[e.currentTarget.id]
      })
    }
  }
})
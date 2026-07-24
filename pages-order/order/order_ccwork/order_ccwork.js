const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')

Component({
  properties: {
    orderId: {
      type: Number,
      value: ''
    },
  },
  options: {
    styleIsolation: 'apply-shared',
  },
  data: {
    switchChecked: true,
    workList: [
      //   {
      //   batch: 0,
      //   content: "请看我就饿前往日内瓦了可能李蔚",
      //   createTime: "2019-09-19 10:12:48",
      //   creator: "18142024017",
      //   domain: "EFF",
      //   follow_man: "呱呱物流",
      //   id: 276276,
      //   level1: "一级追踪",
      //   level2: "未发件",
      //   level3: "",
      //   pk: 276276,
      //   s_order_id: 624946,
      //   secret: false,
      //   tempId: null,
      //   transfer: "",
      //   updateTime: null,
      //   updator: null,
      //   version: 0,
      //   warning_date: null,
      // }, {
      //   batch: 0,
      //   content: "请问请问请问",
      //   createTime: "2019-09-19 10:13:12",
      //   creator: "18142024017",
      //   domain: "EFF",
      //   follow_man: "呱呱物流",
      //   id: 276281,
      //   level1: "一级追踪",
      //   level2: "正常转运",
      //   level3: "",
      //   pk: 276281,
      //   s_order_id: 624946,
      //   secret: false,
      //   tempId: null,
      //   transfer: "",
      //   updateTime: null,
      //   updator: null,
      //   version: 0,
      //   warning_date: null,
      // }
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchChange(e) {
      console.log(e)
      this.setData({
        switchChecked: e.detail.value
      })
    },
    createCargoTransInfo() {
      this.setData({
        _visible: true,
        textarea_focus: true
      })
    },
    inputTextarea(e) {
      this.data.inputTextarea = e.detail.value
    },
    showCustomerPhone() {
      if (_App.user.uToken) {
        this.setData({
          showCustomerPhone: !this.data.showCustomerPhone
        })
      } else {
        wx.showToast({
          title: '登陆后才能查看',
          icon: 'none'
        })
      }
    },
    confirmPop() {
      let secret = _App.user.isCustomer ? false : this.data.switchChecked
      tss.post({
        url: tss.url('') + '/tms/batch/follow',
        params: {
          json: JSON.stringify([{
            content: this.data.inputTextarea,
            secret,
            order_id: this.data.orderId,
            batch: 0,
            level1: _App.user.isCustomer ? '客户登记' : secret ? '内部跟进' : '客服回复'
          }])
        },
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.showModal({
              content: res.errorMsg,
              showCancel: false
            })
            return
          }
          wx.showToast({
            title: '登记成功！',
            icon: 'none'
          })
          this.setData({
            inputTextarea: '',
            _visible: false
          })
          this.queryOrderFollow(this.data.orderId)
        }
      })
    },
    onClosePop() {
      this.setData({
        _visible: false
      })
    },
    queryOrderFollow(orderId) {
      let params = {};
      if (_App.user.isCustomer) {
        params.secret = false
      }
      tss.query({
        // /tms/order/follow
        url: tss.url('') + `/tms/order/follow?order_id=${orderId}`,
        params,
        completion: res => {
          console.log(res)
          if (res.failed) {
            return
          }
          this.setData({
            workList: res.data.map(i => ({ ...i, hide_creator: this.desensitization(i.creator, 4, -4) })),
          })
        }
      })
    },
    desensitization(str, beginLen, endLen) {
      var len = str.length;
      var firstStr = str.substr(0, beginLen);
      var lastStr = str.substr(endLen);
      var middleStr = str.substring(beginLen, len - Math.abs(endLen)).replace(/[\s\S]/ig, '*');
      return firstStr + middleStr + lastStr;;
    }
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    created() {
      console.log('created')
    },
    attached() {
      this.setData({
        user: _App.user
      })
      console.log(_App.user)
    },
    ready() {
      // 初始化订单详情
      if (this.data.orderId) {
        this.queryOrderFollow(this.data.orderId)
      }
    },
  },
})
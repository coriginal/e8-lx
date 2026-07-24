const _App = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const txmap = require('../../../../utils/txmap.js')

Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    type: {
      type: String,
      value: ''
    },
    task_id: {
      type: Number,
      value: ''
    },
    order_id: {
      type: Number,
      value: ''
    },
    task_type: {
      type: String,
      value: ''
    }
  },

  data: {
    show_setting: false,
    map: ''
  },

  lifetimes: {
    attached: function () {
    },
    ready() {
      this.getLoc()
    },
    detached: function () {
      console.log('detached')
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    getLoc(e) {
      const _this = this;
      if (_App.txmap_key){
        this.data.map = new txmap({
          key: _App.txmap_key
        })
        this.data.map.reverseGeocoder({
          success: function (res) {
            _this.setData({
              show_setting: false
            })
          },
          fail: function (res) {
            if (res.status == 1000) {
              _this.setData({
                show_setting: true
              })
              alert.error('获取地理位置失败,请点击设置允许“使用我的地理位置”')
            }
            else {
              // alert.error('获取地理位置失败')
            }
          }

        });
      }else{
        wx.getLocation({
          complete: res => {
            if (res && res.errMsg && res.errMsg.indexOf('auth deny') > 0) {
              alert.error('获取地理位置失败,请点击设置允许“使用我的地理位置”')
            } else {
              console.log(res)
            }
          },
        })
      }
    },
    callback(e) {
      if (e.detail.authSetting['scope.userLocation']) {
        this.setData({
          show_setting: false
        })
      }
    },
  }

})

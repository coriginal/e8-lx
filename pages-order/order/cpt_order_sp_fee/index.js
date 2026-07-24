import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')
import {
  $wuxDialog
} from '../../../components/index'
import {
  numberRound10
} from '../../../utils/util.js';
const _App = getApp().globalData


Component({
  /**
   * 组件的属性列表
   */
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    visiale: Boolean,
    add_fee_flow: String,
    param: Object,
    submit_money: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  lifetimes: {
    ready() {
      console.log(this.data.param)
      if (this.data.param._flowType == 'task') {
        this.setData({
          visiale: true
        })
      } else {
        if (this.data.param.add_fee_flow == '是') {
          this.setData({
            visiale: true
          })
        } else {
          wx.hideLoading()
          this.setData({
            visiale: true
          })
          // this.queryCanSpFee(this.data.param)
          //   .then(res => {
          //     if (res.failed) {
          //       wx.hideLoading()
          //       wx.showModal({
          //         content: res.errorMsg,
          //         showCancel: false
          //       })
          //       return
          //     }
          //     wx.hideLoading()
          //     this.setData({
          //       can_sp_fee_value: res.data,
          //       visiale: true
          //     })
          //   })
        }
      }

    }
  },

  methods: {
    onClosePopup() {
      this.setData({
        visiale: false
      })
      this.triggerEvent('change', {
        visiale: false
      })
    },
    inputValue(e) {
      this.data[e.currentTarget.id] = e.detail.value
    },
    addImages() {
      wx.chooseImage({
        sizeType: ['compressed'],
        success: (res) => {
          this.setData({
            image_urls: res.tempFilePaths
          })
          this.data._tempID = new Date().getTime()
          tss.uploadImagesAsync({
            recordId: 'tms_sp_order_fee',
            itemId: this.data._tempID,
            uName: _App.user.uName,
            uToken: _App.user.uToken,
            filePaths: res.tempFilePaths,
            completion: res => {
              console.log(res)
            }
          })
        },
      })
    },
    // fin/create_sp_task_fee
    submitFees() {
      if (this.data.submit_money > 0) {
        wx.showLoading({ mask: true, title: '加载中...' })
        let url = tss.url('');
        if (this.data.param._flowType == 'task') {
          if (this.data.param.add) {
            url = url + '/tms/fin/spfee_add_taskflow'
          } else {
            url = url + '/tms/fin/spfee_with_taskflow'
          }
        } else {
          console.log(this.data.param)
          if (this.data.param.add_fee_flow == '是') {
            url = url + '/tms/fin/spfee_add_orderflow'
          } else {
            url = url + '/tms/fin/spfee_with_orderflow'
          }
        }
        tss.post({
          url,
          params: {
            ...this.data.param,
            _tempID: this.data._tempID,
            fee: this.data.submit_money,
            remark: this.data.submit_remark || ''
          },
          completion: res => {
            if (res.failed) {
              wx.showModal({
                showCancel: false,
                content: res.errorMsg
              })
              wx.hideLoading()
              return
            }
            wx.hideLoading()
            wx.showToast({
              title: '提交成功!',
              icon: 'none'
            })
            if (this.data.param._flowType == 'task') {
              this.triggerEvent('change', {
                visiale: false,
                refresh: true,
                fee: this.data.param.add ? this.data.submit_money : ''
              })
              return
            }

            if (this.data.param.add_fee_flow == '否') {
              this.triggerEvent('change', {
                visiale: false,
                refresh: true
              })
            } else {
              this.triggerEvent('change', {
                visiale: false,
                refresh: true,
                fee: this.data.submit_money
              })
            }

          }
        })
      } else {
        wx.showToast({
          title: '请输入报销金额',
          icon: 'none'
        })
      }
    },
    queryCanSpFee(params) {
      return new Promise(completion =>
        tss.query({
          url: tss.url('') + '/tms/fin/query_can_sp_fee',
          params,
          completion
        })
      )
    },
  }
})
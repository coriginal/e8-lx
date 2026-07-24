import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
const _APP = getApp().globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
      title: '名称 ：',
      code: 'name',
      value: ''
    },
    {
      title: '联系方式 ：',
      code: 'phone',
      value: '',
      disabled: true
    },
    {
      title: '业务员 ：',
      code: 'clerk',
      value: '',
      disabled: true
    },
    ],
    otherList: [{
      title: '别名 ：',
      code: 'nick_name',
      value: ''
    },
    {
      title: '客户编码 ：',
      code: 'code',
      value: ''
    },
    {
      title: '结算方式 ：',
      code: 'settle_type',
      value: ''
    },
    {
      title: '地址 ：',
      code: 'address',
      value: ''
    },
    {
      title: '备注 ：',
      code: 'remark',
      value: ''
    }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    console.log(options, _APP)
    const { customer_id } = options
    this.setData({
      customer_id,
      type: 'detail',
      user: _APP.user
    })

    if (customer_id) {
      this.queryCustomerDetail(customer_id)
    } else {
      this.getCustomerId()
    }
  },
  getCustomerId() {
    tss.query({
      url: tss.url('sql') + 'customer',
      params: { phone: _APP.user.uName },
      completion: res => {
        if (res.failed) {
          wx.showModal({ content: res.errorMsg, showCancel: false })
          return
        }
        const [data] = res.data
        console.log(data)
        const { id } = data
        this.data.customer_id = id
        this.queryCustomerDetail(id)
      }
    })
  },
  queryCustomerDetail(id) {
    wx.showLoading()
    tss.query({
      url: tss.url('sql') + 'tms_customer',
      params: {
        id
      },
      completion: res => {
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        this.setData({
          customer: res.data[0]
        })
        wx.hideLoading()
      }
    })
  },
  editCustomer() {
    this.setData({
      type: this.data.type == 'detail' ? 'edit' : 'detail'
    })
  },
  confirmCustomer(e) {
    console.log(e)
    let form = e.detail.value
    const { phone, clerk, ...rest } = form
    tss.post({
      url: tss.url('') + '/tms/customer',
      params: {
        id: this.data.customer_id, ...rest
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            showCancel: false,
            content: res.errorMsg
          })
          return
        }
        wx.showToast({ title: '保存成功', icon: 'none' })
        this.setData({
          type: 'detail'
        })
      }
    })
  }
})
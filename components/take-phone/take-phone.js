// components/take-phone/take-phone.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    phoneList: {
      type: [String, Array],
      value: ''
    }
  },
  observers: {
    "phoneList": function (newData) {
      if (newData) {
        this.makePhone(newData)
      }
    }
  },

  data: {
    show: false,
    popPhone: []
  },
  methods: {
    handleMakePhone(e) {
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.id,
        complete: () => {
          this.triggerEvent('closePhone', { takePhone: false })
        }
      })
      this.setData({
        show: false
      })
    },
    onClose() {
      this.setData({
        show: false
      })
    },
    makePhone(phone) {
      const phoneList = phone.split(/\/|\,|\，|\.|\。/g)
      if (phoneList.length === 1) {
        wx.makePhoneCall({
          phoneNumber: phone,
          complete: () => this.triggerEvent('closePhone', { takePhone: false })
        })
      } else {
        this.setData({
          show: true,
          popPhone: phoneList
        })
      }
    },
  }
})

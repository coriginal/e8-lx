const app = getApp().globalData
const tss = require('../../../utils/tss.js')
const reg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/g

Page({
  data: {
    markers: [],
    showpanel: true,
    chepai: [],
    plate_num: ''
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
    this.setData({
      showpanel: !this.data.showpanel
    })
  },
  controltap(e) {
    console.log(e.controlId)
  },

  onLoad(options) {
    this.setData(options)
    this.queryCarLocation()
    wx.setNavigationBarTitle({
      title: `${options.plate_num}`
    })
  },
  onReady() {
    this.mapCtx = wx.createMapContext('map')
  },
  inputValue(e) {
    this.setData({
      plate_num: e.detail.value,

    })
  },
  inputFocus() {

  },
  searchCar(e) {
    if (this.data.plate_num.length > 0) {
      wx.showModal({
        title: '注意！',
        content: '执行此操作请确认已征得车主的定位同意。且此操作将产生费用，是否确认查看？',
        confirmText: '同意继续',
        success: res => {
          if (res.confirm) {
            this.queryCarLocation()
          }
        }
      })
    } else {
      wx.showToast({
        title: '请输入正确车牌号', icon: 'none'
      })
      return
    }
    // tss.query({
    //   url: tss.url('xdata') + 's_task_msg',
    //   params: { type: 'beidou', content: this.data.plate_num },
    //   completion:res=>{

    //   }
    // })
  },

  queryCarLocation() {
    // if (!this.data.chepai.includes(this.data.plate_num)) {
    //   this.data.chepai.unshift(this.data.plate_num)
    //   wx.setStorage({
    //     key: 'chepai',
    //     data: this.data.chepai
    //   })
    // }
    tss.query({
      url: tss.url('sql') + 'tms_trans_order',
      params: { code: this.data.task_code },
      completion: res => {
        if (res.failed) {
          console.log(res)
          return
        }

        const [location] = res.data
        this.taskId = location.id
        const [longitude, latitude] = location.lng_lat.split(',')
        this.setData({
          carLocation: {
            utc: location.position_time || '',
            adr: location.addr,
            plate_num: this.data.plate_num
          },
          latitude: latitude,
          longitude: longitude,
          markers: [{
            iconPath: "../../../images/car.png",
            id: 0,
            latitude: latitude,
            longitude: longitude,
            width: 30,
            height: 65,
            label: {
              content: this.data.plate_num,
              color: '#444',
              bgColor: "#fbbd08",
              anchorX: 10,
              fontSize: 14
            }
          }]
        })
      }
    })
  },
  refreshLocation() {
    wx.showLoading({mask:true})
    tss.post({
      url: tss.url('/tms/task/location'),
      params: {
        taskId: this.taskId
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
        const { data: result } = res
        const { data: carLocation } = result
        const { lat,lon } = carLocation
        const markers = this.data.markers
        markers.latitude = lat
        markers.longitude = lon
        this.setData({
          carLocation: carLocation,
          markers
        })
        wx.hideLoading()
        console.log(res)
        if(res.data.data == '1006'){
          wx.showModal({
            content: '车辆未入网，或北斗设备故障',
            showCancel: false
          })
        }
      }
    })
  },
  closePanel() {
    this.setData({
      showpanel: false
    })
  },
  checkOrders(e) {
    wx.navigateTo({
      url: `../car_orders/car_orders?plate_num=${this.data.plate_num}`,
    })
  },
  chooseChePai(e) {
    this.setData({
      plate_num: e.currentTarget.id
    }, () => {
      this.searchCar()
    })
  },
  deleteHistory(e) {
    let chepai = this.data.chepai.filter(item => item != e.currentTarget.id)
    this.setData({
      chepai
    })
    wx.setStorage({ key: 'chepai', data: chepai, })
  },
  confirmMoadl() {
    this.setData({
      dialogName: null
    })
  }
})
const lc = require('../../../../utils/listenerCenter.js')
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js')
Page({

  data: {
    filterData: [],
    type: '',
    truckList: [],
  },

  onLoad: function (options) {
    console.log(options)
    if (options.type) {
      this.setData({
        type: options.type
      })
    }
    if (options.json && options.json != 'undefined') {
      const list = JSON.parse(options.json)
      this.data.list = list
      this.setData({
        filterData: list
      })
    }
    // 司机类型时从API拉取最新列表，并监听保存事件
    if (options.type === 'driver') {
      this.fetchTruckList()
      lc.addListener('driverFormSaved', this.__wxWebviewId__.toString(), () => {
        this.fetchTruckList()
      })
    }
  },

  onUnload() {
    lc.removeListener('driverFormSaved', this.__wxWebviewId__.toString())
  },

  // 从API获取车辆/司机列表
  fetchTruckList() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    tss.get({
      url: tss.url('ENTITY') + '/OmsTruck',
      completion: (res) => {
        wx.hideLoading()
        if (res.failed) {
          wx.showModal({
            title: '提示',
            content: '获取司机列表失败',
            showCancel: false
          })
          return
        }
        const list = res.data || []
        this.data.list = list
        this.setData({
          filterData: list,
          truckList: list
        })
      },
    })
  },

  // 新增司机
  addDriver() {
    wx.navigateTo({
      url: '/pages-work/tss/capacity/driver_form/index',
    })
  },

  // 编辑司机
  editDriver(e) {
    const {
      id
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages-work/tss/capacity/driver_form/index?id=${id}`,
    })
  },
  addLine(){
    wx.navigateTo({
      url:'/pages-work/tss/capacity/line_edit/index'
    })
  },
  editLine(e){
    const {
      line
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages-work/tss/capacity/line_edit/index?line_id=${line.id||''}&name=${line.name||''}&type=${line.type||''}&belong_type=${line.belong_type||''}&belong_dim_id=${line.belong_dim_id ||''}`,
    })
  },
  // 删除司机
  deleteDriver(e) {
    const {
      id,
      driver
    } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: `确定删除司机"${driver || ''}"吗？`,
      success: (res) => {
        if (!res.confirm) return
        wx.showLoading({
          title: '删除中...',
          mask: true
        })
        tss.post({
          url: tss.url('') + '/tms/entity/OmsTruck/' + id,
          method: 'DELETE',
          completion: (res) => {
            wx.hideLoading()
            if (res.failed) {
              wx.showModal({
                title: '提示',
                content: res.errorMsg || '删除失败',
                showCancel: false
              })
              return
            }
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.fetchTruckList()
          },
        })
      },
    })
  },

  backToPage(e) {
    const {
      id
    } = e.currentTarget.dataset
    console.log(id)
    const type = this.data.type
    if (type === 'truck_type') {
      const data = this.data.list.find(i => i.id == id)
      this.backTo(type, data)
    }
    if (type === 'logistic') {
      const data = this.data.list.find(i => i == id)
      this.backTo(type, data)
    }
    if (type === 'driver') {
      const data = this.data.list.find(i => i.id == id)
      this.backTo(type, data)
    }
    if (type === 'line') {
      const data = this.data.list.find(i => i.id == id)
      console.log("线路数据",data,id)
      this.backTo(type, data)
    }
  },

  backTo(type, data) {
    lc.emitEvent('truckChooseInfo', {
      type,
      data
    })
    wx.navigateBack()
  },

  bindKeyInput: tss.debounce(function (e) {
    wx.showLoading()
    const value = e.detail.value
    const list = this.data.list || []
    if (value) {
      const filterData = list.filter(item =>
        (item.plate_num && item.plate_num.includes(value)) ||
        (item.driver && item.driver.includes(value)) ||
        (item.phone && item.phone.includes(value)) ||
        (item.name && item.name.includes(value)))
      this.setData({
        filterData
      }, () => wx.hideLoading())
    } else {
      this.setData({
        filterData: list
      }, () => wx.hideLoading())
    }
  }, 500),
})
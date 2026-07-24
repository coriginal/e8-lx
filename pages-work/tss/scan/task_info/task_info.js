const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
const util = require('../../../../utils/util.js')
const user = getApp().globalData.user
Page({

  data: {
    task: {
      tbId: '-18',
      _thumbURLS: [],
      plate_num: ''
    },
    tempid: '',
    currentDriver: {

    },
    form: {

    }
    // showModalTask:false
  },

  onLoad: function (options) {
    lc.addListener('driverInfo', this.__wxWebviewId__.toString(), res => {
      this.setData({
        "task.plate_num": res.plate_num,
        "task.driver": res.driver,
        "task.phone": res.phone,
        "task.truck_id": res.truck_id,
        "task.remark": res.remark,
        "task.truck_type": res.truck_type,
        "task.lc": res.lc,
        "task.lc_id": res.lc_id,
        "task.line_name": res.line_name,
        "task.line_nodes": res.line_nodes,
        "task.line_id": res.line_id
      })
    })
    wx.setNavigationBarTitle({
      title: options.operate + '扫描'
    })
    let today = util.formatDate(new Date(), 'yyyy-MM-dd');
    let week = util.formatDate(util.subDate(today, 7), 'yyyy-MM-dd');
    let params = {
      status: '待接单,已接单,已出发,',
      create_from: week,
      type: options.operate
    };
    this.queryTask(params);
    this.queryTruck();
    this.setData({
      operate: options.operate
    })
  },

  toScan: function (e) {
    let task = e.currentTarget.dataset.item;
    let tempPage = getCurrentPages();
    let prevPage = tempPage[tempPage.length - 2];
    prevPage.setData({
      'select.task': task.code,
      'select.plate_num': task.plate_num
    })
    wx.navigateBack({
      delta: 1,
    })
  },

  openTruckList: function () {
    // let showModalTask = this.data.showModalTask
    // this.setData({
    //     showModalTask: !showModalTask
    // })
    let data = {
      ...this.data.task
    }
    delete data['_thumbURLS']
    delete data['tbId']
    wx.navigateTo({
      url: `/pages-work/tss/capacity/capacity_pick/capacity_pick?data=${JSON.stringify(data)}&mode=scan&type=中转`
    })
  },
  truckSelect: function (e) {
    let _truck = e.currentTarget.dataset.text;
    this.setData({
      "currentDriver.plate_num": _truck.plate_num,
      "currentDriver.driver": _truck.driver,
      "currentDriver.phone": _truck.phone,
      "currentDriver.truck_id": _truck.id
    })
  },
  modalConfirmTruck: function (e) {
    this.setData({
      "task.plate_num": this.data.currentDriver.plate_num,
      "task.driver": this.data.currentDriver.driver,
      "task.phone": this.data.currentDriver.phone,
      "task.truck_id": this.data.currentDriver.id,
      showModalTask: false
    })
  },
  modalCancel() {
    this.setData({
      "currentDriver.plate_num": "",
      "currentDriver.driver": "",
      "currentDriver.phone": "",
      "currentDriver.truck_id": "",
      showModalTask: false
    })
  },
  addProof: function (e) {
    var attachURLs = e.detail.attachURLs
    this.setData({
      tempid: e.detail._tempID
    })
  },

  submit: function (e) {
    let params = {
      status: "待接单",
      type: this.data.operate
    };
    let footer = util.formatDate(new Date(), 'yyMMddhhmm');
    let task = this.data.task;

    if (task.plate_num) {
      params.plate_num = task.plate_num
    }
    if (task.driver) {
      params.driver = task.driver
    }
    if (task.phone) {
      params.phone = task.phone
    }
    if (task._thumbURLS) {
      params.tempid = this.data.tempid
    }
    if (task.truck_id) {
      params.truck_id = task.truck_id
    }
    if (task.truck_type) {
      params.truck_type = task.truck_type
    }
    if (task.lc) {
      params.lc = task.lc;
    }
    if (task.lc_id) {
      params.lc_id = task.lc_id
    }
    if (task.remark) {
      params.remark = task.remark
    }
    if (task.line_name) {
      params.line_name = task.line_name
    }
    if (task.line_nodes) {
      params.line_nodes = task.line_nodes
    }
    if (task.line_id) {
      params.line_id = task.line_id
    }
    tss.post({
      url: tss.url('') + '/tms/task',
      params: params,
      completion: res => {
        if (res.data) {
          this.setData({
            "task.code": res.data.code
          });
          let tempPage = getCurrentPages();
          let prevPage = tempPage[tempPage.length - 2];
          prevPage.setData({
            'select.task': res.data.code,
            'select.plate_num': this.data.task.plate_num
          })
          wx.navigateBack({
            delta: 1,
          })
        }
      }
    })
  },
  queryTask: function (params) {
    tss.query({
      url: tss.url('sql') + 'task',
      params,
      completion: res => {
        console.log(res.data)
        if (res.data) {
          this.setData({
            taskList: res.data
          })
        }
      }
    })
  },
  queryTruck: function () {
    tss.query({
      url: tss.url('') + '/tms/api/entity/Truck',
      completion: res => {
        if (res.failed) {
          return
        }
        if (user.roles.indexOf("司机") != -1) {
          var driver = res.data.filter(item => item.phone == user.uName)[0]
        }
        this.setData({
          "task.plate_num": driver?.plate_num || '',
          "task.driver": driver?.driver || '',
          "task.phone": driver?.phone || '',
          "task.truck_id": driver?.id || '',
          "currentDriver.plate_num": driver?.plate_num || '',
          "currentDriver.driver": driver?.driver || '',
          "currentDriver.phone": driver?.phone || '',
          "currentDriver.truck_id": driver?.id || '',
          truckList: res.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
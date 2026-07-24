const _App = getApp().globalData
import Pages from '../../../../pages.js'
const tss = require('../../../../utils/tss.js');
const lc = require('../../../../utils/listenerCenter.js')
const tms = require('../../../../pages/tms.js')
// const _Page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: _App.user,
    form: {},
    logistic: [],
    taskid: '',
    needSite: false,
    needSort: false,
    mode: 'normal',
    noChangeType: false
  },

  onFieldChange(e) {
    const {
      field
    } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("参数", options)
    const {
      data,
      type,
      mode
    } = options
    tms.logistic().then(res => {
      this.setData({
        logistic: res
      })
    })
    if (data) {
      if (mode == 'scan') {
        this.setData({
          form: JSON.parse(data)
        })
      } else {
        this.initForm(data)
      }
    }
    this.setData({
      "form.type": options.type || '',
      taskid: options.taskid || '',
      mode: options.mode || 'normal',
      noChangeType: options.type ? true : false
    })
    if (options.task) {
      this.setData({
        form: JSON.parse(options.task)
      })
    }
    if (type == '整车' || type == '直送' || type == '中转') {
      if (mode == 'normal') this.getSiteLoc(data);
      this.setData({
        needSite: true
      })
    } else {
      this.setData({
        needSite: false
      })
    }
  },
  initForm(data) {
    let list = JSON.parse(data)
    let weight = 0,
      amount = 0,
      volume = 0;
    list.forEach(item => {
      weight += item.weight
      amount += item.amount
      volume += item.volume
    })
    this.setData({
      weight: weight.toFixed(2),
      amount,
      volume: volume.toFixed(2),
      list
    })
  },

  InputChoose(e) {
    const {
      id
    } = e.currentTarget
    console.log(id)
    this[id]();
  },
  getTruck() {
    wx.showLoading()
    return new Promise((resolve, reject) => {
      tss.query({
        url: tss.url('') + '/tms/entity/Truck',
        completion: res => {
          wx.hideLoading()
          resolve()
          if (res.failed) {
            wx.showModal({
              content: res.errorMsg
            })
            return
          }
          this.setData({
            truck_list: res.data
          })
        }
      })
    })
  },
  async onReady() {
    // 查询车牌
    await this.getTruck()
    lc.addListener('truckChooseInfo', this.__wxWebviewId__.toString(), async res => {
      console.log(res)
      let data = res.data
      //刷新车牌列表，防止用户新增了司机之后无法返回数据
      await this.getTruck();
      if (res.type == 'truck_type') {
        this.setData({
          "form.plate_num": data.plate_num || '',
          "form.truck_type": data.truck_type || '',
          "form.driver": data.driver || '',
          "form.phone": data.phone || '',
          "form.lc": (this.data.logistic.find(i => i.id == data.lc_id) || {}).lc || ''
        })
      } else if (res.type == 'logistic') {
        this.setData({
          "form.lc": data
        })
      } else if (res.type == 'driver') {
        this.setData({
          "form.driver": data.name
        }, () => {
          let info = this.data.truck_list.find(item => item.id == data.id)
          this.setData({
            "form.driver": info.driver,
            "form.phone": info.phone,
            "form.plate_num": info.plate_num,
            "form.truck_type": info.truck_type,
            "form.lc": (this.data.logistic.find(i => i.id == info.lc_id) || {}).lc || '',
            "form.truck_id": info.id
          })
        })
      } else if (res.type === 'line') {
        console.log(data)
        this.setData({
          "form.line_name": data.name,
          "form.line_id": data.id
        })
      }
    })
  },
  onUnload() {
    lc.removeListener('truckChooseInfo', this.__wxWebviewId__.toString())
  },
  getRoutes() {
    tss.query({
      url: tss.url('') + '/tms/entity/Line',
      params: {
        type: '单边,往返,双边',
        belong_type: this.data.mode == 'scan' ? "" : '承运商'
      },
      completion: lin => {
        if (lin.failed) {
          wx.showModal({
            content: lin.errorMsg
          })
          return
        }
        if (lin.data.length) {
          let line = lin.data //.map(i => `${i.name}~${i.type}~${i.id}`)
          if (line.length < 6) {
            this.showActionSheet(line).then(res => {
              this.setData({
                "form.line_name": line[res.tapIndex].name,
                "form.line_id": line[res.tapIndex].id
              })
              tss.query({
                url: tss.url('') + '/tms/entity/LineLocation',
                params: {
                  line_id: line[res.tapIndex].id
                },
                completion: loc => {
                  if (loc.failed) {
                    wx.showModal({
                      content: loc.errorMsg
                    })
                    return
                  }
                  console.log(loc)
                  if (loc.data.length == 2) {
                    var list = this.data.list
                    list.forEach(item => {
                      item.start_location_id = item.send_site_id;
                      item.end_location_id = item.receive_site_id;
                    })
                    this.setData({
                      list: list
                    })
                  }
                  if (loc.data.length > 2) {
                    return alert('有经停点请到电脑端调度！')
                  }
                }
              })
            })
          } else {
            wx.navigateTo({
              url: `${Pages.truck_choose}?type=line&json=${JSON.stringify(line)}`,
            })
          }
        }
      }
    })
  },

  getSiteLoc(data) {
    let list = JSON.parse(data)
    console.log(list)
    var start_ids = [],
      end_ids = [],
      start_names = [],
      end_names = [],
      total = []
    list.forEach(item => {
      if (start_ids.indexOf(item.send_site_id) < 0) {
        start_ids.push(item.send_site_id)
        start_names.push(item.send_site)
        total.push({
          id: item.send_site_id,
          name: item.send_site
        })
      }
      if (end_ids.indexOf(item.receive_site_id) < 0) {
        end_ids.push(item.receive_site_id)
        end_names.push(item.receive_site)
        total.push({
          id: item.receive_site_id,
          name: item.receive_site
        })
      }
      item.start_location_id = item.send_site_id;
      item.end_location_id = item.receive_site_id;
    })
    this.setData({
      list: list,
      total: total,
      "form.line_name": [start_names.join("-"), end_names.join("-")]
        .filter(i => i).join('-'),
      "form.line_nodes": [start_ids.join(","), end_ids.join(",")]
        .filter(i => i).join(',')
    })
  },
  fixSort() {
    var total = JSON.stringify(this.data.total)
    wx.navigateTo({
      url: `../capacity_sort/index?json=${total}`,
    })
  },
  getPlateNum() {
    let plateNum = this.data.truck_list.map(i => `${i.driver || ''} - ${i.plate_num||''}`)
    // plateNum = Array.from(new Set(plateNum))
    if (this.data.truck_list.length < 6) {
      this.showActionSheet(plateNum).then(res => {
        this.setData({
          "form.plate_num": this.data.truck_list[res.tapIndex].plate_num || '',
          "form.truck_type": this.data.truck_list[res.tapIndex].truck_type || '',
          "form.driver": this.data.truck_list[res.tapIndex].driver || '',
          "form.phone": this.data.truck_list[res.tapIndex].phone || '',
          "form.lc": (this.data.logistic.find(i => i.id == this.data.truck_list[res.tapIndex].lc_id) || {}).lc || '',
        })
      })
    } else {
      wx.navigateTo({
        url: `${Pages.truck_choose}?type=truck_type&json=${JSON.stringify(this.data.truck_list)}`,
      })
    }


  },
  getTruck_type() {
    let truck_type;
    if (this.data.form.plate_num) {
      truck_type = this.data.truck_list.filter(i => i.plate_num == this.data.form.plate_num).map(i => i.truck_type)
    } else {
      truck_type = this.data.truck_list.map(i => i.truck_type)
    }
    truck_type = Array.from(new Set(truck_type))
    this.showActionSheet(truck_type)
      .then(res => {
        this.setData({
          "form.truck_type": truck_type[res.tapIndex]
        })
      })
  },
  getLogistic() {
    if (this.data.logistic.length) {
      let lc = this.data.logistic.map(i => i.lc)
      if (lc.length < 6) {
        this.showActionSheet(lc).then(res => {
          this.setData({
            "form.lc": lc[res.tapIndex]
          })
        })
      } else {
        wx.navigateTo({
          url: `${Pages.truck_choose}?type=logistic&json=${JSON.stringify(lc)}`,
        })
      }


    }
  },
  getDriverPhone() {
    let phone = this.data.truck_list.map(i => i.phone)
    phone = Array.from(new Set(phone))

    this.showActionSheet(phone)
      .then(res => {
        this.setData({
          "form.phone": phone[res.tapIndex]
        })
      })
  },
  getDriver() {
    wx.navigateTo({
      url: `${Pages.truck_choose}?type=driver&json=${JSON.stringify(driver)}`,
    })
    return
    let driver;
    console.log(this.data.truck_list)
    driver = this.data.truck_list.map(i => {
      return {
        name: i.driver,
        id: i.id
      }
    })
    driver = Array.from(new Set(driver))
    if (driver.length < 6) {
      this.showActionSheet(driver)
        .then(res => {
          this.setData({
            "form.driver": driver[res.tapIndex]
          }, () => {
            let phone = this.data.truck_list.find(item => item.driver == this.data.form.driver).phone
            this.setData({
              "form.phone": phone
            })
          })
        })
    } else {
      wx.navigateTo({
        url: `${Pages.truck_choose}?type=driver&json=${JSON.stringify(driver)}`,
      })
    }

  },
  getType() {
    if (this.data.mode !== 'normal' || this.data.noChangeType) return;
    let items = ['提货', '中转', '派送', '直送', '整车']
    this.showActionSheet(items)
      .then(res => {
        this.setData({
          "form.type": items[res.tapIndex]
        })
      })
  },
  submitForm() {
    let form = {
      ...this.data.form
    }
    let lc_id = this.data.logistic.find(item => item.lc == form.lc)
    form.lc_id = lc_id && lc_id.id || ''
    form.sub_orders = JSON.stringify(this.data.list)
    form.line_nodes = this.data.form.line_nodes
    form.truck_id = this.data.form.truck_id
    form.line_id = this.data.form.line_id
    if (!form.phone || !form.driver) {
      wx.showToast({
        title: '请填写司机或司机电话！',
        icon: 'none'
      })
      return
    }
    if (this.data.mode == 'scan') {
      lc.emitEvent("driverInfo", form)
      wx.navigateBack()
      return
    }
    delete form['truck_id']
    // return
    if (this.data.taskid) {
      tss.save({
        url: tss.url('ENTITY') + 'TransTask/' + this.data.taskid,
        params: form,
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.showModal({
              content: res.errorMsg
            })
            return
          }
          console.log('back')
          lc.emitEvent('alltask', {})
          wx.navigateBack({})
        }
      })
    } else {
      tss.post({
        url: tss.url('') + '/tms/task',
        params: form,
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.showModal({
              content: res.errorMsg
            })
            return
          }
          let task_id = res.data.id
          let task_code = res.data.code
          this.setUserRole(form.phone, form.driver, '9')
          let params = {
            type: res.data.type,
            status: '待接单,已接单'
          }
          lc.emitEvent('task_arrange', {
            msg: 'success'
          })
          wx.redirectTo({
            url: `${Pages.task}?task_code=${task_code}&success_create_task_id=${task_id}&if_op=true&q_params=${JSON.stringify(params)}&from_page=menu`
          })
        }
      })
    }
  },

  setUserRole: function (phone, name, role) {
    tss.post({
      url: tss.url('') + '/api/setUserRole',
      params: {
        userCode: phone,
        userName: name,
        roles: role,
        mobile: phone
      },
      completion: can => {
        if (can.failed) {
          wx.showModal({
            content: can.errorMsg
          })
          return
        }
      }
    })
  },
  showActionSheet(itemList) {
    return new Promise(success => {
      wx.showActionSheet({
        itemList,
        success
      })
    })
  }
})
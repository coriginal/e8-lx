// pages-order/order/order_price_parity/index.js
import dayjs from 'dayjs';
const tss = require('../../../utils/tss')
const app = getApp().globalData
const lc = require('../../../utils/listenerCenter')
import Pages from '../../../pages.js'
import user from '../../../utils/user.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: {
      subOrders: [null],
      if_visit: true,
      service_mode: '派送',
      settle_type: '现付',
    },
    fee: {},
    settleMoney: '',
    customerInfo: null,
    addrField: ['man', 'phone', 'province', 'city', 'district', 'town', 'street_no'],
    addrInfo: {
      send: {},
      receive: {}
    },
    isCustomer: true,
    hideChooseServiceMode: true,
    hideChooseSettleType: true,
    settleTypeList: ['现付', '月结', '到付'],
    serviceModeList: ['派送', '自提'],
    showPickTime: false,
    showOther: false,
    platFormPriceList: [],
    needGet: false,
    currentSelectPlatForm: null,
    requiredList: [],
    platformInfoList: [],
    onlyLowest: false,

    showCustomName: false,

    needHll: false,

    checked: true,

    show: false,

    lcList: [],
    showSurchargeCheckbox: true
  },
  onClickLeft() {
    wx.navigateBack();
  },
  onOpen() {
    this.setData({
      show: true
    })
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  checkboxOnChange({
    detail: value
  }) {
    this.setData({
      checked: value
    })
    this.checkAndGetPrice()
  },
  getLcInfo() {
    return new Promise((resolve, reject) => {
      tss.get({
        url: tss.url('') + '/api/data/sql/lc_info',
        completion: res => {
          if (res.failed) {
            wx.showModal({
              title: "提示",
              content: res.errorMsg,
              showCancel: false
            })
            resolve()
            return
          }
          this.setData({
            lcList: res.data
          })
          resolve()
        }
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    if (app.user.domain == 'D773') {
      this.setData({
        needHll: true
      })
    }
    if (options.customerInfo) {
      if (options.form && options.addrInfo) {
        this.setData({
          form: {
            ...this.data.form,
            ...JSON.parse(options.form)
          },
          customerInfo: JSON.parse(options.customerInfo),
          addrInfo: JSON.parse(options.addrInfo)
        })
      }
    }
    if (app.DomainConfig['price_comparison_show_customize'] && app.DomainConfig['price_comparison_show_customize'].content == "true") {
      console.log('显示自定义平台名称')
      this.setData({
        showCustomName: true
      })
    }
    if (app.DomainConfig?.xcx_show_surcharge_checkbox?.content == "false") {
      this.setData({
        showSurchargeCheckbox: false
      })
    }
    if (user.domain == 'D006') {
      wx.showModal({
        content: "您目前登录的是测试环境，如您是正式发件客户，请不要下单并联系物流公司处理，是否继续",
        success: res => {
          if (!res.confirm) {
            wx.navigateBack()
          }
        }
      })
    }
    wx.showLoading({
      title: '请稍候...',
      mask: true
    })
    await this.getLcInfo();
    await this.getRecordsField()
    await this.queryConfigCode()
    await this.getPlatformInfo()
    lc.addListener('orderInfo', this.__wxWebviewId__.toString(), res => {
      console.log(res)
      switch (res.type) {
        case "send":
        case "receive":
          let {
            form, addrField, addrInfo
          } = this.data
          addrField.map((item, index) => {
            form[`${res.type}_${item}`] = index <= 1 ? (index == 0 ? res.data['obj']['name'] : res.data['obj']['phone']) : (index == 6 ? res.data.obj.addr_detail : res.data.obj.region[index - 2])
          })
          console.log(form)
          addrInfo[res.type] = res.data
          this.setData({
            form,
            addrInfo,
            needGet: true
          })
          break;
        case "customerInfo":
          this.setData({
            customerInfo: res.data,
            currentSelectPlatForm: null,
            platFormPriceList: [],
          })
          this.getDefaultAddress(res.data.id)
          break;
        case "cargo":
          let {
            subOrders
          } = this.data.form
          for (let key in res.data) {
            subOrders[key] = res.data[key]
          }
          this.setData({
            "form.subOrders": subOrders,
            needGet: true
          })
          break;
        case "fee":
          this.setData({
            fee: res.data,
            needGet: true
          })
          // if (res.data._fees.length) {
          //     // this.setData({
          //     //     form: {
          //     //         ...this.data.form,
          //     //         ...res.data
          //     //     }
          //     // })

          //     // if (Number(res.data['insurance_limit']) || res.data['upstairs_type'] || res.data['if_load'] || res.data['if_unload']) {
          //     //     this.setData({
          //     //         needGet: true
          //     //     })
          //     // }
          // } else {
          //     this.setData({
          //         fee: {},
          //         needGet: true
          //     })
          // }
          break;
        case "truck_type":
          this.setData({
            form: {
              ...this.data.form,
              truck_type: res.data.transModeInfo.truck_type
            }
          })
          this.checkAndGetPrice()
          break;

        default:
          break;
      }
    })
    if (app.user.groups.includes('customer')) {
      //0.1 0.01
      if (app.DomainConfig.lowest_price_only_visible_to_customers) {
        this.setData({
          onlyLowest: app.DomainConfig.lowest_price_only_visible_to_customers.content == 'true' ? true : false
        })
      }
      await this.getCustomer()
    } else {
      this.setData({
        isCustomer: false,
      })
    }
    // this.setData({
    //   'form.subOrders': [{
    //     amount: 1,
    //     c_amount: '',
    //     choosePackIdx: 0,
    //     height: '',
    //     long: '',
    //     message: '货品 1件 0.01kg 0.01m³ 纸箱',
    //     pack: '',
    //     package: '',
    //     specs: '',
    //     volume: '0.01',
    //     weight: '1',
    //     width: ''
    //   }]
    // })
    wx.hideLoading()
  },
  getCustomer() {
    return new Promise((resolve, reject) => {
      tss.post({
        url: tss.url('sql') + 'customer',
        params: {},
        completion: res => {
          if (res.failed) {
            return resolve()
          }
          this.setData({
            customerInfo: res.data[0],
            "form.customer_id": res.data[0].id,
            "form.clerk": res.data[0].clerk,
          })
          this.getDefaultAddress(res.data[0].id)
          resolve()
        }
      })
    })
  },
  // 始发地目的地匹配
  setSite() {
    var ordr = this.data.orderInfo;
    if (ordr.send.obj && ordr.receive.obj) {
      ordr.send.site = ordr.send.site || (ordr.send.addr[1] == ordr.receive.addr[1] ? ordr.send.addr[2] : ordr.send.addr[1])
      ordr.receive.site = ordr.receive.site || (ordr.send.addr[1] == ordr.receive.addr[1] ? ordr.receive.addr[2] : ordr.receive.addr[1])
    }
    this.setData({
      orderInfo: ordr
    })
  },
  settleMoneyInput(e) {
    this.data.settleMoney = e.detail.value
  },
  goChooseAddr(e) {
    if (!this.data.customerInfo) {
      wx.showModal({
        title: '提示',
        content: '请先选择客户哦',
        showCancel: false
      })
      return
    }
    const {
      id: type
    } = e.currentTarget
    const {
      id: customer_id
    } = this.data.customerInfo
    let info = {
      type,
      customer_id
    }
    wx.navigateTo({
      url: `${Pages.customer_addr_list}?info=${JSON.stringify(info)}`
    })
  },
  chooseTruckType() {
    wx.navigateTo({
      url: '../order_transmode/order_transmode?needTime=false&type=truck_type',
    })
  },
  // 前往编辑地址
  goEditAddr(e) {
    if (!this.data.customerInfo) {
      wx.showModal({
        title: '提示',
        content: '请先选择客户哦',
        showCancel: false
      })
      return
    }
    const {
      id: type
    } = e.currentTarget
    const {
      id: customer_id
    } = this.data.customerInfo
    wx.navigateTo({
      url: `${Pages.customer_addr_edit}?customer_id=${customer_id}&type=${type}&data=${JSON.stringify(this.data.addrInfo[type] || {})}`
    })
  },
  toChooseCustomer(e) {
    wx.navigateTo({
      url: Pages.customer_list
    })
  },
  goCargoInfo(e) {
    var index = e.currentTarget.dataset.index
    if (this.data.orderId) {
      wx.navigateTo({
        url: `${Pages.order_cargo_tms}?type=cargo&subOrders=${JSON.stringify(this.data.form.subOrders || [])}`
      })
      return
    }
    wx.navigateTo({
      url: `${Pages.order_cargo}?defaultVolume=true&type=cargo&index=${index}&data=${JSON.stringify(this.data.form.subOrders || "")}`,
    })
  },
  addCargoItem() {
    let {
      form
    } = this.data
    form.subOrders.push(null)
    this.setData({
      form
    })
  },
  delCargoItem(e) {
    let {
      index
    } = e.currentTarget.dataset, {
      form
    } = this.data
    form.subOrders.splice(index, 1)
    this.setData({
      form
    })
  },
  showChooseServiceMode() {
    this.setData({
      hideChooseServiceMode: !this.data.hideChooseServiceMode
    })
  },
  showChooseSettleType() {
    this.setData({
      hideChooseSettleType: !this.data.hideChooseSettleType
    })
  },
  chooseSettleType(e) {
    console.log(e)
    let type = e.currentTarget.id,
      {
        form
      } = this.data
    form.settle_type = type
    this.setData({
      form,
      hideChooseSettleType: true
    })
  },
  chooseServer(e) {
    console.log(e)
    let mode = e.currentTarget.id,
      {
        form
      } = this.data
    form.service_mode = mode
    this.setData({
      form,
      hideChooseServiceMode: true
    })
    this.checkAndGetPrice()
  },
  switchChange(e) {
    console.log(e)
    this.setData({
      "form.if_visit": e.detail.value
    })
  },
  getPickTimes() {
    this.setData({
      showPickTime: true
    })
  },
  changePickTime(e) {
    console.log(e)
    this.setData({
      "form.scheduled_pick_time": e.detail,
      showPickTime: false
    })
  },
  inputCode(e) {
    let code = e.detail.value
    if (code) {
      this.setData({
        "form.code": code
      })
    } else {
      let {
        form
      } = this.data
      delete form['code']
      this.setData({
        form
      })
    }
  },
  scanCode() {
    var _this = this
    wx.scanCode({
      success(res) {
        console.log(res)
        _this.setData({
          "form.code": res.result
        })
      },
      fail: err => {
        wx.showModal({
          title: '提示',
          content: '扫描失败，请重新尝试',
          showCancel: false
        })
      }
    })
  },
  goFeeInfo(e) {
    wx.navigateTo({
      url: `${Pages.order_fee}?type=fee&data=${JSON.stringify(this.data.fee || {})}`
    })
  },
  goOtherInfo() {
    this.setData({
      showOther: true
    })
  },
  setRecords() {
    let {
      recordsInfo,
      form,
      curRecords,
      recordsLabel
    } = this.data
    curRecords = ''
    form = {
      ...form,
      ...recordsInfo
    }
    for (let i in recordsInfo) {
      if (recordsInfo[i]) {
        curRecords += `${recordsLabel[i]}:${recordsInfo[i]},`
      }
    }
    curRecords = curRecords.slice(0, -1)
    this.setData({
      form,
      curRecords,
      showOther: false
    })
  },
  recordInput(e) {
    let {
      recordsInfo
    } = this.data
    recordsInfo[e.currentTarget.id] = e.detail.value

    this.setData({
      recordsInfo,
    })
  },
  getRecordsField() {
    return new Promise((resolve, reject) => {
      tss.get({
        url: tss.url('') + '/api/bi/recordfield/tms_order',
        completion: res => {
          if (res.failed) {
            wx.showModal({
              showCancel: false,
              content: res.errorMsg
            })
            return resolve()
          }
          let list = res.data.filter(item => {
            return item.type !== "hidden"
          })
          let recordsLabel = {}
          let curRecords = ""
          list.map(item => {
            recordsLabel[item.code] = item.label
          })
          for (let i in this.data.form['recordsList']) {
            if (this.data.form.recordsList[i]) {
              curRecords += `${recordsLabel[i]}:${this.data.form.recordsList[i]},`
            }
          }
          curRecords = curRecords.slice(0, -1)
          this.setData({
            recordsList: list,
            recordsInfo: this.data.form['recordsList'] || {},
            recordsLabel,
            curRecords
          })
          resolve()
        }
      })
    })
  },
  remarkInput(e) {
    if (!e.detail.value) {
      let {
        form
      } = this.data
      form.remark && delete form['remark']
      this.setData({
        form
      })
      return
    }
    this.setData({
      "form.remark": e.detail.value
    })
  },
  checkAndGetPrice() {
    var {
      form,
      customerInfo
    } = this.data, resolveAddress, amount = 0, weight = 0, volume = 0, cargo = []
    var addressReady = false,
      cargoReady = false
    for (let i in form.subOrders) {
      if (form.subOrders[i]) {
        cargoReady = true
      }
    }
    if (form.receive_province && form.receive_city && form.receive_district) {
      addressReady = true
    }
    if (!cargoReady || !addressReady) {
      this.setData({
        currentSelectPlatForm: null,
        platFormPriceList: []
      })
      console.log("信息还未完整，不进行比价")
      return
    }
    wx.showLoading({
      title: '获取报价中...',
      mask: true
    })
    for (let i in form.subOrders) {
      if (form.subOrders[i]) {
        if (!form.subOrders[i].cargo) {
          wx.showModal({
            title: '提示',
            content: '存在未填写的货物名称！',
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        amount += Number(form.subOrders[i].amount)
        weight += Number(form.subOrders[i].weight)
        volume += Number(form.subOrders[i].volume) * 1000
        cargo.push(form.subOrders[i].cargo)
      }
    }
    volume = volume / 1000
    cargo = cargo.join(',')
    // resolveAddress = form.receive_province + form.receive_city + form.receive_district + form.receive_town + form.receive_street_no
    // var params = {
    //     customId: this.data.customerInfo.id,
    //     params: {
    //         goodsInfo: {
    //             goodsName: cargo,
    //             amount,
    //             volume,
    //             realWeight: weight,
    //             insurance_limit: Number(form.insurance_limit) || null
    //         },
    //         receiver: {
    //             name: "",
    //             phone: "",
    //             address: "",
    //             detailsAddress: resolveAddress
    //         }
    //     },
    //     platformKeys: this.data.platformInfoList.map(item => {
    //         return item.sign
    //     })
    // }

    let form_copy = {
      ...this.data.form
    }
    let newSuborders = form_copy.subOrders.filter(item => item)
    this.setData({
      "form.subOrders": newSuborders
    })
    Object.assign(form_copy, {
      ...this.data.fee
    })
    if (form_copy.settle_type === '到付') {
      form_copy['arrive_pay'] = this.data.settleMoney;
    }
    let {
      if_load = "", if_unload = "", rcode_type = []
    } = form_copy || {};
    if_load = if_load === "是" ? true : false
    if_unload = if_unload === "是" ? true : false
    Object.assign(form_copy, {
      if_load,
      if_unload
    })
    form_copy.subOrders = JSON.stringify(newSuborders)
    form_copy['customer_id'] = this.data.customerInfo.id
    form_copy['clerk'] = this.data.customerInfo.clerk
    form_copy['platformSignStr'] = this.data.platformInfoList.map(item => {
      return item.sign
    }).join(',')
    console.log(form_copy, this.data.platformInfoList.map(item => {
      return item.sign
    }).join(','))
    //form.insurance_limit || delete params['insurance_limit']
    //console.log(params)
    form_copy['searchType'] = 2
    form_copy['amount'] = amount
    form_copy['weight'] = weight
    form_copy['volume'] = volume
    form_copy['cargo'] = cargo
    delete form_copy['subOrders']
    wx.request({
      url: tss.url('') + '/tms/api/rpa/search', //tss.url('')+'/tms/api/rpa/custom/getAllPlatformCost',
      data: form_copy, //JSON.stringify(params),
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", //"application/json;charset=UTF-8",
        "Cookie": wx.getStorageSync('cookie')
      },
      success: res => {
        console.log(res)
        wx.hideLoading()
        if (res.data.result) {
          this.dealPrice(res.data.data)
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.errorMsg,
            showCancel: false
          })
          this.setData({
            platFormPriceList: [],
            currentSelectPlatForm: null
          })
        }
      }
    })
  },
  pageScrollToBottom() {
    wx.createSelectorQuery().select('#box').boundingClientRect(function (rect) {
      if (rect) {
        // 使页面滚动到底部
        console.log(rect.height);
        wx.pageScrollTo({
          scrollTop: rect.height
        })
      }
    }).exec()
  },
  dealPrice(data) {
    console.log(data)
    data = data.filter(item => item.search_status)
    console.log(data)
    if (!data.length) {
      wx.showToast({
        title: '暂无报价!',
        icon: 'none'
      })
      this.setData({
        platFormPriceList: [],
        currentSelectPlatForm: null
      })
      return
    }
    for (let i in data) {
      data[i]['feeFlag'] == false && delete data[i]
      if (this.data.checked || this.data.isCustomer || (app.user.domain == 'D719' && app.user.roles.includes('业务员')) || app.user.domain == 'D529' || app.user.domain == 'D932') {
        data[i]['cost'] = ((data[i]['cost'] * 100 + data[i]['add_fee'] * 100 + (data[i]['cost_bill_model_fee'] && data[i]['cost_bill_model_fee'] * 100)) / 100).toFixed(2)
      } else {
        if (data[i]['platform_key'] == 7) {
          data[i]['cost'] = ((data[i]['cost'] * 100 + data[i]['add_fee'] * 100 + (data[i]['cost_bill_model_fee'] && data[i]['cost_bill_model_fee'] * 100)) / 100).toFixed(2)
          // data[i]['cost'] = data[i]['cost_bill_model_fee'].toFixed(2)
        }
      }
      Object.assign(data[i], {
        planArriveTime: this.getPlanArriveTime(data[i])
      })
      //logo塞入
      let lc = this.data.lcList.find(l => l.id == data[i].lc_info_id)
      let fileName = 'kuaidi'
      if (lc && lc.platform_code) {
        switch (lc.platform_code) {
          case 'yundakuaiyun':
            fileName = 'yunda'
            break;
          default:
            fileName = lc.platform_code
            break;
        }
      }
      Object.assign(data[i], {
        logoUrl: `/images/${fileName}.png`
      })
    }

    this.setData({
      platFormPriceList: data,
      currentSelectPlatForm: {
        ...data[0],
        index: 0
      }
    })
    this.getLcId()
    this.pageScrollToBottom()
  },
  getPlanArriveTime(e) {
    console.log(e)
    const {
      origin
    } = e;
    if (origin) {
      const details = JSON.parse(origin);
      console.log(details)
      const time = details.planArriveTime || '';
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss')  : '无'
    } else {
      return '无'
    }
  },
  choosePlatForm(e) {
    console.log(e.currentTarget.dataset.platform)
    this.setData({
      currentSelectPlatForm: {
        ...e.currentTarget.dataset.platform,
        index: e.currentTarget.dataset.index
      },
      'form.platformProductCostId': e.currentTarget.dataset.platform.id,
      'form.batchId': e.currentTarget.dataset.platform.batch_id,
      'form.lc_id': e.currentTarget.dataset.platform.sign
    })
    this.onClose();
    this.getLcId()
  },
  queryConfigCode() {
    return new Promise((resolve, reject) => {
      tss.get({
        url: tss.url('data') + 'xcx_order_write',
        completion: res => {
          if (res.failed) {
            return resolve()
          }
          let list = res.data.length ? JSON.parse(res.data[0].content).filter(i => i.belong_title == '增值服务' && !i.hidden && i.field !== 'arrive_pay' && i.required == "true") : []
          this.setData({
            requiredList: list,
          })
          resolve()
        }
      })
    })

  },
  clearDefaultAddress() {
    return new Promise((resolve) => {
      let obj = {};
      ['send', 'receive'].map(t => {
        ['man', 'phone', 'province', 'city', 'district', 'town', 'street_no'].map(f => {
          Object.assign(obj, {
            [`form.${t}_${f}`]: ''
          })
        })
      })
      this.setData({
        ...obj
      }, () => {
        resolve()
      })
    })
  },
  // 获取默认地址信息
  async getDefaultAddress(customer_id) {
    await this.clearDefaultAddress()
    tss.query({
      url: tss.url('data') + 'xcx_tms_contact',
      params: {
        customer_id,
        if_default: 1
      },
      completion: res => {
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          return
        }
        if (res.data.length == 0) return
        res.data.forEach(item => {
          let tn = item.type == '寄件' ? 'send' : 'receive'
          this.setData({
            [`form.${tn}_man`]: item.name,
            [`form.${tn}_phone`]: item.phone,
            [`form.${tn}_province`]: item.province,
            [`form.${tn}_city`]: item.city,
            [`form.${tn}_district`]: item.district,
            [`form.${tn}_town`]: item.town,
            [`form.${tn}_street_no`]: item.street_no
          })
        })
        //this.setSite();
      }
    })
  },
  save() {
    if (!this.data.form.hasOwnProperty('send_man') || !this.data.form.hasOwnProperty('receive_man')) {
      wx.showModal({
        title: '提示',
        content: '收件或寄件人未填写',
        showCancel: false
      })
      return
    }
    let cargoReady = false
    for (let i in this.data.form.subOrders) {
      let j = this.data.form.subOrders[i]
      if (j) {
        if (j.cargo && j.amount && j.weight && j.volume) {
          cargoReady = true
        } else {
          cargoReady = false
        }
      }
    }
    if (!cargoReady) {
      wx.showModal({
        title: '提示',
        content: '货物信息未填写完整',
        showCancel: false
      })
      return
    }
    for (let i in this.data.requiredList) {
      if (!this.data.form.hasOwnProperty(this.data.requiredList[i].field)) {
        wx.showModal({
          title: '提示',
          content: '增值服务有必填项未填写',
          showCancel: false
        })
        return
      }
    }
    let form_copy = {
      ...this.data.form
    }
    let newSuborders = form_copy.subOrders.filter(item => item)
    this.setData({
      "form.subOrders": newSuborders
    })
    form_copy.subOrders = JSON.stringify(newSuborders)
    form_copy['customer_id'] = this.data.customerInfo.id
    form_copy['clerk'] = this.data.customerInfo.clerk
    Object.assign(form_copy, {
      ...this.data.fee
    })
    let {
      if_load = "", if_unload = "", rcode_type = []
    } = form_copy || {};
    if_load = if_load === "是" ? true : false
    if_unload = if_unload === "是" ? true : false
    Object.assign(form_copy, {
      if_load,
      if_unload
    })
    if (this.data.form.settle_type === '到付') {
      form_copy['arrive_pay'] = this.data.settleMoney;
    }
    if (this.data.currentSelectPlatForm?.platform_key == 10 || this.data.currentSelectPlatForm?.platform_key == 18) {
      form_copy['price_calculate_id'] = this.data.currentSelectPlatForm.product_code
    }
    let content = "确定下单吗？"
    if (!this.data.currentSelectPlatForm) {
      content = "当前无报价，您仍可下单，但不会推送至平台，确定下单吗？"
    }
    wx.showModal({
      title: '提示',
      content,
      complete: (res) => {
        if (res.confirm) {
          wx.showLoading({
            mask: true
          })
          tss.post({
            url: tss.url('') + '/tms/order',
            params: {
              ...form_copy
            },
            completion: res => {
              wx.hideLoading()
              if (res.failed) {
                wx.showModal({
                  title: '提示',
                  content: res.errorMsg,
                  showCancel: false
                })
                return
              }
              if (this.data.form['lc_id']) {
                if (!this.data.isCustomer || (app.DomainConfig.wx_customer_auto_up_platform == true || false)) {
                  wx.showLoading({
                    title: '正在上传平台...',
                  })
                  this.upPlatform(res.data.data).then(r => {
                    wx.hideLoading()
                    if (r) {
                      wx.redirectTo({
                        // wx.navigateTo({
                        url: `${Pages.order_success}?orderId=${res.data.data}&ifScan=${this.data.ifScan}&pageFrom=order_price_parity`,
                        success: () => wx.vibrateLong()
                      })
                    } else {
                      wx.showModal({
                        title: '提示',
                        content: res.errorMsg,
                        showCancel: false,
                        complete: (e) => {
                          if (e.confirm) {
                            wx.redirectTo({
                              // wx.navigateTo({
                              url: `${Pages.order_success}?orderId=${res.data.data}&ifScan=${this.data.ifScan}&pageFrom=order_price_parity`,
                              success: () => wx.vibrateLong()
                            })
                          }
                        }
                      })
                    }
                  })
                } else {
                  wx.redirectTo({
                    // wx.navigateTo({
                    url: `${Pages.order_success}?orderId=${res.data.data}&ifScan=${this.data.ifScan}&pageFrom=order_price_parity`,
                    success: () => wx.vibrateLong()
                  })
                }
              } else {
                wx.redirectTo({
                  // wx.navigateTo({
                  url: `${Pages.order_success}?orderId=${res.data.data}&ifScan=${this.data.ifScan}&pageFrom=order_price_parity`,
                  success: () => wx.vibrateLong()
                })
              }
            }
          })
        }
      }
    })
  },
  getPlatformInfo(sign) {
    return new Promise((resolve, reject) => {
      tss.post({
        url: tss.url('') + '/tms/api/user/platform/info',
        completion: res => {
          if (res.failed) {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: res.errorMsg,
              complete: (res) => {
                if (res.confirm) {
                  wx.navigateBack()
                }
              }
            })
            return resolve()
          }
          this.setData({
            platformInfoList: res.data.data,
          })
          resolve()
        }
      })
    })
  },
  getLcId() {
    let info = this.data.currentSelectPlatForm,
      infoList = this.data.platformInfoList,
      form = this.data.form
    for (let i in infoList) {
      if (info.sign == infoList[i].sign) {
        form['lc_id'] = infoList[i].lc_info_id
        this.setData({
          form
        })
        return
      }
    }
    wx.showModal({
      title: '提示',
      content: '无法选中平台，此平台不在此域下',
      showCancel: false
    })
    this.setData({
      currentSelectPlatForm: null
    })
  },
  upPlatform(id) {
    return new Promise((resolve, reject) => {
      tss.post({
        url: tss.url('') + '/tms/order/push2Logistices',
        params: {
          order_ids: id
        },
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.hideLoading()
            resolve(false)
          }
          tss.query({
            url: tss.url('sql') + 'tms_order',
            params: {
              tms_order_id: id,
              addPlatformInfo: true
            },
            completion: res => {
              console.log(res)
              if (res.data[0].real_lc_id) {
                resolve(true)
              } else {
                resolve(false)
              }
            }
          })
        }
      })
    })
  },
  refresh() {
    wx.showLoading({
      title: '请稍后',
      mask: true
    })
    wx.redirectTo({
      url: Pages['order_price_parity'],
    })
  },
  pasteAddress() {
    if (!this.data.customerInfo) {
      wx.showModal({
        title: '提示',
        content: '请先选择客户哦',
        showCancel: false
      })
      return
    }
    var _this = this
    wx.getClipboardData({
      success(res) {
        wx.showLoading({
          title: '解析中...',
          mask: true
        })
        tss.post({
          url: tss.url('/addr/v2/splitNamePhoneAddress'),
          params: {
            addr: res.data
          },
          completion: res => {
            wx.hideLoading()
            console.log(res)
            if (res.failed) {
              alert.notice(res.errorMsg)
              return
            }
            const data = res.data
            for (let key in data) {
              typeof data[key] !== 'string' ? '' :
                data[key] = data[key].replace(/\n|\\S/g, '')
            }
            // this.setData({
            //     "form.region": [data.province || '', data.city || '', data.district || '', data.town || ''],
            //     "form.addr_detail": data.street_no || '',
            //     "form.name": data.name || '',
            //     "form.phone": data.phone || ''
            // })
            wx.showModal({
              title: '识别内容',
              content: `姓名：${data.name}\r\n电话：${data.phone}\r\n地址：${data.province||''}${data.city||''}${data.district||''}${data.town||''}${data.street_no}\r\n填入哪里？`,
              cancelText: "寄件人",
              confirmText: '收件人',
              complete: (res) => {
                var type = ""
                if (res.cancel) {
                  type = "send"
                  _this.setAddress(type, data)
                }
                if (res.confirm) {
                  type = "receive"
                  _this.setAddress(type, data)
                }
              }
            })
          }
        })
      }
    })
  },
  setAddress(type, data) {
    this.setData({
      form: {
        ...this.data.form,
        [`${type}_man`]: data.name,
        [`${type}_phone`]: data.phone,
        [`${type}_province`]: data.province,
        [`${type}_city`]: data.city,
        [`${type}_district`]: data.district,
        [`${type}_town`]: data.town || '',
        [`${type}_street_no`]: data.street_no
      },
      [`addrInfo.${type}`]: {
        obj: {
          addr_detail: data.street_no,
          name: data.name,
          phone: data.phone,
          region: [data.province, data.city, data.district, data.town]
        },
        info: [data.name, data.phone],
        addr: [data.province, data.city, data.district, data.town, data.street_no].map(item => {
          return item
        })
      }
    })
  },
  /*
  subOrders: [{"0":"4","1":"5","2":"6","weight":"3","volume":"0.000","pack":"纸箱","cargo":"1","amount":"2","v1":"4","v2":"5","v3":"6","message":"1 2件 3kg 0.000m³ 纸箱"}]
  if_visit: true
  agreement: xieyi
  customer_id: 5159
  clerk: 14755752682
  origin: WECHAT-GZH
  if_send: true
  trans_mode: 整车
  trans_mode_id: 1691
  service_mode: 自提
  settle_type: 现付
  send_province: 浙江省
  send_city: 杭州市
  send_district: 钱塘区
  send_town: 下沙街道
  send_street_no:  杭州市 钱塘区 科创科技园
  send_man: 李镇勇
  send_phone: 15773521643
  send_site:  杭州市 钱塘区 科创科技园
  receive_province: 广西壮族自治区
  receive_city: 百色市
  receive_district: 隆林各族自治县
  receive_street_no: 隆林县兴隆路三中路口对面天洪宾馆电话：
  receive_man: 王美燕
  receive_phone: 13347665299
  receive_site: 江门市
  if_load: false
  if_unload: false
  click: 19858115956
  finFlows: []
  uName: 19858115956
  uToken: o_Y_Y1b3dIRkUKYgetk7DV9NmSRk
  */
  /*
    subOrders: [{"0":"4","1":"5","2":"6","weight":"3","volume":"0.000","pack":"纸箱","cargo":"1","amount":"2","v1":"4","v2":"5","v3":"6","message":"1 2件 3kg 0.000m³ 纸箱"}]
if_visit: true
udf1: 陈大爷
udf2: 19858115956
udf3: 浙D5X9D1
udf4: 18
remark: 快点
agreement: xieyi
code: test1234567890001
scheduled_pick_time: 2023-04-23 10:00~12:00
rcode_type: 电子回单
_fees: 回单类型:电子回单
customer_id: 5159
clerk: 14755752682
origin: WECHAT-GZH
if_send: true
trans_mode: 整车
trans_mode_id: 1691
service_mode: 自提
settle_type: 现付
send_province: 浙江省
send_city: 杭州市
send_district: 钱塘区
send_town: 下沙街道
send_street_no:  杭州市 钱塘区 科创科技园
send_man: 李镇勇
send_phone: 15773521643
send_site:  杭州市 钱塘区 科创科技园
receive_province: 广西壮族自治区
receive_city: 百色市
receive_district: 隆林各族自治县
receive_street_no: 隆林县兴隆路三中路口对面天洪宾馆电话：
receive_man: 王美燕
receive_phone: 13347665299
receive_site: 江门市
if_load: false
if_unload: false
click: 19858115956
finFlows: []
uName: 19858115956
uToken: o_Y_Y1b3dIRkUKYgetk7DV9NmSRk
   */
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (this.data.needGet) {
      this.checkAndGetPrice()
      this.setData({
        needGet: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    lc.removeListener('orderInfo', this.__wxWebviewId__.toString())
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
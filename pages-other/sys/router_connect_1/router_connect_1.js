const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
import { $wuxDialog } from '../../../components/index'
const lc = require('../../../utils/listenerCenter.js')

const NAMES = ['Aaron', 'Alden', 'Austin', 'Baldwin', 'Braden', 'Carl', 'Chandler', 'Clyde', 'David', 'Edgar', 'Elton', 'Floyd', 'Freeman', 'Gavin', 'Hector', 'Henry', 'Ian', 'Jason', 'Joshua', 'Kane', 'Lambert', 'Matthew', 'Morgan', 'Neville', 'Oliver', 'Oscar', 'Perry', 'Quinn', 'Ramsey', 'Scott', 'Seth', 'Spencer', 'Timothy', 'Todd', 'Trevor', 'Udolf', 'Victor', 'Vincent', 'Walton', 'Willis', 'Xavier', 'Yvonne', 'Zack', 'Zane']

// 平台选择
Page({
  data: {
    alphabet: [],
  },
  goTipPlatform() {
    wx.redirectTo({ url: Pages.invite_downstream })
  },
  onLoad(options) {
    wx.hideShareMenu()
    wx.showLoading({ mask: true })
    let { type = '', orderId = '', warehouseId = '', warehouseName = '' } = options
    this.queryPlatform(options.type)
    this.setData({ type, orderId, warehouseId, warehouseName })
    if (type == 'own_logistic') {
      this.getWareHouseList()
    }

  },
  bindKeyInput: tss.debounce(function (e) {
    let value = e.detail.value
    if (value) {
      let filterData = this.data.platform
        .filter(item => item.name.includes(value))
      this.setData({ filterData,searchContent:value })
      console.log(filterData)
    } else {
      this.setData({
        filterData: this.data.platform,
        searchContent:value
      })
    }
  }, 500),
  onReady() {
    lc.addListener('wareHouseInfo', this.__wxWebviewId__.toString(), res => {
      if (res.wareHouseInfo) {
        this.getWareHouseList()
      }
    })
  },
  onUnload() {
    lc.removeListener('wareHouseInfo', this.__wxWebviewId__.toString())
  },
  onChange(e) {
    console.log('onChange', e.detail)
  },
  // 获取仓库列表
  getWareHouseList() {
    tss.query({
      url: tss.url('') + '/tms/entity/CSite',
      params: {
        type: '仓库', status: '在用'
      },
      completion: res => {
        console.log(res)
        if (res.failed) return
        res.data.unshift({ idx: 0, name: '保留发件人信息', id: '' })
        this.setData({
          warehouselist: res.data
        })
      }
    })
  },
  // 选择仓库
  popupClick({ currentTarget }) {
    let { id: warehouseId, name: warehouseName } = currentTarget.dataset
    this.setData({
      warehouseId,
      warehouseName
    }, () => {
      this.onClosePopup()
      this.doSend(this.data.orderId, this.data.logisticsId)
      // this.doSend
    })
  },
  // 新增仓库
  createWareHouse() {
    wx.navigateTo({
      url: `${Pages.order_warehouse}`,
    })
  },
  chooseWareHouse() {
    this.setData({ show_ware_house: true })
  },
  onClosePopup() {
    this.setData({ show_ware_house: false })
  },
  queryPlatform(type, params = {}) {
    if (type == 'own_logistic') {
      params = {
        justDomain: true,
        show_invite: true,
        joinCustomer: true
      }
    }
    if (type == 'create_new_fee' || type == 'task_settle_account') {
      this.querySettleAccount()
      return
    }
    tss.query({
      url: tss.url('sql') + 'lc_info',
      params,
      completion: res => {
        if (res.failed) {
          wx.showToast({
            title: '获取平台失败',
            icon: 'none'
          })
          wx.hideLoading()
          return
        }
        console.log(res.data)
        this.dealData(res.data)
      }
    })
  },
  dealData(data) {
    if (data.length == 0) {
      wx.hideLoading()
      this.setData({ nothing_data: true })
      return
    }
    if (this.data.type == 'own_logistic') {
      data = data.filter(item => item.idk && item.customer_idk)
    }
    let index = data.map(i => i.name.charAt())
    index = [...new Set(index)].join('')
    const alphabet = []
    // console.log(index)
    index.split('').forEach((initial) => {
      const cells = data
        .filter(i => i.name.charAt(0) === initial)
        .map(i => i.name)
      console.log(cells)
      alphabet.push({
        initial,
        cells
      })
    })
    wx.hideLoading()
    if (alphabet.length == 0) {
      wx.hideLoading()
      this.setData({ nothing_data: true })
      return
    }
    this.setData({
      platform: data,
      alphabet
      // alphabet:index.join()
    })
  },
  querySettleAccount(type) {
    tss.get({
      url: tss.url('ENTITY') + 'SettleAccount',
      completion: res => {
        if (res.failed) {
          wx.showModal({
            showCancel: false,
            content: res.errorMsg
          })
          wx.hideLoading()
          return
        }
        let data = res.data.filter(i => i.belong_type == 'logistics')
        this.dealData(data)
      }
    })
  },
  choosePlatform({ currentTarget }) {
    let { id: platform } = currentTarget
    let lc_id = this.data.platform.find(i => i.name == platform).id
    // 绑定平台
    if (this.data.type == 'bindLogistic' && this.data.orderId) {
      this.bindLogistic(platform, lc_id)
      return
    }

    // 修改承运商
    if (this.data.type == 'changeTrans' && this.data.orderId) {
      this.changeTrans(lc_id, this.data.orderId)
      return
    }

    if (this.data.type == 'own_logistic' && this.data.orderId) {
      console.log(this.data.orderId)
      // this.bindLogistic(platform, lc_id)
      this.sendToCarrier(this.data.orderId, lc_id)
      return
    }

    if (this.data.type == 'task_settle_account') {
      lc.emitEvent('task_settle_account', {
        settle_account_name: platform,
        settle_account_id: lc_id
      })
      wx.navigateBack()
      return
    }

    if (this.data.type == 'create_new_fee') {
      lc.emitEvent('back_settle_account', {
        settle_account_name: platform,
        settle_account_id: lc_id
      })
      wx.navigateBack()
      return
    }

    wx.navigateTo({
      url: `${Pages.router_connect_2}?platform=${platform}&lc_id=${lc_id}`,
    })
  },
  changeTrans(lc_id, order_id) {
    if (lc_id) {
      wx.showLoading()
      tss.post({
        url: tss.url('/tms/order/updateColumn'),
        params: {
          ids: order_id,
          propertyName: "lc_id",
          value: lc_id
        },
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.hideLoading()
            return
          }
          wx.hideLoading()
          wx.showModal({
            content: '操作成功',
            showCancel: false,
            confirmText: "返回",
            success: res => {
              if (res.confirm) {
                lc.emitEvent('ChangeInfo', {
                  change: true
                })
                wx.navigateBack()
              }
            }
          })
        }
      })
    }
  },

  // 推送给平台
  sendToCarrier(orderIds, logisticsId) {
    // wx.showLoading({ mask: true })
    if (!orderIds) {
      wx.hideLoading()
      wx.showModal({
        content: '返回选择订单！', showCancel: false
      })
      return
    }

    let logisticName = this.data.platform.find(i => i.id == logisticsId).name
    wx.showModal({
      content: `即将推送给【${logisticName}】`,
      success: res => {
        if (res.confirm) {
          this.setData({
            show_ware_house: true, logisticsId
          })
          // this.doSend(orderIds, logisticsId)
        }
      }
    })
  },



  doSend(orderIds, logisticsId) {
    wx.showLoading({ mask: true })
    tss.post({
      url: tss.url('') + '/tms/order/sendToCarrier',
      params: {
        orderIds, logisticsId,
        warehouseId: this.data.warehouseId || ''
      },
      completion: res => {
        wx.hideLoading()
        if (res.failed) {
          wx.hideLoading()
          wx.showModal({
            content: res.errorMsg, showCancel: false
          })
          return
        }
        res.data.forEach(i => {
          i.errorMsg
        })
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].errorMsg) {
            wx.showModal({
              content: `${res.data[i].errorMsg}-${res.data[i].code}`,
              showCancel: false
            })
            return false;
            break;
          }
        }
        lc.emitEvent('paramsInfo', { refresh: true })
        $wuxDialog().open({
          resetOnClose: true,
          maskClosable: false,
          // title: '推送成功',
          content: '通知给下游承运商',
          buttons: [
            // {
            // text: '返回',
            // onTap(e) {

            //   wx.navigateBack()
            // },
            // },
            {
              text: '立即通知',
              type: 'primary',
              openType: 'share',
            },
          ],
        })
      }
    })
  },

  onShareAppMessage() {

    return {
      title: '有人推送给您新的订单',
      imageUrl: this.data.shareImage,
      path: `${Pages.redirect}?pid=38`,
      complete: res => {
        console('qwe')
      }
    }
  },

  onUserOpStatistic: function (e) {
    if (e.op == 'share') {
      var path = e.path;
      console.log('share-success')
    }
  },



  // 绑定平台
  bindLogistic(platform, lc_id) {
    let _this = this
    $wuxDialog().prompt({
      resetOnClose: true,
      maskClosable: true,
      focus: true,
      title: '请输入平台单号',
      content: `【${platform}】` || '',
      defaultText: this.data.pop_content || '',
      cancelText: '扫码绑定',
      fieldtype: 'text',
      maxlength: -1,
      onConfirm(e, response) {
        // console.log(e, response)
        _this.doBind(response, lc_id, platform)
        // wx.reLaunch({
        //   url: `${Pages.redirect}?pid=${response}`,
        // })
      },
      onCancel(e) {
        wx.scanCode({
          success: res => {
            // _this.setData({
            //   pop_content: res.result
            // })
            _this.doBind(res.result, lc_id, platform)
          }
        })
      },
    })
  },
  doBind(code, lc_id, platform) {
    if (code.length < 5) {
      wx.showToast({
        title: '单号长度过短,请重新绑定!',
        icon: 'none'
      })
      return
    }
    tss.post({
      url: tss.url('') + '/tms/order',
      params: {
        id: this.data.orderId,
        tcode: code,
        lc_id
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg, showCancel: false
          })
          return
        }
        wx.showModal({
          title: '绑定成功',
          content: `【${platform}】- ${code}`,
          showCancel: false,
          success: res => res.confirm ? wx.navigateBack() : ''
        })
      }
    })
  }
})

const _App = getApp().globalData
import Pages from '../../../pages.js'
import { formatDate } from '../../../utils/util.js'
const lc = require('../../../utils/listenerCenter.js')
const tss = require('../../../utils/tss.js')
import { $wuxDialog } from '../../../components/index'

Page({
  data: {
    chooseType: 'onroad',
    statusColor: require('./source.js').OrderStatusColor,
    visible: false,
    showReceive: false,
    painting: {},
    printData: {},
    elecImgUrl: '../../../images/modal.png',
    moreMenu: [
      { code: 'doReceive', title: '签收', icon: 'i-pick', color: '#E63939' },
      { code: 'showElcOrder', title: '电子面单' },
      { code: 'printOrder', title: '打印订单', icon: 'i-punch' },
    ],
    page: 1,
    orderList: {
      total: 0,
      rows: []
    },
    showPage: false,
    choosedItem: {}
  },

  onLoad(options) {
    console.log(_App)
    this.setData({
      _App: _App,
      showPage: true
    })

    this.queryData({
      phone: _App.user.uName
    })
  },

  // 订单列表数据处理
  dealData(data) {
    const dealTag = (list = []) => {
      let _list = []
      list.forEach(item => {
        const [key, value] = Object.entries(item)[0]
        _list.push({
          title: key,
          class: value
        })
      })
      return _list
    }
    data = data.map(i => ({
      domain: i.domain,
      id: i.id,
      createtime: i.createtime,
      creator: i.createtime,
      status: i.status,
      status_code: i.status_code,
      receive_city: i.receive_city,
      receive_district: i.receive_district,
      receive_lng_lat: i.receive_lng_lat,
      receive_man: i.receive_man,
      receive_phone: i.receive_phone,
      receive_province: i.receive_province,
      receive_site: i.receive_site,
      receive_street_no: i.receive_street_no,
      receive_town: i.receive_town,
      send_city: i.send_city,
      send_district: i.send_district,
      send_lng_lat: i.send_lng_lat,
      send_man: i.send_man,
      send_phone: i.send_phone,
      send_province: i.send_province,
      send_site: i.send_site,
      send_street_no: i.send_street_no,
      send_town: i.send_town,
      customer_name: i.customer_name,
      sign_date: i.sign_date,
      order_date: formatDate(i.order_date, 'MM-dd hh:mm'),
      code: i.code,
      tcode: i.tcode,
      ccode: i.ccode,
      lc_info: [i.lc_name, i.tcode].filter(i => i).join(' - '),
      clerk: i.clerk,
      volume: i.volume,
      remark: i.remark,
      cod: i.cod,
      arrive_pay: i.arrive_pay,
      settle_type: i.settle_type,
      rcode_type: i.rcode_type,
      if_visit: i.if_visit,
      tag_names: dealTag((i.tag_names && i.tag_names.split(',')) || [])
    }))
    let list = this.data.orderList.rows
    this.setData({
      "orderList.rows": list.concat(data)
    })
    wx.hideLoading()
  },

  // 搜索订单
  searchCode(e) {
    console.log(e.detail.searchText)
  },

  // 筛选框打开回调
  onOpen(e) {
    console.log('Filter Open')
  },
  // 筛选框关闭回调
  onClose(e) {
    console.log('Filter Close', e)
  },


  // 进入订单详情
  goOrderDetail(e) {
    console.log(e)
    const { id, code, idx } = e.currentTarget.dataset
    wx.navigateTo({ url: `${Pages.order_detail}?id=${id}&code=${code}&orderIdx=${idx}` })
  },
  closeReceive(e) {
    this.setData({
      showReceive: false
    })
  },
  successReceive() {
    this.closeReceive()
    this.setData({
      page: 1,
      orderList: {
        total: 0,
        rows: []
      }
    })
    this.queryData({
      phone: _App.user.uName
    })
  },
  doReceive(e) {
    const { menuOrderId } = this.data
    const receiveItem = this.data.orderList.rows.find(i => i.id == menuOrderId)
    this.setData({
      showReceive: true, receiveItem
    })
  },
  // 打开更多操作菜单
  moreMenu(e) {
    const { id, status, code, idx } = e.currentTarget.dataset
    let realMoreMenu = this.data.moreMenu
    console.log(e.currentTarget.dataset, this.data.chooseType)
    if (status != '待接单') {
      realMoreMenu = realMoreMenu.filter(i => i.code != 'cancelOrder')
    }

    if (status == '已取消') {
      realMoreMenu = realMoreMenu.filter(i => i.code != 'changeOrder' && i.code != 'bindLogistic')
    }
    if (this.data.chooseType == 'signed') {
      realMoreMenu = realMoreMenu.filter(i => i.code != 'changeOrder' && i.code != 'bindLogistic')
    }
    if (_App.user.isCustomer || _App.user.isTest) {
      realMoreMenu = realMoreMenu.filter(i => i.code != 'bindLogistic' || i.code != 'changeTrans' || i.code != 'push2Logistic')
    }

    this.setData({
      realMoreMenu,
      popVisible: true,
      menuOrderId: id,
      menuOrderCode: code,
      menuOrderIdx: idx
    })
  },
  // 点击更多菜单
  clickMoreMenu(e) {
    console.log(e)
    const { code } = e.currentTarget.dataset
    this[code]()
    setTimeout(() => {
      this.closeMoreMenu()
    }, 500)
  },
  changeTrans() {

  },
  // 冻结订单
  frozenorder() {

  },
  // 关闭更多操作菜单
  closeMoreMenu() {
    this.setData({ popVisible: false })
  },

  // 删除订单 逻辑删除
  cancelOrder() {

  },
  // 修改订单
  changeOrder() {

  },
  // 绑定平台
  bindLogistic() {

  },
  // 上传至平台
  push2Logistic() {

  },
  // 打印订单
  printOrder() {

  },


  // 查看轨迹
  goOrderRoute(e) {
    let { id, code, domain } = e.currentTarget.dataset
    wx.navigateTo({ url: `${Pages.order_routes}?id=${id}&code=${code}&domain=${domain}` })
  },
  // 查询收件列表
  queryData(params) {
    params.page = this.data.page
    params.rows = 5

    tss.query({
      url: tss.url('sql') + 'xcx_order_receive',
      params,
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({ content: res.errorMsg, showCancel: false })
          wx.hideLoading()
          return
        }
        if (res.data.total == this.data.orderList.rows.length) {
          wx.hideLoading()
          return
        }
        // this.data.total[this.data.chooseType] = res.data.total
        this.data.page++
        this.dealData(res.data.rows)
        this.setData({
          "orderList.total": res.data
        })
      }
    })
  },
  // painting()回调
  eventGetImage(e) {
    console.log(e)
    const { tempFilePath, errMsg } = e.detail
    if (errMsg == 'canvasdrawer:ok') {
      this.data.lastFilePath = tempFilePath
      this.setData({
        elecImgUrl: tempFilePath
      })
    } else if (errMsg == 'canvasdrawer:samme params') {
      this.setData({
        elecImgUrl: this.data.lastFilePath
      })
    }
  },
  //打开电子免单
  showElcOrder(e, id = this.data.menuOrderId) {
    wx.showLoading()
    // const data = [...this.data.orderList.signed,...this.data.orderList.onroad].find(i=>i.id == id)
    // console.log(data)
    tss.post({
      url: tss.url('') + '/tms/order/print',
      params: {
        ids: id,
        type: '主单',
        print_id: this.data.printData.printModeId || '',
        newModule: true
      },
      completion: res => {
        wx.hideLoading()
        console.log(res)
        let { lineData } = res.data[0]
        let lineDataObj = {}
        let painting = require('./source.js').painting
        Object.entries(lineData).forEach(([key, value]) => {
          value && value.forEach(i => lineDataObj[i.field] = i.value)
        })
        this.setData({
          visible: true,
          painting: painting(lineDataObj, _App)
        })
      }
    })
  },
  //关闭电子面单
  onClosePop() {
    this.setData({ visible: false, elecImgUrl: '../../../images/modal.png' })
  },
  // 复制订单号
  copyCode(e) {
    wx.setClipboardData({
      data: e.currentTarget.id,
    })
  },
  onReachPageBottom() {
    this.queryData({ phone: _App.user.uName })
  },
  pageScroll(e) {
    let { scrollTop } = e.detail
    if (scrollTop == 0) return
    this.data.page_scrollTop = scrollTop
  },
  onReady() {
    // lc.addListener('ChangeInfo', this.__wxWebviewId__.toString(), res => {
    //   console.log(res)
    //   if (res.change) {
    //     this.setData({
    //       page: { "onroad": 1, "signed": 1 },
    //       orderList: { "onroad": [], "signed": [] },
    //     }, () => {
    //       this.queryData({phone:_App.user.uName})
    //     })
    //   }
    //   if (res.cancleOrderIdx) {
    //     let list = `orderList.onroad[${res.cancleOrderIdx}].status`
    //     this.setData({
    //       [list]: '已取消'
    //     })
    //   }
    // })
  },
  onUnload() {
    // 在组件实例被从页面节点树移除时执行
    // lc.removeListener('ChangeInfo', this.__wxWebviewId__.toString())
  }
})
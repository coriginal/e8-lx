import Pages from '../../../pages.js'
import {
  debounce
} from '../../../utils/util.js';
const _APP = getApp().globalData;
const tss = require('../../../utils/tss.js');
const alert = require('../../../utils/alert.js')
const lc = require('../../../utils/listenerCenter.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moreMenu: [{
      code: 'copy',
      title: '复制'
    }, {
      code: 'default',
      title: '设置为默认'
    }, ],
    search: '',
    showAddAddress: true,
    tabActive: 'send',
    list: [],
    show: false,
    filterData: [],
    type: '',
    searchCode: ''
  },
  tabChange(event) {
    this.setData({
      list: [],
      filterData: [],
      show: false,
      tabActive: event.detail.name,
      type: event.detail.name
    }, () => {
      this.queryCustomerAddrList()
    })
  },
  onShow() {
    this.queryCustomerAddrList();
  },
  onLoad: function (options) {
    this.searchCodeDebounce = tss.debounce(this.searchCode, 500)
    const {
      type,
      customer_id = '-999',
      title = type == 'send' ? '寄件地址选择' : '收件地址选择',
      companyName,
    } = JSON.parse(options.info || "{}")
    this.setData({
      tabActive: type,
      title,
      type,
      customer_id,
      companyName,
      showAddAddress: !_APP.user.isCustomer || (_APP.DomainConfig?.xcx_allowed_customer_add_address?.content ? _APP.DomainConfig?.xcx_allowed_customer_add_address?.content == 'true' : true)
    })

    wx.setNavigationBarTitle({
      title: "地址簿"
    })
    customer_id && this.queryCustomerAddrList()
  },

  // 查询客户地址列表
  queryCustomerAddrList() {
    wx.showLoading()
    tss.post({
      method: 'get',
      useCookie: true,
      url: tss.url('sql') + 'customer_contact',
      params: {
        q: this.data.searchCode,
        customer_id: this.data.customer_id,
        type: this.data.type == 'send' ? '寄件' : '收件'
      },
      completion: res => {
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg
          })
          wx.hideLoading()
          return
        }
        this.setData({
          list: res.data.filter((k, v) => v <= 30)
        })
        wx.hideLoading()
      }
    })
  },
  searchCode() {
    this.queryCustomerAddrList()
  },
  bindKeyInput: function (e) {
    this.setData({
      'searchCode': e.detail
    })
    this.searchCodeDebounce()
  },
  // 选择或编辑地址
  EditOrChooseAddr(e) {
    const {
      item,
      type
    } = e.currentTarget.dataset
    let data = {
      obj: {
        addr_detail: item.street_no || '',
        company: item.company || '',
        name: item.name || '',
        phone: item.phone || '',
        region: [item.province || '', item.city || '', item.district || '', item.town || '']
      },
      site: item.site,
      info: [item.name || '', item.phone || ''],
      addr: [item.province, item.city, item.district, item.town, item.street_no].filter(i => i)
    }
    if (type == 'choose') {
      lc.emitEvent('orderInfo', {
        type: this.data.type,
        data
      })
      wx.navigateBack()
    } else {
      data.obj.id = item.id
      wx.redirectTo({
        url: `${Pages.customer_addr_edit}?type=${this.data.type}&data=${JSON.stringify(data)}`
      })
    }
  },
  // 打开更多菜单
  showMoreMenu(e) {
    const {
      item: chooseItem,
      index: chooseIndex
    } = e.currentTarget.dataset
    this.setData({
      visible: true,
      chooseItem,
      chooseIndex
    })
  },
  // 关闭更多菜单
  closeMoreMenu(e) {
    this.setData({
      visible: false,
      chooseItem: ''
    })
  },
  // 点击更多菜单按钮
  clickMoreMenu(e) {
    const {
      chooseIndex = this.data.chooseIndex, code, chooseItem = this.data.chooseItem
    } = e.currentTarget.dataset
    switch (code) {
      case 'copy': {
        this.copyAddr(chooseItem)
      };
      break;
    case 'default': {
      this.setDefaultAddr(chooseItem, chooseIndex)
    };
    break;
    }
  },
  // 设为默认地址
  setDefaultAddr(addr, chooseIndex) {
    let {
      customer_id,
      type,
      id
    } = addr
    let json = [{
      "sqlCode": "update_default_addr",
      data: {
        customer_id,
        type
      }
    }];
    tss.excuteDMLs({
      url: tss.url('dml'),
      data: JSON.stringify(json),
      completion: res => {
        tss.save({
          url: tss.recordURLs('tms_contact').UPDATE,
          params: {
            id,
            if_default: 1
          },
          completion: res => {
            if (res.failed) {
              wx.showModal({
                content: res.errorMsg
              })
            }
            this.queryCustomerAddrList()
          }
        })
        setTimeout(() => {
          this.closeMoreMenu()
        }, 500)
      }
    })
  },
  // 删除地址
  deleteAddr(e) {
    alert.notice('是否确认删除', confirm => {
      tss.del({
        url: tss.recordURLs('tms_contact').DELETE,
        itemId: e.currentTarget.id,
        completion: res => res.failed ? alert.error(res.errorMsg) : this.setData({
          filterData: this.data.list.filter(i => i.id != e.currentTarget.id)
        })
      })

    }, cancel => {})
  },
  // 复制地址
  copyAddr(addr) {
    wx.setClipboardData({
      data: `${addr.name || ''} ${addr.phone || ''} ${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.town || ''}${addr.street_no || ''}`,
      success: () => {
        wx.showToast({
          title: '内容已复制！',
          icon: 'none',
          duration: 2000
        })
        setTimeout(() => {
          this.closeMoreMenu()
        }, 500)
      }
    })
  },
  // 新增一个地址
  createNewAddr() {
    let url = `${Pages.customer_addr_edit}?type=${this.data.tabActive}&customer_id=${this.data.customer_id}`;
    let config = _APP.DomainConfig
    //delete config['xcx_edit_customer']
    if (config?.xcx_allowed_customer_add_address?.content == 'true') {
      url += `&companyName=${this.data.companyName}`
    }
    wx.navigateTo({
      url
    })
  }
})
const _App = getApp().globalData
const lc = require('../../utils/listenerCenter.js')
import Pages from '../../pages.js'
import {
  $wuxToptips
} from '../../components/index.js'
import {
  $wuxDialog
} from '../../components/index'
import {
  payForOrder
} from './payForOrder.js'
import user from '../../utils/user.js'

const tss = require('../../utils/tss.js')


Component({
  options: {
    styleIsolation: 'apply-shared',
  },

  properties: {
    orderId: {
      type: Number,
      value: '',
      observer(a, b) {
        if (a > 0) {
          setTimeout(() => {
            this.getCusTransMode(this.data.orderInfo.customerInfo.id)
          }, 1000);
        }
      }
    },
    form: {
      type: Object,
      value: {
        if_visit: true
      }
    },
    orderInfo: {
      type: Object,
      value: {}
    },
    ifScan: {
      type: Boolean,
      value: false
    },
    send_receive_addr_can_null: {
      type: Boolean,
      value: false
    },
    truckTaskCode: {
      type: String,
      value: ''
    }
  },

  data: {
    value1: ['1'],
    showPickTime: false,
    showPickTimeRow: true,
    // orderInfo: {
    //     'send': { info: ['寄件人信息'], addr: ['请填写寄件人地址'] },
    //     'receive': { info: ['收件人信息'], addr: ['请填写收件人地址'] }
    // },
    // orderSettleType: '现结',
    contentMenu: [{
        icon: 'i-formfill',
        title: '智能黏贴',
        code: 'copy'
      },
      {
        icon: 'i-voicefill',
        title: '语音识别',
        code: 'voice'
      },
      {
        icon: 'i-picfill',
        title: '图片识别',
        code: 'pic'
      }
    ],
    otherMenu: [],
    settleTypeList: [{
      title: '到付',
      checked: false
    }, {
      title: '现付',
      checked: true
    }, {
      title: '月结',
      checked: false
    }],
    showCustomerChoose: false,
    showClerkChoose: false,
    user: _App.user,
    settle_type: "现付",
    service_mode: "派送",
    companyInfo: {},
    agreement: false,
    remark_required: false,
    cargo_required_fields: [],
    recordsInfo: {},
    recordsLabel: {},
    chooseLinePop: false,

    cargoLength: 1,

    clerkList: [],
    filterClerkList: [],
    showPageContainer: false,
    allow_split_order: false,

    showInputCustomer: false,
    customerName: "",
    isNotCustomerName: true,
    modalName: "",
    modalCustomerName: "",
    isCustomer: true
  },

  lifetimes: {
    created() {
      this.getRecordsField()
    },
    // 获取从各个页面返回的订单信息
    attached: function () {
      this.setData({
        isCustomer: _App.user.isCustomer
      })
      lc.addListener('orderInfo', this.__wxWebviewId__.toString(), res => {
        let orderInfo = {
          ...this.data.orderInfo,
          [res.type]: res.data
        }
        this.setData({
          orderInfo,
        })
        if (res.type == 'customerInfo') {
          this.getCustomerLine()
          this.getDefaultAddress(res.data.id)
          this.settleTypeChoose(null, res.data.settle_type)
          this.getCusTransMode(res.data.id)
          var order_default = JSON.parse(res.data.order_default || "{}")
          // this.data.form.if_visit = order_default['if_visit']
          this.setData({
            settle_type: res.data.settle_type,
          })
          if (order_default.if_visit) {
            this.setData({
              "form.if_visit": order_default.if_visit === "true",
            })
          } else if (_App.DomainConfig.if_visit_none && _App.DomainConfig.if_visit_none.content == 1) {
            this.setData({
              "form.if_visit": false
            })
          }
          if (order_default.service_mode) {
            this.setData({
              service_mode: order_default.service_mode,
            })
          } else if (_App.DomainConfig.if_service_none && _App.DomainConfig.if_service_none.content == 1) {
            this.setData({
              service_mode: "自提"
            })
          } else {
            this.setData({
              service_mode: "派送"
            })
          }

          if (order_default.settle_type) {
            this.setData({
              settle_type: order_default.settle_type == "现结" ? "现付" : "月结",
            })
          }

          if (order_default.rcode_type) {
            this.setData({
              'orderInfo.fee.rcode_type': order_default.rcode_type,
              'orderInfo.fee._fees': order_default.rcode_type
            })
          }

        }
        this.setSite();
      })
      if (_App.DomainConfig.if_visit_none && _App.DomainConfig.if_visit_none.content == 1) {
        this.setData({
          "form.if_visit": false
        })
      }
      if (_App.DomainConfig.if_service_none && _App.DomainConfig.if_service_none.content == 1) {
        this.setData({
          service_mode: "自提"
        })
      }
      // this.getTransModeList()
      const agreement = wx.getStorageSync('agreement')
      this.setData({
        orderInfo: {
          'send': {
            info: ['寄件人信息'],
            addr: ['请填写寄件人地址']
          },
          'receive': {
            info: ['收件人信息'],
            addr: ['请填写收件人地址']
          },
          settleTypeList: this.data.settleTypeList
        },
        form: this.data.form,
        user: _App.user,
        companyInfo: _App.companyInfo,
        agreement: !!agreement
      })

    },
    async ready() {
      let arr = []
      const getSettleType = setInterval(() => {
        if (this.data.orderInfo.send.info[0] != ['寄件人信息']) {
          this.data.orderInfo.settleTypeList.map(item => {
            if (item.checked) {
              this.settleTypeChoose(null, item.title)
              item.arrive_pay && this.setData({
                arrive_pay: item.arrive_pay
              })
            }
          })
          clearInterval(getSettleType)
        }
      }, 100)
      wx.showLoading({
        mask: true,
      })
      await this.getRecordsField()
      await queryConfigCode().then(res => {
        this.setData({
          addedService: res
        })
      })
      await this.queryConfigForCode().then(res => {
        if (res.data.length) {
          this.data.writeCode = res.data[0].content
        }
      })
      await this.queryConfigForCode('send_receive_addr_can_null').then(res => {
        if (res.data.length && res.data[0].content == '1') {
          this.data.send_receive_addr_can_null = true
        }
      });
      await this.queryConfigForCode('allow_split_order').then(res => {
        if (res.data.length && res.data[0].content == '1') {
          this.setData({
            allow_split_order: true
          })
        }
      })
      wx.hideLoading()
      this.data.cargo_required_fields = [];
      this.data.remark_required = false;
      if (_App.DomainConfig.order_write_required_fields && _App.DomainConfig.order_write_required_fields.content) {
        let all_columns = JSON.parse(_App.DomainConfig.order_write_required_fields.content);
        for (let i = 0; i < all_columns.length; i++) {
          let item = all_columns[i];
          if (['cargo', 'amount', 'weight', 'volume', 'pack'].indexOf(item.field) > -1 && item.required) {
            this.data.cargo_required_fields.push(item);
          };
          if (item.field == 'remark' && item.required) {
            this.data.remark_required = true
          }
        }
      }
      //如果是客户则进行查询 如果非客户则开启客户选择列表
      if (this.data.user.isCustomer) {
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
        tss.query({
          url: tss.url('sql') + 'customer',
          // params: { phone: _App.user.uName },
          params: {},
          completion: res => {
            if (res.failed) {
              wx.showModal({
                content: res.errorMsg,
                showCancel: false
              })
              return
            }
            if (res.data.length > 1) {
              this.setData({
                showCustomerChoose: true
              })
            }
            this.setData({
              'orderInfo.customerInfo': res.data.length && res.data[0],
              // orderSettleType:res.data[0].settle_type
              showInputCustomer: _App.DomainConfig?.xcx_edit_customer?.content == 'true',
              customerOrderCode: _App.DomainConfig?.customer_order_code?.content || ''
            })
            this.checkCustomerName(this.data.orderInfo.customerInfo.name)
            var order_default = JSON.parse(res.data[0].order_default || "{}")
            if (order_default.rcode_type) {
              this.setData({
                'orderInfo.fee.rcode_type': order_default.rcode_type,
                'orderInfo.fee._fees': order_default.rcode_type
              })
            }
            this.getDefaultAddress(res.data[0].id)
            this.settleTypeChoose(null, res.data[0].settle_type)
            this.getCusTransMode(res.data[0].id)
            wx.hideLoading()
            this.getCustomerLine()
          }
        })
      } else {
        this.setData({
          showCustomerChoose: true
        })
      }
      this.getClerkInfo()
      if (_App.DomainConfig['baidu_api_secret']) {
        this.setData({
          otherMenu: [...this.data.otherMenu, {
            icon: 'i-camerafill',
            title: '面单识别',
            code: 'camera'
          }]
        })
      }
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
      lc.removeListener('orderInfo', this.__wxWebviewId__.toString())
    },
  },
  methods: {
    hideModal() {
      this.setData({
        modalName: ''
      })
    },
    customerNameChange() {
      this.setData({
        modalCustomerName: '',
        modalName: "DialogModal"
      })
    },
    modalCustomerNameInput(e) {
      this.setData({
        modalCustomerName: e.detail.value
      })
    },
    modalUpdateCustomerName() {
      tss.post({
        url: tss.url(`/tms/customer/api/updateCustomerName/${this.data.orderInfo.customerInfo.id}`),
        type: "repair_operate",
        params: {
          customerName: this.data.modalCustomerName
        },
        completion: res => {
          if (res.failed) {
            wx.showModal({
              title: '提示',
              content: res.data,
              showCancel: false
            })
            this.setData({
              customerName: ''
            })
            return
          }
          this.setData({
            'orderInfo.customerInfo.name': this.data.modalCustomerName,
            isNotCustomerName: false,
            customerName: this.data.modalCustomerName,
            modalName: ''
          })
        }
      })
    },
    updateCustomerName(e) {
      if (e.detail.value) {
        tss.post({
          url: tss.url(`/tms/customer/api/updateCustomerName/${this.data.orderInfo.customerInfo.id}`),
          type: "repair_operate",
          params: {
            customerName: e.detail.value
          },
          completion: res => {
            if (res.failed) {
              wx.showModal({
                title: '提示',
                content: res.data,
                showCancel: false
              })
              this.setData({
                customerName: ''
              })
              return
            }
            this.setData({
              'orderInfo.customerInfo.name': this.data.modalCustomerName,
              isNotCustomerName: false,
              customerName: e.detail.value,
            })
          }
        })
      }
    },

    checkCustomerName(customerName) {
      if (/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/g.test(customerName)) {
        this.setData({
          isNotCustomerName: true
        })
      } else {
        this.setData({
          customerName,
          isNotCustomerName: false
        })
      }
    },
    // 获取客户能否填写单号权限
    test() {},
    getClerkInfo() {
      tss.post({
        url: tss.url('') + '/wx/api/users_ex_customer2',
        completion: res => {

          if (res.failed) {
            return
          }
          this.setData({
            clerkList: res.data,
            filterClerkList: {
              ...res.data
            }
          })
        }
      })
    },
    // getCustomerOrderCode() {
    //     tss.query({
    //         url: tss.url('ENTITY') + 'DomainConfig',
    //         params: {
    //             code: 'customer_order_code'
    //         },
    //         completion: res => {
    //             if (res.failed) return
    //             const [data] = res.data
    //             const {
    //                 content = ""
    //             } = data
    //             if (content) {
    //                 this.setData({
    //                     customerOrderCode: content
    //                 })
    //             } else {
    //                 this.setData({
    //                     customerOrderCode: ''
    //                 })
    //             }
    //         }
    //     })
    // },
    getPickTimes() {
      this.setData({
        showPickTime: true
      })
    },
    // 选择预约取件时间
    changePickTime(e) {
      this.setData({
        "orderInfo.scheduled_pick_time": e.detail,
        showPickTime: false
      })
    },
    // 展示settletype
    // showSettleTypeChoose() {
    //   const itemList = ['到付', '现结', '月结']
    //   wx.showActionSheet({
    //     itemList,
    //     success: res => {
    //       this.setData({
    //         orderSettleType: itemList[res.tapIndex]
    //       })
    //     }
    //   })
    // },
    settleMoneyInput(e) {
      this.data.settleMoney = e.detail.value
    },
    // 根据客户查询
    getCusTransMode(customer_id) {
      const getAllMode = () =>
        new Promise(resolve => {
          tss.query({
            url: tss.url('sql') + 'trans_mode_wt',
            completion: res => {
              if (res.failed) {
                resolve('fail')
              } else {
                resolve(res.data)
              }
            }
          })
        })
      getAllMode().then(models => {
        tss.post({
          url: tss.url('') + '/tms/api/customerGetTransMode',
          params: {
            customer_id
          },
          completion: res => {
            if (res.failed) return
            if (res.data.length > 0) {
              let transModeList = res.data.map(i => ({
                ...i,
                if_wt: models.find(x => x.id == i.id).if_wt ? models.find(x => x.id == i.id).if_wt : 0
                // () => {
                //     try {
                //         return models.find(x => x.id == i.id).if_wt
                //     } catch (err) {
                //         return 1
                //     }
                // }
              }))
              let _transMode = transModeList.find(i => i.selected) || transModeList.find(i => !i.if_wt)
              if (this.data.orderId) {
                this.setData({
                  transModeList
                })
              } else {
                this.setData({
                  transModeList,
                  "form.trans_mode": (_transMode && _transMode.name && _transMode.id) ? _transMode.name : transModeList[0].name,
                  "form.trans_mode_id": (_transMode && _transMode.name && _transMode.id) ? _transMode.id : transModeList[0].id,
                  "form.if_wt": (_transMode && _transMode.name && _transMode.id) ? _transMode.if_wt : transModeList[0].if_wt
                })
              }
            }
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
    // 获取默认地址信息
    getDefaultAddress(customer_id) {
      tss.query({
        url: tss.url('data') + 'xcx_tms_contact',
        // url: tss.url('sql') + 'customer_contact'
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
            this.data.orderInfo[item.type == '寄件' ? 'send' : 'receive'] = {
              addr: [item.province, item.city, item.district, item.town, item.street_no].filter(i => i),
              info: [item.name || '', item.phone || ''],
              obj: {
                addr_detail: item.street_no || '',
                name: item.name || '',
                phone: item.phone || '',
                region: [item.province || '', item.city || '', item.district || '', item.town || '']
              },
              site: item.site
            }
          })
          this.setSite();
        }
      })
    },
    // 获取业务类型  -del
    getTransModeList() {
      wx.showLoading({
        mask: true
      })
      tss.query({
        url: tss.url('') + '/tms/api/entity/TransMode',
        params: {
          active: true
        },
        completion: res => {
          if (res.failed) {
            wx.showToast({
              title: res.errorMsg,
              icon: 'none'
            })
            wx.hideLoading()
            return
          } else {
            wx.hideLoading()
            let tm = res.data.find(i => i.name == "零担") ? res.data.find(i => i.name == "零担") : res.data[0] || {};
            this.setData({
              transModeList: res.data,
              "form.trans_mode": tm.name,
              "form.trans_mode_id": tm.id
            })
          }
        }
      })
    },
    // 选择业务类型
    chooseTransMode() {
      this.setData({
        showPopup: true
      })
    },

    popupClick(e) {
      const {
        id,
        name,
        wt
      } = e.currentTarget.dataset
      this.setData({
        "form.trans_mode": name,
        "form.trans_mode_id": id,
        "form.if_wt": wt,
        showPopup: false
      })
    },
    onClosePopup() {
      this.setData({
        showPopup: false,
        chooseServerPop: false,
        chooseSettleTypePop: false,
        chooseLinePop: false,
        showClerkChoose: false
      })
    },
    // 选择付款方式
    settleTypeChoose(e, value) {
      if (e) {
        var settle_type = e.detail.value
      } else if (value == '现结') {
        var settle_type = '现付'
      } else {
        var settle_type = value
      }
      this.data.settleTypeList = this.data.settleTypeList.map(item => ({
        title: item.title,
        checked: item.title == settle_type
      }))
      if (!this.data.settleTypeList[0].checked && this.data.orderInfo.fee) {
        this.setData({
          // "orderInfo.fee.arrive_pay": '',
          // "orderInfo.fee._fees": this.data.orderInfo.fee._fees.replace(/到付款:\d+\s/g, '')
        })
      }
      this.setData({
        'orderInfo.settleTypeList': this.data.settleTypeList,
        settle_type: settle_type
      })
    },

    // 前往客户选择列表
    goChooseCustomer(e) {
      wx.navigateTo({
        url: Pages.customer_list
      })
    },
    // 手动输入起始地目的地
    getSite(e) {
      var type = e.currentTarget.dataset.type
      this.setData({
        [`orderInfo.${type}.site`]: e.detail.value
      })
    },
    // 前往地址簿
    goChooseAddr(e) {
      if (this.data.orderInfo.customerInfo) {
        const {
          id: type
        } = e.currentTarget
        const {
          id: customer_id
        } = this.data.orderInfo.customerInfo
        let info = {
          type,
          customer_id,
          ...(_App.DomainConfig?.xcx_edit_customer?.content == 'true' && {
            companyName: this.data.orderInfo.customerInfo.name
          })
        }
        wx.navigateTo({
          url: `${Pages.customer_addr_list}?info=${JSON.stringify(info)}`
        })
      } else {
        $wuxToptips().warn({
          hidden: false,
          text: '请先选择客户',
          duration: 3000
        })
      }
    },
    // 前往编辑地址
    goEditAddr(e) {
      if (!this.data.orderInfo.customerInfo) {
        $wuxToptips().warn({
          hidden: false,
          text: '请先选择客户',
          duration: 3000
        })
        return;
      }
      const {
        id: type
      } = e.currentTarget
      const {
        id: customer_id
      } = this.data.orderInfo.customerInfo
      let url = `${Pages.customer_addr_edit}?customer_id=${customer_id}&type=${type}&data=${JSON.stringify(this.data.orderInfo[type] || {})}`
      if (_App.DomainConfig?.xcx_edit_customer?.content == 'true' && type == 'send') {
        url += `&companyName=${this.data.orderInfo.customerInfo.name}`
      }
      wx.navigateTo({
        url
      })
    },
    // 前往货物信息
    goCargoInfo(e) {
      var index = e.currentTarget.dataset.index
      if (this.data.orderId) {
        wx.navigateTo({
          url: `${Pages.order_cargo_tms}?type=cargo&subOrders=${JSON.stringify(this.data.orderInfo.cargo.subOrders || [])}`
        })
        return
      }
      wx.navigateTo({
        url: `${Pages.order_cargo}?defaultVolume=true&type=cargo&index=${index}&data=${JSON.stringify(this.data.orderInfo.cargo || "")}&customerId=${this.data.orderInfo.customerInfo?.id || ''}`,
      })
    },

    // 前往车辆信息填写
    goTransModeInfo() {
      let form = this.data.form,
        orderInfo = this.data.orderInfo
      wx.navigateTo({
        url: `${Pages.order_transmode}?type=${form.trans_mode}&data=${orderInfo[form.trans_mode] && JSON.stringify(orderInfo[form.trans_mode].transModeInfo || {}) || ''}`,
      })
    },
    doScan(e) {
      wx.scanCode({
        success: res => {
          let result = res.result
          this.setData({
            "form.ccode": result
          })
        }
      })
    },

    // 前往增值服务
    goFeeInfo(e) {
      // let ifShowArrivePay = JSON.stringify(this.data.settleTypeList[0].checked)
      wx.navigateTo({
        url: `${Pages.order_fee}?type=fee&data=${JSON.stringify(this.data.orderInfo.fee || {})}`
      })
    },
    // 备注
    remarkInput(e) {
      this.data.remark = e.detail.value
    },
    // 上门取件
    switchChange(e) {
      this.data.form.if_visit = e.detail.value
      this.setData({
        showPickTimeRow: e.detail.value
      })
    },
    // 获取当前页填写的表单信息
    getFormData(form) {
      if (this.data.showInputCustomer) {
        if (/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/g.test(this.data.orderInfo.customerInfo.name)) {
          wx.showModal({
            title: '提示',
            content: '请填写公司名称',
            showCancel: false
          })
          return
        }
      }
      // 判断是否同意协议;
      if (form.detail.value.agreement) {
        if (!form.detail.value.agreement[0]) {
          wx.showToast({
            title: '请阅读并同意服务协议！',
            icon: 'none'
          })
          return;
        }
      }
      if (form.detail.value.code || form.detail.value.ccode) {
        const code = form.detail.value.code || form.detail.value.ccode;
        delete form.detail.value.code;
        delete form.detail.value.ccode;
        form.detail.value.ccode = code;
      }
      this.checkForm().then(res => {
        let codes = form.detail.value.ccode
        if (this.data.customerOrderCode) {
          delete form.detail.value.ccode
          let customerOrderCode = this.data.customerOrderCode.split('|')
          customerOrderCode.forEach(i => form.detail.value[i] = codes)
        }
        //扫码下单单号
        if (this.data.writeCode && !_App.user.isCustomer) { //
          delete form.detail.value.ccode
          let writeCode = this.data.writeCode.split('|')
          writeCode.forEach(i => form.detail.value[i] = codes)
        }
        //客户下单单号
        /*if(_App.DomainConfig.customer_order_code.content){
            delete form.detail.value.ccode
            let writeCode = _App.DomainConfig.customer_order_code.content.split('|')
            writeCode.forEach(i => form.detail.value[i] = codes)
        }*/
        wx.showLoading({
          mask: true
        })
        // 检查面单配置
        queryDomainConfig().then(res => {
          if (res.failed) {
            alertError(res.errorMsg)
            return
          }
          // 是否需要面单
          if (res.data.length > 0 && res.data[0].content > 0) {
            // 查询历史面单
            queryCustomerCodeIssue(this.data.orderInfo.customerInfo.id)
              .then(res => {
                if (res.failed) {
                  alertError(res.errorMsg)
                  return
                }
                if (res.data.length > 0) {
                  // 有历史面单 直接用
                  form.detail.value.code = res.data[0].code
                  this.saveAndCommit(form.detail.value)
                } else {
                  // 没有历史面单 查询余额
                  queryCustomerAccountBalance()
                    .then(res => {
                      if (res.failed) {
                        alertError(res.errorMsg)
                        return
                      }
                      let balance = res.data.balance + res.data.balance_freeze
                      // 查询面单价格 
                      queryHandleOrderPrice()
                        .then(res => {
                          if (res.failed) {
                            alertError(res.errorMsg)
                            return
                          }
                          let handleOrderMoney = res.data.money_cal
                          let params = {
                            type: 'com.boudata.tms.product.ModuleOrderENHandler',
                            money_cal: handleOrderMoney,
                            appid: _App.app_id,
                            mchid: _App.mchid,
                            account_num: 1
                          }
                          // 如果余额能够支付 直接进行支付 否则微信支付
                          if (balance >= handleOrderMoney) {
                            params.pay_type = '余额'
                            payForOrder(params, (res) => {
                              if (res == 'success') {
                                this.getFormData(form)
                                return
                              }
                            })
                          } else {
                            wx.hideLoading()
                            // 余额不能够进行支付
                            $wuxDialog().confirm({
                              resetOnClose: true,
                              title: '当前账户余额不足！',
                              content: `请对该单进行主单支付${handleOrderMoney}元`,
                              confirmText: '立即支付',
                              cancelText: '前去充值',
                              cancelType: 'red',
                              onConfirm: () => {
                                payForOrder(params, (res) => {
                                  if (res == 'success') {
                                    this.getFormData(form)
                                    return
                                  }
                                })
                              },
                              onCancel: () => {
                                wx.navigateTo({
                                  url: Pages.topup
                                })
                                this.orderDisabledChange()
                              },
                            })
                          }
                        })
                    })
                }
              })
          } else {
            this.saveAndCommit(form.detail.value)
          }
        })
      })
      // this.saveAndCommit(form.detail.value)
    },
    clerkChoose() {
      this.setData({
        showClerkChoose: true,
        showPageContainer: true
      })
    },
    // 保存订单
    saveAndCommit(formData, orderInfo = this.data.order_cargo) {
      wx.hideLoading()
      // this.checkForm().then(res=>{
      let data = this.dealData(formData, this.data.orderInfo)
      // return
      // if (_App.DomainConfig.if_service_none && _App.DomainConfig.if_service_none.content == 1) {
      //   data.service_mode = "自提"
      // }
      // return
      if (this.data.orderId) {
        data.id = this.data.orderId
        data.subOrders = JSON.stringify(data.subOrders)
      }
      if (!_App.user.isCustomer && this.data.showCustomerChoose) {
        wx.navigateTo({
          url: `${Pages.feeinfo_total}?pageFrom=order&order=${JSON.stringify(data)}&truckTaskCode=${this.data.truckTaskCode}`,
        })
        return
      }
      if (this.data.truckTaskCode) {
        Object.assign(data, {
          truckTaskCode: this.data.truckTaskCode
        })
      }
      tss.post({
        url: tss.url('') + (this.data.truckTaskCode ? '/tms/deliveryTask/createOrder' : '/tms/order'),
        params: data,
        completion: res => {
          if (res.failed) {
            wx.showModal({
              content: res.errorMsg
            })
            this.orderDisabledChange()
            return
          }
          if (this.data.orderId) {
            wx.showModal({
              title: '成功',
              content: '修改成功',
              showCancel: false,
              success: res => {
                if (res.confirm) {
                  lc.emitEvent('ChangeInfo', {
                    change: true,
                    orderId: this.data.orderId
                  })
                  wx.navigateBack()
                }
              }
            })
            return
          }
          wx.redirectTo({
            // wx.navigateTo({
            url: `${Pages.order_success}?orderId=${res.data.data}&ifScan=${this.data.ifScan}&asnno=${res.data.asnno}&income=${res.data.income}`,
            success: () => wx.vibrateLong()
          })
          setTimeout(() => {
            this.orderDisabledChange()
            let orderInfo = this.data.orderInfo
            delete orderInfo.cargo
            delete orderInfo.fee
            this.setData({
              orderInfo,
              form: {
                trans_mode: this.data.form.trans_mode,
                trans_mode_id: this.data.form.trans_mode_id
              }
            })
          }, 1000)
        }
      })
      // }).catch(res=>{
      //   return
      // })
    },
    dealSubOrders(info) {
      let newInfo = []
      for (let i in info) {
        if (info[i]) {
          newInfo = [...newInfo, info[i]]
        }
      }
      return JSON.stringify(newInfo)
    },
    // 字段处理
    dealData(formData, data) {
      let {
        id: customer_id,
        origin = _App.ifFromGzh ? "WECHAT-GZH" : "WECHAT",
        if_send = true,
        trans_mode = this.data.form.trans_mode || '',
        trans_mode_id = this.data.form.trans_mode_id || '',
        transModeInfo = {},
        // settle_type = this.data.settle_type,
        service_mode = this.data.service_mode,
        clerk = "",
      } = data.customerInfo
      if (this.data.settle_type == '到付') {
        formData.arrive_pay = this.data.settleMoney || ''
      }
      if (this.data.showPickTimeRow) {
        formData.scheduled_pick_time = data.scheduled_pick_time
      }

      // 处理收寄件信息
      let x = ['send', 'receive'],
        y = ['province', 'city', 'district', 'town', 'street_no'],
        z = ['man', 'phone', 'company'],
        v = ['site']
      let addrObj = {}
      x.forEach(title => {
        y.forEach((addr, index) => {
          if (data[title].obj) {
            addrObj[`${title}_${addr}`] = addr != 'street_no' ? data[title].obj.region[index] || '' : data[title].obj.addr_detail || ''
          }
        })
        z.forEach((name, index) => {
          if (data[title].obj) {
            addrObj[`${title}_${name}`] = name == 'man' ? data[title].obj.name : data[title].obj[name] || ''
          }
        })
        v.forEach((site, index) => {
          addrObj[`${title}_${site}`] = site == 'site' ? data[title].site : ''
        })
      })

      if (this.data.orderInfo[trans_mode]) {
        transModeInfo = this.data.orderInfo[trans_mode].transModeInfo
      }
      let {
        if_load = "", if_unload = "", rcode_type = []
      } = data.fee || {};
      if_load = if_load === "是" ? true : false
      if_unload = if_unload === "是" ? true : false
      let subOrders = this.data.orderId ? data.cargo.subOrders : this.dealSubOrders(data.cargo)
      return {
        subOrders,
        ...formData,
        //...data.cargo,
        rcode_type,
        ...data.fee,
        customer_id,
        origin,
        if_send,
        trans_mode,
        trans_mode_id,
        service_mode,
        settle_type: this.data.settle_type,
        ...addrObj,
        ...transModeInfo,
        if_load,
        if_unload,
        line_id: data.line_id,
        clerk,
        ...this.data.recordsInfo,
      }
    },

    // 按钮三兄弟
    menuClick(e) {
      wx.navigateTo({
        url: `${Pages.customer_addr_edit}?menu=${e.currentTarget.id}&type=receive`
      })
    },

    // 校验收寄件地址 客户信息
    checkForm() {
      this.setData({
        orderDisabled: true
      })
      return new Promise((resolve, reject) => {
        let order = this.data.orderInfo
        let fee = this.data.addedService
        if (this.data.showCustomerChoose && !order.customerInfo) {
          $wuxToptips().warn({
            hidden: false,
            text: '请先选择客户',
            duration: 3000
          })
          this.orderDisabledChange()
          reject('没有客户')
          return
        }
        if (this.data.ifScan == true && this.data.send_receive_addr_can_null) {
          resolve('complete')
          return
        }
        if (!order.send.obj || !order.receive.obj) {
          $wuxToptips().warn({
            hidden: false,
            text: '请完善收寄件地址信息',
            duration: 3000
          })
          this.orderDisabledChange()
          reject('收寄件地址未填写')
          return
        }
        if (this.data.remark_required && !this.data.remark) {
          $wuxToptips().warn({
            hidden: false,
            text: '必填项备注未填写',
            duration: 3000
          })
          this.orderDisabledChange()
          reject('必填项备注未填写')
          return
        }
        let crf = this.data.cargo_required_fields;
        if (crf.length) {
          let required_list = [];
          let order_cargo = []
          if (this.data.orderId) {
            order_cargo = order.cargo.subOrders
          } else {
            order_cargo = order.cargo ? order.cargo.filter(i => i && i.message) : []
          }
          if (!order_cargo.length) {
            $wuxToptips().warn({
              hidden: false,
              text: '货物信息未填写',
              duration: 3000
            })
            this.orderDisabledChange()
            return
          }
          for (let j = 0; j < order_cargo.length; j++) {
            for (let i = 0; i < crf.length; i++) {
              if (!this.data.orderId) {
                if (!order_cargo[j][crf[i].field]) {
                  required_list.push(crf[i].title)
                }
              } else {
                if (!String(order_cargo[j][crf[i].field]).trim()) {
                  required_list.push(crf[i].title)
                }
              }
            }
          }
          if (required_list.length) {
            $wuxToptips().warn({
              hidden: false,
              text: '必填项' + required_list.join(',') + '未填写',
              duration: 3000
            })
            this.orderDisabledChange()
            reject('必填项' + required_list.join(',') + '未填写')
            return
          }
          if (!this.data.orderId) {
            for (let i = 0; i < order_cargo.length; i++) {
              for (let j in order_cargo[i]) {
                order_cargo[i][j] || delete order_cargo[i][j]
              }
            }
          }
        }
        if (!order.fee && fee.length) {
          $wuxToptips().warn({
            hidden: false,
            text: '请填写增值服务',
            duration: 3000
          })
          this.orderDisabledChange()
          reject('增值服务有必填字段')
          return
        }
        resolve('complete')
      })
    },
    orderDisabledChange() {
      this.setData({
        orderDisabled: false
      })
    },
    // 是否自定义单号配置
    queryConfigForCode(code) {
      return new Promise(completion => {
        tss.query({
          url: tss.url('ENTITY') + 'DomainConfig',
          params: {
            code: code || 'scan_create_order'
          },
          completion
        })
      })
    },
    chooseSettleType() {
      this.setData({
        chooseSettleTypePop: true
      })
    },
    chooseServer() {
      this.setData({
        chooseServerPop: true
      })
    },
    chooseLine() {
      if (this.data.orderInfo.customerInfo) {
        this.setData({
          chooseLinePop: true,
        })
      } else {
        $wuxToptips().warn({
          hidden: false,
          text: '请先选择客户',
          duration: 3000
        })
      }
    },
    serverPopHandle(e) {
      const {
        id
      } = e.currentTarget;
      const {
        type
      } = e.currentTarget.dataset
      this.setData({
        [id]: type,
      })
      this.onClosePopup()
    },
    linePopHandle(e) {
      var {
        orderInfo
      } = this.data
      var line_id = e.currentTarget.dataset.line_id
      orderInfo = orderInfo ? {
        ...orderInfo,
        line_id
      } : {
        line_id
      }
      this.setData({
        orderInfo,
        current_line: e.currentTarget.dataset.name
      })
      this.onClosePopup()
    },
    // 下方协议
    onAgreementChange(e) {
      let agreement = !!e.detail.value[0]
      this.setData({
        agreement
      })
      wx.setStorage({
        key: 'agreement',
        data: agreement
      })
    },
    onHandlePdf(e) {
      const pdf_id = _App.companyInfo.order_agreement.split('#')[1]
      wx.navigateTo({
        url: `${Pages.web}?type=pdf&attachId=${pdf_id}`,
      })
      // wx.downloadFile({
      //   // 示例 url，并非真实存在
      //   url: tss.url('download') + pdf_id,
      //   success: function (res) {
      //     const filePath = res.tempFilePath
      //     wx.openDocument({
      //       filePath: filePath,
      //       success: function (res) {
      //       }
      //     })
      //   }
      // })
    },
    getRecordsField() {
      return new Promise((resolve) => {
        tss.get({
          url: tss.url('') + '/api/bi/recordfield/tms_order',
          completion: res => {
            if (res.failed) {
              wx.showModal({
                showCancel: false,
                content: '获取自定义字段失败'
              })
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
    setRecords() {
      let {
        recordsInfo,
        form,
        curRecords,
        recordsLabel
      } = this.data
      curRecords = ''
      form.recordsList = recordsInfo
      for (let i in form.recordsList) {
        if (form.recordsList[i]) {
          curRecords += `${recordsLabel[i]}:${form.recordsList[i]},`
        }
      }
      curRecords = curRecords.slice(0, -1)
      this.setData({
        form,
        curRecords,
        showPageContainer: false
      })
    },
    bindKeyInput(e) {
      let {
        value
      } = e.detail
      this.setData({
        filterClerkList: this.data.clerkList.filter(item => item.userName.includes(value))
      })
    },
    selectedClerk(e) {
      this.setData({
        'orderInfo.customerInfo.clerk': e.currentTarget.dataset.item.loginName,
        showPageContainer: false
      })
    },
    closePageContainer() {
      this.setData({
        showOther: false,
        showClerkChoose: false
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
    goOtherInfo() {
      this.setData({
        showOther: true,
        showPageContainer: true
      })
    },
    addCargo() {
      var {
        cargoLength,
        orderInfo
      } = this.data
      cargoLength++
      this.setData({
        cargoLength
      })
    },
    delCargo(e) {
      let index = e.currentTarget.dataset.index,
        {
          cargoLength,
          orderInfo
        } = this.data
      cargoLength--
      orderInfo["cargo"] && orderInfo["cargo"].splice(index, 1)
      this.setData({
        cargoLength,
        orderInfo
      })
    },
    getCustomerLine(isEdit = false) {
      wx.showLoading({
        title: '获取线路中...',
        mask: true
      })
      let customer_id = this.data.orderInfo.customerInfo.id
      tss.post({
        url: tss.url("sql") + "/tms_line",
        params: {
          customer_id
        },
        completion: res => {
          if (res.failed) {
            wx.showModal({
              content: res.errorMsg
            })
            return
          }
          this.setData({
            current_line: isEdit ? this.data.orderInfo.line_name : "",
            lineList: res.data
          })
          wx.hideLoading()
        }
      })
    },
    otherClick(e) {
      switch (e.currentTarget.id) {
        case 'camera':
          wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            success: res => {
              let img = wx.getFileSystemManager().readFileSync(res.tempFiles[0].tempFilePath, 'base64')
              this.OCR(img)
            }
          })
          break;
        default:
          break;
      }
    },
    OCR(img) {
      wx.showLoading({
        title: '正在识别...',
        mask: true
      })
      if (_App.DomainConfig['baidu_api_secret']) {
        var {
          api_key,
          secret_key
        } = JSON.parse(_App.DomainConfig['baidu_api_secret'].content)
        wx.request({
          url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${api_key}&client_secret=${secret_key}`,
          method: 'POST',
          complete: res => {
            var {
              access_token
            } = res.data
            wx.request({
              url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/waybill?access_token=' + access_token,
              method: 'POST',
              header: {
                "Content-Type": 'application/x-www-form-urlencoded'
              },
              data: {
                image: img
              },
              complete: res => {
                if (res.data['words_result']) {
                  let info = res.data['words_result'][0]
                  this.setData({
                    "form.code": info['waybill_number'][0].word
                  })
                  if (!info.sender_name.length || !info.sender_phone || !info.sender_addr) {
                    wx.hideLoading()
                    wx.showModal({
                      title: '提示',
                      content: '寄件人有信息缺失，请重新拍摄',
                      showCancel: false
                    })
                    return
                  } else if (!info.recipient_name.length || !info.recipient_phone || !info.recipient_addr) {
                    wx.hideLoading()
                    wx.showModal({
                      title: '提示',
                      content: '收件人有信息缺失，请重新拍摄',
                      showCancel: false
                    })
                  }

                  let send_info = `${info.sender_name[0].word} ${info.sender_phone[0].word.indexOf('*')==-1?info.sender_phone[0].word:''} ${info.sender_addr[0].word}`

                  let receive_info = `${info.recipient_name[0].word} ${info.recipient_phone[0].word.indexOf('*')==-1?info.recipient_phone[0].word:'18888888888'} ${info.recipient_addr[0].word}`

                  this.addrInput(send_info, 'send')
                  this.addrInput(receive_info, 'receive')
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '百度云密钥配置错误或接口异常',
                    showCancel: false
                  })
                }
              }
            })
          }
        })
      } else {
        wx.showModal({
          title: '识别失败，当前域未配置百度智能云密钥',
          content: '',
          showCancel: false
        })
        return
      }
    },
    addrInput(string, type) {
      wx.showLoading({
        title: '解析中...',
      })
      if (string) {
        tss.post({
          url: tss.url('/addr/v2/splitNamePhoneAddress'),
          params: {
            addr: string
          },
          completion: res => {
            if (res.failed) {
              wx.showModal({
                title: '提示',
                content: '信息解析失败，请重试',
                showCancel: false
              })
              wx.hideLoading()
              return
            }
            const data = res.data
            for (let key in data) {
              typeof data[key] !== 'string' ? '' :
                data[key] = data[key].replace(/\n|\\S/g, '')
            }
            var form = {
              region: [data.province || '', data.city || '', data.district || '', data.town || ''],
              addr_detail: data.street_no || '',
              name: data.name || '',
              phone: data.phone || ''
            }
            lc.emitEvent('orderInfo', {
              type,
              data: {
                obj: form,
                info: [form.name, form.phone],
                addr: [...form.region, form.addr_detail]
              }
            })
            wx.hideLoading()
          }
        })
      } else {
        wx.showToast({
          title: '请输入完整信息',
          icon: 'none'
        })
      }
    },
  },
})
// const getCustomerLine=()=>new Promise(resolve=>{
//     console.log("获取客户线路并追加")
//     console.log(this.data.orderInfo)
// })
/*const getLine = () => new Promise(resolve => {
    tss.query({
        url: tss.url('ENTITY') + 'Line',
        params: {
            status: "在用"
        },
        completion: res => {
            if (res.failed) {
                wx.showModal({
                    showCancel: false,
                    mask: true,
                    title: "提示",
                    content: res.errorMsg
                })
            }
            resolve(res.data)
        }
    })
})*/
// 是否需要面单支付
const queryDomainConfig = (this_) => new Promise(completion => {
  tss.query({
    url: tss.url('ENTITY') + 'DomainConfig',
    params: {
      code: 'order_create_code_price'
    },
    completion
  })
})
const queryConfigCode = () => new Promise(resolve => {
  tss.get({
    url: tss.url('data') + 'xcx_order_write',
    completion: res => {
      let list = JSON.parse(res.data[0].content).filter(i => i.belong_title == '增值服务' && !i.hidden && i.field !== 'arrive_pay' && i.required == "true")
      resolve(list)
    }
  })
})

// 获取客户账号余额
const queryCustomerAccountBalance = () => new Promise(completion => {
  tss.get({
    url: tss.url('') + '/api/account',
    completion
  })
})

// 面单价格
const queryHandleOrderPrice = () => new Promise(completion => {
  tss.query({
    url: tss.url('') + '/cloud/order/price/query',
    params: {
      type: 'com.boudata.tms.product.ModuleOrderENHandler',
      account_num: 1
    },
    completion
  })
})

// 历史面单
const queryCustomerCodeIssue = (customer_id) => new Promise(completion => {
  tss.query({
    url: tss.url('sql') + 'code_issue',
    params: {
      customer_id
    },
    completion
  })
})

const alertError = (content, fn) => {
  wx.hideLoading()
  wx.showModal({
    showCancel: false,
    content,
    success: res => {
      res.confirm ? fn && fn() : ''
    }
  })
}
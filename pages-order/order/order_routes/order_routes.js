const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
const http = require('../../../utils/network.js')
import {
  $wuxDialog
} from '../../../components/index'
import {
  formatDate
} from '../../../utils/util.js'

const QQMapWX = require('../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
// const _Page = 1;

var qqmapsdk = new QQMapWX({
  key: Map_Key
});


Page({

  /**
   * 页面的初始数据
   */
  data: {
    uploadList: [],
    workList: [],
    value1: [],
    displayValue1: '请选择',
    time: new Date().getTime(),
    datetime: '',
    inputTextarea: '',
    canIEdit: false,
    tabs: [{
        title: '行程',
        code: '0'
      },
      {
        title: '子单轨迹',
        code: '1'
      },
      {
        title: '问题跟进',
        code: '2'
      }
    ],
    subList: [],
    sub_current: 0,
    verifyDataAndReceiptData: null,
    showOperator: false,
    userList: [],
    receipt_express: '',
    receipt_express_no: ''
  },
  // 查看回单
  checkRecode() {
    let _this = this
    $wuxDialog().prompt({
      resetOnClose: true,
      maskClosable: false,
      focus: true,
      title: '请输入收/寄件人手机号码',
      content: '',
      fieldtype: 'number',
      maxlength: 20,
      defaultText: this.data.defaultText,
      onConfirm(e, text) {
        console.log(e, text)
        const phone = text.replace(/[^\x00-\xff]|\s*/g, '')
        if (phone) {
          _this.setData({
            defaultText: phone
          })
          _this.getReceiptImg(phone)
        } else {
          wx.showToast({
            title: '请输入号码!',
            icon: 'none',
            complete: () => _this.checkRecode()
          })
        }
      },
    })
  },
  //验证手机号
  checkSigncode() {
    let _this = this
    $wuxDialog().prompt({
      resetOnClose: true,
      maskClosable: false,
      focus: true,
      title: '请输入收/寄件人手机号码',
      content: '',
      fieldtype: 'number',
      maxlength: 20,
      defaultText: this.data.defaultText,
      onConfirm(e, text) {
        console.log(e, text)
        const phone = text.replace(/[^\x00-\xff]|\s*/g, '')
        if (phone) {
          _this.setData({
            defaultText: phone
          })
          _this.getSignImg(phone)
        } else {
          wx.showToast({
            title: '请输入号码!',
            icon: 'none',
            complete: () => _this.checkSigncode()
          })
        }
      },
    })
  },
  //获取签收图
  getSignImg(phone) {
    let _this = this,
      urls = [];
    tss.query({
      url: tss.url('') + `/auth/xdata/attach/json/-7/0`,
      params: {
        order_id: this.data.order_id,
        phone
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          return
        }
        urls = urls.concat(res.data.map(i => {
          if (i.fileSrc.indexOf("https://") != -1) {
            return i.fileSrc
          } else {
            return `${_App.app_host}${i.fileSrc}?uName=${_App.user.uName}&uToken=${_App.user.uToken}`
          }
        }));
        _this.showUrl(urls);
      }
    })
  },
  accpetVerifyAndReceiptData(e) {
    console.log("接收到", e)
    this.setData({
      verifyDataAndReceiptData: e.detail
    })
  },
  hasReceiptImg(order_id) {
    tss.get({
      url: tss.url('ENTITY') + 'ReceiptLog?order_id=' + order_id + '&showAttach=true',
      completion: res => {
        if (res.failed) {
          return;
        }
        let hasAttachs = false
        res.data.map(item => {
          if (item.attachs.length) {
            hasAttachs = true
          }
        })
        let filter = res.data.filter(item => item.receipt_express || item.receipt_express_no)
        filter.sort((a, b) => {
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        })
        this.setData({
          rcode_type: hasAttachs,
          receipt_express: filter.length ? filter[0].receipt_express : '',
          receipt_express_no: filter.length ? filter[0].receipt_express_no : ''
        })
      }
    });
  },
  //判断是否有签收图
  hasSignCode(id) {
    tss.get({
      url: tss.url('ENTITY') + `SignOrder?order_id=${id}&showAttach=true`,
      completion: res => {
        console.log(res)
        if (res.failed) {
          /* wx.showModal({
            content: res.errorMsg,
            showCancel: false
          }) */
          return
        }
        if (res.data[0] && res.data[0].attachs.length != 0) {
          this.setData({
            hasSignCode: true,
          })
        }
      }
    })
  },
  getReceiptImg(phone) {
    let _this = this,
      urls = [],
      data = this.data.verifyDataAndReceiptData
    if (phone == data.send_phone || phone == data.receive_phone) {
      tss.query({
        url: tss.url("") + "/xdata/attach/view",
        params: {
          ids: data.receipt_attachids
        },
        completion: res => {
          if (res.failed) {
            wx.showModal({
              title: '提示',
              content: res.errorMsg,
              showCancel: false
            })
            return
          }
          urls = urls.concat(res.data.map(i => {
            if (i.fileSrc.indexOf("https://") != -1) {
              return i.fileSrc
            } else {
              return `${_App.app_host}${i.fileSrc}?uName=${_App.user.uName}&uToken=${_App.user.uToken}`
            }

          }));
          console.log(urls)
          _this.showUrl(urls)
        }
      })
    } else {
      wx.showModal({
        content: "校验不通过！",
        showCancel: false
      })
    }
    // tss.query({
    //     url: tss.url('') + "/xdata/attach/json/-19/0",
    //     params: {
    //         order_id: this.data.order_id,
    //         phone
    //     },
    //     completion: res => {
    //         i--;
    //         if (res.failed) {
    //             wx.showModal({
    //                 content: res.errorMsg,
    //                 showCancel: false
    //             })
    //             return
    //         }
    //         console.log(res)
    //         // if (!res.data.length) return
    //         urls = urls.concat(res.data.map(i => `${_App.app_host}${i.downloadUrl}?phone=${phone}`));
    //         !i && _this.showUrl(urls);
    //     }
    // })
    // tss.query({
    //     url: tss.url('') + "/xdata/attach/json/-19/0",
    //     params: {
    //         order_id: this.data.order_id,
    //         phone
    //     },
    //     completion: res => {
    //         i--;
    //         if (res.failed) {
    //             wx.showModal({
    //                 content: res.errorMsg,
    //                 showCancel: false
    //             })
    //             return
    //         }
    //         console.log(res)
    //         // if (!res.data.length) return
    //         urls = urls.concat(res.data.map(i => `${_App.app_host}${i.downloadUrl}?phone=${phone}`)) 
    //         !i && _this.showUrl(urls);
    //     }
    // })
  },

  showUrl: function (urls) {
    if (urls.length) {
      wx.previewImage({
        urls
      })
    } else {
      wx.showToast({
        title: '暂无可查看回单',
        icon: 'none'
      })
    }
  },

  onLoad: function (options) {
    let {
      id,
      code = '',
      domain = '',
      rcode_type = ''
    } = options
    console.log(options)
    var {
      tabs
    } = this.data
    if (options.hideSubOrderRoute == "true") {
      console.log("隐藏子单轨迹")
      tabs.splice(1, 1)
      tabs = tabs.map((item, index) => {
        return {
          title: item.title,
          code: index + ''
        }
      })
      console.log(tabs)
    }
    this.setData({
      hideSubOrderRoute: options.hideSubOrderRoute == 'true' ? true : false,
      _App,
      rcode_type: JSON.parse(rcode_type || "false"),
      order_id: id,
      datetime: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      canIEdit: _App.user.uName && !_App.user.isCustomer && getCurrentPages().length > 2 && domain == _App.user.domain,
      tabs
    })
    if (!_App.user.isCustomer && _App.DomainConfig?.showTracksOperator?.content == "true") {
      this.setData({
        showOperator: true
      })
    }
    this.queryRoutes(id)
    this.queryOrderInfo(id)
    wx.setNavigationBarTitle({
      title: `No.${code} `,
    })

    if (_App.user.isCustomer === false) {
      let tabs = this.data.tabs
      tabs.push({
        title: '车辆位置',
        code: '3'
      })
      tabs = tabs.map((item, index) => {
        return {
          title: item.title,
          code: index + ''
        }
      })
      console.log(tabs)
      this.setData({
        tabs,
        getCarlocation: true
      })
    }
    console.log(this.data.tabs)
    this.hasSignCode(id)
    this.hasReceiptImg(id)
  },
  // 复制tcode
  copyTcode(e) {
    let {
      id: data
    } = e.currentTarget
    wx.setClipboardData({
      data
    })
  },
  // 轨迹查询
  queryRoutes(order_id) {
    wx.showLoading({
      mask: true
    })
    if (this.data.showOperator) {
      tss.get({
        url: `${tss.url('')}/wx/api/users`,
        completion: res => {
          if (res.failed) {
            wx.showModal({
              content: `账号列表获取失败！`,
              showCancel: false
            })
            wx.hideLoading()
            return
          }
          console.log(res)
          this.setData({
            userList: res.data
          })
        }
      })
    }
    tss.get({
      url: `${tss.url('')}/tms/order/suborder/path/${order_id}?is_path=true`,
      // url: `${tss.url('')}/tms/order/path/81`,
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: `暂无法查询：${res.errorMsg}`,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        console.log(res.data)
        let {
          workList,
          subList
        } = this.data
        workList = res.data[1].paths
        res.data.splice(0, 2)
        subList = res.data
        console.log(subList)
        this.setData({
          workList,
          subList
        }, () => {
          wx.hideLoading()
        })
      }
    })
  },
  subChange(e) {
    console.log(e)
    let index = e.currentTarget.dataset.index
    this.setData({
      sub_current: index
    })
  },
  // 订单详情查询
  queryOrderInfo(id) {
    tss.get({
      url: tss.url('') + '/tms/order/logistics/' + id,
      completion: res => {
        if (res.failed) return
        // let 
        this.setData({
          logistic_company: res.data || []
        })
        console.log(res)
      }
    })
  },
  // 开启编辑
  editRouter() {
    this.setData({
      ifEdit: !this.data.ifEdit
    })
  },
  // 删除轨迹
  delRoute(e) {
    wx.showLoading({
      mask: true
    })
    let {
      id
    } = e.currentTarget
    http.request({
      url: tss.url('') + '/tms/entity/OrderOperateLog/' + id,
      method: http.method.DELETE,
      headers: {
        Cookie: wx.getStorageSync('cookie')
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        this.queryRoutes(this.data.order_id)
      }
    })
  },
  // 打开新增轨迹框
  createRouter() {
    this.setData({
      visible: true,
      click_auto_route_id: '',
      inputTextarea: ''
    })
    this.doLocation()
  },
  // 关闭新增轨迹框
  onClose() {
    this.setData({
      visible: false
    })
  },
  inputTextarea(e) {
    this.data.inputTextarea = e.detail.value
  },
  popRouteInput(e) {
    let {
      id
    } = e.currentTarget
    this.data.inputTextarea_input = `${id == 1 ? `从【${e.detail.value}】出发` : `到达【${e.detail.value}】`}`
  },
  // 确定日期时间
  onConfirm(e) {
    this.setData({
      time: e.detail.date,
      datetime: e.detail.label
    })
  },
  // 打开时间选择器
  clickTap() {
    this.setData({
      date_picker: true
    })
  },
  // 关闭时间选择器
  onVisibleChange() {
    this.setData({
      date_picker: false
    })
  },
  // 确定自定义轨迹
  confirmRouter() {
    this.data.inputTextarea = this.data.click_auto_route_id ? this.data.inputTextarea_input : this.data.inputTextarea
    if (this.data.inputTextarea.replace(/\s/g, '').length == 0) {
      wx.showToast({
        title: '输入框内不能为空！',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      mask: true
    })
    tss.post({
      url: tss.url('') + '/tms/order/path/hand',
      params: {
        scan_date: this.data.datetime,
        description: this.data.inputTextarea,
        ids: this.data.order_id
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        this.onClose()
        this.queryRoutes(this.data.order_id)
      }
    })
  },
  confirmSign() {
    wx.showLoading({
      mask: true
    })
    tss.post({
      url: tss.url('') + '/tms/order/signOrders',
      params: {
        scan_date: this.data.datetime,
        description: this.data.inputTextarea || '签收',
        //status:624,
        //remark:this.data.inputTextarea || '',
        ids: this.data.order_id,
        //sign_mothod:'送货签收'
        ifSign: true
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: res.errorMsg,
            showCancel: false
          })
          wx.hideLoading()
          return
        }
        this.onClose()
        this.queryRoutes(this.data.order_id)
      }
    })
  },
  // 快速定位
  doLocation() {
    let _this = this
    wx.showLoading()
    wx.getLocation({
      success: res => {
        console.log(res)
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            console.log(res)
            let {
              district: route_district_location
            } = res.result.address_component
            _this.setData({
              route_district_location
            })
          },
          complete: res => {
            wx.hideLoading()
          }
        })
      },
      fail() {
        wx.hideLoading()
        wx.showToast({
          title: '定位失败,请开启小程序定位权限。',
          icon: 'none',
          duration: 5000
        })
      }
    })
  },
  chooseRouteAuto(e) {
    let {
      id
    } = e.currentTarget
    this.setData({
      click_auto_route_id: id
    })
    this.data.inputTextarea_input = `${id == 1 ? `从【${this.data.route_district_location}】出发` : `到达【${this.data.route_district_location}】`}`
  },
  focusTextarea() {
    this.setData({
      click_auto_route_id: ''
    })
  },
  showMoreTextarea() {
    this.setData({
      more_textarea: !this.data.more_textarea
    })
  },
  swiperChange(e) {
    this.setData({
      current: e.detail.current,
      tab_current: e.detail.current
    })
  },
  onChangeTabs({
    detail
  }) {
    console.log(detail)
    this.setData({
      tab_current: detail.key,
      current: detail.key
    })
  },
  onClosePicUpload() {
    this.setData({
      showPicUpload: false
    })
  },
  uploadPicture() {
    wx.showLoading()
    let ssr = ['SignOrder', 'Receipt'].map(i =>
      new Promise(completion =>
        tss.query({
          url: tss.url('ENTITY') + i,
          params: {
            order_id: this.data.order_id,
            showAttach: true
          },
          completion
        })
      ))

    Promise.all(ssr)
      .then(res => {
        wx.hideLoading()
        let uploadList = []
        console.log(res)
        // const [sign_pic, receipt_pic] = res
        const _result = res.map((i, index) =>
          new Promise(completion => {
            if (i.data.length == 0) {
              tss.post({
                url: tss.url('ENTITY') + ['SignOrder', 'Receipt'][index],
                params: {
                  order_id: this.data.order_id,
                  showAttach: true
                },
                completion
              })
            } else {
              completion({
                data: i.data[0]
              })
            }
          }))

        Promise.all(_result).then(result => {
          result.forEach((item, _idx) => {
            console.log(item)
            switch (_idx) {
              case 0: {
                uploadList.push({
                  recordId: '-7',
                  title: '签收面单',
                  itemId: item.data.id
                })
              };
              break;
            case 1: {
              uploadList.push({
                recordId: '-19', //'-3',
                title: '回单',
                itemId: new Date().getTime() //item.data.id
              })
            };
            break;
            }
          })

          this.setData({
            uploadList,
            showPicUpload: true
          })
        })
      })
  },
  doUploadPicture(e) {
    const {
      item
    } = e.currentTarget.dataset
    const {
      title,
      ...other
    } = item
    wx.chooseImage({
      sizeType: 'compressed',
      success: (res) => {
        wx.showLoading({
          title: '上传中...',
          mask: true
        })
        tss.uploadImagesAsync({
          ...other,
          uName: _App.user.uName,
          uToken: _App.user.uToken,
          filePaths: res.tempFilePaths,
          completion: res => {
            console.log(res)
            if (res.failed) {
              wx.showModal({
                content: res.errorMsg,
                showCancel: false
              })
              return
            }
            tss.post({
              url: tss.url("") + '/tms/order/receipts/submit',
              params: {
                list: JSON.stringify([{
                  type: this.data.verifyDataAndReceiptData.rcode_type,
                  tempid: other.itemId,
                  order_id: this.data.order_id
                }])
              },
              completion: res => {
                if (res.failed) {
                  wx.showModal({
                    content: res.errorMsg
                  })
                  return
                }
                wx.showToast({
                  title: '上传成功！',
                  icon: 'none'
                })
                this.onClosePicUpload()
              }
            })
          }
        })
      },
      fail: res => {
        wx.hideLoading()
      }
    })
  }
})
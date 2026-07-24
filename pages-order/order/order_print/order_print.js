const lc = require('../../../utils/listenerCenter.js')
const services_uuid = ["0000EEE0-0000-1000-8000-00805F9B34FB", "0000FF00-0000-1000-8000-00805F9B34FB", "49535343-FE7D-4AE5-8FA9-9FAFD205E455"];
const ToBase64 = require('../order_print/base64gb2312.js');
const platform = require('./platform_print_data/sxjd')
import {
  printDatas
} from '../order_print/print'
import {
  $wuxDialog
} from '../../../components/index'

const _App = getApp().globalData
import Pages from '../../../pages.js'
import {
  printData
} from './platform_print_data/best';
const tss = require('../../../utils/tss.js')

Page({
  data: {
    printData: {
      printMode: '默认模板',
      code: '1776884412341',
    },
    printList: [
      {
        name: 'HM-A-300 汉印 通用版',
        code: '123123',
        remark: '测试打印机'
      },
      // { name: 'HM-A-300 汉印 通用版', code: '123123', remark: '测试打印机' },
    ],
    _options1: [],
    _options2: ['打印全部', '打印主单', '打印子单', '补打', '打印平台子单', '打印平台回单'],
    _options3: ['设置备注', '测试打印', '打印速度', '删除'],
    PackageLength: 10,
    choosePrintType: {
      code: 1,
      title: '76*90',
    },
    printTypeList: [{
        code: 0,
        title: '76*100'
      },
      {
        code: 1,
        title: '76*90'
      }
    ],
    choosedPrint: {
      title: '汉印 HM-A300（通用版）',
      code: 'hy'
    },
    choosedPrintList: [{
        title: '汉印 HM-A300（通用版）',
        code: 'hy'
      },
      {
        title: '快麦 KM-360',
        cpde: 'km'
      },
      {
        title: '济强 JLP-352',
        code: 'jq'
      }
    ],
    showPrintChoosed: false,
  },
  // 选择打印机
  choosedBlueTooth() {
    this.setData({
      showPrintChoosed: true
    })
  },
  choosePrintTypePop() {
    this.setData({
      showPrintTypeChoosed: true
    })
  },
  handleChoosedPrintType(e) {
    this.setData({
      choosePrintType: e.currentTarget.dataset.item
    })
    wx.setStorage({
      key: "printType",
      data: e.currentTarget.dataset.item,
      success: () => {
        this.onClosePrintChoosed()
      }
    })
  },
  handleChoosedPrint(e) {
    this.setData({
      choosedPrint: e.currentTarget.dataset.item
    })
    this.onClosePrintChoosed()
  },
  //92H
  //10010010
  //222
  //
  onClosePrintChoosed() {
    this.setData({
      showPrintChoosed: false,
      showPrintTypeChoosed: false
    })
  },

  onLoad: function (options) {
    //获取缓存的蓝牙打印机
    let getStorage = (key) => wx.getStorageSync(key);
    this.setData({
      printList: getStorage('printList') || this.data.printList,
      // printData: getStorage('printData') || this.data.printData,
    }, () => {
      this.setData({
        "printData.code": options.code || '',
        "printData.ids": options.ids || ''
      })
    })
    this.queryPrintMode()
    this.data.platform = wx.getSystemInfoSync().platform
    //获取默认打印规格
    wx.getStorage({
      key: "printType",
      success: res => {
        console.log(res.data)
        this.setData({
          choosePrintType: res.data
        })
      }
    })
  },

  // 打印模版请求
  queryPrintMode() {
    tss.query({
      url: tss.url('') + '/tms/entity/PrintModel',
      params: {
        type: 1
      },
      completion: res => {
        console.log(JSON.parse(res.data[0].column_info))
        if (res.failed || res.data.length == 0) {
          this.setData({
            _options1: ['默认打印'],
            printMode: []
          })
        } else {
          this.setData({
            _options1: res.data.map(i => i.name),
            printMode: res.data,
            "printData.printMode": res.data[0].name,
            "printData.printModeId": res.data[0].id,
            "printData.column_info": res.data[0].column_info
          })
        }
      }
    })
  },

  // 选择打印模版
  choosePrintMode() {
    wx.showActionSheet({
      itemList: this.data._options1,
      success: res => {
        this.setData({
          "printData.printMode": this.data.printMode[res.tapIndex].name,
          "printData.printModeId": this.data.printMode[res.tapIndex].id,
          "printData.column_info": this.data.printMode[res.tapIndex].column_info,
        })
      }
    })
  },

  //搜索蓝牙打印机
  creteBluetooth() {
    wx.navigateTo({
      url: Pages.print_bluetooth,
    })
  },
  // 扫描单号
  doScanOrder() {
    wx.scanCode({
      success: res => {
        this.setData({
          "printData.code": res.result
        })
        // 对识别单号进行校验
        // this.queryPrint()
      }
    })
  },
  showImages() {
    wx.previewImage({
      urls: [`${_App.aliyun_host}/wx_qy.png`],
    })
  },
  onReady() {
    // 获取返回的蓝牙
    lc.addListener('blueTooth', this.__wxWebviewId__.toString(), res => {
      console.log(res)
      let ifHas = this.data.printList.map(item => item.deviceId).includes(res.data.deviceId)
      if (!ifHas) {
        this.data.printList.push(res.data)
        let setData = `printList[${this.data.printList.length - 1}]`
        this.setData({
          [setData]: res.data
        })
      }
    })

    lc.addListener('platformPrintData', this.__wxWebviewId__.toString(), res => {
      console.log(res)
      if (res.type === 'platformPrintData') {
        setTimeout(() => {
          // this.data.platformPrintData = res.data
          console.log(res.data)
          this.data.printData.data = res.data
          this.goPrint(this.data.printBlueTooth)
        }, 500);
      }
    })

  },
  //测试获得平台打印数据
  testPlatform() {
    this.data.platformPrint = true
    const {
      code,
      ids
    } = this.data.printData
    wx.navigateTo({
      url: './print_platform/print_platform?json=' + JSON.stringify({
        code,
        ids
      }),
    })
    return
  },
  // 选择打印类型
  chooseBluetooth(e) {
    console.log('options2', e)
    let printBlueTooth = this.data.printList[e.currentTarget.id]
    this.data.printBlueTooth = printBlueTooth
    wx.showActionSheet({
      itemList: this.data._options2,
      success: res => {
        console.log(res.tapIndex)
        let type = ['全部', '主单', '子单', '补打', '打印平台子单', '打印平台回单']
        this.data.PrintType = type[res.tapIndex]
        if (type[res.tapIndex] == '打印平台子单') {
          this.data.platformPrint = true
          const {
            code,
            ids
          } = this.data.printData
          wx.navigateTo({
            url: './print_platform/print_platform?json=' + JSON.stringify({
              code,
              ids
            }),
          })
          return
        }
        if (type[res.tapIndex] == '打印平台回单') {
          this.data.platformPrint = true
          const {
            code,
            ids
          } = this.data.printData
          wx.navigateTo({
            url: './print_platform/print_platform?isReceipt=true&json=' + JSON.stringify({
              code,
              ids
            }),
          })
          return
        }
        this.data.platformPrint = false
        this.goPrintOrder(this.data.PrintType, printBlueTooth)
      }
    })
  },

  goPrintOrder(type, printBlueTooth) {
    const {
      printModeId: print_id,
      ids
    } = this.data.printData
    if (ids) {
      this.queryPrintData({
        print_id,
        ids,
        type,
        printBlueTooth
      })
    } else {
      wx.showToast({
        title: '没有打印单号，无法打印',
        icon: 'none'
      })
    }
  },

  queryPrintData({
    ids,
    type,
    print_id,
    printBlueTooth
  }) {
    let tag;
    if (type == '补打') {
      tag = '补打'
      type = '子单'
    }
    console.log(type)
    tss.post({
      url: tss.url('') + '/tms/order/print',
      params: {
        ids,
        type,
        print_id,
        newModule: true
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: `打印数据获取失败：${res.errMsg}`,
            showCancel: false
          })
          return
        }
        this.setData({
          "printData.data": res.data.map(i => i.lineData)
        })
        if (tag) {
          this.setData({
            showLatePlay: true,
            sliderOptions: {
              min: 0,
              max: res.data.length,
              value: [0, res.data.length],
              printBlueTooth
            }
          })
        } else {
          this.goPrint(printBlueTooth)
        }
      }
    })
  },
  confirmPlay() {
    const {
      printData,
      sliderOptions
    } = this.data
    const _printData = printData.data.slice(...sliderOptions.value)
    if (_printData.length > 0) {
      this.setData({
        showLatePlay: false,
        "printData.data": _printData
      }, () => {
        this.goPrint(sliderOptions.printBlueTooth)
      })
    } else {
      wx.showToast({
        title: '打印设置区间有误,没有可打印的子单！',
        icon: 'none'
      })
    }
  },
  onChangeSlider(e) {
    console.log('onChange', e.detail.value)
    this.setData({
      "sliderOptions.value": e.detail.value
    })
  },
  afterChangeSlider(e) {
    console.log('afterChange', e.detail.value)
    this.setData({
      "sliderOptions.value": e.detail.value
    })
  },
  onClosePopup() {
    this.setData({
      showLatePlay: false
    })
  },

  // 设置打印速度
  settingSpeed(index) {
    let _this = this
    $wuxDialog().prompt({
      resetOnClose: true,
      maskClosable: false,
      focus: true,
      title: '建议速度：10',
      defaultText: this.data.PackageLength,
      content: '速度过大可能出现乱码,请先测试打印。(最高不超过200)',
      fieldtype: 'number',
      maxlength: 3,
      onConfirm(e, PackageLength) {
        _this.setData({
          PackageLength: PackageLength > 200 ? 200 : PackageLength
        })
      },
    })
  },

  // 设置 0：设置备注 1:测试打印 2:删除
  bluetoothSetting(e) {
    const {
      id: index
    } = e.currentTarget
    wx.showActionSheet({
      itemList: this.data._options3,
      success: res => {
        switch (res.tapIndex) {
          // 设置打印机备注
          case 0:
            this.openDialog(index);
            break;
            // 测试打印
          case 1:
            this.goTestPrint(index);
            break;
            // 设置打印速度
          case 2:
            this.settingSpeed(index);
            break;
            // 删除打印机
          case 3:
            this.deleteBlueTooth(index);
            break;
        }
      }
    })
  },

  // 写备注
  openDialog(index) {
    let _this = this
    $wuxDialog().prompt({
      resetOnClose: true,
      title: '提示',
      focus: true,
      content: '请输入备注,不超过20个字',
      defaultText: '',
      maxlength: 20,
      onConfirm(e, response) {
        console.log(e, response)
        let setData = `printList[${index}].remark`
        _this.setData({
          [setData]: response
        })
      },
    })
  },

  // 测试打印
  goTestPrint(index) {
    let data = [{
      "id": 3843551,
      "createtime": "2023-05-22 13:29:21",
      "creator": "13199100338",
      "domain": "D625",
      "updatetime": "2023-05-26 18:04:09",
      "updator": "Job.Robot",
      "version": 18,
      "amount": 2,
      "cargo": "鲜鱼",
      "code": "8602301434",
      "if_handle_tag": true,
      "pack": "编织胶带",
      "status": "已签收",
      "status_code": 624,
      "tag_ids": null,
      "tag_names": null,
      "tag_types": null,
      "volume": 0.25,
      "weight": 53,
      "arrive_pay": null,
      "business_id": null,
      "business_name": null,
      "cancel_reason": null,
      "ccode": null,
      "clerk": null,
      "cod": null,
      "cost_weight": null,
      "customer_id": 45668,
      "entry_type": null,
      "expect_arrive": null,
      "expect_depart": null,
      "expect_reach_date": null,
      "if_fast": false,
      "if_load": false,
      "if_unload": false,
      "if_visit": true,
      "insurance_limit": 2000,
      "insurance_type": null,
      "lc_id": 22556,
      "line_id": null,
      "line_name": null,
      "order_date": "2023-05-22 12:15:48",
      "origin": "WEB_NEW",
      "pallet_num": 0,
      "rcode": null,
      "rcode_type": null,
      "receive_city": "兴安盟",
      "receive_district": "乌兰浩特市",
      "receive_lng_lat": null,
      "receive_man": "张英波",
      "receive_phone": "18648247799",
      "receive_province": "内蒙古自治区",
      "receive_site": "兴安盟",
      "receive_street_no": "乌兰浩特市红城家宴",
      "receive_town": "",
      "remark": null,
      "send_city": "佳木斯市",
      "send_district": "抚远市",
      "send_lng_lat": null,
      "send_man": "心想事成",
      "send_phone": "13394547942",
      "send_province": "黑龙江省",
      "send_site": "佳木斯市",
      "send_street_no": "抚远市",
      "send_town": "",
      "service_mode": "派送",
      "settle_type": "现付",
      "sub_order_num": 2,
      "tcode": "SF1653648824846",
      "trans_mode": "顺丰标快",
      "trans_mode_id": 2075,
      "truck_type": null,
      "udf1": null,
      "udf2": null,
      "udf3": null,
      "udf4": null,
      "udf5": null,
      "udf6": null,
      "udf7": null,
      "upstairs_type": null,
      "next_tag_type": null,
      "cargo_amount": 2,
      "status_c": null,
      "active": true,
      "cargo_type": null,
      "channel": null,
      "real_lc_id": 22556,
      "receive_site_id": null,
      "send_site_id": null,
      "trace_type": null,
      "warehouse_name": null,
      "warehouse_pid": null,
      "old_amount": 2,
      "old_volume": 0.25,
      "old_weight": 53,
      "bill_model_id": null,
      "platform_info": JSON.parse("{\"rls_errormsg\":\"SF1689644956802:\",\"mailno\":\"SF1689644956802,SF2081797407690\",\"waybillNo\":\"SF1689644956802\",\"xbFlag\":\"0\",\"destRouteLabel\":\"482M-049\",\"filter_result\":\"2\",\"proName\":\"顺丰特快\",\"cargoTypeCode\":\"C201\",\"destGisDeptCode\":\"482M\",\"sourceCityCode\":\"454\",\"limitTypeCode\":\"T4\",\"twoDimensionCode\":\"MMM={'k1':'482','k2':'482M','k3':'049','k4':'T4','k5':'SF1689644956802','k6':'','k7':'7d5adcfd'}\",\"destTransferCode\":\"482\",\"printFlag\":\"000000000\",\"checkCode\":\"7d5adcfd\",\"sourceTransferCode\":\"454\",\"proCode\":\"T4\",\"origincode\":\"454\",\"invoke_result\":\"OK\",\"codingMapping\":\"M\",\"expressTypeCode\":\"B1\",\"rls_code\":\"1000\",\"destCityCode\":\"482\",\"destDeptCode\":\"482M\",\"destcode\":\"482M-049\",\"sourceDeptCode\":\"454FA\",\"printIcon\":\"00000000\",\"orderid\":\"8602301434\",\"destTeamCode\":\"049\"}"),
      "scheduled_delivery_time": null,
      "customer_name": "抚远",
      "platform_subcodes": "SF1689644956802,SF2081797407690",
      "lock_cost": true,
      "lock_income": true,
      "receive_company": "张英波",
      "scheduled_pick_time": null,
      "lc_phone": null,
      "declared_value": null,
      "arrival": false,
      "print_num": 1,
      "upload_order": null,
      "receive_customer_id": null,
      "receive_customer_name": null,
      "real_lc_assign_time": null,
      "confirm": null,
      "notice_delivery": null,
      "invoice_requirements": null,
      "clerk_name": null,
      "bill_model_name": null,
      "lc_name": "顺丰速运",
      "creator_name": "13199100338",
      "real_lc_name": "顺丰速运",
      "department_id": null,
      "department_name": null,
      "days": null,
      "kilometre": null,
      "ocode": null,
      "fin_status": "confirm",
      "order_date1": "2023-05-22",
      "real_line_name": null,
      "send_addr": "黑龙江省佳木斯市抚远市抚远市",
      "receive_addr": "内蒙古自治区兴安盟乌兰浩特市乌兰浩特市红城家宴",
      "receive_customer_name_show": "张英波",
      "receipt_id": null,
      "rcode_back_date": null,
      "receipt_issue_date": null,
      "sign_date": "2023-05-26",
      "sign_man": null,
      "platform_code": "shunfeng",
      "platform_name": "顺丰速运",
      "lc_settle_type": "月结",
      "amount1": 2,
      "weight1": 53,
      "volume1": 0.25,
      "old_amount1": 2,
      "old_weight1": 53,
      "old_volume1": 0.25,
      "insurance_limit1": 2000,
      "cargo_amount1": 2,
      "ccode1": null,
      "cargo1": "鲜鱼",
      "pallet_num1": 0,
      "batch_number": null,
      "cargo_code": null,
      "specs": null,
      "model": null,
      "bill_amount": 0,
      "sudf1": null,
      "sudf2": null,
      "sudf3": null,
      "sudf4": null,
      "sudf5": null,
      "sudf6": null,
      "sudf7": null,
      "sudf8": null,
      "sudf9": null,
      "sudf10": null,
      "charged_weight": 53,
      "income_unit_price": 0.15,
      "income_real_unit_price": null,
      "show_income_unit_price": null,
      "cost_unit_price": null,
      "cost_real_unit_price": null,
      "show_cost_unit_price": null,
      "abnormal_num": 0,
      "last_abnormal_time": null,
      "order_attach_num": 0,
      "receipt_attachids": null,
      "task_param": {},
      "income_fee_1": 7.95,
      "income_fee_1_approving": 7.95,
      "income_fee_1_unbilled": 0,
      "income_fee_1_unpayed": 0,
      "income_fee_1_payed_fee": 7.95,
      "income_fee_1_unbaoxiao_fee": 7.95,
      "income_fee_1_compare": 7.95,
      "income_fee": 7.95,
      "income_payed_fee": 7.95,
      "income_unpayed_fee": 0,
      "income_unpayed": 0,
      "income_unprocessed": 0,
      "cost_fee": 0,
      "cost_payed_fee": 0,
      "cost_unpayed_fee": 0,
      "cost_unpayed": 0,
      "cost_unprocessed": 0,
      "profit": 7.95,
      "billInfo": [
        7.95,
        0,
        0,
        0
      ]
    }]
    // const platform = this.data.platform[0].fn
    this.data.platformPrint = true
    let printBlueTooth = this.data.printList[index]
    this.data.printBlueTooth = printBlueTooth
    const {
      printData
    } = platform
    console.log(printData(data))
    lc.emitEvent('platformPrintData', {
      data: [...printData(data)],
      type: 'platformPrintData'
    })
  },

  // 删除打印机
  deleteBlueTooth(index) {
    if (this.data.printList[index].deviceId == this.data.deviceId) {
      this.closeBLEConnection(this.data.deviceId)
    }
    this.data.printList.splice(index, 1)
    let printList = this.data.printList
    this.setData({
      printList
    })
  },

  // 进行打印
  goPrint(printBlueTooth) {
    let _this = this
    wx.showLoading({
      title: '正在连接...',
      mask: true
    })
    // 初始化蓝牙状态
    wx.openBluetoothAdapter({
      complete: res => {
        console.log(res)
        if (this.data.deviceId == printBlueTooth.deviceId) {
          let {
            deviceId,
            serviceId,
            characteristicId
          } = this.data
          this.doWrite({
            deviceId,
            serviceId,
            characteristicId
          })
        } else {
          _this.getBluetoothAdapterState(printBlueTooth);
        }
      }
    })
    wx.onBLEConnectionStateChange((res) => {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log('onBLEConnectionStateChange', `device ${res.deviceId} state has changed, connected: ${res.connected}`)
      // if (!res.connected) {
      //   _this.showTip('蓝牙连接已断开.');
      // }
    });
  },
  //获取本机蓝牙适配器状态
  getBluetoothAdapterState(printBlueTooth) {
    let _this = this;
    wx.getBluetoothAdapterState({
      complete: function (res) {
        if (!!res && res.available) {
          _this.createConnection(printBlueTooth);
        } else {
          _this.showTip("请开启手机蓝牙")
        }
      }
    })
  },
  createConnection(printBlueTooth) {
    let _this = this
    // if (this.data.deviceId == printBlueTooth.deviceId){
    //   _this.getDeviceService(printBlueTooth.deviceId)
    //   return
    // }
    // 连接
    wx.createBLEConnection({
      deviceId: printBlueTooth.deviceId,
      success(res) {
        console.log(res)
        _this.data.deviceId = printBlueTooth.deviceId
        // wx.hideLoading()
        _this.getDeviceService(printBlueTooth.deviceId)
      },
      fail(res) {
        console.log(res)
        wx.hideLoading();
        _this.showTip('连接失败');
      }
    })
  },


  // 断开与低功耗蓝牙设备的连接 关闭蓝牙模块
  onUnload() {
    // this.closeBLEConnection(this.data.deviceId)
    wx.closeBluetoothAdapter()
    lc.removeListener('blueTooth', this.__wxWebviewId__.toString())
    lc.removeListener('platformPrintData', this.__wxWebviewId__.toString())
  },

  // 获取蓝牙设备所有service（服务）
  getDeviceService(deviceId) {
    let _this = this;
    wx.getBLEDeviceServices({
      deviceId,
      success: res => {
        console.log(res)
        _this.data.serviceId = _this.filterService(res.services);
        if (_this.data.serviceId != "") {
          _this.getDeviceCharacter(deviceId, _this.data.serviceId);
        } else {
          _this.showTip('没有找到主服务');
          _this.closeBLEConnection(deviceId);
        }
      },
      fail: function (res) {
        _this.showTip('搜索设备服务失败');
        _this.closeBLEConnection(deviceId);
      }
    })
  },

  filterService(services) {
    let serviceId = "";
    for (let i = 0; i < services.length; i++) {
      let serverid = services[i].uuid.toUpperCase();
      if (serverid.indexOf(services_uuid[0]) != -1 ||
        serverid.indexOf(services_uuid[1]) != -1 ||
        serverid.indexOf(services_uuid[2]) != -1
      ) {
        serviceId = services[i].uuid;
        break;
      }
    }
    return serviceId;
  },
  // 获取蓝牙设备所有characteristic(特征值)
  getDeviceCharacter(deviceId, serviceId) {
    let _this = this;
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: res => {
        console.log(`res:${res.characteristics}`)
        _this.data.characteristicId = _this.filterCharacter(res.characteristics);
        // console.log(`writeId:${_this.data.writeId}`)
        let characteristicId = _this.filterCharacter(res.characteristics);
        if (_this.data.characteristicId != '') {
          this.doWrite({
            deviceId,
            serviceId,
            characteristicId
          })
          // _this.writeBLECharacteristicValue(deviceId, serviceId, _this.data.writeId, 1);
        } else {
          _this.showTip('获取特征值失败');
          _this.closeBLEConnection(deviceId);
        }
      },
      fail: res => {
        _this.showTip('获取特征值失败');
        _this.closeBLEConnection(deviceId);
      }
    })
  },

  filterCharacter(characteristics) {
    let writeId = '';
    for (let i = 0; i < characteristics.length; i++) {
      let charc = characteristics[i];
      if (charc.properties.write) {
        writeId = charc.uuid;
        break;
      }
    }
    return writeId;
  },

  // 写数据 数据分包传输
  doWrite(options, idx = 0) {
    let PrintData = this.data.printData.data
    let printType = this.data.choosePrintType.code
    options.print_data = PrintData
    if (PrintData.length === 0) {
      wx.showToast({
        title: '没有数据',
        icon: 'none'
      })
      return
    }
    if (this.data.platformPrint) {
      if (PrintData[idx].isBase64) {
        options.print_data = PrintData.map(item => item.base64)
        this.cutCommandBase64(PrintData[idx].base64).then(res => {
          this.writeBLECharacteristicValue(options, res, idx)
        })
        return
      }
      console.log(PrintData[idx])
      this.cutCommand(PrintData[idx]).then(res => {
        console.log(res)
        this.writeBLECharacteristicValue(options, res, idx)
      })
    } else {
      wx.showLoading({
        title: '正在打印...',
        mask: true
      })
      console.log(PrintData[idx])

      // 判断客户标签换成别的
      const unprint_seq = _App.user.domain == 'D742' || (this.data.printData.column_info && this.data.printData.column_info.indexOf('"field":"c111","value":"${pcode_seq!\'\'}"') == -1)
      //742域单独配置
      printDatas(this.data.PrintType, PrintData[idx], _App, idx, unprint_seq, printType, this.data.printData.printMode).then(res => {
        console.log(res)
        this.cutCommand(res).then(res => {
          this.writeBLECharacteristicValue(options, res, idx)
        })
      }).catch(e => {
        console.log(e)
      })
    }
  },

  // 打印
  writeBLECharacteristicValue(options, sendData64, idx, times = 1) {
    let _this = this
    if (sendData64.length >= times) {
      wx.writeBLECharacteristicValue({
        ...options,
        value: sendData64[times - 1],
        success: res => {
          console.log('writeBLECharacteristicValue success', res, times)
          _this.writeBLECharacteristicValue(options, sendData64, idx, ++times);
        },
        fail: res => {
          _this.showTip(`writeBLECharacteristicValue fail:${res.errMsg}`);
          _this.closeBLEConnection(options.deviceId);
        }
      })
    } else {
      if (idx + 1 < options.print_data.length) {
        idx++
        this.doWrite(options, idx)
        return
      }
      wx.showToast({
        title: '打印完成！',
        icon: 'none'
      })
      this.data.platformPrintData = ''
      wx.setStorage({
        key: 'printList',
        data: _this.data.printList
      })
      wx.setStorage({
        key: 'printData',
        data: {
          printMode: this.data.printData.printMode,
          printModeId: this.data.printData.printModeId
        }
      })
    }
  },

  //数据分包
  cutCommand: function (data, PackageLength = this.data.PackageLength) {
    return new Promise(resolve => {
      var sendData64 = [];
      for (let i = 0; i < Math.ceil(data.length / PackageLength); i++) {
        sendData64[i] = wx.base64ToArrayBuffer(ToBase64.encode64gb2312(data.substr(i * PackageLength, PackageLength)));
      }
      console.log(sendData64);
      resolve(sendData64)
    })
  },
  cutCommandBase64: function (data, PackageLength = 24) {
    return new Promise(resolve => {
      var sendData64 = [];
      for (let i = 0; i < Math.ceil(data.length / PackageLength); i++) {
        sendData64[i] = wx.base64ToArrayBuffer(data.substr(i * PackageLength, PackageLength));
      }
      resolve(sendData64)
    })
  },
  // 关闭连接
  closeBLEConnection(deviceId) {
    let _this = this
    wx.closeBLEConnection({
      deviceId: deviceId,
      success(res) {
        _this.setData({
          deviceId: '',
          serviceId: '',
          characteristicId: ''
        })
      }
    })
  },
  showTip: function (data, fn) {
    wx.hideLoading();
    wx.showModal({
      title: '提示',
      content: data,
      showCancel: false,
      success: res => res.confirm && fn && fn()
    })
  }
})
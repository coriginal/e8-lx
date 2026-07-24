const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
const util = require('../../../../utils/util.js')
//日后删除
const QQMapWX = require('../../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
//日后删除
import Pages from '../../../../pages.js'

var qqmapsdk = new QQMapWX({
  key: Map_Key
});

Page({

  data: {
    select: {},
    params: {
      time: 2000 * 60,
      num: 30,
      total: 500
    },
    last_time: "",
    scanData: [],
    recordID: 'tms_scan',
    field: ["station_id,station,scan_time,scan_code,scan_person,last_stop,next_stop,operate,task,location,origin,no_order,customer,customer_id,tempid,lng_lat"],
    btnScan: [{
        name: "开始扫描",
        img: "icon-thumb.png",
        bindtap: "scanCode"
      },
      {
        name: "连续扫描",
        img: "icon-continue.png",
        bindtap: "scanCode",
        ifContinue: 30
      },
      {
        name: "完成扫描",
        img: "icon-upload.png",
        bindtap: "submit"
      }
    ],
    tempid: '',
    abnormal: [],
    abSelect: {},
    abRecordId: 'tms_scan_register',
    _thumbURLS: [],

    oldTask: [],
    listHidden: true,

    task: {
      tbId: '-18',
      _thumbURLS: []
    },
    currentStation: {
      name: "",
      id: ""
    },
    currentNextStation: {
      name: "",
      id: ""
    },

    //需要检查包含
    needCheckList: [],
    needCheck: false
  },

  onLoad: function (options) {
    // wx.removeStorageSync('oldTask');
    console.log(options)
    let listid = options.listid,
      menu = app.tabbarList
    let list = menu.find(item => item.code == 'oc');
    let scan = list.children.find(e => e.code == 'scan'),
      scanList = scan.children;
    let _type = scanList.find(s => s.id == listid);
    let select = JSON.parse(_type.description);
    console.log(select)
    wx.setNavigationBarTitle({
      title: _type.name
    })
    console.log(_type, select);

    this.getSite();
    //this.doLocation();
    this.setData({
      select: select,
      "select.scan_person": app.user.uName,
      tempid: (new Date()).getTime()
    })

    let storage = wx.getStorageSync('scanData'),
      this_storage = [];
    if (storage) {
      storage.forEach(function (i) {
        if (select.operate == i.operate) {
          this_storage.push(i)
        }
      })
    }
    if (storage && this_storage) {
      this.setData({
        scanData: this_storage
      })
    }
    let oldTask = wx.getStorageSync('oldTask'),
      this_task = [];
    if (oldTask) {
      oldTask.forEach(function (i) {
        if (select.operate == i.operate) {
          this_task.push(i)
        }
      })
    }
    if (oldTask && this_task) {
      this.setData({
        oldTask: this_task
      })
    }

    if (select.pretask) {
      // this.setData({ showModalTask: true })
      wx.navigateTo({
        url: '/pages-work/tss/scan/task_info/task_info' + '?operate=' + select.operate,
      })
    }
    this.getTask()
  },
  getValue: function (e) {
    let name = e.currentTarget.dataset.field;
    let value = e.detail.value || e.detail.detail.value;
    this.data.select[name] = value;
  },

  scanCode: function (e, num) {
    let ifcontinue = num || e.currentTarget.dataset.ifcontinue;
    let _this = this;
    wx.scanCode({
      success: res => {
        console.log(res)
        console.log(res.result)
        if (!res.result) {
          return
        }
        let check = /^[\w\d-_]*$/g.test(res.result);
        let reson = res.result.replace(/[\w\d-_]*/g, '')
        if (!check) {
          wx.showToast({
            title: `单号非法！非法字符：${reson}`,
            icon: 'none'
          })
          return
        }
        if (res.scanType == "QR_CODE") {
          res.result = res.result.split('?')[1].split('=')[1]
        }
        console.log(res.result)
        if (res.result.indexOf("/") >= 0 || res.result.indexOf("=") >= 0) {
          return
        }
        if (app.DomainConfig.scan_check_code && Boolean(Number(app.DomainConfig.scan_check_code.content)) && this.data.select.task) {
          let k = this.check(res.result)
          if (k == -1) {
            wx.showModal({
              title: '提示',
              content: '此拆单未包含在运输单中，是否继续扫描？',
              complete: (r) => {
                if (r.cancel) {
                  return
                }
                if (r.confirm) {
                  let this_time = new Date();
                  let scan = {
                    operate: _this.data.select.operate,
                    scan_code: res.result,
                    scan_time: util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                    tempid: _this.data.tempid
                  };
                  if (_this.data.select.pretask) {
                    scan.no_order = 1
                  }
                  _this.pushCheckCode(scan, this_time, ifcontinue)
                }
              }
            })
          } else {
            let this_time = new Date();
            let scan = {
              operate: _this.data.select.operate,
              scan_code: res.result,
              scan_time: util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
              tempid: _this.data.tempid
            };
            if (_this.data.select.pretask) {
              scan.no_order = 1
            }
            _this.pushCheckCode(scan, this_time, ifcontinue)
          }
        } else {
          let this_time = new Date();
          let scan = {
            operate: _this.data.select.operate,
            scan_code: res.result,
            scan_time: util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            tempid: _this.data.tempid
          };
          if (_this.data.select.pretask) {
            scan.no_order = 1
          }
          _this.pushCheckCode(scan, this_time, ifcontinue)
        }
      }
    })
  },
  check(code) {
    let list = this.data.needCheckList
    let res = list.indexOf(code)
    console.log(res)
    return res
  },
  getTask() {
    var params = {
      type: '',
      status: ['待接单', '已接单', '已出发'],
      code: '',
      order_code: '',
      driver: app.user.uName,
      assign_type: 'normal',
      addfee: true,
      showAttach: true,
      page: 1,
      rows: 30
    }
    tss.getJSON({
      url: "https://tms.boudata.com/tss/api/data/sql/tms_trans_order",
      params,
      completion: res => {
        console.log(res)
        let list = res.data.rows.map(item => {
          let i = {
            id: item.id,
            task: item.code,
            status: item.status,
            type: item.type
          }
          return i
        })
        this.setData({
          oldTask: list
        })
        console.log(this.data.oldTask)
      }
    })
  },
  pushCheckCode: function (scan, this_time, ifcontinue) {
    let _this = this;
    let scanData = _this.data.scanData;

    let distinct = scanData.find(e => e.scan_code == scan.scan_code);
    if (distinct) {
      wx.showToast({
        title: '单号重复'
      });
      return
    } //去重

    scanData.unshift(scan);
    _this.setData({
      scanData: scanData
    });

    var stage = wx.getStorageSync('scanData');
    if (!stage) {
      wx.setStorageSync('scanData', [scan])
    } else {
      stage.unshift(scan)
      wx.setStorageSync('scanData', stage)
    }

    let params = _this.data.params,
      last_time = _this.data.last_time || this_time;
    let difTime = this_time.getTime() - last_time.getTime()
    let storage = wx.getStorageSync('scanData');
    if (scanData.length >= params.total) {
      wx.showModal({
        title: '数据过多',
        content: '请先上传数据后再继续',
        success(res) {
          if (res.confirm) {
            _this.submit()
          }
        }
      })
    } else if (storage.length >= params.num || difTime >= params.time) {
      _this.save(storage);
    }
    if (ifcontinue && ifcontinue > 0) {
      setTimeout(() => {
        _this.scanCode(null, ifcontinue - 1)
      }, 1000)
    }
  },

  submit: function (e) {
    let storage = wx.getStorageSync('scanData'),
      this_storage = [],
      stay_storage = [];
    let operate = this.data.select.operate;
    if (storage) {
      storage.forEach(function (i) {
        if (operate == i.operate) {
          this_storage.push(i)
        } else {
          stay_storage.push(i)
        }
      })
    }
    if (storage && this_storage) {
      this.setData({
        stay_storage: stay_storage
      })
      this.save(this_storage, "total")
    } else {
      wx.showToast({
        title: '上传成功'
      })
      this.setData({
        scanData: []
      })
    }
  },

  save: function (arrdata, tips, origin) {
    var field = [],
      s = this.data.select,
      storage = [],
      tempid = this.data.tempid,
      checkFrozen = s.checkFrozen || '';
    field.push(this.data.field);
    storage = arrdata;

    for (var i = 0; i < storage.length; i++) {
      let e = storage[i];
      let obj = [s.station_id, s.station, e.scan_time, e.scan_code, s.scan_person, s.last_stop, s.next_stop, e.operate || s.operate, s.task, s.location, "WxScan", e.no_order, s.customer || '', s.customer_id || '', e.tempid || '', s.lng_lat];
      field.push(obj.join(','));
      if (i == storage.length - 1 && field.length > 1) {
        tss.save({
          url: tss.url('xdata') + "cud/" + this.data.recordID,
          params: {
            "csv": field.join("\n")
          },
          completion: res => {
            if (res.failed) {
              return
            }
            if (checkFrozen) {
              tss.post({
                url: tss.url("") + '/tms/scan/queryFrozenCode',
                params: {
                  tempid: tempid
                },
                completion: fro => {
                  console.log(fro)
                  this.setData({
                    tempid: (new Date()).getTime()
                  })
                  if (fro.data && fro.data.length) {
                    this.setData({
                      frozen: fro.data.map(e => ({
                        code: e,
                        ifHand: false
                      })),
                      showFrozen: true
                    })

                    wx.vibrateLong();
                    const backgroundAudioManager = wx.getBackgroundAudioManager()
                    backgroundAudioManager.title = '留仓提示'
                    backgroundAudioManager.src = 'https://tms.boudata.com/alarm.mp3'
                  }
                  tss.post({
                    url: tss.url("") + '/tms/scan/scanDone',
                    params: {
                      operate: s.operate
                    },
                    completion: can => {
                      console.log(can, checkFrozen, tempid)
                      if (can.failed) {
                        wx.showModal({
                          title: '提示',
                          content: can.errorMsg,
                          showCancel: false
                        })
                        return
                      }

                    }
                  })
                }
              })
            } else {
              tss.post({
                url: tss.url("") + '/tms/scan/scanDone',
                params: {
                  operate: s.operate
                },
                completion: can => {
                  console.log(can, checkFrozen, tempid)
                  if (can.failed) {
                    wx.showModal({
                      title: '提示',
                      content: can.errorMsg,
                      showCancel: false
                    })
                    return
                  }
                }
              })
            }


            let scanData = this.data.scanData;
            for (var j = 0; j < storage.length; j++) {
              scanData[j].upload = 1
            }
            this.setData({
              scanData: scanData
            })
            if (this.data.stay_storage) {
              wx.setStorageSync('scanData', this.data.stay_storage)
            } else {
              wx.removeStorageSync('scanData');
            }
            this.setData({
              last_time: new Date()
            })

            if (tips) {
              wx.showToast({
                title: '上传成功'
              })
              this.data.select.scan_hand = '';
              this.setData({
                select: this.data.select
              });
            }
            if (tips == 'total') {
              if (s.task) {
                let uptask = {
                  operate: s.operate,
                  task: s.task,
                  submitTime: util.formatDate(new Date(), 'MM-dd hh:mm')
                };
                let oldTask = wx.getStorageSync('oldTask') || [uptask];
                let single = oldTask.find(e => s.task == e.task);
                if (single == undefined) {
                  oldTask.unshift(uptask);
                  if (oldTask.length > 10) {
                    oldTask.pop()
                  }
                }
                wx.setStorageSync('oldTask', oldTask)

                this.setData({
                  oldTask: oldTask
                })
              }

              this.setData({
                scanData: [],
                "select.task": ''
              })
            }
          }
        })
      }
    }
  },

  scanField: function (e) {
    let _this = this;
    let name = e.currentTarget.dataset.field;
    wx.scanCode({
      scanType: ['barCode'],
      success: res => {
        if (res.result) {
          console.log(res.result)
          let select = _this.data.select;
          select[name] = res.result;
          _this.setData({
            select: select
          })
          if (app.DomainConfig.scan_check_code && Boolean(Number(app.DomainConfig.scan_check_code.content))) {
            tss.getJSON({
              url: "https://tms.boudata.com/tss/api/data/sql/tms_trans_order",
              params: {
                code: res.result
              },
              completion: res => {
                if (res.data.length) {
                  this.getTaskOrder(res.data[0].id)
                }
              }
            })
          }
        }
      }
    })
  },

  handInput: function (e) {
    let value = e.detail.value;
    if (value) {
      let check = /^[\w\d-_]*$/g.test(value)
      let reson = value.replace(/[\w\d-_]*/g, '')
      if (!check) {
        wx.showToast({
          title: `单号非法！非法字符：${reson}`,
          icon: 'none'
        })
        return
      }
      let this_time = new Date();
      let scan = {
        operate: this.data.select.operate,
        scan_code: e.detail.value,
        scan_time: util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        tempid: this.data.tempid
      };

      if (this.data.select.pretask) {
        scan.no_order = 1
      }
      this.pushCheckCode(scan, this_time);
      this.setData({
        'select.scan_hand': ''
      })
    }
  },

  deleteCode: function (e) {
    let _this = this;
    wx.showModal({
      title: '确定删除',
      content: '详细检查信息再操作',
      success(res) {
        if (res.confirm) {
          let index = e.currentTarget.id;
          _this.data.scanData.splice(index, 1);
          _this.setData({
            scanData: _this.data.scanData
          });

          let storage = wx.getStorageSync('scanData');
          storage.splice(index, 1);
          wx.setStorageSync('scanData', storage);
        }
      }
    })
  },

  onUnload: function () {
    this.leavePage()
    //可能其他监听事件也需要
  },

  leavePage: function () {
    let _this = this;
    let storage = wx.getStorageSync('scanData'),
      this_storage = [],
      stay_storage = [];
    let operate = _this.data.select.operate;
    if (storage) {
      storage.forEach(function (i) {
        if (operate == i.operate) {
          this_storage.push(i)
        } else {
          stay_storage.push(i)
        }
      })
    }
    if (storage && this_storage.length > 0) {
      _this.setData({
        stay_storage: stay_storage
      })
      wx.showModal({
        title: '确定退出',
        content: '扫描数据未上传',
        cancelText: '退出',
        confirmText: '上传数据',
        success(res) {
          if (res.confirm) {
            _this.save(this_storage, 'tips')
          }
        }
      })
    }
  },
  getSite: function () {
    tss.query({
      url: tss.url('sql') + 'c_site',
      params: {},
      completion: res => {
        console.log(res)
        if (res.data && res.data.length >= 1) {
          this.setData({
            "select.station": res.data[0].name,
            "select.station_id": res.data[0].id,
            site: res.data
          })
        } else {
          this.doLocation();
        }
      }
    })
  },
  doLocation: function () { //获取当前位置作为本站，有接口之后会替换掉
    let _this = this
    var lng_lat = ""
    wx.getLocation({
      success: res => {
        lng_lat = `${res.longitude}&${res.latitude}`;
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let address = res.result.address
            _this.setData({
              "select.station": address,
              "select.lng_lat": lng_lat
            })
            console.log(lng_lat)
          },
          complete: res => {
            // wx.hideLoading()
          }
        })
      },
      fail() {
        // wx.hideLoading()
      }
    })
  },
  openSiteList: function (e) {
    this.setData({
      "currentStation.name": this.data.select.station,
      "currentStation.id": this.data.select.station_id
    })
    this.setData({
      showSite: true
    })
  },
  siteSelect: function (e) {
    let _site = e.currentTarget.dataset.text;
    this.setData({
      "currentStation.name": _site.name,
      "currentStation.id": _site.id
    })
  },
  modalConfirmSite: function (e) {
    this.setData({
      "select.station": this.data.currentStation.name,
      "select.station_id": this.data.currentStation.id
    })
    this.setData({
      showSite: false
    })
  },
  modalCancel() {
    console.log("取消选择")
    this.setData({
      "currentStation.name": "",
      "currentStation.id": ""
    })
    this.setData({
      showSite: false
    })
  },
  //客户选择
  openCustomer: function (e) {
    tss.query({
      url: tss.url('sql') + 'customer',
      params: {
        active: 1
      },
      completion: res => {
        if (res.failed) {
          wx.hideLoading()
          return
        }
        if (res.data.length >= 1) {
          this.setData({
            customer: res.data,
            showCustomer: true
          })
        }
      }
    })
  },
  customerSelect: function (e) {
    let _customer = e.currentTarget.dataset.text;
    this.setData({
      "select.customer": _customer.name,
      "select.customer_id": _customer.id
    })
  },
  modalConfirmCustomer: function (e) {
    this.setData({
      showCustomer: false
    })
  },
  frozenHand: function (e) {
    let index = e.currentTarget.dataset.index;
    let frozen = this.data.frozen;
    frozen[index].ifHand = true
    this.setData({
      frozen: frozen
    })
  },
  modalConfirmFrozen: function (e) {
    this.setData({
      showFrozen: false
    })
  },
  //问题件登记
  queryAbnormal: function (id) {
    tss.query({
      url: tss.recordURLs('tms_scan_register').QUERY,
      params: {
        id: id
      },
      completion: res => {
        if (res.failed) {
          return
        }
        this.setData({
          'abSelect.itemId': id,
          'abSelect.content': res.data[0].content
        })
        if (res.data[0]._fileNum) {
          tss.query({
            url: tss.url('xdata') + 'attach/json/' + "tms_scan_register/" + id,
            params: {},
            completion: fil => {
              let attachs = [];
              for (var i = 0; i < fil.data.length; i++) {
                attachs.push({
                  url: tss.url('download') + `${fil.data[i].id}?uName=${app.user.uName}&uToken=${app.user.uToken}`,
                  type: 1,
                  name: fil.data[i].name,
                  id: fil.data[i].id
                })
              }
              this.setData({
                _thumbURLS: attachs
              })
            }
          })
        }
      }
    })
  },
  abnormalReport: function (e) {
    let code = e.currentTarget.dataset.code;
    let index = e.currentTarget.dataset.index;
    let regit = e.currentTarget.dataset.regit;
    tss.query({
      url: tss.url('sql') + 'abnormal_define',
      params: {
        type: "问题件"
      },
      completion: res => {
        if (res.failed) {
          alert.notice('暂时无法登记' + (res.errorMsg || ''))
          return
        }
        this.setData({
          abnormal: res.data,
          showModal: true,
          'abSelect.scan_code': code,
          'abSelect.scan_index': index,
          _thumbURLS: []
        })
      }
    })

    if (regit) {
      this.queryAbnormal(regit);
    } else {
      this.setData({
        'abSelect.itemId': '',
        'abSelect.content': '',
        timestamp: ''
      })
    }
  },
  abnormalSelect: function (e) {
    let text = e.currentTarget.dataset.text;
    if (text) {
      this.setData({
        "abSelect.content": text
      })
    }
  },
  addProof: function (e) {
    var attachURLs = e.detail.attachURLs
    this.setData({
      timestamp: e.detail._tempID
    })
  },
  modalConfirm: function (e) {
    let abSelect = this.data.abSelect,
      timestamp = this.data.timestamp;
    let itemId = abSelect.itemId;
    if (itemId) {
      var _url = tss.url('xdata') + this.data.abRecordId + "/" + itemId;
    } else {
      var _url = tss.url('xdata') + this.data.abRecordId
    }
    const item = {
      scan_code: abSelect.scan_code,
      content: abSelect.content,
      station: this.data.select.station,
      _tempID: timestamp
    }

    if (!item.content) {
      wx.showToast({
        title: '选择问题件内容'
      });
      return
    }
    tss.save({
      url: _url,
      params: item,
      completion: res => {
        wx.hideLoading()
        if (res.failed) {
          alert.error(res.errorMsg)
        }
        let scanData = this.data.scanData;
        scanData[abSelect.scan_index].ifRegit = itemId || res.data.result
        this.setData({
          showModal: false,
          scanData: scanData
        })
        wx.showToast({
          title: '问题件登记成功'
        });
      }
    })
  },
  getTaskNo: function (params) {
    tss.post({
      url: tss.url('') + '/tms/task',
      params: params,
      completion: res => {
        console.log(res)
        this.setData({
          "select.task": res.data.code,
          showModalTask: false
        })
      }
    })
  },
  modalConfirmTask: function (e) {
    let task = this.data.select.task;
    let params = {
      status: "待接单",
      type: this.data.select.operate
    };
    let footer = util.formatDate(new Date(), 'yyMMddhhmm');
    if (task) {
      params.code = task + "-" + footer;
    }

    if (this.data.task._thumbURLS) {
      params.tempid = this.data.tempid
    }
    this.getTaskNo(params);
  },
  openTaskList: function () {
    let listHidden = this.data.listHidden
    this.setData({
      listHidden: !listHidden
    })
  },
  checkedTask: function (e) {
    let task = e.currentTarget.dataset.value;
    let id = e.currentTarget.dataset.id
    if (task) {
      this.setData({
        "select.task": task,
        listHidden: true
      })
      console.log(app.DomainConfig)
      if (app.DomainConfig.scan_check_code && Boolean(Number(app.DomainConfig.scan_check_code.content))) {
        this.getTaskOrder(id)
      }
    }
  },
  getTaskOrder(id) {
    console.log(id)
    //https://tms.boudata.com/tss/tms/task/29904/subOrder?showOrderFee=true
    tss.get({
      url: tss.url('tms') + `/task/${id}/subOrder?showOrderFee=true`,
      completion: res => {
        console.log(res)
        let list = []
        res.data.map(item => {
          list.push(item[1].code)
        })
        this.setData({
          needCheckList: list
        })
        console.log(list)
      }
    })
  },
  onHide: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  },
  nextStation() {
    this.setData({
      'currentNextStation.name': this.data.select.next_stop,
      //'currentNextStation.id': this.data.selectNext.station_id,
      showNextSite: true
    })
  },
  modalConfirmNextSite() {
    this.setData({
      'select.next_stop': this.data.currentNextStation.name,
      showNextSite: false
    })
  },
  modalNextCancel() {
    this.setData({
      'currentNextStation.name': "",
      //'currentNextStation.id': "",
      showNextSite: false
    })
  },
  nextSiteSelect(e) {
    let _site = e.currentTarget.dataset.text;
    this.setData({
      "currentNextStation.name": _site.name,
      //"currentNextStation.id": _site.id
    })
  }
})
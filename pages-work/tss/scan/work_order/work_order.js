const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
const util = require('../../../../utils/util.js')

Page({

  data: {
    params: { time: 2000 * 60, num: 30, total: 500 }, last_time: "",
    btnScan: [
      { name: "完成扫描", img: "icon-upload.png", bindtap: "submit" },
      { name: "连续扫描", img: "icon-continue.png", bindtap: "scanCode", ifContinue: 30 },
      { name: "开始扫描", img: "icon-thumb.png", bindtap: "scanCode" },
    ],
    task:{}, allTask:[] ,task_id:'',

    recordID: 'tms_scan',
    field: ["station,scan_time,scan_code,scan_person,last_stop,next_stop,operate,task,location,origin"],

    totalOrder: [] ,needScan: [], scandOrder: [], storageOrder:[], errorScan: [],
    showScan: [],

    abnormal: [], abSelect: {}, abRecordId: 'tms_scan_register',
    _thumbURLS: [], isDefault:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.removeStorageSync('needScan');
    // wx.removeStorageSync('scanOrder');
    // wx.removeStorageSync('scandOrder');
    // wx.removeStorageSync('errorScan');
    let select = options;
    wx.setNavigationBarTitle({ title: select._type })
    this.setData({ select: select })

  },

  getValue:function(e){
    let task = e.detail.detail.value;
    if(task){
      this.setData({ inputTask: true ,input_task: task})
    }else{
      this.setData({ inputTask: false })
    }
  },
  queryTicon:function(){
    let params = { task_code: this.data.input_task}
    this.queryTask(params,"input")
  },
  scanTask:function(){
    wx.scanCode({
      success: res => {
        if(res.result){
          let params = { task_code: res.result}
          this.queryTask(params,'scan')
        }
      }
    })
  },

  queryTask:function(params,type) {
    tss.query({
      url: tss.url('sql') + 'task',
      params,
      completion: res => {
        if (res.data && type != "scan"){
          this.setData({
            allTask: res.data
          })
        }
        if (type == "scan" || type == "input") {
          this.setData({ task: res.data[0], task_id: res.data[0].id })
          this.queryTaskSubOrder()
        }
       }
    }) 
  },

  queryTaskSubOrder:function(){
    // let params = { task_id: this.data.task_id};
    // params.sortType = 'onlynull';
    // params.sortField = this.data.select.load_time;

    tss.query({
      // url: tss.url('sql') + 'tms_sub_code',
      // params: params,
      url: tss.url('') + `/tms/task/${this.data.task_id}/subOrder2`,
      completion: res => {
        if(res.data){
          this.setData({ 
            totalOrder: res.data, needScan: res.data, showScan: res.data 
          })
        }
       }
    })
  },

  scanCode: function (e, num) {
    let ifcontinue = num || e.currentTarget.dataset.ifcontinue;
    let _this = this;
    wx.scanCode({
      success: res => {
        if (!res.result) { return }
        if (res.result.indexOf("/") >= 0) { return }
        let this_time = new Date();
        let scan = {
          operate: _this.data.select.operate,
          scan_code: res.result,
          scan_time: util.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          task: _this.data.task.code
        };

        let needScan = _this.data.needScan || wx.getStorageSync('storageScan');
        let scandOrder = _this.data.scandOrder||[];
        let errorScan = _this.data.errorScan||[];
        let storageScan = wx.getStorageSync('storageScan')||[];

        let distinct = scandOrder.find(e => e.code == scan.scan_code);
        if (distinct) {
          wx.showToast({ title: '单号重复' });
          return
        }//去重
        
        let normal = needScan.findIndex(e => e.code == scan.scan_code);
        
        if(normal>=0){
          // if(needScan.length == 1){
          //   needScan = []
          // }else if(needScan.length >1){
          needScan.splice(normal, 1);
          // }
          
          wx.setStorageSync('needScan', needScan );

          storageScan.unshift(scan);
          wx.setStorageSync('storageScan', storageScan);
  
          scandOrder.unshift(scan);
          wx.setStorageSync('scandOrder', scandOrder);
          _this.setData({ scandOrder: scandOrder, needScan: needScan, showScan: needScan, storageScan: storageScan });
          
        }else{
          wx.showModal({
            title: '扫描单号不在此任务单里',
            content: '添加到此次任务单里？',
            success(res) {
              if (res.confirm) {
                errorScan.unshift(scan);
                wx.setStorageSync('errorScan', errorScan);

                storageScan.unshift(scan);
                wx.setStorageSync('storageScan', storageScan);
                _this.setData({ scandOrder: scandOrder, errorScan: errorScan, storageScan: storageScan })
              }
            }
          })
        }

        let params = _this.data.params, last_time = _this.data.last_time || this_time;
        let difTime = this_time.getTime() - last_time.getTime();
        // let storageScan = wx.getStorageSync('storageScan');
        if (storageScan.length >= params.total) {
          wx.showModal({
            title: '数据过多',
            content: '请先上传数据后再继续',
            success(res) {
              if (res.confirm) {
                _this.submit()
              }
            }
          })
        } else if (storageScan.length >= params.num || difTime >= params.time) {
          _this.save(storageScan);
        }
        if (ifcontinue > 0) {
          _this.scanCode(null, ifcontinue - 1)
        }
      },
      fail: res => {
        console.log(res)
      }
    })
  },

  submit: function (e) {
    let storage = wx.getStorageSync('storageScan');
    if (storage && storage.length) {
      this.save(storage, "total")
    } else {
      wx.showToast({ title: '上传成功' })
      this.setData({ scandOrder: [] })
    }
  },

  save: function (arrdata, tips) {
    var field = [], s = this.data.select, storage = [];
    field.push(this.data.field); storage = arrdata;

    for (var i = 0; i < storage.length; i++) {
      let e = storage[i];
      let obj = [s.station, e.scan_time, e.scan_code, s.scan_person, s.last_stop, s.next_stop, e.operate || s.operate, e.task||s.task, s.location, s.origin];
      field.push(obj.join(','));

      if (i == storage.length - 1 && field.length > 1) {
        tss.save({
          url: tss.url('xdata') + "cud/" + this.data.recordID,
          params: { "csv": field.join("\n") },
          completion: res => {
            if (res.failed) {
              return
            }

            tss.post({
              url: tss.url("") + '/tms/scan/scanDone',
              params: { operate: s.operate },
              completion: can => {
                console.log(can)
              }
            })
            wx.showToast({ title: '上传成功' })
            wx.removeStorageSync('storageScan');
            this.setData({ last_time: new Date() })
          }
        })
      }
    }
  },

  showScand:function(e){
    let field = e.currentTarget.dataset.field;
    if(field == "error"){
      this.setData({ showScan: this.data.errorScan, isDefault: false, color:"red" })
    }else if (field == "scand"){
      this.setData({ showScan: this.data.scandOrder, isDefault: false,color:"green"})
    }else{
      this.setData({ showScan: this.data.needScan, isDefault: true,color:"" })
    }
  },

  queryScan: function (params) {
    if (!params.task || !params.operate) {
      return
    }
    tss.query({
      url: tss.recordURLs('tms_scan').QUERY,
      params: params,
      completion: res => {
        if (res.failed) {
          return
        }

      }
    })
  },

  //问题件登记
  queryAbnormal: function (id) {
    tss.query({
      url: tss.recordURLs('tms_scan_register').QUERY,
      params: { id: id },
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
                attachs.push({ url: tss.url('download') + `${fil.data[i].id}?uName=${app.user.uName}&uToken=${app.user.uToken}`, type: 1, name: fil.data[i].name, id: fil.data[i].id })
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
      params: { type: "问题件" },
      completion: res => {
        if (res.failed) {
          alert.notice('暂时无法登记' + (res.errorMsg || ''))
          return
        }
        this.setData({
          abnormal: res.data, showModal: true,
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
      this.setData({ "abSelect.content": text })
    }
  },
  addProof: function (e) {
    var attachURLs = e.detail.attachURLs
    this.setData({
      timestamp: e.detail._tempID
    })
  },
  modalConfirm: function (e) {
    let abSelect = this.data.abSelect, timestamp = this.data.timestamp;
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
      wx.showToast({ title: '选择问题件内容' });
      return
    }
    tss.save({
      url: _url,
      params: item,
      completion: res => {
        console.log(res)
        wx.hideLoading()
        if (res.failed) {
          alert.error(res.errorMsg)
        }
        let scanData = this.data.showScan;
        scanData[abSelect.scan_index].ifRegit = itemId || res.data.result
        this.setData({ showModal: false, showScan: scanData })
        wx.showToast({ title: '问题件登记成功' });
      }
    })
  },

  //任务单列表
  openList:function(){
    let today = util.formatDate(new Date(), 'yyyy-MM-dd');
    let week = util.formatDate(util.subDate(today, 5), 'yyyy-MM-dd');
    let params = { phone: app.user.uName, create_from: week  }
    this.queryTask(params);
    this.setData({ showModalTask: true })
  },

  taskSelect:function(e){
    let _task = e.currentTarget.dataset.text;
    this.setData({
      "task.code": _task.code,
      task_id: _task.id
    })
  },
  modalConfirmTask:function(){
    this.queryTaskSubOrder();
    this.setData({ showModalTask: false })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})
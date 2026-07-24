const lc = require('../../../../utils/listenerCenter.js')
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
import { formatDate } from '../../../../utils/util.js'
import user from '../../../../utils/user.js'
import PC from '../../../../project.config.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    form: {},
    query_form: {},
    configuration: [],
    records: [],
    num: 0,
    title: '',
    report_title: [],
    table_width: 100,
    page: 1,
    params: {},
    requiredCol: {},
    showmodal: false,
    reportParam: false,
    total: '',
    reportid: '',
    coldefs: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (options.coldefs) {
      this.setData({
        coldefs: options.coldefs.split(/[,， ]/)
      })
    }
    this.setData({
      reportid: options.reportid
    })
    const _this = this;
    this.getDefine(options.reportid)
      .then(res => {
        wx.setNavigationBarTitle({
          title: res[0]
        })
        this.setData({
          title: res[0]
        })
        const query_param = options.query_param ? JSON.parse(options.query_param) : {};
        if (res[1]) {
          var pz = JSON.parse(res[1].replace(/\'/g, '"'));
          var query = true;
          for (var i = 0; i < pz.length; i++) {
            const pzitem = pz[i];
            if (pzitem.nullable == 'true') {
              delete pzitem.nullable;
            }
            if (pzitem.nullable == 'false' && !pzitem.defaultValue && !query_param[pzitem.code]) {
              query = false;
            }
            pzitem.code = pzitem.code || 'param' + (i + 1);
            pzitem.type = pzitem.type || 'string';
            if ((pzitem.type == 'date' || pzitem.type == 'datetime') && (pzitem.defaultValue || query_param[pzitem.code])) {
              var today = new Date();
              const day = pzitem.defaultValue;
              if ((/today[\s]*-/gi).test(day)) {
                var delta = parseInt(day.split("-")[1]);
                today.setDate(today.getDate() - delta);
              }
              else if ((/today[\s]*\+/gi).test(day)) {
                var delta = parseInt(day.split("+")[1]);
                today.setDate(today.getDate() + delta);
              }
              else if ('cur_year_01' == day) {
                today = new Date(today.getYear() + 1900, 0, 1)
              }
              else if ('cur_month_01' == day) {
                today = new Date(today.getYear() + 1900, today.getMonth(), 1)
              }
              else if ('cur_week_01' == day) {
                var weekday = today.getDay() || 7; //获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
                today.setDate(today.getDate() - weekday + 1)
              }
              else {
                today = pzitem.defaultValue
              }
              today = query_param[pzitem.code] || today;
              pzitem.defaultValue = formatDate(new Date(today), 'yyyy-MM-dd') + (pzitem.type == "datetime" ? " 00:00:00" : "");
            }
            _this.data.form[pzitem.code] = query_param[pzitem.code] || pzitem.defaultValue;
            if (pzitem.options) {
              pzitem.options = pzitem.options.codes.split('|')
              for (var j = 0; j < pzitem.options.length; j++) {
                pzitem.options[j] = { name: pzitem.options[j] }
              }
            }
            if (pzitem.nullable) {
              _this.data.requiredCol[pzitem.code] = pzitem.label;
            }
            if (pzitem.jsonUrl) {
              _this.urlGetData(pzitem.jsonUrl)
                .then(function (r) {
                  pzitem.options = r
                  wx.hideLoading()
                  _this.setData({
                    configuration: pz,
                    form: _this.data.form,
                    showmodal: true
                  })
                })
            }
            else if (i == pz.length - 1) {
              wx.hideLoading()
              _this.setData({
                configuration: pz,
                form: _this.data.form,
                showmodal: true
              })
            }
          }
          if (query) { _this.confirm() }
        }
        else {
          this.getItem()
        }
      })
  },

  onPullDownRefresh: function () {
    this.getItem(this.data.query_form)
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    wx.showLoading({
      title: '加载更多数据中'
    })
    this.getItem(this.data.query_form, this.data.page)
  },

  cancel: function (e) {
    var f = {};
    for (var key in this.data.query_form) {
      f[key] = this.data.query_form[key];
    }
    this.setData({
      form: f,
      showmodal: false
    })
  },
  confirm: function (e) {
    wx.showLoading({
      title: '查询中',
      mask: true
    })
    const form = this.data.form;
    for (var key in form) {
      if (!form[key] && key in this.data.requiredCol) {
        alert.notice(this.data.requiredCol[key] + '不能为空')
        wx.hideLoading()
        return
      }
      else if (!form[key]) {
        delete form[key]
      }
    }
    var qf = {};
    for (var key in this.data.form) {
      qf[key] = this.data.form[key];
    }
    this.setData({
      query_form: qf,
      showmodal: false,
      reportParam: true
    })

    this.getItem(this.data.query_form)
  },
  showQueryDlg: function (e) {
    this.setData({
      showmodal: true
    })
  },

  pickerChange: function (e) {
    const field = e.target.dataset.field;
    const key = 'form.' + field;
    const index = e.target.dataset.index;
    const type = e.target.dataset.type;
    var value = e.detail.value;
    const getnext = e.target.dataset.getnext;
    if (type != 'date') {
      value = this.data.configuration[index].options[value].name
    }
    this.setData({ [key]: value })
    if (getnext) {
      const nextxh = getnext.split('(^')[1].split('^')[0];
      var nextcol = nextxh;
      if (nextxh % 1 == 0) {
        nextcol = 'param' + nextxh;
      }
      const url = getnext.split(',')[1].split('^')[1];
      const param = getnext.split(',')[2].split('^')[1];
      this.data.form[nextcol] = ''
      let _url, symbol = '?';
      if (url.indexOf('?') > -1) {
        symbol = '&'
      }
      _url = url + symbol + param + '=' + value
      const _this = this
      this.urlGetData(_url)
        .then(function (r) {
          const configuration = _this.data.configuration
          for (var i = 0; i < configuration.length; i++) {
            if (configuration[i].code == nextcol) {
              configuration[i].options = r
              break;
            }
          }
          _this.setData({
            configuration: configuration,
            form: _this.data.form
          })
        })
    }
  },
  fieldChange: function (e) {
    this.data.form[e.currentTarget.dataset.code] = e.detail.detail.value
  },

  getDefine: function (reportCode) {
    return new Promise((resolve, reject) => {
      tss.query({
        url: tss.url('') + '/data/' + reportCode + '/define',
        completion: res => {
          if (res.failed || typeof res.data == 'string') {
            alert.error()
            completion && completion()
            reject()
            return
          }
          if(res.data[8]){
            this.setData({
              coldefs: res.data[8].split(/[,， ]/)
            })
          }
          resolve(res.data)
        }
      })
    })
  },

  getItem: function (param, page) {
    if (!page || page == 1) {
      this.setData({
        page: 1,
        records: []
      })
    }
    tss.query({
      url: tss.url('data') + this.data.reportid,
      params: Object.assign({ page: page || 1, rows: 35 }, param),
      completion: res => {
        if (res.failed || typeof res.data == 'string') {
          alert.error()
          completion && completion()
          return
        }
        if (this.data.page == 1) {
          const window_width = wx.getSystemInfoSync().windowWidth;
          var table_width = 0;
          if (res.data.total) {
            var t = [], i = 0;
            const key_num = Object.getOwnPropertyNames(res.data.rows[0]).length
            for (var key in res.data.rows[0]) {
              var width = Math.max(1 / key_num, 0.25) * window_width;
              var dw = this.data.coldefs[i];
              if (dw && Number.isInteger(dw - 0)) {
                width = dw - 0;
              }
              else if (dw && Number.isInteger(dw.replace('%', '') - 0)) {
                width = (dw.replace('%', '') - 0) / 100 * window_width;
              }
              table_width += width;
              t.push({ width: width, name: key })
              i++
            }
            if (window_width > table_width) {
              for (var i = 0; i < t.length; i++) {
                t[i].width = t[i].width * window_width / table_width
              }
              table_width = window_width;
            }
            this.setData({
              report_title: t,
              total: '查询结果共' + res.data.total + '行' + t.length + '列',
              table_width: table_width
            })
          }
          else {
            this.setData({
              total: '',
              table_width: window_width,
              report_title: [{ width: window_width, name: '没有查询到数据' }]
            })
            wx.hideLoading()
            return
          }
        }
        var a = this.data.records;
        var b = res.data.rows
        ++this.data.page
        if (!b.length) {
          wx.showToast({
            title: '没有更多数据了',
            icon: 'none'
          })
          return
        }
        this.setData({
          records: a.concat(b)
        })
        wx.hideLoading()
      }
    })
  },
  urlGetData: function (url) {
    var url = url.replace('auth/', '')
    return new Promise((resolve, reject) => {
      tss.query({
        url: PC.app_host + url,
        completion: res => {
          if (res.failed) {
            alert.error()
            completion && completion()
            reject()
            return
          }
          resolve(res.data)
        }
      })
    })
  }
})
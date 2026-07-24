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
    showpage: false,
    recordid: '',
    write: false,
    fix: false,
    userPartner: {},
    month: formatDate(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    typeList: [
      {
        id: 'apply',
        title: '新增',
        url: '../../../images/icon-add.png',
        selected_url: '../../../images/icon-add-selected.png'
      },
      {
        id: 'submit',
        title: '已提交',
        url: '../../../images/icon-submit.png',
        selected_url: '../../../images/icon-submit-selected.png'
      }
    ],
    typeSelectedId: 'apply',
    form: {},
    requiredCol: {},
    regCol: {},
    records: [],
    page: 1,
    define: [],
    timestamp: '',
    title: '',
    needAttach: '',
    disabled: false,
    cellList: [],
    cell_next_url: '',
    fileCol: {},
    color: getApp().globalData.btnColor || '#224b9b',
    groupField:'',
    groupData:{},
    showMonth:formatDate(new Date(), 'MM')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    if (!Object.keys(getApp().globalData.userPartner).length) {
      tss.query({
        url: tss.url('wxapi') + 'users',
        completion: res => {
          if (res.failed) {
            alert.error(res.errorMsg)
            completion && completion()
            return
          }
          getApp().globalData.userPartner = res.data
          this.setData({
            userPartner: res.data
          })
        }
      })
    }
    this.setData({
      recordid: options.recordid,
      write: options.write == 'false' ? false : true,
      fix: options.fix == 'false' ? false : true,
      typeSelectedId: options.write == 'false' ? 'submit' : 'apply',
      userPartner: getApp().globalData.userPartner
    })
    const _this = this
    const role_arr = user.roles ? user.roles.split(',') : [];
    this.getDefine(options.recordid)
      .then(function (res) {
        for (var i = 0; i < res.length; i++) {
          const item = res[i]
          if (item.defaultValue && item.defaultValue.indexOf('xxx') >= 0) {
            item.qhq = true
          }
          if(item.group){
            _this.setData({
              groupField:item.code,
              groupFieldname:item.label
            })
          }
          if (item.role1) {
            const before_readonly = item.readonly
            item.readonly = true
            var editrole_arr = item.role1.split(',')
            var temp_obj = {};
            var temp_arr = [];

            for (var j = 0; j < editrole_arr.length; j++) {
              temp_obj[editrole_arr[j]] = true;
            }
            for (var j = 0; j < role_arr.length; j++) {
              if (temp_obj[role_arr[j]]) {
                item.readonly = before_readonly;
                break;
              }
            }
          }
          if (item.role2) {
            const before_type = item.type
            item.type = 'hidden'
            var seerole_arr = item.role2.split(',')
            var temp_obj = {};
            var temp_arr = [];

            for (var j = 0; j < seerole_arr.length; j++) {
              temp_obj[seerole_arr[j]] = true;
            }
            for (var j = 0; j < role_arr.length; j++) {
              if (temp_obj[role_arr[j]]) {
                item.type = before_type;
                break;
              }
            }
          }
          if ((item.type == 'date' || item.type == 'datetime') && item.defaultValue) {
            var today = new Date();
            const day = item.defaultValue;
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
              today = item.defaultValue
            }

            item.defaultValue = formatDate(today, 'yyyy-MM-dd') + (item.type == "datetime" ? " 00:00:00" : "");
          }
          if (!item.option) {
            _this.data.form[item.code] = (item.defaultValue && !item.qhq) ? item.defaultValue : '';
          }
          if (item.nullable == 'true') {
            delete item.nullable;
          }
          if (item.nullable && !item.qhq) {
            _this.data.requiredCol[item.code] = item.label;
          }
          if (item.checkReg) {
            _this.data.regCol[item.code] = { value: item.checkReg, name: item.label, errorMsg: item.errorMsg };
          }
          if (item.type == 'file') {
            _this.data.fileCol[item.code] = item.label;
          }
          if (item.options) {
            item.options = item.options.codes.split('|')
            for (var j = 0; j < item.options.length; j++) {
              item.options[j] = { name: item.options[j] }
            }
          }
          if (item.jsonUrl) {
            _this.urlGetData(item.jsonUrl)
              .then(function (r) {
                item.options = r
                _this.setData({
                  define: res,
                  form: _this.data.form
                })
                wx.hideLoading()
              })
          }
          else if (i == res.length - 1) {
            _this.setData({
              define: res,
              form: _this.data.form
            })
            wx.hideLoading()
          }
        }
      })
    this.getItem()

    if (options.type) {
      this.setData({
        'form.type': options.type,
        'form.relation': options.relation,
        disabled: true
      })
    }
    lc.addListener(lc.event.refresh, this.__wxWebviewId__.toString(), res => {
      this.getItem()
    })

  },
  onUnload: function () {
    lc.removeListener(lc.event.refresh, this.__wxWebviewId__.toString())
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getItem()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    if (this.data.typeSelectedId != 'apply') {
      this.getItem(this.data.page)
    }
  },
  tabChange: function (e) {
    const key = e.target.dataset.type
    wx.showLoading({ title: '加载中' })
    this.setData({
      [key]: e.detail,
      page: 1,
      timestamp: ''
    })
    if (this.data.typeSelectedId != 'apply') {
      this.getItem()
    }
    else {
      wx.hideLoading();
      let month = formatDate(new Date().setDate(1), 'yyyy-MM-dd');
      this.setData({
        month: month,
        showMonth:month.substr(5,2),
        form: {},
        attachURLs: []
      })
    }
  },
  monthChange: function (e) {
    wx.showLoading({ title: '加载中' })
    this.setData({
      month: e.detail.value,
      page: 1
    })
    this.getItem()
  },
  pickerChange: function (e) {
    const field = e.target.dataset.field;
    const key = 'form.' + field;
    const index = e.target.dataset.index;
    const type = e.target.dataset.type;
    var value = e.detail.value;
    const getnext = e.target.dataset.getnext;
    if (type != 'date') {
      value = this.data.define[index].options[value] ? this.data.define[index].options[value].name : ''
    }
    this.setData({ [key]: value })
    if (getnext && value) {
      this.getnext(getnext, value)
    }
  },

  getnext: function (getnext, value) {
    const nextcol = getnext.split('(^')[1].split('^')[0];
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
        const define = _this.data.define
        for (var i = 0; i < define.length; i++) {
          if (define[i].code == nextcol) {
            define[i].options = r
            break;
          }
        }
        _this.setData({
          define: define,
          form: _this.data.form
        })
      })
  },

  chooseSezi: function (e) {
    // 用that取代this，防止不必要的情况发生
    var that = this;
    // 创建一个动画实例
    var animation = wx.createAnimation({
      // 动画持续时间
      duration: 500,
      // 定义动画效果，当前是匀速
      timingFunction: 'linear'
    })
    // 将该变量赋值给当前动画
    that.animation = animation
    // 先在y轴偏移，然后用step()完成一个动画
    animation.translateY(200).step()
    // 用setData改变当前动画
    that.setData({
      // 通过export()方法导出数据
      animationData: animation.export(),
      // 改变view里面的Wx：if
      showModal: true,
      cell_field: e.currentTarget.dataset.field,
      cellList: e.currentTarget.dataset.list,
      cell_select_value: this.data.form[e.currentTarget.dataset.field],
      cell_next_url: e.currentTarget.dataset.getnext || ''
    })
    // 设置setTimeout来改变y轴偏移量，实现有感觉的滑动
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export()
      })
    }, 100)
  },

  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'linear'
    })
    that.animation = animation
    animation.translateY(200).step()
    that.setData({
      animationData: animation.export()

    })
    setTimeout(function () {
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        showModal: false
      })
    }, 100)
  },

  clickCell: function (e) {
    const key = 'form.' + e.target.dataset.field;
    this.hideModal()
    this.setData({
      [key]: e.target.dataset.value
    })
    if (this.data.cell_next_url) { this.getnext(this.data.cell_next_url, e.target.dataset.value) }
  },
  fieldChange: function (e) {
    const field = e.target.dataset.field;
    this.data.form[field] = e.detail.detail.value;
  },

  submit: function (e) {
    const tid = this.data.timestamp ? { _tempID: this.data.timestamp } : {};
    wx.showLoading({ title: '正在提交' })
    const tbName = this.data.recordid
    const formData = Object.assign(this.data.form, e.detail.value)
    for (var key in formData) {
      if (key in this.data.regCol && !RegExp(this.data.regCol[key].value).test(formData[key])) {
        alert.notice(this.data.regCol[key].name + '中' + (this.data.regCol[key].errorMsg || '输入值不合法'))
        wx.hideLoading()
        return
      }
      if (key in this.data.fileCol && formData[key].length) {
        var content = [];
        for (var i = 0; i < formData[key].length; i++) {
          content.push(formData[key][i].name + '#' + formData[key][i].id)
        }
        formData[key] = content.join(',')
      }
      if (!formData[key] && key in this.data.requiredCol) {
        alert.notice(this.data.requiredCol[key] + '不能为空')
        wx.hideLoading()
        return
      }
      else if (!formData[key] || key == 'id') {
        delete formData[key]
      }
    }
    tss.save({
      url: tss.url('xdata') + tbName,
      params: Object.assign(formData, tid),
      completion: res => {
        wx.hideLoading()
        if (res.failed) {
          alert.error(res.errorMsg)
          return
        }
        wx.showLoading({ title: '加载中' })
        this.getItem()
        this.setData({

          typeSelectedId: 'submit'
        });
      }
    })

  },
  getItem: function (page) {
    const month = this.data.month
    const _month = formatDate(new Date(month.substr(0, 4), month.substr(5, 2), 0), 'yyyy-MM-dd')
    const tbName = this.data.recordid
    const time_param = '[' + month + ',' + _month + ' 23:59:59]';
    if (!page || page == 1) {
      this.setData({
        page: page || 1,
        records: [],
        groupData: {}
      })
      let gf = this.data.groupField;
      if(gf){
        tss.query({
          url:tss.recordURLs(tbName).QUERY,
          params:{fields:'sum(' + gf + ') as ' + gf,createtime:time_param},
          completion:res => {
            if(res.data && res.data[0]){
              this.setData({groupData : res.data[0]})
            }
          }
        })
      }
    }

    let param = {};
    tss.query({
      url: tss.recordURLs(tbName).QUERY,
      params: {
        page: this.data.page,
        rows: 10,
        createtime: time_param
      },
      completion: res => {
        if (res.failed) {
          alert.error(res.errorMsg)
          completion && completion()
          return
        }
        wx.hideLoading()
        let a = this.data.records, b = [];
        b = res.data.rows
        ++this.data.page
        console.log(b)
        if (!b.length && this.data.page > 2) {
          wx.showToast({
            title: '没有更多数据了',
            icon: 'none'
          })
          return
        }
        this.setData({
          records: a.concat(b)
        })
      }
    })
  },
  didSelectRow: function (e) {
    const itemid = e.currentTarget.dataset.itemid
    const disabled = (e.currentTarget.dataset.creator == user.uName || this.data.fix > 0) ? false : true;
    getApp().globalData.wf_define = this.data.define;
    wx.navigateTo({
      url: `../add/index?needattach=${this.data.needAttach}&itemid=${itemid}&recordid=${this.data.recordid}&disabled=${disabled}&title=${this.data.title}`,
    })
  },
  addattach: function (e) {
    this.data.timestamp = e.detail._tempID
    const col = e.currentTarget.dataset.col;
    if (col) {
      var list = e.detail.attachURLs;
      this.data.form[col] = list;
    }
  },
  delattach: function (e) {
    const col = e.currentTarget.dataset.col;
    if (col) {
      var list = e.detail.attachURLs;
      this.data.form[col] = list;
    }
  },
  getDefine: function (recordid) {
    return new Promise((resolve, reject) => {
      tss.getJSON({
        url: tss.url('xdata') + 'define/' + recordid,
        completion: res => {
          if (res.failed) {
            alert.error()
            completion && completion()
            reject()
            return
          }
          wx.setNavigationBarTitle({
            title: res.data[5]
          })
          this.setData({
            needAttach: res.data[3],
            showpage: true,
            title: res.data[5]
          })
          resolve(res.data[0])
        }
      })
    })
  },
  urlGetData: function (url) {
    var url = url.replace('auth/', '')
    return new Promise((resolve, reject) => {
      tss.query({
        url: PC.app_host + url,
        completion: res => {
          console.log(res)
          if (res.failed) {
            alert.error(res.errorMsg || '')
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
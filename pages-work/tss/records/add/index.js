const lc = require('../../../../utils/listenerCenter.js')
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
import user from '../../../../utils/user.js'
import PC from '../../../../project.config.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showpage: false,
    needAttach: '',
    itemid: '',
    recordid: '',
    disabled: true,
    define: [],
    attachURLs: [],
    requiredCol: {},
    regCol: {},
    cellList: [],
    cell_next_url: '',
    title: '',
    fileCol: {},
    color: getApp().globalData.btnColor || '#224b9b'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      needAttach: options.needattach == '0' ? false : true,
      itemid: options.itemid,
      recordid: options.recordid,
      disabled: options.disabled == 'false' ? false : true,
      define: getApp().globalData.wf_define,
      title: options.title + '详情'
    })
    wx.setNavigationBarTitle({
      title: options.title + '详情'
    })
    for (var i = 0; i < this.data.define.length; i++) {
      const item = this.data.define[i]
      if (item.nullable) {
        this.data.requiredCol[item.code] = item.label;
      }
      if (item.checkReg) {
        this.data.regCol[item.code] = { value: item.checkReg, name: item.label, errorMsg: item.errorMsg };
      }
      if (item.type == 'file') {
        this.data.fileCol[item.code] = item.label;
      }
    }
    tss.get({
      url: tss.recordURLs(options.recordid).GET,
      itemId: options.itemid,
      completion: res => {
        if (res.failed) {
          alert.error()
          completion && completion()
          return
        }
        var _urls = [];
        for (var i = 0; i < res.data.attachList.length; i++) {
          const item = res.data.attachList[i]
          _urls.push({ url: tss.url('download') + `${item.id}?uName=${user.uName}&uToken=${user.uToken}`, type: item.type, name: item.name, id: item.id })
        }
        for (var key in res.data) {
          if (this.data.fileCol[key]) {
            var content = res.data[key];
            var content_urls = [];
            if (content) {
              for (var i = 0; i < content.split(',').length; i++) {
                var item = content.split(',')[i].split('#');
                content_urls.push({ url: tss.url('download') + item[item.length - 1] + `?uName=${user.uName}&uToken=${user.uToken}`, type: 1, name: item[i], id: item[item.length - 1] })
              }
            }
            res.data[key] = content_urls;
          }
        }
        this.setData({
          attachURLs: _urls,
          form: res.data,
          showpage: true
        })
        wx.hideLoading()
      }
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
      value = this.data.define[index].options[value].name
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
      else if (!formData[key]) {
        delete formData[key]
      }
    }
    tss.save({
      url: tss.url('xdata') + tbName,
      params: formData,
      completion: res => {
        wx.hideLoading()
        if (res.failed) {
          alert.error(res.errorMsg)
          return
        }
        lc.emitEvent(lc.event.refresh)
        wx.navigateBack()
      }
    })

  },
  delete: function (e) {
    alert.notice('是否确认删除该条数据？', {
      text: '是', handler: () => {
        tss.del({
          url: tss.recordURLs(this.data.recordid).DELETE,
          itemId: this.data.form.id,
          completion: function (res) {
            wx.hideLoading()
            if (res.failed) {
              alert.error(res.errorMsg)
              return
            }
            lc.emitEvent(lc.event.refresh)
            wx.navigateBack()
          }
        })
      }
    }, { text: '否', handler: () => { return } })

  },
  urlGetData: function (url) {
    var url = url.replace('auth/', '')
    return new Promise((resolve, reject) => {
      tss.query({
        url: PC.app_host + url,
        completion: res => {
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
  },
  addattach: function (e) {
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
  }
})
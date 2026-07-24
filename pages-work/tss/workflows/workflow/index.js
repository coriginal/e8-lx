const lc = require('../../../../utils/listenerCenter.js')
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')

import {
  formatDate
} from '../../../../utils/util.js'
import user from '../../../../utils/user.js'
const PC = getApp().globalData

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showpage: false,
    attachURLs: [],
    month: formatDate(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
    typeList: [],
    typeSelectedId: 'apply', //'approval',
    statusList: [{
        id: 'wait',
        title: '待审批'
      },
      {
        id: 'done',
        title: '已审批'
      },
      {
        id: 'copyto',
        title: '抄送我'
      }
    ],
    statusSelectedId: 'wait',
    form: {},
    requiredCol: {},
    //requiredCol: { type: '费用类型', reason: '申请事由', expect_inday: '期望付款日期', money: '金额'},
    regCol: {},
    feeTypes: [],
    records: [],
    records_cpy: [],
    disabled: '',
    page: 1,
    approverList: [],
    copytoList: [],
    hidden: false,
    hideIconTab: false,
    recordid: '',
    define: [],
    itemid: '',
    timestamp: '',
    title: '',
    cellList: [],
    cell_next_url: '',
    fileCol: {},
    color: getApp().globalData.btnColor || '#224b9b',
    searchContent: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (options.wfingCount && options.wfingCount > 0) {
      this.setData({
        typeSelectedId: 'approval'
      })
    }
    this.setData({
      recordid: options.recordid
    })
    const _this = this
    this.getDefine(this.data.recordid)
      .then(function (res) {
        for (var i = 0; i < res.length; i++) {
          const item = res[i]
          if (item.defaultValue && item.defaultValue.indexOf('xxx') >= 0) {
            item.qhq = true
          }
          if (item.code.indexOf('wf_') == 0) {
            item.wfeditable = true
          }
          if ((item.type == 'date' || item.type == 'datetime') && item.defaultValue) {
            var today = new Date();
            const day = item.defaultValue;
            if ((/today[\s]*-/gi).test(day)) {
              var delta = parseInt(day.split("-")[1]);
              today.setDate(today.getDate() - delta);
            } else if ((/today[\s]*\+/gi).test(day)) {
              var delta = parseInt(day.split("+")[1]);
              today.setDate(today.getDate() + delta);
            } else if ('cur_year_01' == day) {
              today = new Date(today.getYear() + 1900, 0, 1)
            } else if ('cur_month_01' == day) {
              today = new Date(today.getYear() + 1900, today.getMonth(), 1)
            } else if ('cur_week_01' == day) {
              var weekday = today.getDay() || 7; //获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
              today.setDate(today.getDate() - weekday + 1)
            } else {
              today = item.defaultValue
            }
            item.defaultValue = formatDate(new Date(today), 'yyyy-MM-dd') + (item.type == "datetime" ? " 00:00:00" : "");
          }
          if (!item.option) {
            _this.data.form[item.code] = (item.defaultValue && !item.qhq) ? item.defaultValue : '';
          }
          if (item.nullable == 'true') {
            delete item.nullable;
          }
          if (item.nullable && !item.wfeditable && !item.qhq) {
            _this.data.requiredCol[item.code] = item.label;
          }
          if (item.checkReg) {
            _this.data.regCol[item.code] = {
              value: item.checkReg,
              name: item.label,
              errorMsg: item.errorMsg
            };
          }
          if (item.type == 'file') {
            _this.data.fileCol[item.code] = item.label;
          }
          if (item.options) {
            item.options = item.options.codes.split('|')
            for (var j = 0; j < item.options.length; j++) {
              item.options[j] = {
                name: item.options[j]
              }
            }
          }
          if (item.jsonUrl) {
            _this.urlGetData(item.jsonUrl)
              .then(function (r) {
                item.options = r
                _this.setData({
                  showpage: true,
                  define: res,
                  form: _this.data.form
                })
                wx.hideLoading()
                wx.setNavigationBarTitle({
                  title: _this.data.title
                })
              })
          } else if (i == res.length - 1) {
            _this.setData({
              showpage: true,
              define: res,
              form: _this.data.form
            })
            wx.hideLoading()
            wx.setNavigationBarTitle({
              title: _this.data.title
            })
          }
        }
      })

    if (options.hideIconTab) {
      this.getData(options.itemid)
      this.setData({
        itemid: options.itemid,
        hideIconTab: true
      })
    }
    const _url = '../../../images/';
    this.setData({
      typeList: [{
          id: 'apply',
          title: '申请',
          url: _url + 'icon-add.png',
          selected_url: _url + 'icon-add-selected.png'
        },
        {
          id: 'submit',
          title: '已提交',
          url: _url + 'icon-submit.png',
          selected_url: _url + 'icon-submit-selected.png'
        },
        {
          id: 'approval',
          title: '我审批的',
          url: _url + 'icon-approval.png',
          selected_url: _url + 'icon-approval-selected.png'
        }
      ]
    })
    if (this.data.recordid == 122) {
      this.getSpOrderFeeList();
    } else {
      this.getItem()
    }

    if (options.type) {
      this.setData({
        'form.type': options.type,
        'form.relation': options.relation,
        disabled: true
      })
    }

    lc.addListener(lc.event.refresh, this.__wxWebviewId__.toString(), res => {
      if (res) {
        const list = res.type == 'appr' ? 'approverList' : 'copytoList';
        this.data[list].push({
          name: res.name,
          phone: res.phone
        })
        this.setData({
          [list]: this.data[list]
        })
        if (this.data.approverList.length > 2) {
          this.setData({
            hidden: true
          })
        }
      } else {
        this.data.recordid == 122 ? this.getSpOrderFeeList() : this.getItem()
      }
    })
  },

  onUnload: function () {
    lc.removeListener(lc.event.refresh, this.__wxWebviewId__.toString())
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.data.recordid == 122 ? this.getSpOrderFeeList() : this.getItem()
    wx.stopPullDownRefresh()
  },

  onReachBottom: function () {
    if (this.data.typeSelectedId != 'apply') {
      this.data.recordid == 122 ? this.getSpOrderFeeList(this.data.page) : this.getItem(this.data.page)
    }
  },
  getData: function (id) {
    const tbName = this.data.recordid
    tss.get({
      url: tss.recordURLs(tbName).GET,
      itemId: id,
      completion: res => {
        if (res.failed) {
          alert.error()
          return
        }
        var _urls = [];
        for (var i = 0; i < res.data.attachList.length; i++) {
          const item = res.data.attachList[i];
          const url = tss.url('download') + `${item.id}?uName=${user.uName}&uToken=${user.uToken}`;
          _urls.push({
            url: url,
            type: item.type,
            name: item.name,
            id: item.id
          })
        }
        for (var key in res.data) {
          if (this.data.fileCol[key]) {
            var content = res.data[key];
            var content_urls = [];
            if (content) {
              for (var i = 0; i < content.split(',').length; i++) {
                var item = content.split(',')[i].split('#');
                content_urls.push({
                  url: tss.url('download') + item[item.length - 1] + `?uName=${user.uName}&uToken=${user.uToken}`,
                  type: 1,
                  name: item[i],
                  id: item[item.length - 1]
                })
              }
            }
            res.data[key] = content_urls;
          }
        }
        this.setData({
          attachURLs: _urls,
          form: res.data
        })
      }
    })
  },
  tabChange: function (e) {
    const key = e.target.dataset.type
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.setData({
      [key]: e.detail,
      page: 1,
      searchContent: ''
    })
    console.log(this.data.records)
    console.log(this.data.typeSelectedId)
    if (this.data.typeSelectedId != 'apply') {
      this.data.recordid == 122 ? this.getSpOrderFeeList() : this.getItem()
    } else {
      wx.hideLoading();
      this.setData({
        month: formatDate(new Date(new Date().setDate(1)), 'yyyy-MM-dd'),
        form: {},
        attachURLs: [],
        timestamp: '',
        itemid: ''
      })
    }
  },
  getSearchContent(e) {
    console.log(e)
    this.setData({
      searchContent: e.detail.value
    })
    if (e.detail.value == "") {
      if (this.data.recordid == 122) {
        this.setData({
          page: 1
        }, () => {
          this.getSpOrderFeeList()
        })
        return
      }
      this.setData({
        records: this.data.records_cpy
      })
    }
  },
  //F220921041
  //F220901023
  //2022092102
  search() {

    if (this.data.recordid == 122) {
      this.setData({
        page: 1,
      }, () => {
        this.getSpOrderFeeList()
      })
      return
    }
    var {
      searchContent,
      records
    } = this.data, res;
    console.log(searchContent)
    if (searchContent == '') {
      return
    }
    records = records.filter((item) => {
      return item.code == searchContent || item.origin_code == searchContent || item.creatorName == searchContent || String(item.settle_account || '').includes(searchContent)
    });
    this.setData({
      records
    })
  },
  monthChange: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    this.setData({
      month: e.detail.value,
      page: 1
    })
    this.data.recordid == 122 ? this.getSpOrderFeeList() : this.getItem()
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
    this.setData({
      [key]: value
    })
    if (getnext) {
      this.getNext(getnext, value)
    }
  },
  getNext: function (getnext, value) {
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
      cell_select_value: this.data.form[e.currentTarget.dataset.field] || '',
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
    if (this.data.cell_next_url) {
      this.getNext(this.data.cell_next_url, e.target.dataset.value)
    }
  },
  fieldChange: function (e) {
    const field = e.target.dataset.field;
    this.data.form[field] = e.detail.detail.value;
  },
  submit: function (e) {
    var draft_obj = e.detail.target.dataset.draft ? {
      saveDraft: true
    } : {};
    const tid = this.data.itemid ? {
      id: this.data.itemid
    } : this.data.timestamp ? {
      _tempID: this.data.timestamp
    } : {};
    wx.showLoading({
      title: '正在提交',
      mask: true
    })
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
      } else if (!formData[key]) {
        delete formData[key]
      }
    }
    tss.save({
      url: tss.url('xdata') + tbName,
      params: Object.assign(formData, tid, draft_obj),
      completion: res => {
        wx.hideLoading()
        if (res.failed) {
          alert.error(res.errorMsg)
          return
        }
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        this.data.recordid == 122 ? this.getSpOrderFeeList() : this.getItem()
        this.setData({
          typeSelectedId: 'submit'
        });
      }
    })

  },
  //订单费用报销专用
  getSpOrderFeeList(page) {
    if (!page || page == 1) {
      this.setData({
        page: page || 1,
        records: []
      })
    }
    const month = this.data.month
    const _month = formatDate(new Date(month.substr(0, 4), month.substr(5, 2), 0), 'yyyy-MM-dd')
    const tbName = this.data.recordid
    let param = {};
    const type = this.data.typeSelectedId;
    const status = this.data.statusSelectedId;
    if (type == 'approval') {
      const p = status == 'wait' ? {
        my_wait: true
      } : status == 'done' ? {
        my_approved: true
      } : {
        my_cc: true
      }
      const c = status == 'wait' ? {} : {
        createtime: month + ',' + _month + ' 23:59:59'
      };
      console.log(user)
      param = Object.assign(p, c);
      console.log(tss.recordURLs(tbName).QUERY)
    } else {
      param = {
        createtime: month + ',' + _month + ' 23:59:59',
        //creator: user.uName
        my_applier: true
      };
    }
    tss.query({
      url: tss.url('') + '/api/data/sql/tms_sp_order_fee',
      params: Object.assign({
          page: page || 1,
          rows: 10,
          //showAttach: false
          search_content: this.data.searchContent
        },
        param),
      completion: res => {
        if (res.failed) {
          alert.error(res.errorMsg)
          completion && completion()
          return
        }
        wx.hideLoading()
        let a = this.data.records,
          b = [];
        b = res.data.rows
          ++this.data.page
        if (!b.length && this.data.page > 2) {
          wx.showToast({
            title: '没有更多数据了',
            icon: 'none'
          })
          return
        }
        this.setData({
          records: a.concat(b),
          records_cpy: [...a.concat(b)]
        })
      }
    })
  },
  getItem: function (page) {
    if (!page || page == 1) {
      this.setData({
        page: page || 1,
        records: []
      })
    }
    const month = this.data.month
    const _month = formatDate(new Date(month.substr(0, 4), month.substr(5, 2), 0), 'yyyy-MM-dd')
    const tbName = this.data.recordid
    let param = {};
    const type = this.data.typeSelectedId;
    const status = this.data.statusSelectedId;
    if (type == 'approval') {
      const p = status == 'wait' ? {
        wfing: 'true'
      } : status == 'done' ? {
        wfdone: 'true'
      } : {
        wfcc: 'true'
      }
      const c = status == 'wait' ? {} : {
        createtime: '[' + month + ',' + _month + ' 23:59:59]'
      };
      console.log(user)
      param = Object.assign({
        my_wf_list: user.uName
      }, p, c);
      console.log(tss.recordURLs(tbName).QUERY)
    } else {
      param = {
        createtime: '[' + month + ',' + _month + ' 23:59:59]',
        creator: user.uName
      };
    }
    console.log(Object.assign({
      page: page || 1,
      rows: 10,
      showAttach: true
    }, param))
    tss.query({
      url: tss.recordURLs(tbName).QUERY,
      params: Object.assign({
          page: page || 1,
          rows: 10,
          showAttach: false
        },
        param),
      completion: res => {
        if (res.failed) {
          alert.error(res.errorMsg)
          completion && completion()
          return
        }
        wx.hideLoading()
        let a = this.data.records,
          b = [];
        b = res.data.rows
          ++this.data.page
        if (!b.length && this.data.page > 2) {
          wx.showToast({
            title: '没有更多数据了',
            icon: 'none'
          })
          return
        }
        this.setData({
          records: a.concat(b),
          records_cpy: [...a.concat(b)]
        })
      }
    })
  },
  didSelectRow: function (e) {
    const a = this.data.records[e.currentTarget.dataset.index]
    getApp().globalData.wf_define = this.data.define;
    if (a.wfstatus) {
      var url = `../approve/index?recordid=${this.data.recordid}&id=${a.id}&type=${this.data.typeSelectedId}&wfstatus=${a.wfstatus}&mystatus=${this.data.statusSelectedId}&title=${this.data.title}`
      wx.navigateTo({
        url: url
      })
    } else {
      var _urls = [];
      if (a.fileIds) {
        for (var i = 0; i < a.fileIds.split(',').length; i++) {
          const id = a.fileIds.split(',')[i];
          const url = tss.url('download') + `${id}?uName=${user.uName}&uToken=${user.uToken}`;
          _urls.push({
            url: url,
            type: 1,
            name: '',
            id: id
          })
        }
      }
      for (var key in a) {
        if (this.data.fileCol[key]) {
          var content = a[key];
          var content_urls = [];
          if (content) {
            var b = content.split('&nbsp&nbsp');
            if (b.length) {
              for (var i = 0; i < b.length - 1; i++) {
                var name = b[i].split('>')[1].split('<')[0];
                var id = a[key + '_ids'].split(',')[i];
                content_urls.push({
                  url: tss.url('download') + id + `?uName=${user.uName}&uToken=${user.uToken}`,
                  type: 1,
                  name: name,
                  id: id
                })
              }
            }
          }
          a[key] = content_urls;
        }
      }
      this.setData({
        itemid: a.id,
        form: a,
        typeSelectedId: 'apply',
        attachURLs: _urls
      })
    }
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
          this.data.title = res.data[5]
          resolve(res.data[0])
        }
      })
    })
  },
  urlGetData: function (url) {
    var url = url.replace('auth/', '')
    return new Promise((resolve, reject) => {
      console.log(PC + url)
      tss.query({
        url: PC.app_host + url,
        completion: res => {
          console.log(res)
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
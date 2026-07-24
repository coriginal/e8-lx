import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')
const _App = getApp().globalData
import list from './frame.js'

// 客户录单页面

Page({

  /**
   * 页面的初始数据
   */
  data: {
    _volume: {},
    old_info: [],
    old_volume: 0,
    volumeList: [],
    v_list_value: {
      long: '',
      width: '',
      height: '',
      amount: '',
      volume: ''
    },
    cargo_tag_list: [{
      text: '日常用品',
      value: '日常用品'
    }, {
      text: '数码产品',
      value: '数码产品'
    }, {
      text: '服装鞋帽',
      value: '服装鞋帽'
    }, {
      text: '家具家电',
      value: '家具家电'
    }, {
      text: '文件资料',
      value: '文件资料'
    }, {
      text: '食品酒水',
      value: '食品酒水'
    }, {
      text: '五金建材',
      value: '五金建材'
    }, {
      text: '行李包裹',
      value: '行李包裹'
    }, {
      text: '其他',
      value: 'other'
    }],
    tagCargo: '',
    tagActive: '',
    showOtherCargoInput: false,
    init: {
      amount: 1,
      weight: 1
    },
    // D1005 物品选择
    customerCargoList: [],
    filteredCargoList: [],
    showCargoPopup: false,
    searchCargoValue: ''
  },
  isD1005: _App.user?.domain === 'D1005',
  unit: _App.DomainConfig.weight_unit?.content === 't' ? 1000 : 1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {
      index
    } = options
    console.log(options)
    let cargo = JSON.parse(options.data || [])[Number(index)]?.cargo || ''
    this.setData({
      form: JSON.parse(options.data || [])[Number(index)] || {
        weight: '1',
        amount: '1',
        ...((options.defaultVolume == 'true' && _App.DomainConfig.wx_carogo_default_volume?.content == 'true') ? {
          volume: '0.01'
        } : {})
      },
      'init.weight': String(JSON.parse(options.data || [])[Number(index)]?.weight || '1'),
      'init.amount': String(JSON.parse(options.data || [])[Number(index)]?.amount || '1'),
      'init.unit_weight': String(JSON.parse(options.data || [])[Number(index)]?.unit_weight || '1'),
      'init.unit_volume': String(JSON.parse(options.data || [])[Number(index)]?.unit_volume || ''),
      'init.sudf1': String(JSON.parse(options.data)[Number(index)]?.sudf1 || ''),
      list: list(),
      type: options.type || 'cargo',
      old_info: JSON.parse(options.data || []) || [],
      cur_index: Number(index),
      choosePackIdx: JSON.parse(options.data || [])[Number(index)] && JSON.parse(options.data || [])[Number(index)]['choosePackIdx'],
      tagActive: cargo ? (this.data.cargo_tag_list.findIndex(item => item.value === cargo) != -1 ? cargo : 'other') : 'other',
      showOtherCargoInput: this.data.cargo_tag_list.findIndex(item => item.value === cargo) != -1 ? false : (cargo == '' ? true : true),
      tagCargo: this.data.cargo_tag_list.findIndex(item => item.value === cargo) != -1 ? '' : cargo,
    })
    // D1005: 如果存在客户信息则获取物品列表
    if (this.isD1005) {
      const customerId = _App.customerInfo?.id;
      //if (customerId) {
      this.fetchCustomerCargo(options.customerId || customerId);
      //}
    }
  },
  // D1005: 获取客户物品列表
  fetchCustomerCargo(customerId) {
    const that = this;
    tss.getJSON({
      url: tss.url('sql') + 'customer_cargo',
      params: {
        customer_id: customerId,
        type: 'all'
      },
      completion: (res) => {
        if (!res.failed) {
          that.setData({
            customerCargoList: res.data || [],
            filteredCargoList: res.data || []
          });
        }
      }
    });
  },
  // D1005: 打开物品选择弹窗
  openCargoPopup() {
    const customerId = _App.customerInfo?.id;
    // 如果列表为空则重新获取
    if (customerId && this.data.customerCargoList.length === 0) {
      this.fetchCustomerCargo(customerId);
    }
    this.setData({
      showCargoPopup: true,
      searchCargoValue: '',
      filteredCargoList: this.data.customerCargoList
    });
  },
  // D1005: 关闭物品选择弹窗
  closeCargoPopup() {
    this.setData({
      showCargoPopup: false
    });
  },
  // D1005: 搜索物品
  onCargoSearch(e) {
    const searchVal = typeof e.detail === 'string' ? e.detail : (e.detail && e.detail.value) || '';
    const keyword = searchVal.toLowerCase();
    const {
      customerCargoList
    } = this.data;
    const filtered = customerCargoList.filter(item =>
      (item.cargo || '').toLowerCase().includes(keyword)
    );
    this.setData({
      searchCargoValue: searchVal,
      filteredCargoList: filtered
    });
  },
  // D1005: 选择物品
  selectCargo(e) {
    const item = e.currentTarget.dataset.item;
    const updates = {
      'form.cargo': item.cargo || '',
      showCargoPopup: false
    };
    // udf4 是单件重量，udf5 是单件体积
    if (item.udf4 || item.udf5) {
      if (item.udf4) {
        updates['form.unit_weight'] = item.udf4;
        updates['init.unit_weight'] = item.udf4;
      }
      if (item.udf5) {
        updates['form.unit_volume'] = item.udf5;
        updates['init.unit_volume'] = item.udf5;
      }
      // 如果件数已填写，自动计算重量 = 件数 × 单件重量，体积 = 件数 × 单件体积
      const amount = Number(this.data.form.amount || 0);
      if (amount > 0) {
        const unitWeight = Number(item.udf4 || 0);
        const unitVolume = Number(item.udf5 || 0);
        if (unitWeight > 0) {
          const calcWeight = (amount * unitWeight / this.unit).toFixed(3);
          updates['form.weight'] = calcWeight;
          updates['init.weight'] = calcWeight;
        }
        if (unitVolume >= 0) {
          updates['form.volume'] = (amount * unitVolume).toFixed(3);
        }
      }
    }
    this.setData(updates);
  },
  removeVolumeItem(e) {
    let index = e.currentTarget.dataset.index
    let {
      volumeList
    } = this.data
    volumeList.splice(index, 1)
    if (volumeList.length) {
      let volume = volumeList.reduce((a, b) => {
        a += Number(b.volume * 1000);
        return a
      }, 0)
      this.setData({
        'form.volume': (volume / 1000).toFixed(3)
      })
    } else {
      this.setData({
        'form.volume': ''
      })
    }
    this.setData({
      volumeList
    })
  },
  tagCargoChange(e) {
    console.log(e)
    this.setData({
      'form.cargo': e.detail
    })
  },
  chooseCargoTag(e) {
    console.log(e)
    if (e.currentTarget.dataset.cargo.value === 'other') {
      this.setData({
        'form.cargo': '',
        showOtherCargoInput: true,
        tagActive: 'other'
      })
      return
    }
    this.setData({
      'form.cargo': e.currentTarget.dataset.cargo.value,
      showOtherCargoInput: false,
      tagCargo: '',
      tagActive: e.currentTarget.dataset.cargo.value
    })
  },
  addVolumeItem(e) {
    let {
      long,
      width,
      height,
      c_amount,
      volume
    } = this.data.v_list_value
    let {
      volumeList
    } = this.data
    if (long && width && height && c_amount && volume) {
      volumeList.push({
        long,
        width,
        height,
        c_amount,
        volume
      })
      if (volumeList.length) {
        let volume = volumeList.reduce((a, b) => {
          a += Number(b.volume * 1000);
          return a
        }, 0);
        this.setData({
          'form.volume': (volume / 1000).toFixed(3)
        })
        if (getApp().globalData.DomainConfig.auto_specs && getApp().globalData.DomainConfig.auto_specs.content == "1") {
          let specs = [];
          console.log(volumeList)
          volumeList.forEach((item) => {
            specs.push(item.long + "*" + item.width + "*" + item.height + "*" + item.c_amount)
          })
          this.setData({
            'form.specs': specs.join('+')
          })
        }
      }
      this.setData({
        volumeList,
        v_list_value: {
          long: '',
          width: '',
          height: '',
          c_amount: '',
          volume: ''
        }
      })
    }
  },
  computedListVolume(e) {
    let {
      name
    } = e.currentTarget.dataset
    if (name == 'amount') {
      if (e.detail.value == '') {
        this.setData({
          [`v_list_value.${name}`]: '',
          "v_list_value.volume": 0
        })
        return
      }
      if (e.detail.value <= 0) {
        wx.showModal({
          title: '提示',
          content: '至少为1件',
          showCancel: false
        })
        this.setData({
          [`v_list_value.${name}`]: 1
        })
        return
      }
    } else {
      if (e.detail.value == '') {
        return
      }
    }
    this.setData({
      [`v_list_value.${name}`]: Number(e.detail.value)
    })
    console.log(this.data.v_list_value)
    let {
      long,
      width,
      height,
      c_amount
    } = this.data.v_list_value
    if (long && width && height && c_amount) {
      this.setData({
        "v_list_value.volume": ((long * width * height * c_amount) / 1000000).toFixed(3)
      })
    }

  },
  stepperChange(event) {
    const {
      name
    } = event.currentTarget.dataset;
    const value = String(event.detail);
    this.setData({
      [`form.${name}`]: value
    });
    // D1005: 件数、单件重量或单件体积改变时自动计算
    if (this.isD1005 && (name === 'amount' || name === 'unit_weight' || name === 'unit_volume')) {
      // setData 是异步的，用 value 获取当前改变的字段的新值
      const amount = Number(name === 'amount' ? value : this.data.form.amount || 0);
      const unitWeight = Number(name === 'unit_weight' ? value : this.data.form.unit_weight || 0);
      const unitVolume = Number(name === 'unit_volume' ? value : this.data.form.unit_volume || 0);
      const updates = {};
      // 件数或单件重量改变 → 计算重量
      if (amount > 0 && unitWeight > 0) {
        updates['form.weight'] = (amount * unitWeight / this.unit).toFixed(3);
        updates['init.weight'] = (amount * unitWeight / this.unit).toFixed(3);
      }
      // 件数或单件体积改变 → 计算体积
      if (amount > 0 && unitVolume >= 0) {
        updates['form.volume'] = (amount * unitVolume).toFixed(3);
      }
      if (Object.keys(updates).length > 0) {
        this.setData(updates);
      }
    }
  },
  formSubmit(e) {
    console.log(e)
    delete e.detail.value['weight'];
    delete e.detail.value['amount'];
    let form = {
      ...this.data.form,
      ...e.detail.value
    };
    console.log(form)
    for (let key in form) {
      form[key] = form[key]?.trim() || ""
    }
    let message = [form.cargo || '', form.amount ? `${form.amount}件` : '', form.weight ? `${form.weight}${getApp().globalData.DomainConfig.weight_unit?.content || "kg"}` : '', form.volume ? `${form.volume}m³` : '', form.specs ? `规格${form.specs}` : '', form.pack].filter(i => i).join(' ')
    var {
      cur_index,
      old_info,
      choosePackIdx
    } = this.data, new_info = []
    old_info[cur_index] = {
      ...form,
      choosePackIdx,
      message
    }
    new_info = [...old_info]
    // return 
    lc.emitEvent('orderInfo', {
      type: this.data.type,
      data: old_info
    })
    wx.navigateBack()
  },
  goComputed(e) {
    if (e.currentTarget.dataset.type === "navigate")
      wx.navigateTo({
        url: '../order_cargo_computed/order_cargo_computed',
      })
  },
  // 计算体积
  getVolumes(e) {
    this.judgeNumber(e, true)
    // const { id } = e.currentTarget
    // this.data._volume[id] = e.detail.value
    if (Object.values(this.data._volume).filter(x => x).length >= 3) {
      let [a, b, c] = Object.values(this.data._volume)
      this.setData({
        "form.volume": (((a * b * c) * (this.data['form']['3'] || 1)) / 1000000).toFixed(3),
        old_volume: (((a * b * c) * (this.data['form']['3'] || 1)) / 1000000).toFixed(3)
      })
    }
  },
  choosePack(e) {
    const {
      id: choosePackIdx
    } = e.currentTarget
    const {
      pack
    } = e.currentTarget.dataset
    this.setData({
      choosePackIdx,
      "form.pack": pack
    })
  },
  judgeNumber(event, if_volume) {
    console.log(event.detail)
    if (typeof event.detail != 'object') {
      event.detail = {
        value: String(event.detail)
      }
    }
    var _event$detail = event.detail,
      detail = _event$detail === undefined ? {} : _event$detail;
    var _detail$value = detail.value,
      value = _detail$value === undefined ? '' : _detail$value;
    var index1 = value.indexOf('.');
    var index2 = value.indexOf('.', index1 + 1);
    if (index2 > -1) {
      value = value.substr(0, index2)
    }
    if (if_volume) {
      var key = "_volume." + event.currentTarget.dataset.name;
      var key1 = "form." + event.currentTarget.dataset.index;
      this.setData({
        [key]: value,
        [key1]: value
      })
      if (key1 == "form.3") {
        this.setData({
          "form.volume": (this.data.old_volume * (value || 1)).toFixed(3)
        })
      }
    } else {
      var key = "form." + event.currentTarget.dataset.name;
      this.setData({
        [key]: value
      })
    }
  },
  blurJudgeNumber: function (event, if_volume) {
    if (typeof event.detail != 'object') {
      event.detail = {
        value: String(event.detail)
      }
    }
    var _event$detail = event.detail,
      detail = _event$detail === undefined ? {} : _event$detail;
    var _detail$value = detail.value,
      value = _detail$value === undefined ? '' : String(_detail$value);
    var index1 = value.indexOf('.');
    if (index1 > -1 && index1 + 1 == value.length) {
      value = value + '0'
    }

    if (if_volume) {
      var key = "_volume." + event.currentTarget.dataset.name;
      var key1 = "form." + event.currentTarget.dataset.index;
      this.setData({
        [key]: value,
        [key1]: value
      })
      if (key1 == "form.3") {
        this.setData({
          "form.volume": (this.data.old_volume * (value || 1)).toFixed(3)
        })
      }
    } else {
      var key = "form." + event.currentTarget.dataset.name;
      this.setData({
        [key]: value
      })
    }
  }
})
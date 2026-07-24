import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: {
      "truck_type": {
        title: '车型',
        placeholder: '( 单选 )',
        value: '',
        children: [],
      },
      "arrive_depart": {
        title: '装卸时间',
        placeholder: '( 选填: 例如 10-25 14-15 )',
        value: {}
      },
    //   "pallet_num": {
    //     title: '托盘数量',
    //     placeholder: '( 选填 )',
    //     value: ''
    //   },
    },
    needTime: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({ type: options.type, _from: options._from })
    if (options.data) {
      this.data.orderInfo = JSON.parse(options.data)
    }
    if(options.needTime){
        if(options.needTime == 'false'){
            let list = this.data.list
            delete list['arrive_depart']
            this.setData({
                list
            })
        }
    }
    wx.setNavigationBarTitle({
      title: `${options.type || "整车"}信息`,
    })

    // this.setData({
    //   ...JSON.parse(options.data)
    // })
    // }else{
    // this.getTruckType()
    // }
    this.getTruckType()
      .then(res => {
        console.log(res)
        if (res.failed) {
          wx.showModal({
            content: `获取车型失败:${res.errorMsg}`,
            showCancel: false
          })
        }
        this.setData({
          "list.truck_type.children": res.failed ? [] : res.data
        })
        // this.data.list.truck_type.children = res.failed ? [] : res.data
        if (options.data) {
          let data = JSON.parse(options.data)
          for (let key in data) {
            switch (key) {
              case 'truck_type':
                let truck_type = this.data.list[key].children.find(i => i.name == data[key]) || {}
                Object.keys(truck_type).length ? truck_type.checked = true : '';
                break;
            //   case 'pallet_num':
            //     this.data.list[key].value = data[key];
            //     break;
              case 'expect_arrive':
              case 'expect_depart':
                this.data.list.arrive_depart.value[key] = data[key];
                break;
            }
          }
          this.setData({
            list: this.data.list
          })
        }
      })
  },

  // 获取车型
  getTruckType() {
    return new Promise(completion =>
      tss.get({
        url: tss.url('') + '/tms/api/entity/TruckType',
        completion
      })
    )
  },

  formSubmit() {
    let aoe = { ...{}, ...this.data.list }
    let transModeInfo = {}
    for (let key in aoe) {
      switch (key) {
        case 'truck_type':
          let truck_type = aoe[key].children.find(i => i.checked)
          transModeInfo[key] = truck_type ? truck_type.name : '';
          break;
        case 'arrive_depart':
          transModeInfo['expect_arrive'] = aoe[key].value[0]
          transModeInfo['expect_depart'] = aoe[key].value[1]
          break;
        // case 'pallet_num':
        //   transModeInfo[key] = aoe[key].value;
        //   break;
      }
    }
    if (this.data._from == 'quote') {
      if (transModeInfo.truck_type) {
        wx.navigateTo({
          url: `${Pages.order_quote1}?data=${JSON.stringify({ ...this.data.orderInfo, ...transModeInfo })}`
        });
        return
      } else {
        wx.showToast({
          title: '请选择车型', icon: 'none'
        })
        return
      }
    }
    lc.emitEvent('orderInfo', {
      type: this.data.type,
      data: {
        message: `${transModeInfo.truck_type || ''} 装：${transModeInfo.expect_arrive || ''} 卸：${transModeInfo.expect_depart || ''}`,// ${transModeInfo.pallet_num || ''}托
        transModeInfo
      }
    })
    wx.navigateBack()
  },

  onChange(e) {
    this.data.list.pallet_num.value = e.detail.value
  },
  inputTime(e) {
    let idx = e.currentTarget.id
    this.data.list.arrive_depart.value[idx] = e.detail.value
  },
  chooseFeeItem(e) {
    const { item, listItem } = e.target.dataset
    let _list = this.data.list[listItem]
    for (let i = 0; i < _list.children.length; i++) {
      if (item.name == _list.children[i].name) {
        _list.children[i].checked = true
      } else {
        _list.children[i].checked = false
      }
    }
    let writeList = `list.${listItem}.children`
    this.setData({
      [writeList]: _list.children
    })
  }
})
const tss = require('../../../../utils/tss.js')
const lc = require('../../../../utils/listenerCenter.js')

Page({
  data: {
    mode: 'create',
    id: '',
    formData: {
      plate_num: '',
      trailer_num: '',
      truck_type: '',
      brand: '',
      can_load_weight: '',
      can_load_volume: '',
      driver: '',
      phone: '',
      lc_id: '',
      type: '',
      status: '在用',
      position_type: '',
      device_num: '',
      robot_notify_wxid: '',
    },
    truckTypeList: [],
    truckTypeColumns: [],
    showTruckTypePicker: false,
    lcList: [],
    lcColumns: [],
    showLcPicker: false,
    positionTypeList: [{
        value: '',
        text: '无'
      },
      {
        value: 'g7',
        text: 'g7'
      },
      {
        value: 'beidou',
        text: '北斗'
      },
      {
        value: 'jimi',
        text: '几米'
      },
      {
        value: 'wx',
        text: '微信'
      },
    ],
    positionTypeColumns: ['无', 'g7', '北斗', '几米', '微信'],
    showPositionTypePicker: false,
    statusList: [{
      name: '在用'
    }, {
      name: '停用'
    }],
    statusColumns: ['在用', '停用'],
    showStatusPicker: false,
    typeList: [{
      name: '自有'
    }, {
      name: '外请'
    }],
    typeColumns: ['自有', '外请'],
    showTypePicker: false,
  },

  async onLoad(options) {
    wx.showLoading()
    if (options.id) this.setData({
      mode: 'edit',
      id: options.id
    })
    await this.loadTruckTypes()
    await this.loadLcList()
    wx.hideLoading()
    if (options.id) this.loadTruckDetail(options.id)
  },

  loadTruckTypes() {
    return new Promise((resolve, reject) => {
      tss.get({
        url: tss.url('') + '/tms/entity/TruckType',
        completion: (res) => {
          resolve()
          if (res.failed) return
          const list = res.data || []
          this.setData({
            truckTypeList: list,
            truckTypeColumns: list.map(i => i.name)
          })
        },
      })
    })
  },

  loadLcList() {
    return new Promise((resolve, reject) => {
      tss.get({
        url: tss.url('sql') + 'lc_info',
        completion: (res) => {
          resolve()
          if (res.failed) return
          const list = res.data || []
          this.setData({
            lcList: list,
            lcColumns: list.map(i => i.name)
          })
        },
      })
    })
  },

  loadTruckDetail(id) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    tss.get({
      url: tss.url('ENTITY') + `/OmsTruck/${id}`,
      completion: (res) => {
        console.log("载入数据", res)
        wx.hideLoading()
        if (res.failed) return
        const item = res.data
        if (!item) return
        const formData = {
          ...this.data.formData
        }
        for (const key in formData) {
          if (item[key] !== undefined) formData[key] = item[key]
        }
        if(item['position_type']){
          let positionType = this.data.positionTypeList.find(type=>type.value == item['position_type'])
          if(positionType){
            formData['position_type_name']  = positionType.text
          }
        }
        if(item['lc_id']){
          let lc = this.data.lcList.find(l=>l.id == item['lc_id'])
          console.log(lc)
          if(lc){
            formData['lc_name']  = lc.name
          }
        }
        formData['version'] = item['version']
        this.setData({
          formData
        })
      },
    })
  },

  onFieldChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    this.setData({
      [`formData.${field}`]: e.detail
    })
  },

  openTruckTypePicker() {
    this.setData({
      showTruckTypePicker: true
    })
  },
  onTruckTypeConfirm(e) {
    const selected = this.data.truckTypeList[e.detail.index]
    this.setData({
      'formData.truck_type': selected ? selected.name : '',
      showTruckTypePicker: false
    })
  },
  onTruckTypeCancel() {
    this.setData({
      showTruckTypePicker: false
    })
  },

  openLcPicker() {
    this.setData({
      showLcPicker: true
    })
  },
  onLcConfirm(e) {
    const selected = this.data.lcList[e.detail.index]
    this.setData({
      'formData.lc_id': selected ? selected.id : '',
      'formData.lc_name': selected ? selected.name : '',
      showLcPicker: false
    })
  },
  onLcCancel() {
    this.setData({
      showLcPicker: false
    })
  },

  openPositionTypePicker() {
    this.setData({
      showPositionTypePicker: true
    })
  },
  onPositionTypeConfirm(e) {
    const idx = e.detail.index
    const selected = this.data.positionTypeList[idx]
    this.setData({
      'formData.position_type': selected ? selected.value : '',
      'formData.position_type_name': selected ? selected.text : '',
      showPositionTypePicker: false
    })
  },
  onPositionTypeCancel() {
    this.setData({
      showPositionTypePicker: false
    })
  },

  openStatusPicker() {
    this.setData({
      showStatusPicker: true
    })
  },
  onStatusConfirm(e) {
    this.setData({
      'formData.status': this.data.statusColumns[e.detail.index],
      showStatusPicker: false
    })
  },
  onStatusCancel() {
    this.setData({
      showStatusPicker: false
    })
  },

  openTypePicker() {
    this.setData({
      showTypePicker: true
    })
  },
  onTypeConfirm(e) {
    this.setData({
      'formData.type': this.data.typeColumns[e.detail.index],
      showTypePicker: false
    })
  },
  onTypeCancel() {
    this.setData({
      showTypePicker: false
    })
  },

  submitForm() {
    const data = this.data.formData
    if (!data.plate_num) {
      wx.showToast({
        title: '请输入车牌号',
        icon: 'none'
      });
      return
    }
    if (!data.truck_type) {
      wx.showToast({
        title: '请选择车型',
        icon: 'none'
      });
      return
    }
    if (!data.driver) {
      wx.showToast({
        title: '请输入司机',
        icon: 'none'
      });
      return
    }
    if (!data.phone) {
      wx.showToast({
        title: '请输入司机电话',
        icon: 'none'
      });
      return
    }
    if (!data.type) {
      wx.showToast({
        title: '请选择类型',
        icon: 'none'
      });
      return
    }

    const title = this.data.mode === 'create' ? '确定新增司机吗？' : '确定保存修改吗？'
    wx.showModal({
      title: '提示',
      content: title,
      success: (res) => {
        if (!res.confirm) return
        wx.showLoading({
          title: '保存中...',
          mask: true
        })
        const params = {
          ...data
        }
        if (this.data.mode === 'edit') params.id = this.data.id
        if (params['id']){
          params['id'] = Number(params.id)
        }
        tss.post({
          url: tss.url('') + '/tms/entity/OmsTruck',
          params,
          useCookie: true,
          completion: (res) => {
            wx.hideLoading()
            if (res.failed) {
              wx.showModal({
                title: '提示',
                content: res.errorMsg || '保存失败',
                showCancel: false
              })
              return
            }
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
            lc.emitEvent('driverFormSaved', {})
            setTimeout(() => wx.navigateBack(), 500)
          },
        })
      },
    })
  },
})
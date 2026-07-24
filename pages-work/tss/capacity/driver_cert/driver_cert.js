const _App = getApp().globalData;
const tss = require('../../../../utils/tss.js');
import Pages from '../../../../pages.js';
const table_sub = 'tms_quote_driver'

Page({

  data: {
    idCardList: {
      name: 'idCardList',
      title: '身份验证',
      extra: '（ 请上传身份证 ）',
      type: 'idcard',
      imglist: [{ title: '身份证正面', url: '' }, { title: '身份证反面', url: '' }],
      list: [
        { code: 'name', title: '姓名', value: '' },
        { code: 'id', title: '身份证', value: '' },
        { code: 'phone', title: '手机号', value: _App.user.uName, disabled: true }
      ]
    },
    driverList: {
      name: 'driverList',
      title: '驾驶证验证',
      extra: '（ 请上传驾驶证 ）',
      type: 'drivinglicense',
      imglist: [{ title: '驾驶证正面', url: '' }, { title: '驾驶证反面', url: '' }],
      list: [
        { code: 'id_num', title: '驾驶证编号', value: '' },
        { code: 'plate_num', title: '车牌', value: '' },
        { code: 'truck_type', title: '车型', value: '' },
        { code: 'sex', title: '性别', value: '' },
        { code: 'address', title: '地址', value: '' },
        { code: 'birth_date', title: '出生日期', value: '' },
        { code: 'issue_date', title: '初次领证日期', value: '' },
        { code: 'car_class', title: '准驾车型', value: '' },
        { code: 'valid_from', title: '有效期限起始日', value: '' },
        { code: 'valid_to', title: '有效期限终止日', value: '' },
        { code: 'official_seal', title: '印章文构', value: '' },
      ]
    },
    driverInfos: {}
  },

  onLoad: function (options) {
    this.queryCertRate()
  },

  certTap(e) {
    console.log(e)
    if (e.detail.change) {
      this.setData({
        showPop: false
      })
      this.changeDriverInfo()
    } else {
      wx.navigateBack()
    }
  },
  onReady() {
    this.data.itemId = new Date().getTime()
  },
  changeDriverInfo() {
    // tss.post({
    //   url: tss.url('ENTITY') + 'QuoteDriver',
    //   params: {

    //   }
    // })
  },
  dealData(data) {
    let _data = { ...data, ...JSON.parse(data.remark || "{}") }
    let list1 = this.data.idCardList.list
    let list2 = this.data.driverList.list
    list1.forEach(item => item.value = _data[item.code])
    list2.forEach(item => item.value = _data[item.code])
    this.setData({
      "idCardList.list": list1,
      "driverList.list": list2
    })
  },
  // 查询审核进度
  queryCertRate() {
    wx.showLoading()
    tss.query({
      url: tss.url('ENTITY') + 'QuoteDriver',
      params: {
        phone: _App.user.uName
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          wx.hideLoading()
          return
        }
        wx.hideLoading()
        let xdata = res.data.filter(i => i.status != '关闭')
        if (xdata.length) {
          let data = xdata[0]
          this.data.driverInfos = data
          if (data.status == '审核通过') {
            wx.showModal({
              showCancel: false,
              content: '您当前已经审核通过，无需再次审核',
              success: res => wx.navigateBack()
            })
            return
          }
          this.setData({
            showPop: true,
            isCerting: data.status == '审核中' ? true : false,
            extra: data.status == '审核中' ? '预计48小时内完成审核,请耐心等待。' : '可联系当前物流公司进行申诉，或者重新填写信息。',
          })
          this.dealData(data)
        }
      }
    })
  },
  // 上传文件
  uploadFile(e) {
    console.log(e)
    let { name, type } = e.currentTarget.dataset
    let idx = e.currentTarget.id

    if (this.data[name].imglist[idx].loading) return
    wx.chooseImage({
      count: 1,
      sizeType: 'compressed',
      success: res => {
        this.setData({
          [`${name}.imglist[${idx}].url`]: res.tempFilePaths[0],
          [`${name}.imglist[${idx}].loading`]: true
        })
        // this.upLoadImg(res, type, idx, name)
        this.getIdCard(res, idx, type, name)
      },
    })
  },
  async getIdCard(res, idx, type, name) {
    const result = await this.upLoadImg(res, idx, type, name)
    console.log(result)
    tss.post({
      url: `${tss.url('')}/wx/ocr/${type}`,
      params: {
        appid: _App.app_id,
        imgurl: result.url
      },
      completion: res => {
        this.setData({
          [`${name}.imglist[${idx}].loading`]: false
        })
        if (!res.failed) {
          let item = this.data[name].list
          for (let i = 0; i < item.length; i++) {
            if (item[i].disabled || item[i].value) continue;
            item[i].value = res.data[item[i].code]
          }
          this.setData({
            [`${name}.list`]: this.data[name].list
          })
        }
      }
    })
  },
  upLoadImg(res, idx, type, name) {
    return new Promise(resolve => {
      tss.uploadImagesAsync({
        recordId: '-9',
        itemId: this.data.driverInfos.id || this.data.itemId,
        uName: _App.user.uName,
        uToken: _App.user.uToken,
        filePaths: res.tempFilePaths,
        completion: res => {
          console.log(res)
          resolve({
            url: `${_App.app_host}/tss/xdata/attach/download/${res[0].id}`,
            idx, type, name
          })
        }
      })
    })
  },
  doCheck(e) {
    const { name, phone, plate_num, truck_type, ...remark } = e.detail.value
    console.log(name, phone, plate_num, truck_type, remark)
    tss.post({
      url: tss.url('ENTITY') + 'QuoteDriver',
      params: {
        name, phone, plate_num, truck_type, status: '审核中',
        remark: JSON.stringify(remark),
        id: this.data.driverInfos.id || '',
        tempid: (!this.data.driverInfos.id && this.data.itemId)||'',
      },
      completion: res => {
        console.log(res)
      }
    })
    this.setData({
      showPop: true,
      isCerting: true
    })
  }
})
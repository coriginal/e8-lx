const _App = getApp().globalData;
const tss = require('../../../../utils/tss.js');
import Pages from '../../../../pages.js';

Page({
  data: {
    showDateChoose: false,
    photoImg: `./img/photo.png`,
    imgList: [
      {
        title: "行驶证",
        fn: "license",
        url: "",
        uploadUrl: "",
        bgImg: `./img/driver_card.png`,
        className: "card-img card1",
      },
      {
        title: "车辆照片",
        url: "",
        uploadUrl: "",
        bgImg: `./img/car-img.png`,
        className: "card-img card2",
      },
    ],
    fields: {
      plate_num: {
        title: "车牌号",
        value: "",
      },
      phone: {
        title: "司机电话",
        value: "",
        disabled: true,
      },
      truck_type: {
        title: "车型选择",
        value: "",
        disabled: true,
      },
      driver: {
        title: "所有人",
        value: "",
      },
      // driving_license: {
      //   title: "行驶证",
      //   value: ""
      // },
      brand: {
        title: "品牌",
        value: "",
      },
    },
    itemId: "",
    showTruck: false,
    checkedId: "",
    carList: [],
    formMap: new Map([
      ["driver", "请填写司机姓名"],
      ["plate_num", "请填写车牌号"],
      ["truck_type", "请选择车型"],
      ["register_date", "请选择车辆注册日期"],
    ]),
  },
  onLoad() {
    this.setData({
      itemId: new Date().getTime(),
      "fields.phone.value": _App.user.uName
    })
    this.getTruckType()
    this.getTruckCert()
  },
  getTruckCert() {
    tss.query({
      url: tss.url('ENTITY') + 'OmsTruck',
      params: {
        phone: _App.user.uName
      },
      completion: res => {
        if (res.failed) {
          return
        }
        this.setData({
          truckList: res.data,
          truckPlateNum: res.data.map(item => item.plate_num).join("、")
        })
      }
    })
  },
  getTruckType() {
    tss.query({
      url: tss.url('ENTITY') + 'TruckType',
      completion: res => {
        console.log(res)
        if (res.failed) {
          return
        }
        this.setData({
          carList: res.data
        })
      }
    })
  },
  handleField(e) {
    const { id } = e.currentTarget;
    if (id == "truck_type") {
      this.setData({
        showTruck: true
      })
    }
    if (id == "register_date") {
      this.setData({
        showDateChoose: true
      })
    }
  },
  chooseTruck(e) {
    const { id } = e.currentTarget;
    const { name } = e.currentTarget.dataset;

    this.setData({
      checkedId: Number(id),
      "fields.truck_type.value": name
    })
    this.onClose();
  },
  onClose() {
    this.setData({
      showTruck: false
    })
  },
  confirmDateTime(e) {
    this.setData({
      "fields.register_date.value": e.detail.label
    })
  },
  // onVisibleChange
  onVisibleChange() {
    this.setData({
      showDateChoose: false
    })
  },
  inputCardText(e) {
    const { id } = e.currentTarget;
    // this.fields[id].value = e.detail.value;
    this.setData({
      [`field.${id}.value`]: e.detail.value
    })
  },
  // 上传行驶证、车辆
  async onImgUpload(e) {
    const { name, fn } = e.currentTarget.dataset;
    const { id: idx } = e.currentTarget;
    const res = await wx.chooseImage({ count: 1 });
    const { uName, uToken } = _App.user;
    // this[name][idx].url = res.tempFilePaths[0];
    this.setData({
      [`${name}[${idx}].url`]: res.tempFilePaths[0]
    })

    wx.showLoading()

    const result = await tss.uploadImagesAsync({
      recordId: "-11",
      itemId: this.data.itemId,
      uName,
      uToken,
      filePaths: res.tempFilePaths,
      completion: result => {
        // 上传成功进行身份证识别
        // this[name][idx].uploadUrl = result[0];
        wx.hideLoading();
        this.setData({
          [`${name}[${idx}].uploadUrl`]: result[0]
        })

        if (result[0].success) {
          const url = `${_App.app_host}/tss/xdata/attach/download/${result[0].id}?uName=${uName}&uToken=${uToken}`;
          this.getLicenseInfo(url, fn);
        }
      }
    });
  },
  async getLicenseInfo(url) {
    wx.showLoading({
      title: '识别中..',
    })
    const result = await tss.ocr(url, "license")
    if (result.plate_num) {
      const { plate_num, owner, model } = result
      this.setData({
        "fields.brand.value": model.text,
        "fields.plate_num.value": plate_num.text,
        "fields.driver.value": owner.text
      })
    }
    wx.hideLoading()
  },
  formSubmit(e) {

    if (!e.detail.value.plate_num) {
      wx.showToast({
        title: '请填写车牌号',
        icon:'none'
      })
      return
    }
    if (!e.detail.value.driver) {
      wx.showToast({
        title: '请填写车辆所有人',
        icon:'none'
      })
      return
    }

    tss.post({
      url: tss.url('ENTITY') + 'OmsTruck',
      params: {
        ...e.detail.value,
        tempid: this.data.itemId
      },
      completion: res => {
        console.log(res)
        if (res.failed) {
          return
        }
        wx.showModal({
          content:"操作成功",
          confirmText: "返回",
          showCancel: false,
          success: ({ confirm }) => {
            confirm && wx.navigateBack()
          }
        })
      }
    })
  }
})
const lc = require('../../../utils/listenerCenter.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    total: '-',
    list: [
      { count: 1, v1: "", v2: "", v3: "" }
    ],
    textList: []
  },
  goBack(e) {
    const { id } = e.currentTarget;
    const item = this.data.textList[id]
    console.log(item)
    // lc.addListener('ChangeInfo', this.__wxWebviewId__.toString(), res => {

    // })
    lc.emitEvent('back-volume', { value: item.value })
    wx.navigateBack()
  },
  onSubmit(e) {
    console.log(e)
    let value = 1;
    const { count = 1, v1 = 0, v2 = 0, v3 = 0 } = e.detail.value
    this.setData({
      total: (count * v1 * v2 * v3 / 1000000).toFixed(2)
    })
    if (count * v1 * v2 * v3 / 1000 > 0) {
      const value = (count * v1 * v2 * v3 / 1000000).toFixed(2)
      this.setData({
        textList: this.data.textList.concat([{
          v1, v2, v3, count, value,
          text: `${v1}✕${v2}✕${v3}✕${count}=${value}m³`
        }])
      })
    }
  },
  deleteText(e) {
    const { id } = e.currentTarget;
    console.log(id)
    this.setData({
      textList: this.data.textList.filter((i, v) => v != id)
    })
  },
  addOn() {
    this.setData({
      list: this.data.list.concat([{ count: 1, v1: "", v2: "", v3: "" }])
    })
  },
  addNumber(e) {
    const { id } = e.currentTarget;
    this.setData({
      [`list[${id}].count`]: this.data.list[id].count + 1
    })
  },
  inputCount(e) {
    const { id } = e.currentTarget;
    this.setData({
      [`list[${id}].count`]: e.detail.value
    })
  },
  cutNumber(e) {
    const { id } = e.currentTarget;
    if (this.data.list[id].count - 1 <= 0) {
      this.setData({
        [`list[${id}].count`]: 0
      })
    } else {
      this.setData({
        [`list[${id}].count`]: this.data.list[id].count - 1
      })
    }
  }
})
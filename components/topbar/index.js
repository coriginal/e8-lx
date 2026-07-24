const { bottom, top } = wx.getMenuButtonBoundingClientRect()
const _App = getApp().globalData
const tss = require('../../utils/tss.js')

Component({
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: 'apply-shared'
  },
  properties: {
    isBack: {
      type: Number,
      value: 1
    },
    title: {
      type: String,
      value: ''
    },
    optionsMsg:{
      type:Boolean,
      value:true
    },
    showPop:{
      type: Boolean,
      value: false
    },
    ifDot:{
      type:Boolean,
      value:false
    },
    hidden:{
        type:Boolean,
        value:false
    }
  },
  data: {
    style: `padding-bottom:5px;padding-top: ${top}px;height:${bottom+5}px;background-color:white;`,
    pop: `top:${bottom + 8}px`
  },
  methods: {
    goBack(){ wx.navigateBack()},
    goOptions() { wx.navigateTo({ url: '../options/index' }) },
    closePop() { this.setData({ pop: 'display:none' }) }
  },
  attached() {
    const { length: isBack } = getCurrentPages()
    this.setData({ isBack })
  },
  ready(){
    const query = this.createSelectorQuery()
    query.select('.popover').boundingClientRect(rect => {
      if(rect){
        this.setData({ popright: 69.75 - rect.width / 2 })
      }
    }).exec()
    setTimeout(() => { this.closePop() }, 5000)
  }
})
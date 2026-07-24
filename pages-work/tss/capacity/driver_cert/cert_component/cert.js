// pages-work/tss/capacity/driver_cert/cert_component/cert.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    extra:{
      type:String,
      value:'预计48小时内完成审核,请耐心等待。'
    },
    isCerting:{
      type:Boolean,
      value:true
    },
    showPop:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap(e){
      this.triggerEvent('click',{change:this.data.isCerting?false:true})
    }
  }
})

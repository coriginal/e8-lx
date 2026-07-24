
Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    title:{
      type:String,
      value:true
    }
  },

  data: {},

  lifetimes: {
    // 获取从各个页面返回的订单信息
    attached: function () {
    },
    ready() {
    },
    detached: function () {
      console.log('detached')
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    hideModal(e) {
      this.setData({
        show: false
      })
    }
  },
  forbidBubble(e){
    console.log(e)
  }

})

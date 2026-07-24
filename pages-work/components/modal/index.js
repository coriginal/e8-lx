// components/modal/modal.js

Component({

  /**
  * 组件的属性列表
  */
  properties: {
    title: {
      type: String,
      value: ''
    },
    show: {
      type: Boolean,
      value: false
    },
    height: {
      type: String,
      value: '80%'
    },
    hideCancel:{
      type: Boolean,
      value: false
    },
    hideConfirm: {
      type: Boolean,
      value: false
    },
    showModal: {
      type: Boolean,
      value: false
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
    clickMask:function clickMask() {},
    noop: function noop(){},
    cancel:function cancel() {
      this.setData({ show: false })
      this.triggerEvent('cancel')
    },
    confirm: function confirm(e) {
      var showModal = e.currentTarget.dataset.showModal
      if (!showModal){
        this.setData({ show: false })
      }
      this.triggerEvent('confirm')
    }
  }
});
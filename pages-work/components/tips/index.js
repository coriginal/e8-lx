Component({

  properties: {
    image: {
      type: String,
      value: 'failed.png'
    },
    title: {
      type: String,
      value: '',
    },
    content: {
      type: String,
      value: ''
    },
    fail: {
      type: String,
      value: '取消'
    },
    success: {
      type: String,
      value: '保存'
    },
    ignore: {
      type: String,
      value: 'Ignore'
    },
    color: {
      type: String,
      value: 'orange'
    },
    _showTips:{
      type: Boolean,
      value: false
    },
    _showCancel: {
      type: Boolean,
      value: true
    },
    _showSub: {
      type: Boolean,
      value: false
    },
  },

  data: {
    
  },

  methods: {
    _clearIconTapped: function (e) {
      this.setData({
        _showTips: false
      })
    },
    _cancelTips:function(e){
      this.setData({ _showTips: false })
      this.triggerEvent('cancel')
    },
    _comfrimTips:function(e){
      this.triggerEvent('confirm')
    }
  }
})

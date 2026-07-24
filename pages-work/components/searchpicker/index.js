
Component({
  properties: {
    disabled: {
      type: Boolean,
      value: false
    },
    show: {
      type: Boolean,
      value: false
    },
    range: Array,
    showrange: Array,
    value: {
      type: Number,
      value: 0
    },
    showvalue: {
      type: Number,
      value: 0
    },
    usesearch: {
      type: Boolean,
      value: false
    },
    isScroll:{
      type:Boolean,
      value:false
    }
  },
  externalClasses: ['custom-class'],

  methods: {
    showPicker() {
      this.setData({
        show: true
      });
    },

    hidePicker(e) {
      if(this.data.isScroll){
        this.data.isScroll = false;
        let _this = this;
        setTimeout(function(){_this.hidePicker(e)},200)
        return
      }
      let action = e.currentTarget.dataset.action;
      this.setData({
        show: false
      });
      const value = this.data.usesearch ? (this.data.showrange[this.data.showvalue] ? this.data.showrange[this.data.showvalue].rangeindex : null) : this.data.value;
      if (action === 'change') {
        this.triggerEvent('change', { value: value })
      }
      this.setData({
        usesearch: false,
        value: value
      })
    },
    query(e) {
      var data = this.data.range;
      var showrange = [];
      for (var i = 0; i < data.length; i++) {
        if (data[i].name.indexOf(e.detail.value) > -1) {
          data[i].rangeindex = i;
          showrange.push(data[i])
        }
      }
      this.setData({
        value: 0,
        showvalue: 0,
        usesearch: true,
        showrange: showrange
      })
    },
    bindChange: function bindChange(e) {
      this.setData({
        showvalue: e.detail.value[0],
        value: this.data.usesearch ? this.data.showrange[e.detail.value[0]].rangeindex : e.detail.value[0]
      })
    },
   bindpickstart: function(e){
     this.data.isScroll = true
   },
   //滚动结束
   bindpickend: function(e){
     this.data.isScroll = false
   }
  },
});

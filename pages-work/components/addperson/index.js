Component({

  externalClasses: ['custom-class'],

  properties: {
    list: {
      type: Array,
      value: []
    },
    type: {
      type: String,
      value: ''
    },
    hidden: {
      type: Boolean,
      value: false
    },
    arrow: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    addperson: function (e) {
      const type = e.currentTarget.dataset.type;
      this.triggerEvent('addperson', { value: type });
    },
    deleteBtnTapped: function (e) {
      const type = this.data.type;
      const index = e.currentTarget.dataset.index
      this.data.list.splice(index, 1)
      console.log(this)
      this.setData({
        list: this.data.list
      })
      this.triggerEvent('delperson',{list:this.data.list,type:type})
    }
  }
});
Component({

  externalClasses: ['custom-class'],

  properties: {
    list: {
      type: Array,
      value: []
    },
    selectedId: {
      type: [String, Number],
      value: ''
    }
  },

  methods: {
    _handleZanTabChange: function _handleZanTabChange(e) {
      var selectedId = e.currentTarget.dataset.itemId;

      this.setData({
        selectedId: selectedId
      });

      this.triggerEvent('tabchange', selectedId);
    }
  }
});
Component({

  properties: {
    value: {
      type: String,
      value: '',
      observer: '_updateValue'
    },
    placeholder: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: 'text'
    }
  },

  data: {
    _focus: false,
    _showClear: false,
    _value: ''
  },

  methods: {
    _clearIconTapped: function (e) {
      this.setData({
        _showClear: false,
        _focus: false,
        _value: ''
      })
      this.triggerEvent('clear', { value: '' }, {})
    },

    _beginEditing: function (e) {
      this.setData({ _showClear: e.detail.value.length > 0 })
    },

    _editing: function (e) {
      const value = e.detail.value
      this.setData({
        _showClear: value.length > 0,
        _value: value
      })
      this.triggerEvent('editing', { value: value }, {})
    },

    _endEditing: function (e) {
      this.setData({
        _showClear: false,
        _focus: false
      })
    },

    _updateValue: function (newVal, oldVal) {
      this.setData({ _value: newVal })
    }

  },

  externalClasses: ['custom-class']
})

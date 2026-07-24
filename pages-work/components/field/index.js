'use strict';

Component({
  externalClasses: ['custom-class'],

  behaviors: ['wx://form-field'],

  properties: {
    title: String,
    type: {
      type: String,
      value: 'input'
    },
    disabled: Boolean,
    ud_confirmbar:Boolean,
    inputType: {
      type: String,
      value: 'text'
    },
    placeholder: String,
    focus: Boolean,
    mode: {
      type: String,
      value: 'normal'
    },
    right: Boolean,
    error: Boolean,
    maxlength: {
      type: Number,
      value: 140
    },
    ud_required:Boolean,
    ud_show:String,
    ud_phred:String,
    ud_noborder: Boolean,
    ud_picker: String,
    ud_range: Array,
    ud_choose_text: String,
    ud_call: Boolean,
    ud_key:String
  },

  methods: {
    handleFieldChange: function handleFieldChange(event) {
      var _event$detail = event.detail,
          detail = _event$detail === undefined ? {} : _event$detail;
      var _detail$value = detail.value,
          value = _detail$value === undefined ? '' : _detail$value;

      this.setData({ value: value });

      this.triggerEvent('change', event);
    },
    handleFieldFocus: function handleFieldFocus(event) {
      this.triggerEvent('focus', event);
    },
    handleFieldBlur: function handleFieldBlur(event) {
      this.triggerEvent('blur', event);
    },
    pickerChange: function pickerChange(event) {
      this.triggerEvent('pchange', { value: event.detail.value })
      const data = this.data.ud_range[event.detail.value];
      const key = this.properties.ud_key || 'name'
      this.setData({ value: data ? data[key] : '' });
    },
    call: function call(event) {
      if (this.data.value) {
        wx.makePhoneCall({
          phoneNumber: this.data.value
        })
      }
    }
  }
});
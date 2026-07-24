Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  externalClasses: ['wux-class'],
  properties: {
    type: {
      type: String,
      value: '',
    },
    size: {
      type: [String, Number],
      value: 44,
      observer: 'updated',
    },
    color: {
      type: String,
      value: '',
    },
    hidden: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    fontSize: '',
  },
  methods: {
    updated(size = this.data.size) {
      let fontSize = size

      if (typeof size === 'number') {
        fontSize = `${size}rpx`
      } else if (typeof size === 'string') {
        if (!isNaN(Number(size))) {
          fontSize = `${size}rpx`
        }
      }

      if (this.data.fontSize !== fontSize) {
        this.setData({
          fontSize,
        })
      }
    },
  },
  attached() {
    this.updated()
  },
})
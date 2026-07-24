const _App = getApp().globalData
import { $wuxBackdrop } from '../index'
import common from './params'

Component({
  options: {
    styleIsolation: 'apply-shared',
  },

  properties: {
    fields: {
      type: Array,
      value: ['date']
    }
  },
  lifetimes: {
    created() {
      this.$wuxBackdrop = $wuxBackdrop('#wux-backdrop', this)
    },
    ready() {
      this.showQueryParams()
      this.initParams()
    }
  },

  data: {
    time:new Date().getTime(),
    x: _App.systemInfo.screenWidth,
    y: _App.systemInfo.screenHeight,
    showParams: false,
    example: {
      classNames: 'wux-animate--slideInRight',
      enter: true,
      exit: true,
    }
  },

  methods: {
    initParams() {
      let params = JSON.parse(JSON.stringify(common))

      this.data.fields.forEach(item => item in params ? '' : delete params[item])

      this.setData({
        params
      })
      this.data.lastParams = JSON.parse(JSON.stringify(params))
    },

    showQueryParams(e) {
      const showParams = this.data.showParams

      this.setData({
        showParams: !showParams
      })
      if (showParams) {
        this.$wuxBackdrop.release()
      } else {
        this.$wuxBackdrop.retain()
      }
    },

    touchEnd(e) {
      const { screenWidth } = _App.systemInfo
      const { clientX, clientY } = e.changedTouches[0]
      this.setData({
        x: clientX > screenWidth / 2 ? screenWidth : 0,
        y: clientY - 25
      })
    },
    panelClick(e) {
      const { type } = e.currentTarget.dataset
      const { id } = e.currentTarget

      const findIdx = this.data.params[type].findIndex(i => i.code == id)

      switch (type) {
        case 'status': {
          const _status = this.data.params[type][findIdx].checked
          this.setData({
            [`params.${type}[${findIdx}].checked`]: !_status
          })
        }; break;
        case 'date': {
          // const _status = this.data.params[type][findIdx].isChoosing
          this.setData({
            showDateChoose: true,
            [`params.${type}[${findIdx}].isChoosing`]: true
          })
        }
      }
    },
    onConfirmDatePicker(e) {
      console.log(e)
      const findIdx = this.data.params.date.findIndex(i => i.isChoosing)
      console.log(findIdx,this.data.params.date)
      this.setData({
        [`params.date[${findIdx}].isChoosing`]: false,
        [`params.date[${findIdx}].value`]: e.detail.label
      })
      this.onCancelDatePicker()
    },
    onCancelDatePicker(e) {
      this.setData({
        showDateChoose: false
      })
    },
    onClosed() {
      this.showQueryParams()
      this.setData({
        params: JSON.parse(JSON.stringify(this.data.lastParams))
      })
    },
    btnReset() {
      this.initParams()
    },

    btnConfirm() {
      this.showQueryParams()
      this.data.lastParams = JSON.parse(JSON.stringify(this.data.params))
    }

  }
})
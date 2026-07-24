import baseComponent from '../helpers/baseComponent'
import classNames from '../helpers/classNames'
import { $wuxBackdrop } from '../index'

baseComponent({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    prefixCls: {
      type: String,
      value: 'wux-filterbar',
    },
    items: {
      type: Array,
      value: [],
    }
  },
  data:{
    params:{}
  },
  computed: {
    classes() {
      const { prefixCls } = this.data
      const wrap = classNames(prefixCls)
      const bd = `${prefixCls}__bd`
      const item = `${prefixCls}__item`
      const text = `${prefixCls}__text`
      const pop = `${prefixCls}__pop`
      const scrollView = `${prefixCls}__scroll-view`
      const panel = `${prefixCls}__panel`
      const panelHd = `${prefixCls}__panel-hd`
      const panelTitle = `${prefixCls}__panel-title`
      const panelSelected = `${prefixCls}__panel-selected`
      const panelBd = `${prefixCls}__panel-bd`
      const groups = `${prefixCls}__groups`
      const group = `${prefixCls}__group`
      const input = `${prefixCls}__input`
      const radio = `${prefixCls}__radio`
      const btn = `${prefixCls}__btn`
      const check = `${prefixCls}__check`
      const btns = `${prefixCls}__btns`
      const select = `${prefixCls}__select`

      return {
        wrap,
        bd,
        item,
        text,
        pop,
        scrollView,
        panel,
        panelHd,
        panelTitle,
        panelSelected,
        panelBd,
        groups,
        group,
        radio,
        btn,
        check,
        btns,
        select,
        input
      }
    },
  },
  methods: {
    /**
     * 重置按钮
     * @param {Object} e 事件对象
     * @param {Object} prevState 上一个状态值
     */
    onReset(e, prevState) {
      const { index, item, params = {} } = e.currentTarget.dataset
      // console.log(prevState, item, params)
      const children = prevState && prevState.children || item.children.map((n) => {
        return Object.assign({}, n, {
          children: n.children.map((m) => Object.assign({}, m, {
            checked: m.defaultChecked ? true : false,
          })),
          selected: n.children.filter(x => x.defaultChecked)[0] ? n.children.filter(x => x.defaultChecked)[0].label : ''
        })
      })
      // console.log(children)
      this.setData({
        [`options[${index}].children`]: children,params
      })
    },
    /**
     * 关闭侧边栏筛选框
     * @param {Object} e 事件对象
     * @param {Function} callback 回调函数
     */
    onClose(e, callback) {
      const { index } = e.currentTarget.dataset
      const params = {
        [`options[${index}].visible`]: false,
      }

      this.setData(params, () => {
        if (typeof callback === 'function') {
          callback.call(this, e)
        } else {
          this.onReset(e, this.prevState)
        }

        this.$wuxBackdrop.release()
      })
    },
    /**
     * 确认按钮
     * @param {Object} e 事件对象
     */
    onConfirm(e) {
      this.onClose(e, this.onChange)
    },
    /**
     * 筛选栏内单项选择触发 change 事件
     * @param {Object} e 事件对象
     */
    onRadioChange(e) {
      const { value } = e.detail
      const { index, item, parentIndex } = e.currentTarget.dataset
      const children = item.children.map((n) => Object.assign({}, n, {
        checked: n.value === value,
      }))
      const selected = children.filter((n) => n.checked).map((n) => n.label).join(',')

      this.setData({
        [`options[${parentIndex}].children[${index}].children`]: children,
        [`options[${parentIndex}].children[${index}].selected`]: selected,
      })
    },
    /**
     * 筛选栏内多项选择触发 change 事件
     * @param {Object} e 事件对象
     */
    onCheckboxChange(e) {
      const { value } = e.detail
      const { index, item, parentIndex } = e.currentTarget.dataset
      const children = item.children.map((n) => Object.assign({}, n, {
        checked: value.includes(n.value),
      }))
      const selected = children.filter((n) => n.checked).map((n) => n.label).join(',')

      this.setData({
        [`options[${parentIndex}].children[${index}].children`]: children,
        [`options[${parentIndex}].children[${index}].selected`]: selected,
      })
    },

    onInputChange(e) {
      const { value } = e.detail
      const { index, item, parentIndex } = e.currentTarget.dataset
      this.setData({
        [`options[${parentIndex}].children[${index}].selected`]: value
      })
    },
    onClick(e) {
      const { index } = e.currentTarget.dataset
      this.onOpenSelect(this.data.options, index)
    },
    /**
     * 打开下拉框
     * @param {Array} data 菜单数据
     * @param {Number} index 当前索引
     */
    onOpenSelect(data = [], index = 0) {
      const current = data[index]
      const options = data.map((n, i) => {
        const params = Object.assign({}, n, {
          checked: index === i ? true: false,
        })

        // 判断已选择的元素是否同组
        if (n.checked) {
          // const has = this.getDifference(n.groups, current.groups)

          // params.checked = !!has.length

          // 判断非同组的元素清空选择内容
          if (index !== i && !has.length) {
            if (typeof params.children === 'object') {
              params.children = params.children.map((n) => {
                return Object.assign({}, n, {
                  children: n.children.map((m) => Object.assign({}, m, {
                    checked: false,
                  })),
                  selected: '',
                })
              })
            }
          }
        }
        params.visible = index === i ? !n.visible : false
        this.$wuxBackdrop[index === i ? !n.visible ? 'retain' : 'release' : 'release']()
        return params
      })

      this.setData({ options, index }, () => {
        this.prevState = current
        if (!['radio', 'checkbox', 'filter'].includes(current.type)) {
          this.onChange()
        }
      })
    },
    /**
     * 关闭下拉框
     */
    onCloseSelect() {
      const options = this.data.options
      const params = {}

      options.forEach((n, i) => {
        if (n.checked && n.visible) {
          params[`options[${i}].visible`] = false
        }
      })

      this.setData(params)
    },
    /**
     * 获取两个数组相同的元素
     * @param {Array} data 数组
     * @param {Array} values 数组
     */
    getDifference(data = [], values = []) {
      return data.filter(v => values.includes(v))
    },
    /**
     * 元素发生变化时的事件
     */
    onChange() {
      // console.log('change')
      setTimeout(() => {
        const { options: items } = this.data
        const checkedItems = items.filter((n) => n.checked)
        this.onCloseSelect()
       
        checkedItems.forEach((n) => {
          if (n.checked) {
            // if (n.value === 'filter') {
              n.children.filter((n) => n.selected).forEach((n) => {
                if (n.type == 'input') {
                  this.data.params[n.value] = n.selected
                } else {
                  this.data.params[n.value] = n.children.filter((n) => n.checked).map((n) => n.value).join(',')
                }
              })
            // }
          }
        })
        this.setData({
          paramsChecked: Object.values(this.data.params).length
        })
        // return params
        this.triggerEvent('change', { param: this.data.params })
      }, 300)
    },
    /**
     * scroll-view 滚动时触发的事件
     * @param {Object} e 事件对象
     */
    onScroll(e) {
      this.triggerEvent('scroll', e)
    },
    /**
     * 打开 select 或 filter 时触发的回调函数
     * @param {Object} e 事件对象
     */
    onEnter(e) {
      this.triggerEvent('open', e)
    },
    /**
     * 关闭 select 或 filter 时触发的回调函数
     * @param {Object} e 事件对象
     */
    onExit(e) {
      this.triggerEvent('close', e)
    },
  },
  created() {
    this.$wuxBackdrop = $wuxBackdrop('#wux-backdrop', this)
  },
  ready() {
    this.setData({
      options: this.data.items,
    },()=>{
      this.onChange()
    })
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      // console.log('pages onShow')
      // this.setData({
      //   options: this.data.items,
      // }, () => {
      //   this.onChange()
      // })
     }
  },
})

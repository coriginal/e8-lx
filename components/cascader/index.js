import baseComponent from '../helpers/baseComponent'
import classNames from '../helpers/classNames'
import arrayTreeFilter from '../helpers/arrayTreeFilter'
const tss = require('../../utils/tss.js');
const WUX_CASCADER = 'wux-cascader'
const defaultFieldNames = {
    label: 'label',
    value: 'value',
    children: 'children',
}

baseComponent({
    externalClasses: ['wux-scroll-view-class'],
    properties: {
        isLeaf:{
            type:Boolean,
            value: false
        },
        prefixCls: {
            type: String,
            value: 'wux-cascader',
        },
        defaultValue: {
            type: Array,
            value: [],
        },
        value: {
            type: Array,
            value: [],
            observer(newVal) {
                if (this.data.controlled) {
                    this.setData({ activeValue: newVal }, () => this.getCurrentOptions(newVal))
                }
            },
        },
        controlled: {
            type: Boolean,
            value: false,
        },
        title: {
            type: String,
            value: '',
        },
        options: {
            type: Array,
            value: [],
            observer: 'getCurrentOptions',
        },
        chooseTitle: {
            type: String,
            value: '请选择',
        },
        visible: {
            type: Boolean,
            value: false,
        },
        defaultFieldNames: {
            type: Object,
            value: defaultFieldNames,
        },
    },
    data: {
        activeOptions: [],
        activeIndex: 0,
        bodyStyle: '',
        activeValue: [],
        showOptions: [],
        fieldNames: {}
    },
    computed: {
        classes: ['prefixCls', function(prefixCls) {
            const wrap = classNames(prefixCls)
            const hd = `${prefixCls}__hd`
            const title = `${prefixCls}__title`
            const menus = `${prefixCls}__menus`
            const menu = `${prefixCls}__menu`
            const bd = `${prefixCls}__bd`
            const inner = `${prefixCls}__inner`
            const scrollView = `${prefixCls}__scroll-view`
            const option = `${prefixCls}__option`
            const item = `${prefixCls}__item`
            const icon = `${prefixCls}__icon`
            const ft = `${prefixCls}__ft`

            return {
                wrap,
                hd,
                title,
                menus,
                menu,
                bd,
                inner,
                scrollView,
                option,
                item,
                icon,
                ft,
            }
        }],
    },
    methods: {
      closePanel() {
        this.onPopupClose()
      },
      confirmPanel(e) {
        const options = this.data.activeOptions.filter((n) => n[this.getFieldName('value')] !== WUX_CASCADER)
        const value = options.map((n) => n[this.getFieldName('value')])
        this.emitEvent({ value, options, done: true })
      },
        getActiveOptions(activeValue) {
            const { options } = this.data
            const value = this.getFieldName('value')
            const childrenKeyName = this.getFieldName('children')

            return arrayTreeFilter(options, (option, level) => option[value] === activeValue[level], { childrenKeyName })
        },
        getShowOptions(activeValue) {
            const { options } = this.data
            const children = this.getFieldName('children')
            const result = this.getActiveOptions(activeValue).map((activeOption) => activeOption[children]).filter((activeOption) => !!activeOption)

            return [options, ...result]
        },
        getMenus(activeValue = [], hasChildren) {
            const { options, chooseTitle } = this.data
            const activeOptions = this.getActiveOptions(activeValue)

            if (hasChildren) {
                const value = this.getFieldName('value')
                const label = this.getFieldName('label')

                activeOptions.push({
                    [value]: WUX_CASCADER,
                    [label]: chooseTitle
                })
            }

            return activeOptions
        },
        getNextActiveValue(value, optionIndex) {
            let { activeValue } = this.data

            activeValue = activeValue.slice(0, optionIndex + 1)
            activeValue[optionIndex] = value

            return activeValue
        },
         updated(currentOptions, optionIndex, condition, callback) {
             //console.log("updated",currentOptions)
            const value = this.getFieldName('value')
            const children = this.getFieldName('children')
            const hasChildren = currentOptions[children] && currentOptions[children].length > 0
            const activeValue = this.getNextActiveValue(currentOptions[value], optionIndex)
            const activeOptions = this.getMenus(activeValue, hasChildren)
            const activeIndex = activeOptions.length - 1
            const showOptions = this.getShowOptions(activeValue)
            const params = {
                activeValue,
                activeOptions,
                activeIndex,
                showOptions,
            }

            // 判断 hasChildren 计算需要更新的数据
            if (hasChildren || (activeValue.length === showOptions.length && (optionIndex = Math.max(0, optionIndex - 1)))) {
                params.bodyStyle = `transform: translate(${-50 * optionIndex}%)`
                params.showOptions = showOptions
            }

            // 判断是否需要 setData 更新数据
            if (condition) {
                this.setData(params)
            }

            // 回调函数
            if (typeof callback === 'function') {
                callback.call(this, currentOptions, activeOptions, !hasChildren)
            }
        },
        /**
         * 更新级联数据
         * @param {Array} activeValue 当前选中值
         */
        getCurrentOptions(activeValue = this.data.activeValue) {
            const optionIndex = Math.max(0, activeValue.length - 1)
            const activeOptions = this.getActiveOptions(activeValue)
            const currentOptions = activeOptions[optionIndex]

            if (currentOptions) {
                this.updated(currentOptions, optionIndex, true)
            } else {
                const value = this.getFieldName('value')
                const label = this.getFieldName('label')

                activeOptions.push({
                    [value]: WUX_CASCADER,
                    [label]: this.data.chooseTitle
                })

                const showOptions = this.getShowOptions(activeValue)
                const activeIndex = activeOptions.length - 1
                const params = {
                    showOptions,
                    activeOptions,
                    activeIndex,
                    bodyStyle: '',
                }

                this.setData(params)
            }
        },
        /**
         * 点击菜单时的回调函数
         */
        onMenuClick(e) {
            const { menuIndex } = e.currentTarget.dataset
            const index = menuIndex > 1 ? menuIndex - 1 : 0
            const bodyStyle = `transform: translate(${-50 * index}%)`

            this.setData({
                bodyStyle,
                activeIndex: menuIndex,
            })
        },
        /**
         * 点击选项时的回调函数
         */
        onItemSelect(e) {
        
          const { item, optionIndex, type } = e.currentTarget.dataset
            // 判断是否禁用
            if (!type && (!item || item.disabled)) return

            // updated

            this.updated(item, optionIndex, !this.data.controlled, this.onChange)

        },
        /**
         * 组件关闭时的回调函数
         */
        onPopupClose() {
            this.triggerEvent('close')
        },
        /**
         * 选择完成时的回调函数
         */
        onChange(currentOptions = {}, activeOptions = [], done = false) {
            const options = activeOptions.filter((n) => n[this.getFieldName('value')] !== WUX_CASCADER)
            const value = options.map((n) => n[this.getFieldName('value')])

            // 判断是否异步加载
            if (currentOptions.isLeaf === false && !currentOptions.children) {
                this.emitEvent({ value, options, done: false })
                // this.triggerEvent('load', { value, options })
                this.loadOptions({ value, options })
                return
            }

            // 正常加载
            this.emitEvent({ value, options, done })
        },
        emitEvent(params = {}) {
           //console.log(params)
            this.triggerEvent('change', params)

            // 当选择完成时关闭组件
            if (params.done) {
                this.onPopupClose()
            }
        },
        getFieldName(name) {
            return this.data.fieldNames[name]
        },
        loadOptions(params) {
          //console.log(params)
          const { value } = params
          const options = this.data.options
          let code = value[value.length - 1]
          const result = deal(options, node => node.value === code)[0];

          this.queryTown(code).then(res => {
            if(res.failed) return
            result.children = res.data.map(item => ({ value: item.sid, label: item.name, parentid: item.parentid }))

            this.setData({ value_addr: value, options }, () => {
              this.getCurrentOptions()
              wx.setStorage({ key: 'options', data: options })
            })
          })
        },
      
      // 查询行政区划表
      queryCanton() {
        tss.query({
          // url: tss.url('data') + 's_canton_infom',
          url: tss.url('sql') + 'canton_info',
          params: { datalevel: '1,2,3', noCache: false },
          completion: res => {
            if (res.failed) return
            let District = res.data
              .filter(i => i.datalevel == 3)
              .map(i => ({ value: i.sid, label: i.name, parentid: i.parentid, isLeaf: this.data.isLeaf }))
            let City = res.data
              .filter(i => i.datalevel == 2)
              .map(i => ({ value: i.sid, label: i.name, parentid: i.parentid, children: District.filter(x => i.sid == x.parentid) }))
            let Province = res.data
              .filter(i => i.datalevel == 1)
              .map(i => ({ value: i.sid, label: i.name, parentid: i.parentid, children: City.filter(x => i.sid == x.parentid) }))

            this.setData({ options: Province })
          }
        })
      },
       // 查询第四级县
      queryTown(parentid) {
        return new Promise(completion => {
          tss.query({
            url: tss.url('sql') + 'canton_info',
            params: { parentid },
            completion
          })
        })
      }
    },
  attached() {
    let options = wx.getStorageSync('options')
    if (options) {
      this.setData({ options })
    } else {
      this.queryCanton()
    }
    const { defaultValue, value, controlled } = this.data
    const activeValue = controlled ? value : defaultValue
    const fieldNames = Object.assign({}, defaultFieldNames, this.data.defaultFieldNames)

    this.setData({ activeValue, fieldNames }, () => this.getCurrentOptions(activeValue))
  },
})


function deal(nodes, predicate) {
  // 如果已经没有节点了，结束递归
  if (!(nodes && nodes.length)) {
    return [];
  }
  const newChildren = [];
  for (const node of nodes) {
    if (predicate(node)) {
      // 如果节点符合条件，直接加入新的节点集
      newChildren.push(node);
      node.children = deal(node.children, predicate);
    } else {
      // 如果当前节点不符合条件，递归过滤子节点，
      // 把符合条件的子节点提升上来，并入新节点集
      newChildren.push(...deal(node.children, predicate));
    }
  }
  return newChildren;
}
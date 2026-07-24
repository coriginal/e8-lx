import user from '../../utils/user'
const tss = require('../../utils/tss.js')

Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    choosedIdx: ''
  },
  lifetimes: {
    ready() {
      const { domain_group } = user
      if(domain_group){
        this.getDomainGroup(domain_group)
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    chooseDomain(e) {
      console.log(e)
      const { id } = e.currentTarget
      this.setData({
        choosedIdx: Number(id)
      })
    },
    confirmChoose() {
      const { choosedIdx } = this.data
      if (choosedIdx !== '') {
        const { domain } = this.data.domain_group_list[choosedIdx]

        this.triggerEvent('domain', domain)
      } else {
        wx.showToast({
          title: '请选择所属公司！', icon: 'none'
        })
      }
    },
    getDomainGroup(domain_group) {
      tss.query({
        url: tss.url('data') + 'x_domain_group',
        params: {
          domain_group
        },
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.showModal({
              showCancel: false,
              content: res.errorMsg
            })
            return
          }
          // let data = new Array(20).fill(res.data[0]);

          if (res.data.length == 1) {
            const [domainInfo] = res.data
            const { domain } = domainInfo
            this.triggerEvent('domain', domain)
          }
          this.setData({
            domain_group_list: res.data
          })
        }
      })
    }
  }
})

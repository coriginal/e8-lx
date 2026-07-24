import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const alert = require('../../../utils/alert.js')
const lc = require('../../../utils/listenerCenter.js')


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    customerId: String,
    type: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    addrList: [],
    page:1,
    rows:5,
    nomore:false
  },
  lifetimes: {
    ready() {
      console.log(this.data.customerId)
      const customerId = this.data.customerId
      if (customerId) {
        this.getCustomerAddrUsed(this.data.type, customerId)
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getCustomerAddrUsed(type, customer_id) {
      // 查询客户地址列表
      tss.query({
        url: tss.url('sql') + 'customer_contact',
        params: { customer_id, type: type == 'send' ? '寄件' : '收件',page:this.data.page,rows:this.data.rows },
        completion: res => {
          if (res.failed) return
          this.setData({
            addrList: this.data.addrList.concat(res.data.rows) 
          })
          if(res.data.total===this.data.addrList.length){
            this.setData({
                nomore:true
            })
          }
        }
      })
    },
    loadMore(){
        if(this.data.nomore){
            return
        }
        this.setData({
            page:++this.data.page
        },()=>{
            this.getCustomerAddrUsed(this.data.type, this.data.customerId)
        })
    },
    chooseAddr(e) {
      const { item } = e.currentTarget.dataset
      console.log(item)
      this.triggerEvent('change', item)
    }
  }
})

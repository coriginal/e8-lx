
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js');
const lc = require('../../../utils/listenerCenter.js')

Component({
  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    orderId: String
    // task: {
    //   type: Object,
    //   value: {}
    // }
  },

  data: {
    task: []
  },

  ready() {
    this.getTmsOrder()
  },

  methods: {
    getTmsOrder() {
      console.log("tms_order")
      tss.query({
        url: tss.url('sql') + 'tms_order',
        params: { tms_order_id: this.data.orderId, task_info: true },
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.hideLoading()
            wx.showModal({ content: res.errorMsg, showCancel: false })
            return
          }
          const [order] = res.data
          this.triggerEvent("verifyAndReceiptData",{
              receipt_attachids:order.receipt_attachids,
              send_phone:order.send_phone,
              receive_phone:order.receive_phone,
              rcode_type: order.rcode_type
          })
          let task = [
            { title: '提1', child: [] },
            { title: '转1', child: [] },
            { title: '转2', child: [] },
            { title: '转3', child: [] },
            { title: '派1', child: [] }
          ]
          // let task = { '提1': [], '转1': [], '转2': [], '转3': [], '派1': [] };
          const reg = /^提1$|^转1$|^转2$|^转3$|^派1$/
          task.forEach(item => {
            const { title } = item
            if (order[title]) {
              item.child = order[title]
            }
            // if (reg.test(order[title])) {
            //   item.child = order[title]||[]
            // }
          })
          console.log(task)
          this.setData({
            task: task.filter(i => i.child.length > 0)
          })
        }
      })
    },
    goCarLocation(e) {
      const { info } = e.currentTarget.dataset
      const { plate_num, task_code } = info
      if (plate_num) {
        wx.navigateTo({
          url: `${Pages.car_location}?plate_num=${plate_num}&task_code=${task_code}`
        })
      }
    }
  }
})

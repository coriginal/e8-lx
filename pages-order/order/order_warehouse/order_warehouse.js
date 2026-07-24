import { formatDate } from '../../../utils/util.js'
const _App = getApp().globalData
import Pages from '../../../pages.js'
const tss = require('../../../utils/tss.js')
const lc = require('../../../utils/listenerCenter.js')

Page({

  data: {
    ware_house:[]
  },

  onLoad(options) {
    
  },
  
  checkboxChange(e){
    console.log(e)
    this.data.ware_house = e.detail.value
  },

  inputValue(e){
    let { id } = e.currentTarget
    this.data[id] = e.detail.value
  },
  confirm(e){
    tss.post({
      url: tss.url('xdata') + 'c_site',
      params:{
        status:'在用',
        name: this.data.ware_house_name||'',
        wh_type: this.data.ware_house[0]||'',
        type:'仓库',
        phone:this.data.phone||''
      },
      completion:res=>{
        console.log(res)
        if(res.data.failed){
          wx.showModal({ content: res.errorMsg, showCancel: false })
          return
        }
        wx.showModal({
          content: '新增成功',
          showCancel:false,
          success:res=>{
            if(res.confirm){
              lc.emitEvent('wareHouseInfo', { wareHouseInfo: 'refresh' })
              wx.navigateBack()
            }
          }
        })
      }
    })
  }
})
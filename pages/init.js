const _App = getApp().globalData;
const tss = require('../utils/tss.js');

export default function initFn() {
  return Promise.all([
    getComponyInfo(),
    getDomainConfig(),
    (_App.user.isCustomer && getCustomerInfo())
  ])
    .then(res => res.map(i => i.failed ? [] : i.data))
    .then(res => {
      const [companyInfo, domainConfig, customerInfo] = res;
      let domainConfigMap = {};
      for (let i = 0; i < domainConfig.length; i++) {
        domainConfigMap[domainConfig[i].code] = domainConfig[i]
      }
      _App.DomainConfig = domainConfigMap;
      if(companyInfo){
        _App.companyInfo = companyInfo[0]
      }
      if(customerInfo){
        console.log("客户信息", _App.user.isCustomer, customerInfo)
        _App.customerInfo = customerInfo[0] || null
      }
    })
}
const getCustomerInfo=()=>{
    return new Promise((completion)=>{
        tss.query({
            url:tss.url('sql')+'customer',
            completion
        })
    })
}

const getComponyInfo = () => {
  return new Promise((completion) => {
    tss.query({
      url: tss.url('sql') + 'tms_x_domain',
      completion
    })
  })

}

const getDomainConfig = () => {
  return new Promise((completion) => {
    tss.query({
      url: tss.url('ENTITY') + 'DomainConfig',
      completion
    })
  })
}
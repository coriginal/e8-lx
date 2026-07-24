
// 二维码地址
// https://www.boudata.com/tss/wx/api/acode?appId=wx1f18a0c7e9272b40&page=pages/homepage/home_gzh/index&qrCode=true
// https://tms.boudata.com/tss/wx/api/acode?appId=wx9b75ba40fdf9b921&page=pages/redirect/redirect&qparam=18&qrCode=true
// https://ms.boudata.com/tss/wx/api/acode?appId=wx3cdec87f52559387&page=pages/homepage/home_gzh/index&qrCode=true
import localStorage from '../../../utils/localStorage';

Page({
  onLoad(options) {
    console.log(options)
    const { domain, group, belong, pid } = options
    domain && localStorage.setItem("domain", domain)
    group && localStorage.setItem("group", group)
    belong && localStorage.setItem("belong", belong)
    pid && localStorage.setItem("pid", pid)
  }
})
// 壹米滴答
import out from '../custom_print/out'
export const printData = (data, subtcode = null) => {
    //测试
    console.log(data)
    //
    //data = test_data
    //
    var allData = []
    let printData = data[0]
    console.log(printData)
    printData.platform_info=JSON.stringify(printData.platform_info)
    const subOrder = printData.platform_subcodes.split(',')
    if (subOrder.length) {
        let index = subtcode && subOrder.indexOf(subtcode)
        console.log(index)
        for (let i in subOrder) { //subOrder
            if (subtcode && index != i) {
                continue;
            }
            let cxk={"init":{"width":76,"height":130},"rowLineList":[{"x0":0,"y0":10,"x1":76,"y1":10,"width":2,"type":"rl"},{"x0":"31","y0":"5","x1":"58","y1":"5","width":"2","type":"rl"},{"x0":"0","y0":"26","x1":"76","y1":"26","width":"2","type":"rl"},{"x0":"0","y0":"34","x1":"76","y1":"34","width":"2","type":"rl"},{"x0":"0","y0":"52","x1":"76","y1":"52","width":"2","type":"rl"},{"x0":"0","y0":"58","x1":"76","y1":"58","width":"2","type":"rl"},{"x0":"0","y0":"82","x1":"76","y1":"82","width":"2","type":"rl"},{"x0":"0","y0":"88","x1":"76","y1":"88","width":"2","type":"rl"}],"colLineList":[{"x0":"31","y0":"0","x1":"31","y1":"10","width":"2","type":"cl"},{"x0":"58","y0":"0","x1":"58","y1":"10","width":"2","type":"cl"}],"textList":[{"fontsize":"24","x":"0","y":"15","data":"库市-库D02-K08-P","size":0,"type":"text","center_width":"76","mag":"2","wrap":0,"bind":{"type":"platform","field":"arrivedOrgSimpleName"},"center":112,"tail":""},{"fontsize":"32","x":"2","y":"28","data":"库尔勒市","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"receive_district"},"tail":""},{"fontsize":"32","x":"64","y":"28","data":"1/5","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"deliver":"count","tail":""},{"fontsize":"32","x":"3","y":"41","data":"收","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"32","x":"10","y":"35","data":"孔军","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"receive_man"},"tail":""},{"fontsize":"24","x":"10","y":"39","data":"18699626692","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"receive_phone"},"tail":""},{"fontsize":"24","x":"10","y":"42","data":"新疆维吾尔自治区巴音郭楞蒙古自治州库尔勒市萨依巴格辖区人民东路七星华誉购物中心一楼门面那拉丝醇专卖店","size":0,"type":"text","center_width":"0","mag":"1","wrap":"20","bind":{"type":"normal","field":"receive_addr"},"_data":"新疆维吾尔自治区巴音郭楞蒙古自治州库尔勒\n市萨依巴格辖区人民东路七星华誉购物中心一\n楼门面那拉丝醇专卖店","tail":""},{"fontsize":"32","x":"2","y":"53","data":"寄","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"32","x":"7","y":"53","data":"杨沫","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"send_man"},"tail":""},{"fontsize":"32","x":"33","y":"53","data":"17729091943","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"send_phone"},"tail":""},{"fontsize":"24","x":"61","y":"54","data":"实名认证","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"32","x":"58","y":"1","data":"大件快递3.60","size":0,"type":"text","center_width":"18","mag":"1","wrap":"4","bind":{"type":"normal","field":"trans_mode"},"_data":"大件快递\n3.60","center":472,"tail":""},{"fontsize":"24","x":"65","y":"77","data":"已验视","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"2","y":"90","data":"8602163121","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"code"},"tail":""},{"fontsize":"32","x":"2","y":"94","data":"那拉臻-那拉丝醇全脂驼乳粉320g*12  2件，那拉臻-那拉丝醇初乳+全脂驼乳粉315g*12听  2件，那拉丝醇乳酸菌配方驼乳粉300g*12（1件）","size":0,"type":"text","center_width":"0","mag":"1","wrap":"20","bind":{"type":"normal","field":"cargo1"},"_data":"那拉臻-那拉丝醇全脂驼乳粉320g*12\n  2件，那拉臻-那拉丝醇初乳+全脂驼乳\n粉315g*12听  2件，那拉丝醇乳酸\n菌配方驼乳粉300g*12（1件）","tail":""},{"fontsize":"24","x":"2","y":"125","data":"2023-04-17 16:31:53","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"deliver":"date","tail":""},{"fontsize":"32","x":"15","y":"71","data":"子","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"32","x":"15","y":"76","data":"母","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"32","x":"20","y":"71","data":"DPK3641 751 71 586","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":"","deliver":"barcode"},{"fontsize":"32","x":"20","y":"76","data":"DPK364175171586","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"platform","field":"parentMailNo"},"tail":""},{"fontsize":"24","x":"45","y":"84","data":"保价金额：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"2","y":"84","data":"签收单返单：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""}],"barCodeList":[{"mode":128,"width":1,"ratio":1,"height":"10","x":"5","y":"60","data":"1234567890","type":"barcode","deliver":"barcode"}]}
            let deliver={
                count:`${Number(i)+1}/${subOrder.length}`,
                date:formatTime(new Date()),
                barcode:subOrder[i]
            }
            console.log(deliver)
            allData.push(out(cxk, printData,deliver))
        }
    }
    return allData
}
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : `0${n}`
}
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}
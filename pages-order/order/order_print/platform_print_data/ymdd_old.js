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
            let cxk={"init":{"width":76,"height":105},"rowLineList":[{"x0":"0","y0":"16","x1":"76","y1":"16","width":"2","type":"rl"},{"x0":"0","y0":"21","x1":"76","y1":"21","width":"2","type":"rl"},{"x0":"0","y0":"31","x1":"76","y1":"31","width":"2","type":"rl"},{"x0":"0","y0":"41","x1":"76","y1":"41","width":"2","type":"rl"},{"x0":"0","y0":"51","x1":"76","y1":"51","width":"2","type":"rl"},{"x0":"60","y0":"46","x1":"76","y1":"46","width":"2","type":"rl"},{"x0":"0","y0":"63","x1":"76","y1":"63","width":"2","type":"rl"},{"x0":"0","y0":"72","x1":"76","y1":"72","width":"2","type":"rl"},{"x0":"0","y0":"81","x1":"76","y1":"81","width":"2","type":"rl"},{"x0":"0","y0":"93","x1":"76","y1":"93","width":"2","type":"rl"}],"colLineList":[{"x0":"60","y0":"21","x1":"60","y1":"51","width":"2","type":"cl"},{"x0":"8","y0":"63","x1":"8","y1":"81","width":"2","type":"cl"},{"x0":"38","y0":"63","x1":"38","y1":"81","width":"2","type":"cl"},{"x0":"46","y0":"63","x1":"46","y1":"81","width":"2","type":"cl"}],"textList":[{"fontsize":"24","x":"0","y":"65","data":"物品","size":0,"type":"text","center_width":"8","mag":"1","wrap":"1","center":20,"_data":"物\n品"},{"fontsize":"24","x":"0","y":"74","data":"打印","size":0,"type":"text","center_width":"8","mag":"1","wrap":"1","center":20,"_data":"打\n印"},{"fontsize":"24","x":"38","y":"65","data":"重量体积","size":0,"type":"text","center_width":"8","mag":"1","wrap":"2","center":312,"_data":"重量\n体积"},{"fontsize":"24","x":"38","y":"75","data":"签收","size":0,"type":"text","center_width":"8","mag":"1","wrap":0,"center":312},{"fontsize":"24","x":"2","y":"23","data":"温州分拨","size":0,"type":"text","center_width":"0","mag":"2","wrap":0,"bind":{"type":"platform","field":"allocationCentre"}},{"fontsize":"24","x":"30","y":"28","data":"编织袋","size":0,"type":"text","center_width":"30","mag":"1","wrap":0,"bind":{"type":"normal","field":"pack"},"center":324},{"fontsize":"32","x":"60","y":"24","data":"门到门","size":0,"type":"text","center_width":"16","mag":"1","wrap":0,"bind":{"type":"platform","field":"serverType"},"center":496},{"fontsize":"24","x":"2","y":"33","data":"乐清盐盘营业部E","size":0,"type":"text","center_width":"0","mag":"2","wrap":0,"bind":{"type":"platform","field":"deptSiteName"}},{"fontsize":"32","x":"2","y":"42","data":"Y07-Y18,A18-F07","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"platform","field":"storageCode"},"need_cut":{"char":",","wrap":true},"_data":"Y07-Y18\nA18-F07\n"},{"fontsize":"24","x":"3","y":"54","data":"收","size":0,"type":"text","center_width":"0","mag":"2","wrap":0},{"fontsize":"24","x":"12","y":"53","data":"陈浩进","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"receive_man"}},{"fontsize":"24","x":"12","y":"56","data":"浙江省温州市乐清市翁垟街道兴茂路260号（创点广告）","size":0,"type":"text","center_width":"0","mag":"1","wrap":"19","bind":{"type":"normal","field":"receive_addr"},"_data":"浙江省温州市乐清市翁垟街道兴茂路260\n号（创点广告）"},{"fontsize":"24","x":"38","y":"53","data":"18957718886","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"receive_phone"}},{"fontsize":"32","x":"9","y":"65","data":"织带","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"cargo"}},{"fontsize":"32","x":"48","y":"65","data":63,"size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"platform","field":"goodsWeight"},"tail":"kg/"},{"fontsize":"32","x":"2","y":"17","data":"106634708023","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"platform","field":"wayBillNo"}},{"fontsize":"24","x":"3","y":"96","data":"寄","size":0,"type":"text","center_width":"0","mag":"2","wrap":0},{"fontsize":"24","x":"15","y":"95","data":"柯诗标","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"customer_name"}},{"fontsize":"24","x":"40","y":"95","data":"18970366555","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"send_phone"}},{"fontsize":"24","x":"15","y":"98","data":"江西省上饶市广信区尊桥乡岛山村6号","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"send_addr"}},{"fontsize":"32","x":"60","y":"34","data":"标准件","size":0,"type":"text","center_width":"16","mag":"1","wrap":0,"bind":{"type":"platform","field":"productType"},"center":496},{"fontsize":"24","x":"60","y":"42","data":"寄付","size":0,"type":"text","center_width":"16","mag":"1","wrap":0,"deliver":"paytype","center":520},{"fontsize":"32","x":"65","y":"65","data":0,"size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"platform","field":"goodsVolume"},"tail":""},{"fontsize":"24","x":"30","y":"22","data":"1/2","size":0,"type":"text","center_width":"30","mag":"2","wrap":0,"center":324,"tail":"","deliver":"count"},{"fontsize":"20","x":"8","y":"75","data":"2023-04-06 19:10:02","size":0,"type":"text","center_width":"30","mag":"1","wrap":0,"center":89,"tail":"","deliver":"date"}],"barCodeList":[{"mode":128,"width":1,"ratio":1,"height":"10","x":"32","y":"2","data":"1234567890","type":"barcode","deliver":"barcode","hastext":"true"},{"mode":128,"width":1,"ratio":1,"height":"8","x":"28","y":"82","data":"106634708023","type":"barcode","bind":{"type":"platform","field":"wayBillNo","hastext":"true"}}]}
            let deliver={
                barcode:subOrder[i],
                paytype:JSON.parse(printData.platform_info).settlementType==1?'寄付':'',
                count:`${Number(i)+1}/${subOrder.length}`,
                date:formatTime(new Date())
            }
            console.log(deliver)
            allData.push(out(cxk, printData,deliver))
            // allData.push((
            //     "! 0 203 200 828 1\r\n" +
            //     "PAGE-WIDTH 608\r\n" +
            //     "BOX 0 0 608 828 2\r\n" +
            //     "LINE 0 128 608 128 2\r\n" +
            //     "BARCODE-TEXT 7 0 5\r\n"+
            //     `BARCODE 128 1 1 90 243 5 ${subOrder[i]}\r\n` +
            //     "BARCODE-TEXT OFF\r\n"+
            //     "LINE 0 168 608 168 2\r\n" +
            //     "SETMAG 1 1\r\n"+
            //     `TEXT 5 0 24 136 运单号${printData.tcode}\r\n`+
            //     "LINE 480 168 480 408 2\r\n" +
            //     "SETMAG 2 2\r\n"+
            //     "SETBOLD 1\r\n"+
            //     `TEXT 5 0 24 184 ${orderInfo.allocationCentre}\r\n`+
            //     "SETBOLD 0\r\n"+
            //     "SETMAG 1 1\r\n"+
            //     Center({
            //         fontsize:4,
            //         x:320,
            //         y:182,
            //         data:`${Number(i)+1}/${subOrder.length}`,
            //         width:160
            //     })+
            //     Center({
            //         fontsize:3,
            //         x:320,
            //         y:214,
            //         data:printData.pack,
            //         width:160
            //     })+
            //     "SETMAG 1 1\r\n"+
            //     Center({
            //         fontsize:5,
            //         x:480,
            //         y:168,
            //         data:orderInfo.serverType,
            //         width:128,
            //         height:80
            //     })+
            //     "LINE 0 248 608 248 2\r\n" +
            //     "SETMAG 2 2\r\n"+
            //     "SETBOLD 1\r\n"+
            //     `TEXT 5 0 24 264 ${orderInfo.deptSiteName}\r\n`+
            //     "SETBOLD 0\r\n"+
            //     "SETMAG 1 1\r\n"+
            //     Center({
            //         fontsize:5,
            //         x:480,
            //         y:248,
            //         data:orderInfo.productType,
            //         width:128,
            //         height:80
            //     })+
            //     "LINE 0 328 608 328 2\r\n" +
            //     "SETBOLD 1\r\n"+
            //     `TEXT 5 0 24 339 ${orderInfo.storageCode.split(',')[0]}\r\n`+
            //     `TEXT 5 0 24 373 ${orderInfo.storageCode.split(',')[1]}\r\n`+
            //     "SETBOLD 0\r\n"+
            //     // Center({
            //     //     fontsize:5,
            //     //     x:480,
            //     //     y:329,
            //     //     data:
            //     // })+
            //     "LINE 480 368 608 368 2\r\n" +

            //     "LINE 0 408 608 408 2\r\n" +

            //     "SETMAG 2 2\r\n" +
            //     "TEXT 5 0 24 432 收\r\n"+
            //     "SETMAG 1 1\r\n" +
            //     "LINE 0 504 608 504 2\r\n" +
            //     "LINE 64 504 64 648 2\r\n" +
            //     "LINE 304 504 304 648 2\r\n" +
            //     "LINE 368 504 368 648 2\r\n" +

            //     "TEXT 5 0 20 515 物\r\n"+  
            //     "TEXT 5 0 20 540 品\r\n"+  
            //     "TEXT 5 0 20 587 打\r\n"+  
            //     "TEXT 5 0 20 612 印\r\n"+  

            //     "TEXT 5 0 312 515 重量\r\n"+  
            //     "TEXT 5 0 312 540 体积\r\n"+ 

            //     "TEXT 5 0 312 600 签收\r\n"+ 

            //     "LINE 0 576 608 576 2\r\n" +
            //     "LINE 0 648 608 648 2\r\n" +

            //     "LINE 0 744 608 744 2\r\n" +
            //     "SETMAG 2 2\r\n" +
            //     "TEXT 5 0 24 762 寄\r\n"+
            //     "FORM \r\n" +
            //     "PRINT \r\n"))
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
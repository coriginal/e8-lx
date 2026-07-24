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
    //
    printData.platform_info=JSON.stringify({
        "orderId": "O221116001",
        "waybillNumber": "KY5000032054197",
        "printWaybillNumber": "KY5000032054197",
        "senderAreaCode": "",
        "areaCode": "0571",
        "destinationAirport": "杭州",
        "destinationOperationDepartment": "江东取派部",
        "firstDistribution": "赭山中转场",
        "consigneeNetWork": "同一点部",
        "outboundAllocation": "",
        "network": "江东取派部-同一点部",
        "flightsPlateNumber": "",
        "urgentFlag": "",
        "serviceMode": "次日达",
        "threeCode": "杭州-赭山中转场",
        "identification": "商",
        "smallBoxflag": "",
        "regionName": "华东大区"
       })
    //
    //printData.platform_info=JSON.stringify(printData.platform_info)
    const subOrder = ['001']//printData.platform_subcodes.split(',')
    if (subOrder.length) {
        let index = subtcode && subOrder.indexOf(subtcode)
        console.log(index)
        for (let i in subOrder) { //subOrder
            if (subtcode && index != i) {
                continue;
            }
            let cxk={"init":{"width":76,"height":130},"rowLineList":[{"x0":"2","y0":"18","x1":"74","y1":"18","width":"2","type":"rl"},{"x0":"2","y0":"125","x1":"74","y1":"125","width":"2","type":"rl"},{"x0":"2","y0":"34","x1":"74","y1":"34","width":"2","type":"rl"},{"x0":"2","y0":"44","x1":"74","y1":"44","width":"2","type":"rl"},{"x0":"2","y0":"50","x1":"74","y1":"50","width":"2","type":"rl"},{"x0":"2","y0":"72","x1":"74","y1":"72","width":"2","type":"rl"},{"x0":"2","y0":"62","x1":"74","y1":"62","width":"2","type":"rl"},{"x0":"2","y0":"82","x1":"74","y1":"82","width":"2","type":"rl"},{"x0":"2","y0":"107","x1":"74","y1":"107","width":"2","type":"rl"},{"x0":"2","y0":"121","x1":"74","y1":"121","width":"2","type":"rl"}],"colLineList":[{"x0":"2","y0":"18","x1":"2","y1":"125","width":"2","type":"cl"},{"x0":"74","y0":"18","x1":"74","y1":"125","width":"2","type":"cl"},{"x0":"28","y0":"34","x1":"28","y1":"50","width":"2","type":"cl"},{"x0":"8","y0":"50","x1":"8","y1":"72","width":"2","type":"cl"},{"x0":"20","y0":"121","x1":"20","y1":"125","width":"2","type":"cl"},{"x0":"38","y0":"121","x1":"38","y1":"125","width":"2","type":"cl"},{"x0":"56","y0":"121","x1":"56","y1":"125","width":"2","type":"cl"}],"textList":[{"fontsize":"24","x":"4","y":"21","data":"随","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"4","y":"24","data":"货","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"4","y":"27","data":"联","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"64","y":"30","data":"已验视","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"16","x":"3","y":"122","data":"寄件签署：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"16","x":"21","y":"122","data":"收件员：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"16","x":"39","y":"122","data":"收件签署：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"16","x":"57","y":"122","data":"签收时间：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"3","y":"83","data":"寄方备注： 工业使用，请小心轻放。工业使用，请小心 轻放。工业使用，请小心轻放工业使用，请小心轻放.","size":0,"type":"text","center_width":"0","mag":"1","wrap":"24","_data":"寄方备注： 工业使用，请小心轻放。工业使用，请小\n心 轻放。工业使用，请小心轻放工业使用，请小心轻\n放.","tail":""},{"fontsize":"24","x":"4","y":"74","data":"托寄物：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"4","y":"78","data":"件数：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"50","y":"74","data":"回单：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"58","y":"78","data":"计重：","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"2","y":"78","data":"实重：","size":0,"type":"text","center_width":"72","mag":"1","wrap":0,"center":274,"tail":"","deliver":"weight"},{"fontsize":"32","x":"3","y":"54","data":"收","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"32","x":"3","y":"65","data":"寄","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"24","x":"13","y":"78","data":1,"size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"cargo_amount"},"tail":""},{"fontsize":"24","x":"16","y":"74","data":"钢扣","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"cargo"},"tail":""},{"fontsize":"16","x":"35","y":"64","data":"顾欢","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"tail":""},{"fontsize":"16","x":"45","y":"64","data":"15000517125","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"send_phone"},"tail":""},{"fontsize":"16","x":"10","y":"68","data":"浙江省嘉兴市海盐县西塘桥街道滨海大道1239号","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"send_addr"},"tail":""},{"fontsize":"24","x":"10","y":"56","data":"浙江省绍兴市越城区袍江工业区三江东路41号浙江米欧制带股份有限公司","size":0,"type":"text","center_width":"0","mag":"1","wrap":"21","bind":{"type":"normal","field":"receive_addr"},"_data":"浙江省绍兴市越城区袍江工业区三江东路41号\n浙江米欧制带股份有限公司","tail":""},{"fontsize":"24","x":"38","y":"52","data":"万佳","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"receive_man"},"tail":""},{"fontsize":"24","x":"48","y":"52","data":"18367559827","size":0,"type":"text","center_width":"0","mag":"1","wrap":0,"bind":{"type":"normal","field":"receive_phone"},"tail":""},{"fontsize":"24","x":"2","y":"36","data":"西安","size":0,"type":"text","center_width":"26","mag":"2","wrap":0,"center":72,"tail":""},{"fontsize":"24","x":"28","y":"36","data":"渭城中转","size":0,"type":"text","center_width":"46","mag":"2","wrap":0,"center":312,"tail":""},{"fontsize":"32","x":"2","y":"45","data":"灞桥取派部","size":0,"type":"text","center_width":"26","mag":"1","wrap":0,"tail":"","center":40},{"fontsize":"32","x":"28","y":"45","data":"灞桥分拨站干线组A区","size":0,"type":"text","center_width":"46","mag":"1","wrap":0,"tail":"","center":256}],"barCodeList":[{"mode":128,"width":1,"ratio":1,"height":"10","x":"12","y":"20","data":"1234567890","type":"barcode","hastext":true},{"mode":128,"width":1,"ratio":1,"height":"9","x":"16","y":"109","data":"1234567890","type":"barcode","hastext":true}]}
            let deliver={
                weight:`实重：${printData.weight}kg`
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
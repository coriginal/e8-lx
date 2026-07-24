// 韵达

function dealAdress(adr) {
    let text = "";
    let x = 10;
    let y = 402;

    for (let i = 0; i < adr.length; i += 12) {
        let line = adr.substring(i, i + 12);
        text += `TEXT 3 0 ${x} ${y} ${line}\r\n`;
        y += 20;
    }

    return text;
    // var text = ""
    // if (adr.length > 10) {
    //     text += `TEXT 5 0 10 296 ${adr.substring(0,9)}\r\n` + `TEXT 5 0 10 326 ${adr.substring(9,adr.length)}\r\n`
    // }else {
    //     text += `TEXT 5 0 10 296 ${adr}\r\n`
    // }
    // return text
}

function dealRoute(route, routecode) {
    route = route.split('-')
    routecode = routecode.split('-')
    let text = ""
    let spacing = 11
    let codeSpacing = 23
    route.forEach(i => {
        text += `TEXT 5 0 ${spacing} 572 ${i}\r\n`
        spacing += 118
    })
    routecode.forEach((i, idx) => {
        text += `TEXT 5 0 ${codeSpacing} 644 ${i}\r\n`
        codeSpacing += 118
    })
    return text
}

function dealDate(date) {
    let spacing = (441 - (date.length * 16)) / 2
    console.log(spacing)
    let text = `TEXT 20 3 ${spacing} 90 ${date}\r\n`
    return text
}

function dealCode(code) {
    let spacing = (441 - (code.length * 32)) / 2
    let text = `TEXT 4 7 ${spacing} 20 ${code}\r\n`
    return text
}
//适用于中文
function dataCenter(data, font, size, x, y, width, mag, z = 0) {
    switch (font) {
        case 3:
            z = 20
            break
        case 4:
            z = 24
            break
        case 20:
            z = 16
            break
        case 55:
            z = 16
            break
        case 28:
            z = 28
            break
        default:
            z = 24
    }
    let spacing = 0;
    let cn = /^[\u4e00-\u9fa5]+$/
    z *= mag;
    for (let i in data) {
        if (!cn.test(data[i])) {
            spacing += z / 2;
        } else {
            spacing += z
        }
    }
    spacing = x + (width - spacing) / 2
    let text = `TEXT ${font} ${size} ${spacing>=0?spacing:x} ${y} ${data}\r\n`
    return text
}

function getMode(data){
    if(data.service_mode != "自提"){
        if(!data.entry_type){
            if(!data.upstairs_type){
                return ""
            }else{
                return "上楼"
            }
        }else{
            return "提仓"
        }
    }
}

function dealSite(one, two) {
    let text = dataCenter(one, 20, 6, 0, 196, 346, 2) + "SETBOLD 0\r\n"
    if (one != two) {
        text += dataCenter(two, 20, 6, 0, 246, 346, 2)
    }
    return text
}
export const printData = (data, subtcode = null) => {
    let allData = []
    let printData = data[0]
    const orderInfo = printData.platform_info
    const subOrder = printData.platform_info.mailno_sub
    console.log(subOrder)
    if (subOrder.length) {
        let index = subtcode && subOrder.indexOf(subtcode)
        console.log(index)
        for (let i in subOrder) {
            if (subtcode && index != i) {
                continue;
            }
            allData.push()
            allData.push((
                "! 0 200 200 720 1\r\n" +
                "PAGE-WIDTH 600\r\n" +
                "BOX 0 0 592 704 2\r\n" +

                "LINE 0 113 592 113 2\r\n" +
                "LINE 448 0 448 113 2\r\n" +
                "LINE 448 57 592 57 2\r\n" +
                "LINE 0 195 592 195 2\r\n" +
                "LINE 0 333 592 333 2\r\n" +
                //青浦中部
                "LINE 0 241 337 241 2\r\n" +
                "LINE 0 287 592 287 2\r\n" +
                //s
                "LINE 337 195 337 333 2\r\n" +
                "LINE 0 380 278 380 2\r\n" +
                "LINE 278 333 278 560 2\r\n" +
                "LINE 427 333 427 560 2\r\n" +
                "LINE 427 428 592 428 2\r\n" +
                "LINE 427 479 592 479 2\r\n" +
                "LINE 0 513 592 513 2\r\n" +



                "LINE 0 560 580 560 2\r\n" +
                "LINE 119 560 119 704 2\r\n" +
                "LINE 237 560 237 704 2\r\n" +
                "LINE 356 560 356 704 2\r\n" +
                "LINE 470 560 470 704 2\r\n" +
                "LINE 0 632 580 632 2\r\n" +

                "SETMAG 2 2\r\n" +
                "SETBOLD 1\r\n" +
                dataCenter(orderInfo.mailno, 5, 0, 0, 29, 448, 2) +
                dataCenter(orderInfo.cargo_area.split('-')[orderInfo.cargo_area.split('-').length - 1], 5, 0, 380, 217, 212, 2) +

                // dealCode(subOrder[i]) +
                // dealDate(printData.order_date) +
                // dataCenter(orderInfo.receiver_center, 20, 7, 0, 137, 346, 2) +
                // dataCenter(printData.pack, 20, 6, 346, 230, 146, 2) +
                dealRoute(orderInfo.route, orderInfo.cargo_area) +
                //1/2
                // "BOX 346 129 592 188 0\r\n" +
                // `TEXT 20 0 410 137 ${subOrder.length}/${Number(i)+1}\r\n` +
                // dealSite(orderInfo.receiver_site, orderInfo.receiver_super_site) +
                // //包装类型
                // dataCenter(printData.service_mode, 20, 6, 346, 296, 146, 2) +
                // //竖条形码
                // `VBARCODE 128 2 20 110 496 560 ${subOrder[i]}\r\n` +
                // dataCenter(printData.receive_man, 20, 6, 346, 354, 146, 2) +
                // //收件地址
                "SETMAG 1 1\r\n" +
                "SETBOLD 0\r\n" +
                `TEXT 20 0 241 97 ${printData.order_date}\r\n` +
                dataCenter(orderInfo.receiver_center, 4, 0, 0, 206, 337, 1) +

                dataCenter(orderInfo.receiver_site, 4, 0, 0, 250, 337, 1) +
                // dataCenter(orderInfo.receiver_site, 4, 0, 0, 272, 337, 1) +//294

                dataCenter(`${subOrder.length}/${Number(i)+1}`, 4, 0, 380, 294, 212, 1) +
                dataCenter(orderInfo.segment_code, 5, 0, 0, 341, 278, 1) +
                dataCenter(printData.pack, 5, 0, 427, 366, 165, 1) +
                dataCenter(`${printData.weight||''}kg/${printData.volume+'m3'||''}`, 20, 0, 427, 438, 165, 1) +
                dataCenter(printData.cargo, 4, 0, 427, 480, 165, 1) +
                `TEXT ${orderInfo.sender_site.length>11?3:4} 0 0 521 ${orderInfo.sender_site}\r\n` +
                dataCenter(printData.receive_man, 20, 0, 278, 521, 149, 1) +
                dataCenter(getMode(printData), 4, 0, 427, 521, 165, 1) +
                `BARCODE 128 2 20 75 80 122 ${subOrder[i]}\r\n` +

                `BARCODE QR 278 350 M 2 U 7\r\n` +
                `MA,${subOrder[i]}\r\n` +
                "ENDQR \r\n" +
                dealAdress("【收件地址】" + printData.receive_addr + "【备注】" + printData.remark) +
                // //送货上门
                // dataCenter(orderInfo.sender_site, 5, 0, 0, 397, 346, 1) +
                // `TEXT 5 0 354 397 ${printData.weight||''}kg/${printData.volume||''}m\r\n` +
                // //物品
                // `TEXT 5 0 362 436 ${printData.cargo}\r\n` +
                // //横条形码
                // `BARCODE 128 2 20 75 8 475 ${subOrder[i]}\r\n` +
                // //备注
                // //"SETMAG 0 0\r\n" +
                // `TEXT 3 0 0 354 备注：${printData.remark || ''}\r\n` +
                "FORM\r\n" +
                "PRINT\r\n"))
        }
    }
    return allData
}
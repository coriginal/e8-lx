// 韵达

function dealAdress(adr) {
    var text = ""
    if (adr.length > 15) {
        text += `TEXT 5 0 10 296 ${adr.substring(0,14)}\r\n` + `TEXT 5 0 10 326 ${adr.substring(14,adr.length)}\r\n`
    } else {
        text += `TEXT 5 0 10 296 ${adr}\r\n`
    }
    return text
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
            z = 32
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
    z *= mag
    let spacing = x + (width - (data.length * z)) / 2
    let text = `TEXT ${font} ${size} ${spacing} ${y} ${data}\r\n`
    return text
}

function dealSite(one, two) {
    let text =  dataCenter(one, 20, 6, 0, 196, 346, 2) + "SETBOLD 0\r\n"
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
                "LINE 441 64 580 64 2\r\n" +
                "LINE 441 0 441 128 2\r\n" +
                "LINE 0 129 580 129 2\r\n" +
                "LINE 346 129 346 471 2\r\n" +
                "LINE 0 188 580 188 2\r\n" +
                "LINE 492 188 492 560 2\r\n" +
                "LINE 0 238 346 238 2\r\n" +
                "LINE 0 288 492 288 2\r\n" +
                "LINE 0 346 492 346 2\r\n" +
                "LINE 0 389 492 389 2\r\n" +
                "LINE 346 428 492 428 2\r\n" +
                "LINE 0 471 492 471 2\r\n" +
                "LINE 0 560 580 560 2\r\n" +
                "LINE 119 560 119 704 2\r\n" +
                "LINE 237 560 237 704 2\r\n" +
                "LINE 356 560 356 704 2\r\n" +
                "LINE 470 560 470 704 2\r\n" +
                "LINE 0 632 580 632 2\r\n" +

                "SETMAG 2 2\r\n" +
                "SETBOLD 1\r\n" +
                dealCode(subOrder[i]) +
                dealDate(printData.order_date) +
                dataCenter(orderInfo.receiver_center, 20, 7, 0, 137, 346, 2) +
                dataCenter(printData.pack, 20, 6, 346, 230, 146, 2) +
                dealRoute(orderInfo.route, orderInfo.cargo_area) +
                //1/2
                "BOX 346 129 592 188 0\r\n" +
                `TEXT 20 0 410 137 ${subOrder.length}/${Number(i)+1}\r\n` +
                dealSite(orderInfo.receiver_site, orderInfo.receiver_super_site) +
                //包装类型
                dataCenter(printData.service_mode, 20, 6, 346, 296, 146, 2) +
                //竖条形码
                `VBARCODE 128 2 20 110 496 560 ${subOrder[i]}\r\n` +
                dataCenter(printData.receive_man, 20, 6, 346, 354, 146, 2) +
                //收件地址
                "SETMAG 1 1\r\n" +
                dealAdress(printData.receive_addr) +
                //送货上门
                dataCenter(orderInfo.sender_site, 5, 0, 0, 397, 346, 1) +
                `TEXT 5 0 354 397 ${printData.weight||''}kg/${printData.volume||''}m\r\n` +
                //物品
                `TEXT 5 0 362 436 ${printData.cargo}\r\n` +
                //横条形码
                `BARCODE 128 2 20 75 8 475 ${subOrder[i]}\r\n` +
                //备注
                //"SETMAG 0 0\r\n" +
                `TEXT 3 0 0 354 备注：${printData.remark || ''}\r\n` +
                "FORM\r\n" +
                "PRINT\r\n"))
        }
    }
    return allData
}
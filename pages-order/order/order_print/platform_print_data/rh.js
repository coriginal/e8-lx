// 百世
import dayjs from 'dayjs'

function dealAddress(adr) {
    var text = ""
    if (adr.length > 15) {
        text += `TEXT 20 0 339 581 ${adr.substring(0,14)}\r\n` + `TEXT 20 0 259 605 ${adr.substring(14,adr.length)}\r\n`
    } else {
        text += `TEXT 20 0 339 581 ${adr}\r\n`
    }
    return text
}

function dataCenter(data, font, size, x, y, width, mag = 1) {
    let z = 0;
    switch (font) {
        case 3:
            z = 20;
            break;
        case 4:
            z = 32;
            break;
        case 20:
            z = 16;
            break;
        case 55:
            z = 16;
            break;
        case 28:
            z = 28;
            break;
        default:
            z = 24;
    }
    data = String(data);
    let pattern = /[\u4e00-\u9fa5]/,
        w = 0;
    data.split('').map((t) => {
        if (pattern.test(t)) {
            w += z * mag;
        } else {
            w += z * mag / 2;
        }
    });
    let spacing = x + (width - w) / 2;
    console.log('居中计算结果', spacing);
    let text = `TEXT ${font} ${size} ${Math.round(spacing)} ${y} ${data}\r\n`;
    return text;
}

function dealRouteCode(routeCode) {
    let routeCodeList = routeCode.split('-');
    let text = "";
    if (routeCodeList.length) {
        routeCodeList.map((item, index) => {
            text += dataCenter(item, 1, 0, 123 * index, 474, 123, 2)
        })
    }
    return text;
}

function dealRouteName(routeName) {
    let routeNameList = routeName.split('-');
    let text = ""
    if (routeNameList.length) {
        routeNameList.map((item, index) => {
            text += dataCenter(item, 3, 0, 123 * index, 523, 123, 1)
        })
    }
    return text;
}
export const printData = (data, subtcode = null, boxNo = "") => {
    let allData = []
    let orderData = data[0]
    let platformData = orderData.platform_info
    const subOrder = orderData.platform_subcodes.split(',');
    if (subOrder.length) {
        for (let i in subOrder) {
            console.log(i)
            if (subtcode && subtcode != subOrder[i]) {
                continue;
            }
            allData.push((
                "! 0 200 200 708 1\r\n" +
                "PAGE-WIDTH 600\r\n" +
                "SETBOLD 1\r\n" +
                `TEXT 4 0 ${592 - platformData.goodsName.length * 32 - 16} 8 ${platformData.goodsName}\r\n` +
                (orderData.trans_mode ? `TEXT 1 0 ${(592 - platformData.goodsName.length * 32)-(orderData.trans_mode.length * 24 + 16)} 8 ${orderData.trans_mode || ''}\r\n` +
                    `INVERSE-LINE ${(592 - platformData.goodsName.length * 32)-(orderData.trans_mode.length * 24 + 16)} 8 ${(592 - platformData.goodsName.length * 32) - 16} 8 32\r\n` : '') +
                "SETBOLD 0\r\n" +
                "SETMAG 2 2\r\n" +
                dataCenter(platformData.destCenter, 3, 0, 0, 102, 332, 2) +
                dataCenter(platformData.destName, 3, 0, 0, 243, 332, 2) +
                "LINE 0 49 509 49 2\r\n" +
                dealRouteCode(platformData.routeCode) +
                "SETMAG 1 1\r\n" +
                dataCenter(platformData.sendSite, 4, 0, 0, 557, 251, 1) +
                dataCenter(platformData.sendSiteTwo || '', 3, 0, 0, 601, 251, 1) +
                dataCenter(platformData.billCode, 4, 0, 0, 62, 324, 1) +
                `TEXT 4 0 333 62 ${Number(i)+1}/${subOrder.length}\r\n` +
                `TEXT 4 0 333 107 ${orderData.pack}\r\n` +
                `TEXT 1 0 333 152 ${orderData.service_mode == '派送' ? `派送（${orderData.upstairs_type ? '上楼' :'不含上楼'}）`: orderData.service_mode}\r\n` +
                dataCenter(platformData.destNameTwo, 1, 0, 0, 295, 324, 1) +
                dealRouteName(platformData.routeName) +
                `VBARCODE 128 1 1 75 517 400 ${subOrder[i]}\r\n` +

                "LINE 325 49 325 329 2\r\n" +
                "LINE 0 199 509 199 2\r\n" +

                `TEXT 1 0 333 207 J:\r\n` +
                `TEXT 1 0 333 247 S:\r\n` +
                `TEXT 1 0 333 287 T:\r\n` +

                `TEXT 1 0 373 207 ${orderData.weight} KG\r\n` +
                `TEXT 1 0 373 247 ${orderData.weight} KG\r\n` +
                `TEXT 1 0 373 287 ${orderData.volume}m3\r\n` +

                `TEXT 1 0 373 349 到：${orderData.arrive_pay || ''}\r\n` +
                `TEXT 1 0 373 389 代：${orderData.cod || ''}\r\n` +
                `TEXT 1 0 373 429 保：${orderData.insurance_limit || ''}\r\n` +

                `BARCODE-TEXT 7 0 5\r\n` +
                `BARCODE 128 1 1 72 40 341 ${subOrder[i]}\r\n` + //y:100
                `BARCODE-TEXT OFF\r\n` +



                "LINE 0 329 509 329 2\r\n" +

                "LINE 0 462 600 462 2\r\n" +
                "LINE 0 518 600 518 2\r\n" +
                "LINE 0 549 600 549 2\r\n" +
                "LINE 251 549 251 639 2\r\n" +

                `TEXT 20 0 259 557 收件人：${orderData.receive_man}\r\n` +
                "TEXT 20 0 259 581 收件地址：\r\n" +
                dealAddress(orderData.receive_addr) +
                "LINE 0 639 600 639 2\r\n" +
                `TEXT 20 0 12 652 ${orderData.remark || ''}\r\n` +
                `TEXT 20 0 12 680 最后打印时间：${dayjs().format("YYYY/MM/DD HH:mm:ss")}\r\n` +

                "FORM \r\n" +
                "PRINT \r\n"))
        }
    }
    return allData
}
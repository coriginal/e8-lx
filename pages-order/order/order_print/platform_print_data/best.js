// 百世
var lastRoute;

function dealData(data) {
    const {
        if_visit,
        cod,
        arrive_pay
    } = data
    let text = '',
        x = 30,
        y = 590,
        spacing = 80;
    [if_visit, cod, arrive_pay]
    .forEach((item, idx) => {
        if (item) {
            if (idx === 0) {
                text += `TEXT 4 3 ${x} ${y} 上 \r\nINVERSE-LINE ${x - 20} ${y - 10} ${x + 50} ${y - 10} 50 \r\n`
                x += spacing
            }
            if (idx === 1) {
                text += `TEXT 4 3 ${x - 5} ${y} COD \r\nINVERSE-LINE ${x - 20} ${y - 10} ${x + 50} ${y - 10} 50 \r\n`
                x += spacing
            }
            if (idx === 2) {
                text += `TEXT 4 3 ${x} ${y} 到 \r\nINVERSE-LINE ${x - 20} ${y - 10} ${x + 50} ${y - 10} 50 \r\n`
                x += spacing
            }
        }
    })
    return text
}


function dealRouter(data) {
    const {
        routingInfo
    } = data
    let text = '',
        spacing = 115,
        x = 10,
        y = 130,
        regex = /[a-zA-Z0-9]+/g;
    routingInfo.split('-').forEach(item => {
        let result = item.match(regex) || []
        text += `TEXT 5 0 ${x} ${y} ${item.substring(0, 2)} \r\n`
        text += result.length ? `TEXT 5 0 ${x+11} ${y+58} ${result[0]} \r\n` : ''
        x += spacing
        if (result[0]) {
            lastRoute = result[0]
        }
    })

    return text
}

function dealRemark(data) {
    const {
        receive_addr = '', platform_info = ''
    } = data
    const {
        remark = ''
    } = platform_info
    let if_receive_line_feed = false,
        text = '',
        spacingH = 30,
        printY = 490;
    //  派送15个字换行 备注16个字换行
    if (receive_addr.length > 15) {
        if_receive_line_feed = true
        let a = receive_addr.substring(0, 16),
            b = receive_addr.substring(16, receive_addr.length)
        text += `TEXT 3 0 10 ${printY} ${'【派送】' + a} \r\nTEXT 3 0 10 ${printY + spacingH} ${b} \r\n`
    } else {
        text += `TEXT 3 0 10 ${printY} ${'【派送】' + (receive_addr || '')} \r\n`
    }

    if (if_receive_line_feed) {
        if (remark && remark.length > 16) {
            let a = remark.substring(0, 16),
                b = remark.substring(16, remark.length)
            text += `TEXT 5 0 10 ${printY + spacingH * 2} ${'备注：' + (a || '')} \r\nTEXT 5 0 10 ${printY + spacingH * 3} ${b || ''} \r\n `
        } else {
            text += `TEXT 5 0 10 ${printY + spacingH * 2} ${'备注：' + (remark || '')} \r\n`
        }
    } else {
        if (remark && remark.length > 16) {
            let a = remark.substring(0, 16),
                b = remark.substring(16, remark.length)
            text += `TEXT 5 0 10 ${printY + spacingH} ${'备注：' + (a || '')} \r\n TEXT 5 0 10 ${printY + spacingH * 2} ${b || ''} \r\n `
        } else {
            text += `TEXT 5 0 10 ${printY + spacingH} ${'备注：' + (remark || '')} \r\n`
        }
    }
    return text
}

function dealProvince(province) {
    if (!province) return "";

    // 标准化（去掉“省 / 市 / 自治区”等）
    const name = province
        .replace(/省|市|自治区|壮族自治区|回族自治区|维吾尔自治区|特别行政区/g, "")
        .trim();

    const regionMap = {
        华东: ["上海", "江苏", "浙江", "安徽", "福建", "江西", "山东"],
        华北: ["北京", "天津", "河北", "山西", "内蒙古"],
        华南: ["广东", "广西", "海南"],
        华中: ["河南", "湖北", "湖南"],
        西南: ["重庆", "四川", "贵州", "云南", "西藏"],
        西北: ["陕西", "甘肃", "青海", "宁夏", "新疆"],
        东北: ["辽宁", "吉林", "黑龙江"],
        港澳台: ["香港", "澳门", "台湾"]
    };
    for (const [region, provinces] of Object.entries(regionMap)) {
        if (provinces.includes(name)) {
            return region;
        }
    }
    return "";
}

function dealBigTitle(data) {
    const {
        weight,
        volume
    } = data
    let text = '';
    console.log(weight, volume)
    console.log('dealBigTitle', weight > 70 || (volume > 0.01 && volume < 0.41))
    if (weight > 70 || (volume > 0.01 && volume < 0.41)) {
        text += `TEXT 12 2 410 40 ${dealProvince(data.receive_province)} \r\nINVERSE-LINE 360 0 600 0 120 \r\n`
    }
    return text
}

function dataCenter(data, font, size, x, y, width, mag) {
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
    console.log(data);
    let pattern = /[\u4e00-\u9fa5]/,
        w = 0;
    data.split('').map((t) => {
        if (pattern.test(t)) {
            w += z;
        } else {
            w += z / 2;
        }
    });
    w *= mag;
    let spacing = x + (width - w) / 2;
    console.log('居中计算结果', spacing);
    let text = `TEXT ${font} ${size} ${Math.round(spacing)} ${y} ${data}\r\n`;
    return text;
}
export const printData = (data, subtcode = null, boxNo = "") => {
    let allData = []
    let printData = data[0]
    console.log(printData.platform_info.subWaybillInfoList.subWaybillInfo)
    const subOrder = printData.platform_info.subWaybillInfoList.subWaybillInfo
    console.log(subtcode)
    //const subOrder = printData.platform_subcodes && printData.platform_subcodes.split(',');
    if (subOrder.length) {
        for (let i in subOrder) {
            console.log(i)
            if (subtcode && subtcode != subOrder[i].subCodePrintCode) {
                continue;
            }
            allData.push((
                "! 0 200 200 770 1\r\n" +
                "PAGE-WIDTH 608\r\n" +
                "BOX 0 0 600 750 2\r\n" +
                // "LINE 0 60 600 60 2\r\n" +
                "LINE 0 120 600 120 2\r\n" +
                "LINE 0 240 600 240 2\r\n" +
                "LINE 360 0 360 120 2\r\n" +
                "LINE 115 120 115 240 2\r\n" +
                "LINE 230 120 230 240 2\r\n" +
                "LINE 345 120 345 240 2\r\n" +
                "LINE 460 120 460 240 2\r\n" +
                "LINE 0 180 600 180 2\r\n" +

                "LINE 0 360 436 360 2\r\n" +
                "LINE 0 480 436 480 2\r\n" +
                "LINE 436 240 436 480 2\r\n" +

                "LINE 218 360 218 480 2\r\n" +
                "LINE 0 420 436 420 2\r\n" +

                "LEFT \r\n" +
                "SETMAG 2 2 \r\n" +
                "SETBOLD 1\r\n" +
                dealBigTitle(printData) +
                `TEXT 5 0 15 70 ${printData.platform_info.parentWaybillCode}\r\n` +
                // 路由点  i.platform_info.routingInfo
                dealRouter(printData.platform_info) +
                dataCenter((Number(i) + 1 || '') + '/' + (subOrder.length || ''), 1, 2, 10, 367, 218, 2) +
                // 派件分拨 网点
                "SETBOLD 2\r\n" +
                `TEXT 1 2 10 250 ${printData.platform_info.dispParentName || ''} \r\n` +

                "SETMAG 3 3\r\n" +
                `TEXT 4 6 295 232 ${lastRoute}\r\n` + //436
                "SETBOLD 1\r\n" +

                "SETMAG 1 1 \r\n" +
                // 日期
                (boxNo ? `TEXT 5 0 8 10 ${boxNo} \r\n` : '') +
                `TEXT 5 0 230 10 ${printData.order_date.split(' ')[0]} \r\n` +
                `TEXT 1 0 10 330 ${printData.platform_info.dispSiteName || ''} \r\n` +
                // 重量体积
                // `TEXT 4 3 228 375 ${(printData.weight || '') + 'KG/' + (printData.volume || '')} \r\n` +
                dataCenter((printData.weight || '') + 'KG/' + (printData.volume || ''), 4, 3, 228, 375, 218, 1) +
                // 寄网点
                // `TEXT 4 3 10 435 ${printData.platform_info.sendSiteName || ''} \r\n` +
                dataCenter(printData.platform_info.sendSiteName || '', 4, 3, 10, 435, 218, 1) +
                // 寄网点
                // `TEXT 4 3 228 435 ${printData.pack || ''} \r\n` +
                dataCenter(printData.pack || '', 4, 3, 228, 435, 218, 1) +
                "LEFT \r\n" +
                // 派送和备注
                dealRemark(printData) +
                // 增值服务
                dealData(printData) +
                `BARCODE 128 1 20 100 15 640 ${subOrder[i].subCodePrintCode}\r\n` +
                `VBARCODE 128 1 20 110 448 655 ${subOrder[i].subCodePrintCode}\r\n` +




                "FORM \r\n" +
                "PRINT \r\n"))
        }
    }
    return allData
}
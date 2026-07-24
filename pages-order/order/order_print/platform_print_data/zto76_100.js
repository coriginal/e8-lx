// 中通

function dealAdress(adr) {
    var text = ""
    if (adr.length > 20) {
        text += `TEXT 5 0 24 316 ${adr.substring(0,19)}\r\n` + `TEXT 5 0 24 344 ${adr.substring(19,adr.length)}\r\n`
    } else {
        text += `TEXT 5 0 24 316 ${adr}\r\n`
    }
    return text
}

function dealRoute(data) {
    var text=""
    for (let i = 1; i < 5; i++) {
        if (!data[`route${i}`]) {
            continue
        }
        let len = data[`route${i}`].length
        let sp = 144 * i - 72 - (20 * len) + 16
        text += `TEXT 3 0 ${sp} 176 ${data[`route${i}`]}\r\n`
    }
    return text
}
//适用于中文
function dataCenter(data, font, size, x, y, width, mag, z = 0, eng = false, isNum = false) {
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
    if (eng) {
        z /= 2
    }
    z *= mag
    let spacing = x + (width - ((isNum ? String(data).length : data.length) * z)) / 2
    //288+(288-5*12)/2
    let text = `TEXT ${font} ${size} ${Math.round(spacing)} ${y} ${data}\r\n`
    return text
}

function dealSite(data) {
    let text = ""
    let arr = []
    var list = ["dispatchSiteName", "secondDispatchSiteName"]
    for (let t in list) {
        arr = []
        if (data[list[t]]) {
            let len = data[list[t]].length
            if (len > 4) {
                let j = 0
                arr[j] = ""
                for (let i in data[list[t]]) {
                    if (i % 4 == 0 && i != 0) {
                        j++
                        arr[j] = ""
                    }
                    arr[j] += data[list[t]][i]
                }
                for (let i in arr) {
                    text += `TEXT 4 0 ${85-arr[i].length*16} ${392+32*i} ${arr[i]}\r\n`
                }
            } else {
                text += `TEXT 4 0 ${85-len*16} 392 ${data[list[t]]}\r\n`
            }
        }
    }
    return text
}

function dealQRCode(data,e) {
    let i = data.routeCode.split('-')
    let qrdata = {
        'k1': '',
        'k2': '',
        'k3': '',
        'k4': '',
        'k5': ''
    }
    for (let j=1;j<=3;j++) {
        qrdata[`k${Number(j)}`] = i[j-1]||""
    }
    qrdata["k4"]=e
    qrdata["k5"]=data.productType
    qrdata = "ZTOKY=" + JSON.stringify(qrdata)
    let text = "BARCODE QR 0 412 M 2 U 5\r\n" +
        `MA,${qrdata}\r\n` +
        "ENDQR \r\n"
    return text
}
function dealPrintType(data){
    var text = ""
    data=String(data)
    if (data.length > 11) {
        text += `TEXT 5 0 24 728 ${data.substring(0,11)}\r\n` + `TEXT 5 0 24 752 ${data.substring(11,data.length)}\r\n`
    } else {
        text += `TEXT 5 0 24 728 ${data}\r\n`
    }
    return text
}
export const printData = (data, subtcode = null,boxNo=null) => {
    //测试
    console.log(data)
    //
    //data = test_data
    //
    var allData = []
    let printData = data[0]
    const orderInfo = printData.platform_info
    const subOrder = printData.platform_subcodes.split(',')
    console.log(subOrder)
    if (subOrder.length) {
        let index = subtcode && subOrder.indexOf(subtcode)
        console.log(index)
        for (let i in subOrder) {
            if (subtcode && index != i) {
                continue;
            }
            allData.push((
                "! 0 200 200 788 1\r\n" +
                "PAGE-WIDTH 608\r\n" +
                "SETBOLD 1\r\n" +
                `TEXT 4 0 256 24 ${orderInfo.routeCode}\r\n` +
                "SETBOLD 0\r\n" +
                //56
                "BOX 16 56 576 776 2\r\n" +
                "LINE 16 176 576 176 2\r\n" +

                "LINE 154 176 154 288 2\r\n" +
                "LINE 298 176 298 288 2\r\n" +
                "LINE 442 176 442 288 2\r\n" +

                "LINE 16 288 576 288 2\r\n" +
                "LINE 16 392 576 392 2\r\n" +

                "LINE 176 392 176 616 2\r\n" +
                "LINE 400 392 400 616 2\r\n" +

                "LINE 16 504 176 504 2\r\n" +
                "LINE 16 560 176 560 2\r\n" +
                "LINE 400 504 576 504 2\r\n" +
                "LINE 400 560 576 560 2\r\n" +

                "LINE 16 616 576 616 2\r\n" +

                "LINE 288 616 288 776 2\r\n" +

                "LINE 16 696 576 696 2\r\n" +
                `CENTER\r\n`+
                `BARCODE-TEXT 7 0 5\r\n`+
                `BARCODE 128 2 20 80 0 64 ${subOrder[i]}\r\n` +//y:100
                `BARCODE-TEXT OFF\r\n`+
                `LEFT\r\n`+
                "SETMAG 2 2\r\n"+
                dealRoute(orderInfo) +
                "SETMAG 1 1\r\n"+
                `TEXT 28 0 24 288 ${printData.service_mode}\r\n` +
                `TEXT 28 0 246 288 ${printData.receive_man}\r\n` +
                dealAdress(printData.receive_addr) +
                `TEXT 28 0 24 372 ${orderInfo.deliveryType||""}\r\n` +
                dealSite(orderInfo) +
                (printData.domain=="D389" && boxNo?`TEXT 28 0 416 392 ${boxNo}\r\n`:"") +
                "CENTER\r\n" +
                dealQRCode(orderInfo,subOrder[i]) +
                "LEFT\r\n" +
                `TEXT 4 0 24 504 ${Number(i)+1}/${subOrder.length}\r\n` +
                dataCenter(orderInfo.productType, 4, 0, 24, 560, 136, 1) +
                dataCenter(printData.cargo, 4, 0, 416, 504, 136, 1) +

                dataCenter(orderInfo.sendSiteName, 5, 0, 24, 640, 288, 1) +
                dataCenter(printData.pack, 5, 0, 288, 640, 288, 1) +

                dataCenter(formatTime(new Date()), 5, 0, 24, 704, 288, 1, 0, true) +
                dataCenter(printData.weight, 5, 0, 288, 712, 288, 1, 0, true, true) +
                //dataCenter(orderInfo.printType, 5, 0, 24, 956, 288, 1) +
                dealPrintType(orderInfo.printType)+
                dataCenter(printData.volume, 5, 0, 288, 736, 288, 1, 0, true, true) +
                "FORM\r\n" + 
                "PRINT\r\n"))
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
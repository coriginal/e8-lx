// 中通

function dealAdress(adr) {
    var text = ""
    if (adr.length > 20) {
        text += `TEXT 5 0 24 440 ${adr.substring(0,19)}\r\n` + `TEXT 5 0 24 468 ${adr.substring(19,adr.length)}\r\n`
    } else {
        text += `TEXT 5 0 24 440 ${adr}\r\n`
    }
    return text
}

function dealRoute(data) {
    var text = "SETMAG 2 2\r\n"
    for (let i = 1; i < 5; i++) {
        if (!data[`route${i}`]) {
            continue
        }
        let len = data[`route${i}`].length
        let sp = 144 * i - 72 - (20 * len) + 16
        text += `TEXT 3 0 ${sp} 260 ${data[`route${i}`]}\r\n`
    }
    text += "SETMAG 1 1\r\n"
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
                    text += `TEXT 4 0 ${85-arr[i].length*16} ${564+32*i} ${arr[i]}\r\n`
                }
            } else {
                text += `TEXT 4 0 ${85-len*16} 564 ${data[list[t]]}\r\n`
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
    let text = "BARCODE QR 0 584 M 2 U 6\r\n" +
        `MA,${qrdata}\r\n` +
        "ENDQR \r\n"
    return text
}
function dealPrintType(data){
    var text = ""
    data=String(data)
    if (data.length > 11) {
        text += `TEXT 5 0 24 956 ${data.substring(0,11)}\r\n` + `TEXT 5 0 24 980 ${data.substring(11,data.length)}\r\n`
    } else {
        text += `TEXT 5 0 24 956 ${data}\r\n`
    }
    return text
}
export const printData = (data, subtcode = null) => {
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
                "! 0 200 200 1028 1\r\n" +
                "PAGE-WIDTH 608\r\n" +
                "SETBOLD 1\r\n" +
                `TEXT 4 0 256 24 ${orderInfo.routeCode}\r\n` +
                "SETBOLD 0\r\n" +
                "BOX 16 68 576 1028 2\r\n" +
                "LINE 16 260 576 260 2\r\n" +

                "LINE 154 260 154 404 2\r\n" +
                "LINE 298 260 298 404 2\r\n" +
                "LINE 442 260 442 404 2\r\n" +

                "LINE 16 404 576 404 2\r\n" +
                "LINE 16 564 576 564 2\r\n" +

                "LINE 160 564 160 820 2\r\n" +
                "LINE 416 564 416 820 2\r\n" +

                "LINE 16 708 160 708 2\r\n" +
                "LINE 16 764 160 764 2\r\n" +
                "LINE 416 708 576 708 2\r\n" +
                "LINE 416 764 576 764 2\r\n" +

                "LINE 16 820 576 820 2\r\n" +

                "LINE 288 820 288 1028 2\r\n" +

                "LINE 16 916 576 916 2\r\n" +
                `CENTER\r\n`+
                `BARCODE-TEXT 7 0 5\r\n`+
                `BARCODE 128 2 20 128 0 100 ${subOrder[i]}\r\n` +//y:100
                `BARCODE-TEXT OFF\r\n`+
                `LEFT\r\n`+
                dealRoute(orderInfo) +
                `TEXT 28 0 24 412 ${printData.service_mode}\r\n` +
                `TEXT 28 0 246 412 ${printData.receive_man}\r\n` +
                dealAdress(printData.receive_addr) +
                `TEXT 28 0 24 496 ${orderInfo.deliveryType||""}\r\n` +
                dealSite(orderInfo) +
                "CENTER\r\n" +
                dealQRCode(orderInfo,subOrder[i]) +
                "LEFT\r\n" +
                `TEXT 4 0 24 708 ${Number(i)+1}/${subOrder.length}\r\n` +
                dataCenter(orderInfo.productType, 4, 0, 24, 764, 136, 1) +
                dataCenter(printData.cargo, 4, 0, 416, 708, 136, 1) +

                dataCenter(orderInfo.sendSiteName, 5, 0, 24, 844, 288, 1) +
                dataCenter(printData.pack, 5, 0, 288, 844, 288, 1) +

                dataCenter(formatTime(new Date()), 5, 0, 24, 932, 288, 1, 0, true) +
                dataCenter(printData.weight, 5, 0, 288, 932, 288, 1, 0, true, true) +
                //dataCenter(orderInfo.printType, 5, 0, 24, 956, 288, 1) +
                dealPrintType(orderInfo.printType)+
                dataCenter(printData.volume, 5, 0, 288, 956, 288, 1, 0, true, true) +
                "FORM \r\n" + 
                "PRINT \r\n"))
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
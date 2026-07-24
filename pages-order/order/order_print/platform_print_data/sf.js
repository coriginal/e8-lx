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
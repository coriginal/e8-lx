export default function out(all, bindData,deliverData) {
    var data = `! 0 200 200 ${all.init.height*8-12} 1\r\n` +
        `PAGE-WIDTH ${all.init.width*8}\r\n`,a
    console.log(all)
    for (let key in all) {
        switch (key) {
            case "rowLineList":
                a = all["rowLineList"]
                for (let i in a) {
                    data += `LINE ${a[i].x0*8} ${a[i].y0*8} ${a[i].x1*8} ${a[i].y1*8} ${a[i].width}\r\n`
                }
                break;
            case "colLineList":
                a = all["colLineList"]
                for (let i in a) {
                    data += `LINE ${a[i].x0*8} ${a[i].y0*8} ${a[i].x1*8} ${a[i].y1*8} ${a[i].width}\r\n`
                }
                break;
            case "textList":
                a = all["textList"]
                if (a.length == 0) {
                    continue
                }
                for (let i in a) {
                    data += `SETMAG ${a[i].mag} ${a[i].mag}\r\n`
                    if (a[i].bind && bindData) {
                        console.log("绑定字段")
                        let bind = a[i].bind
                        let text = getBindData(bind, bindData)
                        console.log(text)
                        let centerX = a[i]['center'] ? toCenter(a[i].fontsize, a[i].x, a[i].center_width, (a[i].wrap > 0 && a[i].wrap < text.length) ? text.substring(0, a[i].wrap) : (a[i]['need_cut'] ? (a[i]['need_cut']['wrap'] ? text.split(a[i]['need_cut']['char'])[0] : text) : text), a[i].mag) : a[i].x*8

                        console.log(lastDeal(text, a[i], centerX))

                        data += lastDeal(text, a[i], centerX, a[i].mag)
                    } else {
                        let text = a[i].data
                        if(a[i]['deliver']){
                            console.log(deliverData[a[i]['deliver']])
                            if(deliverData[a[i]['deliver']]){
                              text=deliverData[a[i]['deliver']]  
                            }
                        }
                        let centerX = a[i].center ? toCenter(a[i].fontsize, a[i].x, a[i].center_width, (a[i].wrap > 0 && a[i].wrap < text.length) ? text.substring(0, a[i].wrap) : (a[i]['need_cut'] ? (a[i]['need_cut']['wrap'] ? text.split(a[i]['need_cut']['char'])[0] : text) : text), a[i].mag) : a[i].x*8
                        data += lastDeal(text, a[i], centerX, a[i].mag)
                    }
                }
                break;
            case "barCodeList":
                a = all['barCodeList']
                for (let i in a) {
                    if(a[i]['hastext']){
                        data+="BARCODE-TEXT 0 0 0\r\n"
                    }
                    if (a[i].bind && bindData) {
                        let cxk=getBindData(a[i].bind,bindData)
                        data+=`BARCODE ${a[i].mode} ${a[i].width} ${a[i].ratio} ${a[i].height*8} ${a[i].x*8} ${a[i].y*8} ${cxk}\r\n`
                    } else {
                        let barcode=a[i].data
                        if(a[i]['deliver']){
                            if(deliverData[a[i]['deliver']]){
                              barcode=deliverData[a[i]['deliver']]  
                            }
                        }
                        data+=`BARCODE ${a[i].mode} ${a[i].width} ${a[i].ratio} ${a[i].height*8} ${a[i].x*8} ${a[i].y*8} ${barcode}\r\n`
                    }
                    if(a[i].hastext){
                        data+="BARCODE-TEXT OFF\r\n"
                    }
                }
                break;
            default:
                break;
        }
    }
    data += "FORM \r\n" +
        "PRINT \r\n"
    console.log(data)
    return data
}
const lastDeal = function (text, a, centerX, mag) {
    var data = ""
    console.log(text)
    if (a.wrap > 0 && a.wrap < text.length) {
        var wrapnum = 0,
            _data = ""
        for (let i in text) {
            if (i % a['wrap'] == 0 && i != 0) {
                data += `TEXT ${fsTodots(a.fontsize)} ${a.size} ${centerX} ${Number(a.y)*8+Number(a.fontsize)*Number(mag)*wrapnum} ${_data}\r\n`
                wrapnum++
                _data = ""
            }
            _data += text[i]
        }
        if(a['tail']){
            _data+=a['tail']
        }
        data += `TEXT ${fsTodots(a.fontsize)} ${a.size} ${centerX} ${Number(a.y)*8+Number(a.fontsize)*Number(mag)*wrapnum} ${_data}\r\n`
        console.log(data)
        return data
    } else if (a.need_cut) {
        if (a.need_cut.wrap) {
            var arr = text.split(a.need_cut.char)
            for (let i in arr) {
                data += `TEXT ${fsTodots(a.fontsize)} ${a.size} ${centerX} ${Number(a.y)*8+Number(a.fontsize)*Number(mag)*i} ${arr[i]+(i==arr.length-1?(a['tail']||''):'')}\r\n`
            }
        }
        return data
    }
    return `TEXT ${fsTodots(a.fontsize)} ${a.size} ${centerX} ${Number(a.y)*8} ${text+(a['tail']||'')}\r\n`
}
const toCenter = function (fontsize, x, width, data, mag) {
    let a = 0,
        reg = /^[\u4e00-\u9fa5]$/
    if (!data) {
        return x
    }
    console.log(fontsize * mag)
    for (let i in data) {
        if (reg.test(data[i])) {
            a += Number(fontsize) * Number(mag)
        } else {
            a += (Number(fontsize) / 2) * Number(mag)
        }
    }
    if (a < width * 8) {
        return (Number(x) * 8 + Number(width / 2) * 8) - a / 2
    } else {
        return x
    }
}
const getBindData = function (bind, bindData) {
    if (bind.type == 'normal') {
        if (bindData[bind.field]) {
            return bindData[bind.field]
        } else {
            return "无数据"
        }
    } else {
        if (bindData.platform_info) {
            console.log(bindData.platform_info)
            let pi = JSON.parse(bindData.platform_info)
            return pi[bind.field]
        } else {
            return "平台无数据"
        }
    }
}
const fsTodots = function (fs) {
    fs = Number(fs)
    switch (fs) {
        case 32:
            fs = 4
            break;
        case 24:
            fs = 1;
            break
        case 20:
            fs = 3;
            break;
        case 16:
            fs = 20
            break;
        case 28:
            fs = 28
        default:
            fs = 1;
            break;
    }
    return fs
}
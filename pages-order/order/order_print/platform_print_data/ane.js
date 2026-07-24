import {
    formatDate
} from '../../../../utils/util'

const dealPrintInfo = ({
    platform_info = {}
}) => {
    return {
        orderNo: platform_info.orderNo || '',
        sendSite: platform_info.sendSite || '',
        aimAllot: platform_info.aimAllot || '',
        ewbNo: platform_info.ewbNo || '',
        superiorSite: platform_info.superiorSite || '',
        aimSite: platform_info.aimSite || '',
        transportUrl: platform_info.transportUrl ? platform_info.transportUrl.split('-') : [],
        freightArea: platform_info.freightArea ? platform_info.freightArea.split('-') : []
    }
}

const dealTransportUrl = (data = [], y, isLabel = false) => {
    // isLabel 当字数多余四个字时候进行换行
    let command = "",
        step = 0;
    data.forEach(item => {
        if (isLabel && item.length > 4) {
            let lines = [
                item.substring(0, 4),
                item.substring(4, 8)
            ].filter(Boolean);
            let leY = -12;
            lines.forEach(item => {
                command += "TEXT 8 0 " + `${10 + step}` + ` ${y + leY} ${item}` + "\r\n";
                leY += 27
            })
            step += 117;
        } else {
            command += "TEXT 8 0 " + `${10 + step}` + ` ${y} ${item}` + "\r\n";
            step += 117;
        }
    });

    return command;
}

const dealAddrs = (addr) => {
    let lines = [
        addr.substring(0, 19),
        addr.substring(19, 38),
        addr.substring(38, 57)
    ].filter(Boolean);

    let command = "",
        step = 0;
    lines.forEach(item => {
        command += "TEXT 8 0 110 " + `${310+step} ${item}` + "\r\n";
        step += 27;
    });

    return command;
}

const dealSendSite = (str, date1, date2) => {
    let lines = [
        str.substring(0, 5),
        str.substring(5, 10),
        str.substring(10, 15),
    ].filter(Boolean);

    let command = "",
        step = 0;
    lines.forEach(item => {
        command += "TEXT 8 0 10 " + `${530+step} ${item}` + "\r\n";
        step += 27;
    });

    command += "TEXT 8 0 10 " + `${530+step} ${date1}` + "\r\n";
    command += "TEXT 8 0 10 " + `${557+step} ${date2}` + "\r\n";

    return command;
}


const dealTransModel = (str = "") => {
    let command = "";
    if (str === '零担') {
        command += `TEXT 4 0 360 15 精准零担\r\n`
    }
    return command
}
function dealTransMode(id){
    let type=""
    switch(id){
        case 95:
            type="Mini电商大件"
            break
        case 24:
            type= "精准零担"
            break
        case 23:
            type="定时达"
            break
        case 270:
            type= "普惠达"
            break
        case 524:
            type= "Mini电商小件"
            break
        case 220:
            type= "整车"
            break
        case 428:
            type= "填仓"
            break
        default:
            type= "精准零担"
            break
    }
    let text=`TEXT 4 0 420 14 ${type}\r\n`
    return text
}
export const printData = (data, subtcode = null) => {
    console.log(data)
    let allData = []
    let printData = data[0];
    let transMode=dealTransMode(data[0].trans_mode)
    console.log(transMode)
    const now_date = new Date();
    const date_now1 = formatDate(now_date, 'yyyy-MM-dd');
    const date_now2 = formatDate(now_date, ' hh:mm:ss')
    const {
        orderNo,
        sendSite,
        transportUrl,
        freightArea,
        aimAllot,
        ewbNo,
        superiorSite,
        aimSite
    } = dealPrintInfo(printData);
    const subOrder = printData.platform_subcodes && printData.platform_subcodes.split(',');
    if (subOrder.length) {
        let index = subtcode && subOrder.indexOf(subtcode)
        for (let i in subOrder) {
            if (subtcode && index != i) {
                continue;
            }
            allData.push((
                "! 0 200 200 708 1\r\n" +
                "PAGE-WIDTH 600\r\n" +
                "BOX 0 0 592 660 2\r\n" +
                "LINE 0 360 0 650 2\r\n" +
                // "LINE 580 60 600 650 2\r\n" +
                "LINE 100 60 600 60 2\r\n" +
                "LINE 100 180 600 180 2\r\n" +
                "LINE 100 300 600 300 2\r\n" +
                "LINE 0 400 600 400 2\r\n" +
                "LINE 0 460 600 460 2\r\n" +
                "LINE 0 520 600 520 2\r\n" +
                // "LINE 0 580 600 580 2\r\n" +
                "LINE 100 60 100 400 2\r\n" +
                "LINE 400 60 400 300 2\r\n" +
                "LINE 400 120 600 120 2\r\n" +
                "LINE 400 240 600 240 2\r\n" +
                "LINE 117 400 117 520 2\r\n" +
                "LINE 234 400 234 520 2\r\n" +
                "LINE 351 400 351 520 2\r\n" +
                "LINE 468 400 468 520 2\r\n" +
                "LINE 150 520 150 660 2\r\n" +
                `VBARCODE 128 1 1 80 10 390 ${subOrder[i]}\r\n` +
                'BT 7 0 5\r\n' +
                `BARCODE 128 1 1 90 195 530 ${subOrder[i]}\r\n` +
                'BT OFF\r\n' +
                // `TEXT 5 0 240 625 ${i} \r\n` +
                "SETMAG 1 1\r\n" +
                // 单号
                // "SETMAG 2 2 \r\n" +
                //transMode+
                `TEXT 4 0 120 80 ${ewbNo}\r\n` +
                "SETBOLD 2\r\n" +
                dealTransModel(printData.business_name) +
                `TEXT 4 0 120 130 ${aimAllot}\r\n` +
                `TEXT 4 0 120 200 ${superiorSite}\r\n` +
                `TEXT 4 0 120 250 ${aimSite}\r\n` +
                "SETBOLD 1\r\n" +
                `TEXT 4 0 420 70 ${Number(i)+1}/${subOrder.length}\r\n` +
                `TEXT 4 0 420 130 ${printData.pack}\r\n` +
                `TEXT 5 0 410 200 ${printData.service_mode=="自提"?"自提":(printData.upstairs_type?"送货上楼":"送货(不含上楼)")}\r\n` +
                `TEXT 5 0 410 260 ${printData.weight||''}kg/${printData.volume||''}m\r\n` +
                // `TEXT 8 0 120 320 ${printData.receive_addr||''} \r\n` +
                dealAddrs(printData.receive_addr || '') +
                dealTransportUrl(transportUrl, 420, true) +
                dealTransportUrl(freightArea, 480) +
                dealSendSite(sendSite, date_now1, date_now2) +
                'INVERSE-LINE 0 400 600 400 60\r\n' +
                'SETBOLD 0\r\n'+
                (printData.remark ? `TEXT 8 0 0 666 ${printData.remark}\r\n`:'') +
                "FORM \r\n" +
                "PRINT \r\n"))
        }
    }
    return allData
}
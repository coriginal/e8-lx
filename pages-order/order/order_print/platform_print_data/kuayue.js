// 中通

function dealRemark(adr) {
    var text = ""
    if (adr.length > 24) {
        text += `TEXT 3 0 32 668 ${adr.substring(0,23)}\r\n` + `TEXT 3 0 32 688 ${adr.substring(23,adr.length)}\r\n`
    } else {
        text += `TEXT 3 0 32 668 ${adr}\r\n`
    }
    return text
}

function dealAdress(adr, isReceive = true) {
    var text = ""
    if (isReceive) {
        if (adr.length > 31) {
            text += `TEXT 20 0 88 444 ${adr.substring(0,30)}\r\n` + `TEXT 20 0 88 460 ${adr.substring(30,adr.length)}\r\n`
        } else {
            text += `TEXT 20 0 88 444 ${adr}\r\n`
        }
    } else {
        if (adr.length > 31) {
            text += `TEXT 20 0 88 524 ${adr.substring(0,30)}\r\n` + `TEXT 20 0 88 540 ${adr.substring(30,adr.length)}\r\n`
        } else {
            text += `TEXT 20 0 88 524 ${adr}\r\n`
        }
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

function dealQRCode(data, e) {
    let i = data.routeCode.split('-')
    let qrdata = {
        'k1': '',
        'k2': '',
        'k3': '',
        'k4': '',
        'k5': ''
    }
    for (let j = 1; j <= 3; j++) {
        qrdata[`k${Number(j)}`] = i[j - 1] || ""
    }
    qrdata["k4"] = e
    qrdata["k5"] = data.productType
    qrdata = "ZTOKY=" + JSON.stringify(qrdata)
    let text = "BARCODE QR 0 584 M 2 U 6\r\n" +
        `MA,${qrdata}\r\n` +
        "ENDQR \r\n"
    return text
}

function dealPrintType(data) {
    var text = ""
    data = String(data)
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
    // data = [{
    //     "id": 3394641,
    //     "createtime": "2023-02-13 21:48:51",
    //     "creator": "15325328828",
    //     "domain": "D195",
    //     "updatetime": "2023-02-14 10:02:01",
    //     "updator": "Job.Robot",
    //     "version": 6,
    //     "amount": 1,
    //     "cargo": "家具",
    //     "code": "8602050183",
    //     "if_handle_tag": false,
    //     "pack": "纸箱",
    //     "status": "已签收",
    //     "status_code": 624,
    //     "tag_ids": "1171,1172",
    //     "tag_names": [{
    //             "提": 5
    //         },
    //         {
    //             "转": 5
    //         }
    //     ],
    //     "tag_types": null,
    //     "volume": 0.807275,
    //     "weight": 61.74,
    //     "arrive_pay": null,
    //     "business_id": 387,
    //     "business_name": "零担",
    //     "cancel_reason": null,
    //     "ccode": null,
    //     "clerk": null,
    //     "cod": null,
    //     "cost_weight": null,
    //     "customer_id": 25458,
    //     "entry_type": null,
    //     "expect_arrive": null,
    //     "expect_depart": null,
    //     "expect_reach_date": null,
    //     "if_fast": false,
    //     "if_load": false,
    //     "if_unload": false,
    //     "if_visit": true,
    //     "insurance_limit": 4000,
    //     "insurance_type": "普通货险",
    //     "lc_id": 3789,
    //     "line_id": null,
    //     "line_name": null,
    //     "order_date": "2023-02-13",
    //     "origin": "EXCEL",
    //     "pallet_num": 0,
    //     "rcode": null,
    //     "rcode_type": null,
    //     "receive_city": "杭州市",
    //     "receive_district": "西湖区",
    //     "receive_lng_lat": null,
    //     "receive_man": "林玉炳",
    //     "receive_phone": "18787403043",
    //     "receive_province": "浙江省",
    //     "receive_site": "杭州市",
    //     "receive_street_no": "文新街道阳光地带花园西区11幢3单元501",
    //     "receive_town": "",
    //     "remark": null,
    //     "send_city": "嘉兴市",
    //     "send_district": "南湖区",
    //     "send_lng_lat": null,
    //     "send_man": "慧尔物流",
    //     "send_phone": "153253211261",
    //     "send_province": "浙江省",
    //     "send_site": "浙江省嘉兴市南湖区",
    //     "send_street_no": "城区",
    //     "send_town": "",
    //     "service_mode": "自提",
    //     "settle_type": "月结",
    //     "sub_order_num": 1,
    //     "tcode": "KY4000161194608",
    //     "trans_mode": "零担",
    //     "trans_mode_id": 386,
    //     "truck_type": null,
    //     "udf1": null,
    //     "udf2": null,
    //     "udf3": null,
    //     "udf4": null,
    //     "udf5": null,
    //     "udf6": null,
    //     "udf7": null,
    //     "upstairs_type": null,
    //     "next_tag_type": null,
    //     "cargo_amount": 1,
    //     "status_c": null,
    //     "active": true,
    //     "cargo_type": null,
    //     "channel": null,
    //     "real_lc_id": 18166,
    //     "receive_site_id": null,
    //     "send_site_id": null,
    //     "trace_type": null,
    //     "warehouse_name": null,
    //     "warehouse_pid": null,
    //     "old_amount": 1,
    //     "old_volume": 0.807275,
    //     "old_weight": 61.74,
    //     "bill_model_id": null,
    //     "platform_info": {
    //         "orderId": "O221116001",
    //         "waybillNumber": "KY5000032054197",
    //         "printWaybillNumber": "KY5000032054197",
    //         "senderAreaCode": "",
    //         "areaCode": "0571",
    //         "destinationAirport": "杭州",
    //         "destinationOperationDepartment": "江东取派部",
    //         "firstDistribution": "赭山中转场",
    //         "consigneeNetWork": "同一点部",
    //         "outboundAllocation": "",
    //         "network": "江东取派部-同一点部",
    //         "flightsPlateNumber": "",
    //         "urgentFlag": "",
    //         "serviceMode": "次日达",
    //         "threeCode": "杭州-赭山中转场",
    //         "identification": "商",
    //         "smallBoxflag": "",
    //         "regionName": "华东大区"
    //     },
    //     "scheduled_delivery_time": null,
    //     "customer_name": "慧尔物流",
    //     "platform_subcodes": "71001509813000010001",
    //     "lock_cost": null,
    //     "lock_income": null,
    //     "receive_company": null,
    //     "scheduled_pick_time": null,
    //     "lc_phone": null,
    //     "declared_value": null,
    //     "arrival": false,
    //     "print_num": null,
    //     "upload_order": null,
    //     "receive_customer_id": null,
    //     "receive_customer_name": "",
    //     "real_lc_assign_time": null,
    //     "confirm": null,
    //     "notice_delivery": null,
    //     "invoice_requirements": null,
    //     "clerk_name": null,
    //     "bill_model_name": null,
    //     "lc_name": "跨越速运",
    //     "creator_name": "测试88",
    //     "real_lc_name": "安能物流",
    //     "department_id": 25,
    //     "department_name": "西塘桥部",
    //     "days": null,
    //     "kilometre": null,
    //     "ocode": null,
    //     "fin_status": "new",
    //     "order_date1": "2023-02-13",
    //     "real_line_name": null,
    //     "send_addr": "浙江省嘉兴市南湖区城区",
    //     "receive_addr": "浙江省杭州市西湖区文新街道阳光地带花园西区11幢3单元501",
    //     "receive_customer_name_show": null,
    //     "receipt_id": null,
    //     "rcode_back_date": null,
    //     "receipt_issue_date": null,
    //     "sign_date": "2023-02-16",
    //     "sign_man": null,
    //     "platform_code": "kuayue",
    //     "platform_name": "跨越速运",
    //     "lc_settle_type": null,
    //     "amount1": 1,
    //     "weight1": 61.74,
    //     "volume1": 0.807275,
    //     "old_amount1": 1,
    //     "old_weight1": 61.74,
    //     "old_volume1": 0.807275,
    //     "insurance_limit1": 4000,
    //     "cargo_amount1": 1,
    //     "ccode1": null,
    //     "cargo1": "家具",
    //     "pallet_num1": 0,
    //     "batch_number": null,
    //     "cargo_code": null,
    //     "specs": null,
    //     "model": null,
    //     "bill_amount": null,
    //     "sudf1": null,
    //     "sudf2": null,
    //     "sudf3": null,
    //     "sudf4": null,
    //     "sudf5": null,
    //     "sudf6": null,
    //     "sudf7": null,
    //     "sudf8": null,
    //     "sudf9": null,
    //     "sudf10": null,
    //     "charged_weight": null,
    //     "income_unit_price": null,
    //     "income_real_unit_price": null,
    //     "show_income_unit_price": null,
    //     "cost_unit_price": null,
    //     "cost_real_unit_price": null,
    //     "show_cost_unit_price": null,
    //     "abnormal_num": 0,
    //     "last_abnormal_time": null,
    //     "order_attach_num": 0,
    //     "receipt_attachids": null,
    //     "task_param": {}
    // }]
    //
    var allData = []
    let printData = data[0]
    const orderInfo = printData.platform_info
    const subOrder = printData.platform_subcodes.split(',')
    console.log(subOrder)
    if (subOrder.length) {
        let index = subtcode && subOrder.indexOf(subtcode)
        for (let i in subOrder) {
            if (subtcode && index != i) {
                continue;
            }
            allData.push((
                "! 0 200 200 1028 1\r\n" +
                "PAGE-WIDTH 608\r\n" +
                "BOX 16 132 592 988 2\r\n" +
                "LINE 16 260 592 260 2\r\n" +
                "LINE 224 260 224 388 2\r\n" +
                "LINE 16 340 592 340 2\r\n" +
                "LINE 16 388 592 388 2\r\n" +
                "LINE 64 388 64 564 2\r\n" +
                "LINE 16 484 592 484 2\r\n" +
                "LINE 16 564 592 564 2\r\n" +
                "LINE 16 644 592 644 2\r\n" +
                "LINE 16 844 592 844 2\r\n" +
                "LINE 16 956 592 956 2\r\n" +
                "LINE 160 956 160 988 2\r\n" +
                "LINE 304 956 304 988 2\r\n" +
                "LINE 448 956 448 988 2\r\n" +

                `TEXT 20 0 16 116 第1打印时间：\r\n` +
                `TEXT 20 0 376 116 寄件时间：\r\n` +
                `TEXT 3 0 32 156 随货联\r\n` +
                `BARCODE-TEXT 7 0 5\r\n` +
                `BARCODE 128 2 20 80 96 148 ${subOrder[i]}\r\n` +
                `BARCODE-TEXT OFF\r\n` +
                "TEXT 20 0 528 236 已验视\r\n" +
                "SETBOLD 1\r\n" +
                "SETMAG 2 2\r\n" +
                dataCenter(orderInfo.destinationAirport, 1, 0, 16, 276, 208, 2) +
                dataCenter(orderInfo.firstDistribution, 1, 0, 224, 276, 368, 2) +
                `TEXT 3 0 400 36 ${orderInfo.serviceMode}\r\n` +
                `TEXT 1 0 32 788 ${Number(i)+1}/${subOrder.length}\r\n` +
                "SETMAG 1 1\r\n" +
                dataCenter(orderInfo.destinationOperationDepartment, 28, 0, 16, 350, 208, 1) +
                dataCenter(orderInfo.consigneeNetWork, 28, 0, 224, 350, 368, 1) +
                "TEXT 28 0 26 422 收\r\n" +
                "TEXT 28 0 26 494 寄\r\n" +//484
                (printData.receive_company ? `TEXT 3 0 88 412 ${printData.receive_company}\r\n` : '') +
                `TEXT 3 0 320 412 ${printData.receive_man+'    '+printData.receive_phone}\r\n` +
                dealAdress(printData.receive_addr) +
                (printData.remark ? dealRemark(printData.remark) : '') +
                "SETBOLD 0\r\n" +
                (printData.send_company ? `TEXT 20 0 88 496 ${printData.send_company}\r\n` : '') +
                `TEXT 20 0 320 496 ${printData.send_man+'    '+printData.send_phone}\r\n` +
                dealAdress(printData.send_addr, false) +
                `TEXT 3 0 40 588 托寄物：${printData.cargo}\r\n` +
                `TEXT 3 0 576 588 回单：\r\n` +
                `TEXT 3 0 40 620 件数：${printData.cargo_amount}\r\n` +
                dataCenter(`实重：${printData.weight}kg`, 3, 0, 192, 620, 192, 1) +
                `TEXT 3 0 576 620 计重：\r\n` +
                `BARCODE-TEXT 7 0 5\r\n` +
                `BARCODE 128 2 20 72 128 844 ${subOrder[i]}\r\n` +//844
                `BARCODE-TEXT OFF\r\n` +
                "TEXT 20 0 32 964 寄件签署：\r\n" +
                "TEXT 20 0 176 964 收件员：\r\n" +
                "TEXT 20 0 320 964 收件签署：\r\n" +
                "TEXT 20 0 464 964 签收时间：\r\n" +
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
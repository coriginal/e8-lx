// 中通

function dealAdress(adr, isReceive = true) {
    var text = ""
    if (isReceive) {
        if (adr.length > 20) {
            text += `TEXT 28 0 96 444 ${adr.substring(0,19)}\r\n` + `TEXT 5 0 96 472 ${adr.substring(19,adr.length)}\r\n`
        } else {
            text += `TEXT 28 0 96 444 ${adr}\r\n`
        }
    } else {
        if (adr.length > 20) {
            text += `TEXT 28 0 96 780 ${adr.substring(0,19)}\r\n` + `TEXT 5 0 96 812 ${adr.substring(19,adr.length)}\r\n`
        } else {
            text += `TEXT 28 0 96 780 ${adr}\r\n`
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
export const printData = (data, subtcode = null, boxNo = null) => {
    //测试
    console.log(data)
    //
    // data = [{
    //     "id": 3945057,
    //     "createtime": "2023-06-13 20:00:57",
    //     "creator": "18115814802",
    //     "domain": "D529",
    //     "updatetime": "2023-06-13 20:01:11",
    //     "updator": "18115814802",
    //     "version": 4,
    //     "amount": 1,
    //     "cargo": "板材",
    //     "code": "8602349449",
    //     "if_handle_tag": false,
    //     "pack": "纸箱",
    //     "status": "已接单",
    //     "status_code": 100,
    //     "tag_ids": "7872,7875,7876",
    //     "tag_names": [{
    //             "提": 1
    //         },
    //         {
    //             "转": 1
    //         },
    //         {
    //             "派": 1
    //         }
    //     ],
    //     "tag_types": null,
    //     "volume": 0.01,
    //     "weight": 1,
    //     "arrive_pay": null,
    //     "business_id": 2326,
    //     "business_name": "快递快运",
    //     "cancel_reason": null,
    //     "ccode": null,
    //     "clerk": null,
    //     "cod": null,
    //     "cost_weight": null,
    //     "customer_id": 24892,
    //     "entry_type": null,
    //     "expect_arrive": null,
    //     "expect_depart": null,
    //     "expect_reach_date": "2023-06-15 23:59:59",
    //     "if_fast": false,
    //     "if_load": false,
    //     "if_unload": false,
    //     "if_visit": true,
    //     "insurance_limit": null,
    //     "insurance_type": null,
    //     "lc_id": 19992,
    //     "line_id": null,
    //     "line_name": null,
    //     "order_date": "2023-06-13 20:00:02",
    //     "origin": "WEB_NEW",
    //     "pallet_num": 0,
    //     "rcode": null,
    //     "rcode_type": null,
    //     "receive_city": "无锡市",
    //     "receive_district": "新吴区",
    //     "receive_lng_lat": null,
    //     "receive_man": "李波",
    //     "receive_phone": "13275309652",
    //     "receive_province": "江苏省",
    //     "receive_site": "无锡市",
    //     "receive_street_no": "鸿山街道镇自提",
    //     "receive_town": "",
    //     "remark": null,
    //     "send_city": "南通市",
    //     "send_district": "如东县",
    //     "send_lng_lat": null,
    //     "send_man": "百里",
    //     "send_phone": "18306282707",
    //     "send_province": "江苏省",
    //     "send_site": "南通市",
    //     "send_street_no": "江海西路90号",
    //     "send_town": "",
    //     "service_mode": "派送",
    //     "settle_type": "现付",
    //     "sub_order_num": 1,
    //     "tcode": "106995525054",
    //     "trans_mode": "快递快运",
    //     "trans_mode_id": 2067,
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
    //     "real_lc_id": 19992,
    //     "receive_site_id": null,
    //     "send_site_id": null,
    //     "trace_type": null,
    //     "warehouse_name": null,
    //     "warehouse_pid": null,
    //     "old_amount": 1,
    //     "old_volume": 0.01,
    //     "old_weight": 1,
    //     "bill_model_id": null,
    //     "platform_info": JSON.parse("{\"status\":0,\"outSideNo\":\"8602349449\",\"orderNo\":\"10700155467\",\"wayBillNo\":\"106995525054\",\"sourceSiteCode\":\"513F29\",\"sourceSiteName\":\"通州上营业部C\",\"deptSiteCode\":\"510PT02\",\"deptSiteName\":\"后宅鸿运营业部E\",\"allocationCentre\":\"无锡分拨\",\"routeName\":\"513F29[通州上营业部E]-513F[保税区营业部]-513W[南通分拨]-510W[无锡分拨]-510PT[无锡后鸿营业部]-510PT02[后宅鸿运营业部E]\",\"storageCode\":\"Y27-Y03-X,D09-B19-X\",\"subOrders\":\"106995525054001\",\"serverType\":\"门到门\",\"productType\":\"标准件\",\"settlementType\":\"1\",\"isCollectGoodsFee\":1,\"goodsWeight\":1.0,\"goodsVolume\":0.01}"),
    //     "scheduled_delivery_time": null,
    //     "customer_name": "百里",
    //     "platform_subcodes": "106995525054001",
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
    //     "receive_customer_name": null,
    //     "real_lc_assign_time": null,
    //     "confirm": null,
    //     "notice_delivery": null,
    //     "invoice_requirements": null,
    //     "clerk_name": null,
    //     "bill_model_name": null,
    //     "lc_name": "新壹米",
    //     "creator_name": "周",
    //     "real_lc_name": "新壹米",
    //     "department_id": null,
    //     "department_name": null,
    //     "days": null,
    //     "kilometre": null,
    //     "ocode": null,
    //     "fin_status": "new",
    //     "order_date1": "2023-06-13",
    //     "real_line_name": null,
    //     "send_addr": "江苏省南通市如东县江海西路90号",
    //     "receive_addr": "江苏省无锡市新吴区鸿山街道镇自提",
    //     "receive_customer_name_show": null,
    //     "receipt_id": null,
    //     "rcode_back_date": null,
    //     "receipt_issue_date": null,
    //     "sign_date": null,
    //     "sign_man": null,
    //     "platform_code": "yimidida",
    //     "platform_name": "壹米滴答",
    //     "lc_settle_type": "月结",
    //     "amount1": 1,
    //     "weight1": 1,
    //     "volume1": 0.01,
    //     "old_amount1": 1,
    //     "old_weight1": 1,
    //     "old_volume1": 0.01,
    //     "insurance_limit1": null,
    //     "cargo_amount1": 1,
    //     "ccode1": null,
    //     "cargo1": "板材",
    //     "pallet_num1": 0,
    //     "batch_number": "",
    //     "cargo_code": "",
    //     "specs": "",
    //     "model": "",
    //     "bill_amount": null,
    //     "sudf1": "",
    //     "sudf2": "",
    //     "sudf3": "",
    //     "sudf4": "",
    //     "sudf5": "",
    //     "sudf6": "",
    //     "sudf7": "",
    //     "sudf8": "",
    //     "sudf9": "",
    //     "sudf10": "",
    //     "charged_weight": 2,
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
    //     "task_param": {},
    //     "income_fee_1": 30,
    //     "income_fee_1_approving": 30,
    //     "income_fee_1_unbilled": 30,
    //     "income_fee_1_unpayed": 30,
    //     "income_fee_1_payed_fee": 0,
    //     "income_fee_1_unbaoxiao_fee": 30,
    //     "income_fee_1_compare": 30,
    //     "income_fee": 30,
    //     "income_payed_fee": 0,
    //     "income_unpayed_fee": 30,
    //     "income_unpayed": 30,
    //     "income_unprocessed": 0,
    //     "cost_fee": 0,
    //     "cost_payed_fee": 0,
    //     "cost_unpayed_fee": 0,
    //     "cost_unpayed": 0,
    //     "cost_unprocessed": 0,
    //     "profit": 30,
    //     "billInfo": [
    //         0,
    //         30,
    //         0,
    //         0
    //     ]
    // }]
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
                "! 0 200 200 828 1\r\n" +
                "PAGE-WIDTH 608\r\n" +
                "LINE 0 128 608 128 2\r\n" +
                "LINE 0 168 608 168 2\r\n" +
                "LINE 480 168 480 408 2\r\n" +
                "LINE 0 248 608 248 2\r\n" +
                "LINE 0 328 608 328 2\r\n" +
                "LINE 0 408 608 408 2\r\n" +
                "LINE 480 368 608 368 2\r\n" +
                "LINE 0 504 608 504 2\r\n" +
                "LINE 64 504 64 648 2\r\n" + //
                "LINE 304 504 304 648 2\r\n" + //
                "LINE 368 504 368 648 2\r\n" + //
                "LINE 0 576 608 576 2\r\n" +
                "LINE 0 648 608 648 2\r\n" +
                "LINE 0 744 608 744 2\r\n" +
                `BARCODE-TEXT 7 0 5\r\n` +
                `BARCODE 128 2 20 67 170 8 ${subOrder[i]}\r\n` + //y:100
                `BARCODE-TEXT OFF\r\n` +
                `TEXT 28 0 24 134 运单号${orderInfo.wayBillNo}\r\n` +
                (boxNo ? `TEXT 28 0 405 134 ${boxNo}\r\n` : '') +
                "SETMAG 2 2 \r\n" +
                `TEXT 3 0 24 188 ${orderInfo.allocationCentre}\r\n` +
                `TEXT 1 0 400 170 ${Number(i)+1}/${subOrder.length}\r\n` +
                dataCenter(orderInfo.serverType, 3, 0, 480, 188, 128, 2) +
                dataCenter(orderInfo.productType, 3, 0, 480, 268, 128, 2) +
                `TEXT 1 0 24 264 ${orderInfo.deptSiteName}\r\n` +
                `TEXT 1 0 24 432 收\r\n` +
                `TEXT 1 0 24 768 寄\r\n` +
                //256
                "SETMAG 1 1 \r\n" +
                `TEXT 28 0 400 218 ${printData.pack}\r\n` +
                `TEXT 4 0 24 336 ${orderInfo.storageCode.split(',')[0]}\r\n` +
                `TEXT 4 0 24 368 ${orderInfo.storageCode.split(',')[1]}\r\n` +
                dataCenter("寄付", 4, 0, 480, 332, 128, 1) +
                `TEXT 4 0 96 412 ${printData.receive_man}\r\n` +
                `TEXT 4 0 256 412 ${printData.receive_phone}\r\n` +
                `TEXT 4 0 96 748 ${printData.send_man}\r\n` +
                `TEXT 4 0 256 748 ${printData.send_phone}\r\n` +
                dealAdress(printData.receive_addr) +
                dealAdress(printData.send_addr, false) +
                `TEXT 28 0 18 509 物\r\n` +
                `TEXT 28 0 18 542 品\r\n` +
                `TEXT 28 0 308 509 重量\r\n` +
                `TEXT 28 0 308 542 体积\r\n` +
                `TEXT 28 0 18 581 打\r\n` +
                `TEXT 28 0 18 614 印\r\n` +
                `TEXT 28 0 308 598 签收\r\n` + //576
                `TEXT 4 0 68 524 ${printData.cargo}\r\n` + //504
                `TEXT 4 0 372 524 ${orderInfo.goodsWeight}kg/${orderInfo.goodsVolume}\r\n` +
                `TEXT 1 0 68 600 ${formatTime(new Date())}\r\n` + //648
                `BARCODE-TEXT 7 0 5\r\n` +
                `BARCODE 128 2 20 67 100 648 ${boxNo?subOrder[i]:orderInfo.wayBillNo}\r\n` + //y:100
                `BARCODE-TEXT OFF\r\n` +
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
import {
  isValidJSON
} from '../../../utils/util.js';
const _App = getApp().globalData
var printMode;
const TestPrint = {
  c6: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c61",
    value: "OP6699447413464",
    border: false,
    align: "left",
    type: "条形码"
  }],
  c5: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c51",
    value: "东城区",
    border: false,
    align: "left",
    type: null
  }],
  c4: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c41",
    value: "北京市",
    border: false,
    align: "left",
    type: null
  }],
  c3: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c31",
    value: "咨询电话: ",
    border: false,
    align: "left",
    type: null
  }],
  c9: [{
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c91",
      value: "寄",
      border: true,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c92",
      value: "大啊啊",
      border: false,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c93",
      value: "13688789098",
      border: false,
      align: "left",
      type: null
    }
  ],
  c8: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c81",
    value: "北京市北京市东城区东华门街道办事处",
    border: false,
    align: "left",
    type: null
  }],
  c7: [{
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c71",
      value: "收",
      border: true,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c72",
      value: "1",
      border: false,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c73",
      value: "13572038802",
      border: false,
      align: "left",
      type: null
    }
  ],
  c1: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c11",
    value: "大贞物流",
    border: false,
    align: "left",
    type: null
  }],
  c2: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c21",
    value: "散客",
    border: false,
    align: "left",
    type: null
  }],
  c11: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c111",
    value: "",
    border: false,
    align: "left",
    type: null
  }],
  c10: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c101",
    value: "浙江省宁波市江东区",
    border: false,
    align: "left",
    type: null
  }],
  c13: [{
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c131",
      value: "100件",
      border: true,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c132",
      value: "111kg",
      border: true,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c133",
      value: "1方",
      border: true,
      align: "left",
      type: null
    }
  ],
  c12: [{
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c121",
      value: "回单",
      border: true,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c122",
      value: "上楼",
      border: true,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c123",
      value: "进仓",
      border: true,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c124",
      value: "",
      border: false,
      align: "left",
      type: null
    },
    {
      fontweight: 400,
      fontfamily: null,
      fontsize: 15,
      field: "c125",
      value: "",
      border: false,
      align: "left",
      type: null
    }
  ],
  c15: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c151",
    value: "/tss/wx/api/acode2?appId=wx9b75ba40fdf9b921&page=Cpts/order_query_route/order_query_route&onlyQparam=true&qparam=1,2,3,os,",
    border: false,
    align: "left",
    type: null
  }],
  c14: [{
    fontweight: 400,
    fontfamily: null,
    fontsize: 15,
    field: "c141",
    value: "备注: ",
    border: false,
    align: "left",
    type: null
  }]
};

const ellRemark = (data, printType) => {
  let lines = [
    data.substring(0, 33),
    data.substring(33, 50),
    data.substring(50, 67)
  ].filter(Boolean);
  let init = printType == 0 ? 675 : 590;
  let command = "",
    step = 0;
  lines.forEach(item => {
    command += "TEXT 8 0 10 " + `${init + step} ${item}` + "\r\n";
    step += 25;
  });

  return command;
};

const COMMON_ORDER_0 =
  "! 0 200 200 770 1\r\n" +
  "PAGE-WIDTH 608\r\n" +
  "BOX 0 0 600 750 2\r\n" +
  "LINE 0 60 600 60 2\r\n" +
  "LINE 0 120 600 120 2\r\n" +
  "LINE 0 240 600 240 2\r\n" +
  "LINE 200 120 200 240 2\r\n" +
  "LINE 0 390 600 390 2\r\n" +
  "LINE 0 510 400 510 2\r\n" +
  "LINE 0 585 400 585 2\r\n" +
  "LINE 0 660 400 660 2\r\n" +
  "LINE 140 60 140 120 2\r\n" +
  "LINE 400 390 400 750 2\r\n";

const COMMON_ORDER_1 =
  "! 0 200 200 660 1\r\n" +
  "PAGE-WIDTH 608\r\n" +
  "BOX 0 0 600 650 2\r\n" +
  "LINE 0 60 600 60 2\r\n" +
  "LINE 0 120 600 120 2\r\n" +
  "LINE 0 240 600 240 2\r\n" +
  "LINE 200 120 200 240 2\r\n" +
  "LINE 0 390 600 390 2\r\n" +
  "LINE 0 510 400 510 2\r\n" +
  "LINE 0 545 400 545 2\r\n" +
  "LINE 0 585 400 585 2\r\n" +
  "LINE 140 60 140 120 2\r\n" +
  "LINE 400 390 400 650 2\r\n";

const _join = (array, type = " ") =>
  (array &&
    array
    .filter(u => u.value)
    .map(i => i.value)
    .join(type)
    .replace(/\&nbsp\;/g, "")) ||
  "";

const printBarCode = ({
  _App,
  printType,
  data
}) => {
  if(_App.user.domain === 'D1005'){
    return printType == 0 ?
    //425 585
    ("TEXT 8 0 410 535 客户签收：\r\n" + "LINE 400 510 608 510 2\r\n") :
    //440 535
    ("TEXT 8 0 410 515 客户签收：\r\n" + "LINE 400 510 608 510 2\r\n");
  }
  return printType == 0 ?
    ("BARCODE QR 425 585 M 2 U 4\r\n" +
      `MA,${_App.app_host}?pageId=19&code=${data.c6[0].value}\r\n` +
      "ENDQR \r\n" +
      "TEXT 8 0 415 725 (微信扫一扫) \r\n") :
    ("BARCODE QR 440 535 M 2 U 3\r\n" +
      `MA,${_App.app_host}?pageId=19&code=${data.c6[0].value}\r\n` +
      "ENDQR \r\n" +
      "TEXT 8 0 415 638 (微信扫一扫) \r\n");
}

const toCenter = (string, size, width) => {
  //120
  if (size == 4) {
    size = 32
  } else {
    size = 24
  }
  width /= 2
  var spacing = 0,
    regPos = /^[0-9]+.?[0-9]*/,
    reEng = /^[a-zA-Z]+$/
  for (let i in string) {
    console.log(string[i])
    if (regPos.test(string[i]) || reEng.test(string[i])) {
      spacing += size / 2;
    } else {
      spacing += size
    }
  }
  return (width - Math.round(spacing / 2)) <= 0 ? 0 : width - Math.round(spacing / 2)
}
//D400定制千辉物流子单
const c7DomainConfig = (text, x, y, y1) => {
  let result;
  console.log(_App.user.domain)
  if (_App.user.domain == 'D400' && printMode == '千辉物流子单') {
    result = `SETMAG 2 2\r\n` + `TEXT 4 0 ${x} ${y1} ${text}\r\n`
    result += `SETMAG 1 1\r\n`
  } else {
    result = `TEXT 8 0 ${x} ${y} ${text}\r\n`
  }
  return result
}
const commonPrint = (data, _App, printType) => {
  function getBarcodeConfig() {
    let config = _App.DomainConfig?.print_barcode_config?.content
    if (config && isValidJSON(config)) {
      return JSON.parse(config)
    } else {
      return {
        width: 1,
        ratio: 2
      }
    }
  }
  return (
    "SETBOLD 1\r\n" +
    //"CENTER\r\n" +
    "SETMAG 1 1\r\n" +


    `TEXT ${_join(data.c1).length>=18?1:4} 0 ${toCenter(_join(data.c1),_join(data.c1).length>=18?1:4,600)} 20 ` +
    _join(data.c1) +
    "\r\n" +


    //"CENTER 120\r\n" +
    "LEFT \r\n" +
    `TEXT 4 0 ${toCenter(_join(data.c2),4,120)} 75 ` +
    _join(data.c2) +
    "\r\n" +
    "LEFT \r\n" +
    "TEXT 4 0 200 75 " +
    _join(data.c3) +
    "\r\n" +
    // "SETMAG 2 2\r\n" +
    //"CENTER 200\r\n" +
    `TEXT 4 0 ${toCenter(_join(data.c4),4,200)} 145 ` +
    _join(data.c4) +
    "\r\n" +
    // "SETMAG 1 1\r\n" +
    `TEXT 8 0 ${toCenter(_join(data.c5),8,200)} 200 ` +
    _join(data.c5) +
    "\r\n" +
    "SETBOLD 0\r\n" +
    "LEFT \r\n" +
    (_App.user.domain == 'D400' && printMode == '千辉物流子单' ? 'TEXT 4 0 240 135 ' : ("BARCODE-TEXT 0 0 0\r\n" + `BARCODE 128 ${getBarcodeConfig().width} ${getBarcodeConfig().ratio} 70 240 135 `)) +
    _join(data.c6) +
    "\r\n" +
    "BARCODE-TEXT OFF\r\n" +
    // "TEXT 4 3 10 250 " + ((data.c7).find(i => i.value == '收') && (data.c7).find(i => i.value == '收').value) + "\r\n" +
    // "TEXT 4 3 80 250 " + `${data.c7.filter(i => i != '收' && i.value).join(' ')}` + " \r\n" +
    //D400单独配 置
    c7DomainConfig(_join(data.c7), 10, 250, 283) +
    // "TEXT 8 0 10 250 " +
    // _join(data.c7) +
    // "\r\n" +
    "TEXT 8 0 10 300 " +
    _join(data.c8, "") +
    "\r\n" +
    "TEXT 8 0 10 350 " +
    _join(data.c16, "") +
    " \r\n" +

    `${data.c7.find(i => i.value == "收") ? "BOX 8 248 37 278 2\r\n" : ""}` +
    `${data.c9.find(i => i.value == "寄") ? "BOX 8 398 37 428 2\r\n" : ""}` +
    // "TEXT 8 2 10 400 寄\r\n" +
    // "TEXT 8 2 80 400 " + (_join(data.c9)) + "\r\n" +
    "TEXT 8 0 10 400 " +
    _join(data.c9) +
    "\r\n" +
    //"TEXT 8 0 10 440 " +
    c7DomainConfig(_join(data.c10), 10, 440, 418) +
    // _join(data.c10, "") +
    // "\r\n" +
    //增值服务
    `TEXT 8 0 10 ${printType == 0 ? 535 : 515} ` +
    _join(data.c12, "/") +
    "\r\n" +
    //件数重量体积
    `TEXT 8 0 10 ${printType == 0 ? 615 : 555} ` +
    _join(data.c13, "-") +
    "\r\n" +
    // data.feePrint + data.cargoPrint +
    "TEXT 8 0 10 480 " +
    _join(data.c17, "") +
    "\r\n" +
    "LEFT\r\n" +
    "SETMAG 1 1\r\n" +
    // "TEXT 8 0 10 675 " + (_join(data.c14)) + "\r\n" +
    ellRemark(_join(data.c14, ""), printType) +
    "SETMAG 0 0\r\n" +
    (_App.user.domain == 'D400' && printMode == '千辉物流子单' ? '' : printBarCode({
      _App,
      printType,
      data
    })) +
    // "BARCODE QR 425 585 M 2 U 4\r\n" +
    // `MA,${_App.app_host}?_queryCode=${data.c6[0].value} \r\n` +
    // "ENDQR \r\n" +
    // "TEXT 8 0 415 725 (微信扫一扫) \r\n" +
    "SETBOLD 0\r\n"
  );
};

// 判断客户是否需要打印客户签名
const decideC11 = (unprint_seq, data) => {
  if (unprint_seq) {
    let x = 410,
      y = 400,
      step = 30,
      t_length = 8;
    let result = "";
    // 行数

    const getRows = len =>
      len % t_length === 0 ? len / t_length : Math.floor(len / t_length + 1);
    // 内容
    const text = [_join(data.c18), _join(data.c19), _join(data.c20)];

    text.forEach((item, idx) => {
      const rows = getRows(item.length);
      for (let i = 0; i < rows; i++) {
        result += `TEXT 8 0 ${x+ toCenter(item.substring(
					i * t_length,
					i * t_length + t_length
				),8,120)} ${y} ${item.substring(
					i * t_length,
					i * t_length + t_length
				)} \r\n`;
        y += step;
      }
    });
    return result;
  }
  return `TEXT 4 0 ${410 + toCenter(_join(data.c11),4,120)} 420 ` + _join(data.c11) + "\r\n";
};

const print = {
  test: (data = TestPrint, _App) => commonPrint(data, _App, printType),

  全部: (data, _App, idx, unprint_seq, printType) => {
    if (idx === 0) {
      return (
        commonPrint(data, _App, printType) +
        (unprint_seq ?
          decideC11(unprint_seq, data) :
          `TEXT 4 0 410 400 客户签${_App.user.domain==='D1005'?'收':'名'}：  \r\n`)
      );
    } else {
      return (
        commonPrint(data, _App, printType) +
        //"CENTER 120\r\n" +
        "SETMAG 1 1\r\n" +
        decideC11(unprint_seq, data)
      );
    }
  },

  子单: (data, _App, idx, unprint_seq, printType) =>
    commonPrint(data, _App, printType) +
    //"CENTER 120\r\n" +
    "SETMAG 1 1\r\n" +
    decideC11(unprint_seq, data),

  补打: (data, _App, idx, unprint_seq, printType) =>
    commonPrint(data, _App, printType) +
    //"CENTER 120\r\n" +
    "SETMAG 1 1\r\n" +
    decideC11(unprint_seq, data),

  主单: (data, _App, idx, unprint_seq, printType) =>
    commonPrint(data, _App, printType) +
    (unprint_seq ?
      decideC11(unprint_seq, data) :
      `TEXT 4 0 410 400 客户签${_App.user.domain==='D1005'?'收':'名'}：  \r\n`)
};

function dealData(data) {
  return data;

  let newData = Object.assign({}, data);
  newData.receive_city_big =
    newData.receive_city && newData.receive_city.length > 4 ?
    `${newData.receive_city.substring(0, 3)}...` :
    newData.receive_city || "";
  newData.arrive_pay =
    newData.arrive_pay > 0 ? "到付款:" + newData.arrive_pay : "";
  newData.cod = newData.cod > 0 ? "代收货款:" + newData.cod : "";
  newData.entry_type = newData.entry_type ? "进仓" : "";
  newData.rcode_type = newData.rcode_type ? "回单" : "";
  newData.upstairs_type = newData.upstairs_type ? "上楼" : "";
  newData.amount = newData.amount > 0 ? newData.amount + "件" : "";
  newData.volume = newData.volume > 0 ? newData.volume + "方" : "";
  newData.weight = newData.weight > 0 ? newData.weight + "kg" : "";
  newData.feelist = [
    newData.entry_type,
    newData.rcode_type,
    newData.upstairs_type,
    newData.arrive_pay,
    newData.cod
  ].filter(x => x);
  newData.cargoList = [
    newData.service_mode,
    newData.volume,
    newData.weight,
    newData.amount,
    newData.pack
  ].filter(x => x);
  let spacing = 10;
  newData.feePrint = "";
  newData.feelist.forEach(i => {
    if (i.includes("到付款") || i.includes("代收货款")) {
      newData.feePrint += "TEXT  8 2 " + spacing + " 535 " + i + "\r\n";
      let distance = i.split(":")[1].length * 10;
      spacing += 100 + distance;
    } else {
      newData.feePrint += "TEXT  8 2 " + spacing + " 535 " + i + "\r\n";
      spacing += 60;
    }
  });
  let spacing2 = 10;
  newData.cargoPrint = "";
  newData.cargoList.forEach(v => {
    let distance = v.length * 10 + 40;
    newData.cargoPrint += "TEXT 8 2 " + spacing2 + " 615 " + v + "\r\n";
    spacing2 += distance;
  });
  console.log(TestPrint);
  return newData;
}
const printDatas = (type, data, _App, idx, unprint_seq, printType, _printMode) => {
  return new Promise((resolve, reject) => {
    printMode = _printMode
    resolve(
      `${printType == 0 ? COMMON_ORDER_0 : COMMON_ORDER_1}${print[type](
				data,
				_App,
				idx,
				unprint_seq,
        printType,
			)}FORM \r\nPRINT \r\n`
    )
  });
}

// POPRINT反向打印

//  FORM\r\n
export {
  printDatas,
  TestPrint
};
// pc端自动展开
// "resizable": true,

const HostList = {
  dev: {
    app_name: "e8_prod",
    app_id: "wx9b75ba40fdf9b921",
    app_host: "http://192.168.31.212:8087",
    register: {
      domain: "",
      group: ""
    },
    mchid: "1525155411",
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3",
    gzh_appid: "wxd1e32997a92e1630",
    cp_muban_id: "eQCiSUKz-NrQitI4VuDyue0sKYaH_4ZgBfXxFPbsd0Y",
    tx_muban_id: "--Lno8MdbLVYwvxtADryKqXBDsR3c90eNJ_ltKbiazo"
  },
  djtc: {
    app_name: 'djtc',
    app_id: "wxdaf532e3a157d57d",
    app_host: "https://tms.tongnet.com",
    register: {
      domain: "",
      group: ""
    },
    mchid: "1525155411",
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3",
    //gzh_appid: "wxd1e32997a92e1630",
    cp_muban_id: "eQCiSUKz-NrQitI4VuDyue0sKYaH_4ZgBfXxFPbsd0Y",
    tx_muban_id: "--Lno8MdbLVYwvxtADryKqXBDsR3c90eNJ_ltKbiazo"
  },
  e8_prod: {
    app_name: "e8_prod",
    app_id: "wx373e19c339513a4e",
    //app_host:"http://localhost:8080",
    //app_host:'http://192.168.31.86:8087',
    //app_host:"http://172.20.10.2:8091",
    //app_host:"https://e8dev.boudata.com",
    //app_host:"http://192.168.0.40:8091",
    app_host: "https://tms.boudata.com",
    register: {
      domain: "D1047",
      group: ""
    },
    mchid: "1525155411",
    txmap_key: "MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3",
    gzh_appid: "wxd1e32997a92e1630",
    cp_muban_id: "eQCiSUKz-NrQitI4VuDyue0sKYaH_4ZgBfXxFPbsd0Y",
    tx_muban_id: "--Lno8MdbLVYwvxtADryKqXBDsR3c90eNJ_ltKbiazo"
  },
  //https://tms.boudata.com&code=8100185109&domain=D047&pageId=47
  eff: {
    app_name: "eff",
    app_id: "wx1f18a0c7e9272b40",
    //app_host: "https://e8dev.boudata.com",
    app_host: "https://tms.boudata.com",
    register: {
      domain: "D009",
      group: ""
    },
    mchid: "1525155411",
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3"
  },
  M5: {
    app_name: "M5",
    app_id: "wx3cdec87f52559387",
    app_host: "https://ms.boudata.com",
    // app_host: "https://e8dev.boudata.com",
    register: {
      domain: "",
      group: ""
    },
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3"
  },
  RS: {
    app_name: "RS",
    app_id: "wx87572198f214082e",
    app_host: "https://tms.pinhuobus.com",
    register: {
      domain: "D002",
      group: ""
    },
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3"
  },
  ZTKY: {
    app_name: "中铁快运",
    app_id: "wx63ab60527106a0f6",
    app_host: "https://tms.efafa.vip",
    //app_host: "https://tms.boudata.com",
    register: {
      domain: "D404",
      group: ""
    },
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3"
  },
  ZMM: {
    app_name: "展满满",
    app_id: "wx5435b5be246d4e0c",
    app_host: "https://tms.boudata.com",
    register: {
      domain: "D767",
      group: ""
    },
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3"
  },
  YTDT: {
    app_name: "意图达通",
    app_id: "wxe4cbaf74b2969bbc",
    app_host: "https://tms.zhejiangyitu.com",
    register: {
      domain: "",
      group: ""
    },
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3"
  },
  M3: {
    app_name: "M3",
    app_id: "wx2f5e2f52686d5dab",
    app_host: "https://ms.boudata.com",
    // app_host: "https://e8dev.boudata.com",
    register: {
      domain: "",
      group: ""
    },
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3"
  },
  BDXT: {
    app_name: "BDXT",
    app_id: "wx754e74c2b255cb5c",
    app_host: "https://tms.bdxt56.com",
    register: {
      domain: "D008",
      group: ""
    },
    txmap_key: "KY3BZ-E3AHO-4C2WN-SQ64R-JL3HS-OEFNZ",
    aliyun_host: "https://bd-image.oss-cn-hangzhou.aliyuncs.com/e8v3"
  }
};

const getAppHost = HostName => {
  return HostList[HostName];
};

module.exports = {
  getAppHost
};
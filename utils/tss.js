const http = require('./network.js')
import logpool from './log.js'
import {
    json2Form
} from './util.js'

const urls = {
    'e8api': '/e8/api/',
    'wxapi': '/wx/api/',
    'wxlogin': '/wxlogin.in',
    'wxreg': '/wxreg.in',
    'wxphone': '/wxphone.in',
    'sms': '/sms.in',
    'data': '/data/json/',
    'xdata': '/xdata/',
    'download': '/xdata/attach/download/',
    'upload': '/remote/upload?afterUploadClass=com.boubei.tssx.ali.oss.CreateAttach&type=2', //com.boubei.tss.dm.record.file.CreateAttach new:com.boubei.tssx.ali.oss.CreateAttach
    'uploadRcode': '/remote/upload?afterUploadClass=com.boudata.tms.handle.CreateReceiptAttach&type=2',
    'delAttach': '/xdata/attach/',
    'dml': '/api/dml/multi',
    'sys': '/param/json/simple/',
    'sql': '/api/data/sql/',
    'tms': '/tms',
    'ENTITY': '/tms/api/entity/'
}
const url = function (code, hastss = true) {
    const api = urls[code] || code
    return getApp().globalData.app_host + (hastss ? '/tss' : "") + api
}

// 一个录入表所拥有的增、删、改、查等接口
const recordURLs = function (tableId) {
    const url$xdata = url('xdata')
    return {
        CREATE: url$xdata + tableId,
        UPDATE: url$xdata + tableId + '/',
        DELETE: url$xdata + 'batch/' + tableId + '/del',
        GET: url$xdata + tableId + '/',
        QUERY: url$xdata + 'json/' + tableId,
        CUD: url$xdata + 'cud/' + tableId,
        ATTACH: url$xdata + 'attach/json/' + tableId + '/',
        CSV_EXP: url$xdata + 'export/' + tableId,
        CSV_TL: url$xdata + 'import/tl/' + tableId
    }
}

const save = function ({
    url,
    params,
    completion
}) {
    const id = params.id
    if (id) {
        url += '/' + id
    }
    post({
        url,
        params,
        completion
    })
}

const post = function ({
    url,
    params = {},
    requestBody = {},
    type,
    headers,
    completion,
    useCookie = false,
    method='POST',
    enableChunked = false
}) {
    const {
        uName,
        uToken
    } = getApp().globalData.user
    if (!useCookie) {
        if (uName) {
            params.uName = uName
        }
        if (uToken) {
            params.uToken = uToken
        }
    }
    if (Object.keys(requestBody).length) {
        params = {
            ...params,
            ...requestBody
        }
        url = url + '?' + json2Form(params)
    } else {
        headers = {
            'content-type': type == "repair_operate" ? 'application/json;charset=UTF-8' : 'application/x-www-form-urlencoded'
        }
    }
    for (let key in params) {
        if (params[key] === '' || params[key] === null || params[key] === undefined) delete params[key]
    }
    // console.log(params, requestBody,headers)
    http.request({
        url,
        method,
        params,
        headers,
        enableChunked,
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'post',
                    errorMsg: res.errorMsg,
                    user: uName,
                    api: {
                        url,
                        method: 'post',
                        params
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const getJSON = function ({
    url,
    params = {},
    completion
}) {
    const {
        uName,
        uToken
    } = getApp().globalData.user
    if (uName) {
        params.uName = uName
    }
    if (uToken) {
        params.uToken = uToken
    }
    const _url = url + '?' + json2Form(params)

    http.request({
        url: _url,
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'getJSON',
                    errorMsg: res.errorMsg,
                    user: uName,
                    api: {
                        url: _url,
                        method: 'get'
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const get = function ({
    url,
    itemId = '',
    completion
}) {
    const _url = url + itemId,
        {
            uName,
            uToken
        } = getApp().globalData.user
    http.request({
        url: _url,
        params: {
            uName,
            uToken
        },
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'get',
                    errorMsg: res.errorMsg,
                    user: uName,
                    api: {
                        url: _url,
                        method: 'get'
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const excuteDMLs = function ({
    url,
    data,
    completion
}) {
    const {
        uName,
        uToken
    } = getApp().globalData.user
    const params = {
        uName,
        uToken,
        json: data,
        ds: 'connectionpool'
    }
    const _url = url + '?' + json2Form(params)

    http.request({
        url: _url,
        method: http.method.POST,
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'excuteDMLs',
                    errorMsg: res.errorMsg,
                    user: uName,
                    api: {
                        url: _url,
                        method: 'post'
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const del = function ({
    url,
    itemId,
    completion
}) {
    const {
        uName,
        uToken
    } = getApp().globalData.user
    const params = {
        uName,
        uToken,
        ids: itemId + ''
    }
    const _url = url + '?' + json2Form(params)

    http.request({
        url: _url,
        method: http.method.POST,
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'del',
                    errorMsg: res.errorMsg,
                    user: uName,
                    api: {
                        url: _url,
                        method: 'post'
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const delnew = function ({
    url,
    order_ids,
    completion
}) {
    const {
        uName,
        uToken
    } = getApp().globalData.user
    const params = {
        uName,
        uToken,
        order_ids: order_ids + ''
    }
    const _url = url + '?' + json2Form(params)

    http.request({
        url: _url,
        method: http.method.DELETE,
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'del',
                    errorMsg: res.errorMsg,
                    user: uName,
                    api: {
                        url: _url,
                        method: 'post'
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const removeImages = function (id, completion) {
    const {
        uName,
        uToken
    } = getApp().globalData.user
    const _url = url('delAttach') + id + '?' + json2Form({
        uName,
        uToken
    })

    http.request({
        url: _url,
        method: http.method.DELETE,
        completion: res => {
            completion && completion(res)
        }
    })
}

const query = function ({
    url,
    params = {},
    completion
}) {
    const {
        uName,
        uToken
    } = getApp().globalData.user
    http.request({
        url: url + (typeof params.noCache === 'undefined' ? '?noCache=true' : `?noCache=${!!params.noCache}`),
        params: Object.assign({
            uName,
            uToken
        }, params),
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'query',
                    errorMsg: res.errorMsg,
                    user: uName,
                    api: {
                        url,
                        method: 'get',
                        params
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const queryReport = function ({
    report,
    params = {},
    completion
}) {
    query({
        url: url('data') + report,
        params,
        completion
    })
}

const uploadImages = function (url, filePath, completion) {
    http.upload({
        url: url + '&client=wx',
        filePath,
        name: 'file',
        completion: res => {
            if (res.failed) {
                completion && completion({
                    img: filePath,
                    success: false
                })
            } else {
                res.data ? completion && completion({
                        id: res.data.replace('<html><script>', '').replace('</script></html>', '').replace(';', ''),
                        img: filePath,
                        success: true
                    }) :
                    completion && completion({
                        img: filePath,
                        success: false
                    })
            }
        }
    })
}

const uploadImagesSync = function ({
    recordId,
    itemId,
    filePaths,
    completion
}) {
    const {
        uName,
        uToken
    } = getApp().globalData.user
    const _url = url('upload') + `&uName=${uName}&uToken=${uToken}&recordId=${recordId}&itemId=${itemId}`

    const promiseGen = (filePaths) => {
        return filePaths.reduce((promise, filePath) => {
            return promise.then(value => {
                return new Promise(resolve => {
                    uploadImages(_url, filePath, res => {
                        value.push(res)
                        resolve(value)
                    })
                })
            })
        }, Promise.resolve([]))
    }

    promiseGen(filePaths).then(res => {
        completion && completion(res)
    })
}

const uploadImagesAsync = function ({
    recordId,
    itemId,
    useSpecifiedName,
    filePaths,
    completion,
    tableId,
    waterMark,
    markMode
}) {
    let {
        uName,
        uToken
    } = getApp().globalData.user,
        _url = url('upload') + '&' + json2Form({
            uName,
            uToken,
            recordId,
            itemId,
            useSpecifiedName,
            tableId,
            waterMark,
            markMode
        });
    // if(recordId == '-3'){
    //   // 回单换afterClass
    //   _url = url('uploadRcode') + '&' + json2Form({ uName, uToken, recordId, itemId, useSpecifiedName });
    // }
    var tasks = []
    for (let i = 0; i < filePaths.length; i++) {
        let p = new Promise(function (resolve, reject) {
            uploadImages(_url, filePaths[i], res => resolve(res))
        })
        tasks.push(p)
    }
    Promise.all(tasks)
        .then(res => {
            completion && completion(res)
        })
}

const downloadFile = function ({
    ids,
    completion
}) {
    const _url = url('download')
    const {
        uName,
        uToken
    } = getApp().globalData.user,
        params = `?uName=${uName}&uToken=${uToken}`
    if (Array.isArray(ids)) {
        let tasks = []
        for (let i = 0; i < ids.length; i++) {
            let p = new Promise(function (resolve, reject) {
                http.download(_url + ids[i] + params, res => {
                    res.failed ? {} : resolve(res.tempFilePath)
                })
            })
            tasks.push(p)
        }
        Promise.all(tasks)
            .then(res => {
                completion && completion(res)
            })
    } else {
        http.download(_url + ids + params, res => {
            completion && completion(res)
        })
    }
}

const sys = function (paramGroup, completion) {
    const _url = url('sys') + paramGroup
    http.request({
        url: _url,
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'sys',
                    errorMsg: res.errorMsg,
                    api: _url
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const sendVerificationCode = function (phone, completion) {
    const _url = url('sms')
    http.request({
        url: _url,
        params: {
            phone
        },
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'sendVerificationCode',
                    errorMsg: res.errorMsg,
                    api: _url,
                    params: phone
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false
            })
        }
    })
}

const sendGZHMsg = function ({
    params = {},
    completion
}) {
    const {
        uName,
        uToken
    } = getApp().globalData.user

    const _url = url('wxapi') + 'sendgzhmsg'
    params.uName = 'BD0000'
    params.uToken = 'oKYA65HP9aMry2lgcQgyorxYXasU'

    http.request({
        url: _url,
        params: params,
        headers: {
            appCode: 'BD'
        },
        completion: res => {
            if (res.failed) {
                logpool.error({
                    method: 'sendGZHMsg',
                    errorMsg: res.errorMsg,
                    user: uName,
                    api: {
                        _url,
                        method: 'get',
                        params
                    }
                })
                completion && completion({
                    failed: true,
                    errorMsg: res.errorMsg
                })
                return
            }
            completion && completion({
                failed: false,
                data: res.data
            })
        }
    })
}

const debounce = function (fn, wait) {
    var timer = null;
    return function () {
        var context = this
        var args = arguments
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            fn.apply(context, args)
        }, wait)
    }
}

const ocr = async (img_url, ocrType) => {
    // ocr_type 1：身份证；2：银行卡；3：行驶证；4：驾驶证；7：营业执照；8：通用OCR
    const ocr_type = {
        "idCard": {
            type: 1,
            res: 'idcard_res'
        },
        "bank": {
            type: 2,
            res: 'bankcard_res'
        },
        "license": {
            type: 3,
            res: 'driving_res'
        },
        "driveLicense": {
            type: 4,
            res: 'driving_license_res'
        },
        "company": {
            type: 7,
            res: 'biz_license_res'
        },
        "common": {
            type: 8,
            res: 'ocr_comm_res'
        },
    }
    try {
        const {
            data
        } = await wx.serviceMarket
            .invokeService({
                service: "wx79ac3de8be320b71", // '固定为服务商OCR的appid，非小程序appid',
                api: "OcrAllInOne",
                data: {
                    img_url,
                    data_type: 3,
                    ocr_type: ocr_type[ocrType].type
                }
            })
        return data[ocr_type[ocrType].res]
    } catch (error) {
        return {
            success: false
        }
    }
}

export {
    ocr,
    url,
    recordURLs,
    save,
    get,
    excuteDMLs,
    del,
    delnew,
    query,
    queryReport,
    uploadImagesSync,
    uploadImagesAsync,
    downloadFile,
    removeImages,
    sys,
    sendVerificationCode,
    post,
    getJSON,
    sendGZHMsg,
    debounce
}
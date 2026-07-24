const http$method = Object.freeze({
    POST: 'POST',
    GET: 'GET',
    DELETE: 'DELETE'
})

const request = function ({
    url,
    method = http$method.GET,
    params,
    completion,
    headers,
    enableChunked
}) {
    if (!url) {
        return
    }

    var result
    wx.request({
        url,
        method,
        header: headers ? Object.assign(headers, {
            Cookie: wx.getStorageSync('cookie')
        }) : {
            Cookie: wx.getStorageSync('cookie')
        },
        enableChunked,
        data: params,
        success: res => {
            if (res.statusCode == 200) {
                let errorMsg = res.data.errorMsg
                if (errorMsg) {
                    result = {
                        failed: true,
                        errorMsg: errorMsg
                    }
                } else {
                    result = {
                        failed: false,
                        data: res.data
                    }
                    let cookie = res.header['Set-Cookie'] || ''
                    //e.trim().startsWith('JSESSIONID=')
                    if (cookie.split(',').filter(e => e.trim().startsWith('token=')).length > 0 && cookie.split(',').filter(e => e.trim().startsWith('JSESSIONID=')).length > 0) {
                        wx.setStorageSync('cookie', cookie)
                    }
                }
            } else {
                result = {
                    failed: true,
                    errorMsg: 'request failed'
                }
            }
        },
        fail: res => {
            result = {
                failed: true,
                errorMsg: 'invoke api(wx.request) failed'
            }
        },
        complete: res => {
            completion && completion(result)
        }
    })
}

const upload = function ({
    url,
    filePath,
    name,
    completion
}) {
    if (!url) {
        return
    }
    var result
    wx.uploadFile({
        url,
        filePath,
        name,
        success: res => {
            if (res.statusCode == 200) {
                result = res.data.errorMsg ? {
                    failed: true,
                    errorMsg: res.data.errorMsg
                } : {
                    failed: false,
                    data: res.data
                }
            } else {
                result = {
                    failed: true,
                    errorMsg: 'upload failed'
                }
            }
        },
        fail: res => {
            result = {
                failed: true,
                errorMsg: 'invoke api(wx.uploadFile) failed'
            }
        },
        complete: res => {
            completion && completion(result)
        }
    })
}

const download = function (url, completion) {
    if (!url) {
        return
    }

    var result
    wx.downloadFile({
        url,
        header: {
            Cookie: wx.getStorageSync('cookie')
        },
        success: res => {
            result = {
                failed: false,
                tempFilePath: res.tempFilePath,
                statusCode: res.statusCode,
                errorMsg: res.errMsg
            }
        },
        fail: res => {
            result = {
                failed: true,
                errorMsg: 'invoke api(wx.downloadFile) failed'
            }
        },
        complete: res => {
            completion && completion(result)
        }
    })
}

module.exports = {
    method: http$method,
    request,
    upload,
    download
}
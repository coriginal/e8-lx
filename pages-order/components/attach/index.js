const tss = require('../../../utils/tss.js')
const http = require('../../../utils/network.js')
const alert = require('../../../utils/alert.js')
// import user from '../../utils/user.js'
const app = getApp().globalData
import logpool from '../../../utils/log.js'

Component({

    externalClasses: ['custom-class'],

    properties: {
        list: {
            type: Array,
            value: []
        },
        imagemode: {
            type: String,
            value: ''
        },
        hidedel: {
            type: Boolean,
            value: false
        },
        hideadd: {
            type: Boolean,
            value: false
        },
        notopmargin: {
            type: Boolean,
            value: false
        },
        nobottommargin: {
            type: Boolean,
            value: false
        },
        recordId: {
            type: Number,
            value: ''
        },
        recordCode: {
            type: String,
            value: ''
        },
        itemId: {
            type: Number,
            value: ''
        },
        itemNum: {
            type: Number,
            value: 1
        },
        timestamp: {
            type: Number,
            value: ''
        },
        count: {
            type: Number,
            value: ''
        },
        sourceType: {
            type: String,
            value: ''
        },
        sizeType: {
            type: Array,
            value: ['compressed']
        },
        scrollx: {
            type: Boolean,
            value: false
        },
        waterMark: {
            type: String,
            value: ''
        },
        markMode: {
            type: String,
            value: ''
        },
        autoItemId: {
            type: Boolean,
            value: true
        }
    },

    methods: {
        addattach: function (e) {
            var _this = this
            console.log("点击了", this.data.itemId)
            if (!this.data.itemId) {
                let ts = new Date().getTime();
                let real_ts = [];
                if (this.data.itemNum > 1) {
                    for (let i = 0; i < this.data.itemNum; i++) {
                        real_ts.push(ts + '00' + i);
                    }
                }
                this.data.timestamp = this.data.timestamp || real_ts.join(',') || ts;
            }
            wx.chooseMedia({
                sourceType: this.data.sourceType ? [this.data.sourceType] : ['album', 'camera'],
                count: this.data.count || 9,
                sizeType: this.data.sizeType,
                success: res => {
                    wx.showLoading({
                        title: '上传中...',
                        mask: true
                    })
                    const tbName = this.data.recordId || this.data.recordCode;
                    tss.uploadImagesAsync({
                        recordId: tbName,
                        itemId: this.data.itemId || (this.data.autoItemId ? this.data.timestamp : null),
                        uName: app.user.uName,
                        uToken: app.user.uToken,
                        filePaths: res.tempFiles.map(item=>item.tempFilePath),
                        waterMark: this.data.waterMark,
                        markMode: this.data.markMode,
                        completion: res => {
                            console.log(res)
                            let _urls = []
                            for (var i = 0; i < res.length; i++) {
                                if (res[i].success) {
                                    var img = res[i].img;
                                    if (img) {
                                        var simg = img.split('/');
                                        img = simg[simg.length - 1]
                                        img = img.substr(img.length - 25, 25)
                                    }
                                    _urls.push({
                                        url: res[i].img, //tss.url('download') + `${res[i].id}?uName=${app.user.uName}&uToken=${app.user.uToken}`,
                                        type: 1,
                                        name: img,
                                        id: res[i].id
                                    })
                                } else {
                                    logpool.info(tbName + ' uploadfile fail')
                                }
                            }
                            this.setData({
                                list: this.data.list.concat(_urls),
                                toView: 'addattach'
                            })
                            this.triggerEvent('addattach', {
                                _tempID: this.data.timestamp,
                                attachURLs: this.data.list
                            })
                        }
                    })
                },
                fail:error=>{
                    console.log(error)
                }
            })

        },
        delattach: function (e) {
            const index = e.currentTarget.dataset.index
            let id = this.data.list[index].id
            id = id.replace(';', '');
            alert.notice('是否确认删除附件？', {
                text: '确定',
                handler: () => {
                    tss.removeImages(
                        id,
                        res => {
                            if (res.failed) {
                                alert.error('删除附件失败。' + (res.errorMsg || ''))
                                return
                            } else {
                                alert.notice('删除附件成功')
                                this.data.list.splice(index, 1)
                                this.setData({
                                    list: this.data.list
                                })
                                this.triggerEvent('delattach', {
                                    attachURLs: this.data.list
                                })
                            }
                        }
                    )
                }
            }, {
                text: '取消',
                handler: () => {
                    return
                }
            })
        },
        previewAttach: function (e) {
            const index = e.target.dataset.index;
            const item = this.data.list[index];
            if (item.type == '2') {
                var suffix = this.checkSuffix(item.name)
                tss.downloadFile({
                    ids: item.id,
                    completion: res => {
                        if (res.failed) {
                            alert.error(res.errorMsg)
                            return
                        }
                        var filePath = res.tempFilePath
                        this.openFile(filePath, suffix)
                    }
                })
            } else {
                var list = [];
                for (var i = 0; i < this.data.list.length; i++) {
                    const item = this.data.list[i];
                    if (item.type != '2') {
                        list.push(item.url)
                    }
                }
                wx.previewImage({
                    current: item.url,
                    urls: list
                })
            }
        },

        openFile: function (filepath, suffix) {
            if (!suffix) {
                var suffix = this.checkSuffix(filepath)
            }
            if (suffix) {
                wx.openDocument({
                    filePath: filepath,
                    fileType: suffix,
                    success: function (res) {
                        console.log("打开成功")
                    },
                    fail: function (res) {
                        wx.showToast({
                            title: '文件打开失败！',
                            icon: 'none'
                        })
                    }
                })
            } else {
                wx.showToast({
                    title: '该文件类型不支持打开！',
                    icon: 'none'
                })
            }
        },

        checkSuffix: function (str) {
            var valid = ['doc', 'xls', 'ppt', 'pdf', 'docx', 'xlsx', 'pptx']
            var index = str.lastIndexOf('.')
            var suffix = str.substr(index + 1)
            if (valid.indexOf(suffix) >= 0) {
                return suffix
            } else {
                return false
            }
        },

        forbidBubble(e) {
            console.log(e)
        }
    }
});
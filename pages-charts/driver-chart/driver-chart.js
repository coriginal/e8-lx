import * as echarts from '../ec-canvas/echarts';
const tss = require('../../utils/tss.js');
const user = require('../../utils/user.js');
const alert = require('../../utils/alert.js');
const _app = getApp()
import {
    subDate
} from '../../utils/util.js';
Page({
    data: {
        ecBar: {},
        ecPie: {},
        ecLine: {},
        datefrom: "2020-01-01",
        dateto: "2022-12-01",
        detailDatefrom: "2020-01-01",
        detailDateto: "2022-12-01",
        list: [],
        filterData: [],
        //页面容器
        show: false,
        duration: 500,
        position: 'center',
        round: false,
        overlay: true,
        customStyle: '',
        overlayStyle: '',
        //当前选择的司机
        currentDriver: "",
        //是否显示圆饼图
        isShowPie: false,
        //深色模式
        viewMode: 'null',
        //主题色
        //theme:"#100C2A",
        //测试用
        isTest: false,
        testDomain: "D368",

        codeList: [],
        detailHidden: true,
        lineHidden: false,
        IsNull: false,
        detailIsNull: false,
        role: "",

        currentPage: 0,
        i_currentPage: 0,

        unit:""
    },
    onLoad(options) {
        this.setData({
            unit:_app.globalData.DomainConfig.weight_unit.content
        })
        if (!wx.canIUse('page-container')) {
            alert.notice("当前微信版本不支持报表系统，请更新微信", () => {
                wx.navigateBack({
                    delta: 0,
                })
            })
            return
        }
        this.whichRole().then(res => {
            console.log(res)
            var date = new Date()
            if (res.role == 9) {
                this.setData({
                    role: 9,
                    show: true,
                    detailDateto: `${date.getFullYear()}-${date.getMonth()+1<=9?0:''}${date.getMonth()+1}-${date.getDate()}`
                })
                this.getLineInfo(res);
                this.queryDriverOrder()
                return
            }
            console.log(date.getFullYear())
            this.setData({
                datefrom: `${date.getFullYear()}-${date.getMonth()+1<=9?0:''}${date.getMonth()+1}-01`,
                dateto: `${date.getFullYear()}-${date.getMonth()+1<=9?0:''}${date.getMonth()+1}-${date.getDate()}`
            })
            console.log(new Date(this.data.datefrom) - new Date(this.data.dateto))
            this.getBarInfo('xcx_report3')
            this.queryDriverList()
        })
    },
    onReady() {
        console.log(this.data.ecBar)
        this.barComponent = this.selectComponent('#mychart-dom-bar')
        //this.barComponent = this.selectComponent('#mychart-dom-pie')
    },
    //判断角色 司机:9 总经理:2
    whichRole() {
        console.log(_app.globalData.user)
        let user = _app.globalData.user
        console.log(user.roles.indexOf('总经理'))
        return new Promise((resolve, reject) => {
            if (user.roles.indexOf('总经理') == -1) {
                if (user.roles.indexOf('司机') != -1) {
                    this.setData({
                        currentDriver: {
                            driver: user.cnName,
                            phone: user.mobile != "null" ? user.mobile : user.uName
                        }
                    })
                    resolve({
                        role: "9",
                        driver: user.cnName,
                        phone: user.mobile != "null" ? user.mobile : user.uName
                    })
                }
            } else {
                resolve({
                    role: "2"
                })
            }
        })
    },
    //switch按钮
    modeSwitch() {
        this.setData({
            viewMode: this.data.viewMode == "dark" ? "null" : "dark"
        })
        this.getBarInfo('xcx_report3')
        this.data.isShowPie ? this.getPieInfo('xcx_report3') : ""
    },
    //柱状图
    driverTree(e) {
        var xInfo = []
        var yInfo = []
        for (var i in e) {
            xInfo.push(e[i].driver)
            yInfo.push(e[i].ordernumber)
        }
        return {
            xInfo,
            yInfo
        }
    },
    getBarInfo(code) {
        console.log("向服务器获取图表数据")
        var that = this
        tss.post({
            url: tss.url('') + '/data/json/' + code,
            params: {
                datefrom: that.data.datefrom,
                dateto: that.data.dateto,
                domain: that.data.isTest ? that.data.testDomain : user.default.domain
            },
            completion: res => {
                if (res.failed || typeof res.data == 'string') {
                    alert.error()
                    completion && completion()
                    return
                }
                if (res.data.length == 0) {
                    this.setData({
                        IsNull: true
                    })
                    alert.notice("当前选择时间内无数据，请重新选择查询")
                    return
                }
                this.setData({
                    IsNull: false
                })
                var info = this.driverTree(res.data)
                var option = {
                    title: {
                        text: '司机运单量情况排名',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: { // 坐标轴指示器，坐标轴触发有效
                            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                        }
                    },
                    grid: {
                        left: 20,
                        right: 20,
                        bottom: 15,
                        top: 40,
                        containLabel: true
                    },
                    yAxis: [{
                        type: 'value',
                        axisLine: {
                            lineStyle: {
                                color: '#999'
                            }
                        },
                        axisLabel: {
                            color: '#666'
                        }
                    }],
                    xAxis: [{
                        type: 'category',
                        axisTick: {
                            show: false
                        },
                        data: info.xInfo,
                        axisLine: {
                            lineStyle: {
                                color: '#999'
                            }
                        },
                        axisLabel: {
                            color: '#666',
                            show: true,
                            interval: 0
                        }
                    }],
                    series: [{
                        name: '订单数',
                        type: 'bar',
                        label: {
                            normal: {
                                show: true,
                                position: 'inside'
                            }
                        },
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#83bff6'
                                },
                                {
                                    offset: 0.5,
                                    color: '#188df0'
                                },
                                {
                                    offset: 1,
                                    color: '#188df0'
                                }
                            ])
                        },
                        data: info.yInfo,
                        barWidth: "80%",
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.2)'
                        }
                    }],
                    dataZoom: {
                        type: 'inside', // 内置于坐标系中
                        start: 0,
                        end: 16,
                        xAxisIndex: [0]
                    },
                };
                that.initBar(option)
            }
        })
    },
    initBar(option) {
        console.log("图表初始化")
        var that = this
        console.log("ecBar置空")
        that.barComponent.init((canvas, width, height, dpr) => {
            console.log("开始初始化chart")
            var chart = echarts.init(canvas, that.data.viewMode, {
                width: width,
                height: height,
                devicePixelRatio: dpr // new
            });
            console.log("chart初始化完成")
            canvas.setChart(chart);
            chart.setOption(option);
            return chart;
        })
    },
    //圆饼图
    showPieChart() {
        this.setData({
            isShowPie: !this.data.isShowPie
        })
        if (!this.data.isShowPie) {
            return
        }
        this.pieComponent = this.selectComponent('#mychart-dom-pie')
        this.getPieInfo('xcx_report3')
    },
    initPie(option) {
        this.pieComponent.init((canvas, width, height, dpr) => {
            const chart = echarts.init(canvas, this.data.viewMode, {
                width: width,
                height: height,
                devicePixelRatio: dpr // new
            });
            canvas.setChart(chart);
            chart.setOption(option);
            return chart;
        })
    },
    getPieInfo(code) {
        var that = this
        tss.post({
            url: tss.url('') + '/data/json/' + code,
            params: {
                datefrom: that.data.datefrom,
                dateto: that.data.dateto,
                domain: that.data.isTest ? that.data.testDomain : user.default.domain
            },
            completion: res => {
                console.log(res)
                if (res.failed || typeof res.data == 'string') {
                    alert.error()
                    completion && completion()
                    return
                }
                var list = []
                for (var i in res.data) {
                    list.push({
                        value: res.data[i].ordernumber,
                        name: res.data[i].driver
                    })
                }
                var option = {
                    legend: {
                        type: 'scroll',
                        orient: 'vertical',
                        right: 10,
                        top: 20,
                        bottom: 20,
                        data: list.map(item => {
                            return item.name
                        })
                    },
                    series: [{
                        label: {
                            normal: {
                                fontSize: 14
                            }
                        },
                        type: 'pie',
                        center: ['40%', '50%'],
                        radius: '55%',
                        data: list,
                        /* itemStyle: {
                            color:'#188df0'
                        }, */
                    }]
                };
                that.initPie(option)
            }
        })
    },
    //日期选择
    bindDateFromChange(e) {
        console.log(e)
        this.setData({
            datefrom: e.detail.value
        })
    },
    bindDateToChange(e) {
        this.setData({
            dateto: e.detail.value
        })
    },
    //查询
    search() {
        console.log(`始日期：${this.data.datefrom},止日期：${this.data.dateto}`)
        if (new Date(new Date(this.data.dateto) - new Date(this.data.datefrom)) > 0) {
            this.getBarInfo('xcx_report3')
            this.queryDriverList()
            this.data.isShowPie ? this.getPieInfo('xcx_report3') : ""
        } else {
            alert.notice("止日期必须大于始日期！")
        }
    },
    //搜索司机
    bindKeyInput: tss.debounce(function (e) {
        let value = e.detail.value
        if (value) {
            console.log(this.data.list)
            let filterData = this.data.list
                .filter(item => item.driver.includes(value))
            this.setData({
                filterData
            })
        } else {
            this.setData({
                filterData: this.data.list
            })
        }
    }, 500),
    //获取司机列表
    queryDriverList() {
        wx.showLoading({
            mask: true
        })
        tss.post({
            url: tss.url('') + '/data/json/driver_t',
            params: {
                datefrom: this.data.datefrom,
                dateto: this.data.dateto,
                domain: this.data.isTest ? this.data.testDomain : user.default.domain
            },
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    wx.hideLoading()
                    return
                }
                this.setData({
                    list: res.data,
                    filterData: res.data
                })
                wx.hideLoading()
            }
        })
    },
    //选择司机并进入相应页面
    chooseDriver(e) {
        console.log(e.currentTarget.dataset.item)
        const position = e.currentTarget.dataset.position
        let customStyle = ''
        let duration = this.data.duration
        switch (position) {
            case 'top':
            case 'bottom':
                customStyle = 'height: 30%;'
                break
            case 'right':
                break
        }
        this.setData({
            position,
            show: true,
            customStyle,
            duration,
            currentDriver: e.currentTarget.dataset.item,
            detailDatefrom: this.data.datefrom,
            detailDateto: this.data.dateto
        })
        this.getLineInfo(e.currentTarget.dataset.item)
        this.queryDriverOrder()
    },
    //页面容器
    toBack(e) {
        console.log(e)
        this.setData({
            show: false
        })
    },
    onAfterEnter() {
        this.setData({
            coinSx:''
        })
    },
    onAfterLeave() {
        if (this.data.role == 9) {
            wx.navigateBack({
                delta: 0,
            })
            return
        }
        this.setData({
            show: false,
            detailIsNull: false,
            i_currentPage: 0,
            coinSx:''
        })
    },
    //折线图
    getLineInfo({
        driver,
        phone
    }) {
        var that = this;
        tss.post({
            url: tss.url('') + '/data/json/driver_info',
            params: {
                datefrom: that.data.detailDatefrom,
                dateto: that.data.detailDateto,
                name: driver, //driver,
                phone: phone,
                domain: that.data.isTest ? that.data.testDomain : user.default.domain
            },
            completion: res => {
                console.log(res)
                //alert.notice(`${res.data[0].status}\r\n${res.data[0].driver}`)
                that.lineComponent = that.selectComponent('#mychart-dom-line')
                if (res.data.length == 0) {
                    this.setData({
                        detailIsNull: true
                    })
                    alert.notice("当前选择时间内无数据，请重新选择查询")
                    return
                }
                this.setData({
                    detailIsNull: false
                })
                var list = [...res.data]
                console.log(list.map(({
                    time
                }) => time))
                console.log(list)
                var option = {
                    title: {
                        text: `${driver}个人运单量情况表`,
                        left: 'center'
                    },
                    grid: {
                        containLabel: true
                    },
                    tooltip: {
                        show: true,
                        trigger: 'axis'
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: list.map(({
                            time
                        }) => time),
                        // show: false
                        /* axisLabel: {
                            color: '#666',
                            show: true,
                            interval: 0
                        } */
                    },
                    yAxis: {
                        x: 'center',
                        type: 'value',
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        }
                        // show: false
                    },
                    series: [{
                        name: '单量',
                        type: 'line',
                        smooth: true,
                        data: list.map(({
                            ordernum
                        }) => ordernum),
                        itemStyle: {
                            color: '#188df0'
                        },
                    }],
                    /*                     dataZoom: {
                                            type: 'inside', // 内置于坐标系中
                                            start: 0,
                                            end: 10,
                                            xAxisIndex: [0]
                                        }, */
                };
                this.initLine(option)
            }
        })
    },
    initLine(option) {
        this.lineComponent.init((canvas, width, height, dpr) => {
            var chart = echarts.init(canvas, this.data.viewMode, {
                width: width,
                height: height,
                devicePixelRatio: dpr // new
            });
            canvas.setChart(chart);
            chart.setOption(option);
            return chart;
        })
    },
    //保存图表到为图片
    saveChart(e) {
        console.log(e)
        var chart = null;
        switch (e.currentTarget.id) {
            case "bar":
                chart = this.barComponent;
                break;
            case "pie":
                chart = this.pieComponent;
                break;
            default:
                return;
        }
        chart.canvasToTempFilePath({
            success: res => {
                console.log("tempFilePath:", res.tempFilePath)
                // 存入系统相册
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath || '',
                    success: res => {
                        console.log("success", res)
                        alert.notice("已保存至相册！")
                    },
                    fail: res => {
                        console.log("fail", res)
                        alert.notice("保存失败！")
                    }
                })
            },
            fail: res => console.log(res)
        });
    },

    testButton() {
        //e.currentTarget.dataset.item
        let e = {
            currentTarget: {
                dataset: {
                    item: {
                        driver: "老张",
                        phone: "13656679984"
                    }
                }
            }
        }
        this.chooseDriver(e)
    },
    queryDriverOrder() {
        var _this = this;
        console.log(_this.data.currentDriver)
        let driverinfo = _this.data.currentDriver
        tss.post({
            url: tss.url('') + '/data/json/driver_order',
            params: {
                name: driverinfo.driver,
                phone: driverinfo.phone,
                datefrom: this.data.detailDatefrom,
                dateto: this.data.detailDateto,
                domain: this.data.isTest ? this.data.testDomain : user.default.domain
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    wx.hideLoading()
                    return
                }
                _this.setData({
                    driverData: res.data,
                    codeList: res.data
                })
            }
        })
    },
    codeInput: tss.debounce(function (e) {
        let value = e.detail.value
        if (value) {
            let driverData = this.data.codeList
                .filter(item => item.code.includes(value))
            this.setData({
                driverData
            })
        } else {
            this.setData({
                driverData: this.data.codeList
            })
        }
    }, 500),
    orderDetail(e) {
        console.log(e)
        this.setData({
            currentDetail: [e.currentTarget.dataset.item],
            detailHidden: false,
            lineHidden: true
        })
    },
    hiddenDetail() {
        this.setData({
            detailHidden: true,
            lineHidden: false
        })
    },
    searchDetail() {
        this.getLineInfo(this.data.currentDriver);
        this.queryDriverOrder()
    },
    bindDetailDateFromChange(e) {
        console.log(e)
        this.setData({
            detailDatefrom: e.detail.value
        })
    },
    bindDetailDateToChange(e) {
        this.setData({
            detailDateto: e.detail.value
        })
    },
    choosePage(e) {
        var date = new Date()
        if (!this.data.show) {
            console.log(e)
            this.setData({
                currentPage: e.target.dataset.index
            })
            if (e.target.dataset.index == 1) {
                this.setCoinDate(date.getFullYear(), date.getMonth() + 1)
            }
        } else {
            this.setData({
                i_currentPage: e.target.dataset.index
            })
            if (e.target.dataset.index == 1) {
                this.setCoinDate(date.getFullYear(), date.getMonth() + 1)
            }
        }
    },
    setCoinDate(year, month) {
        var date = new Date(year, month, 0)
        let day = date.getDate()
        month = `${date.getMonth()+1<=9?0:''}${month}`
        var coin_datefrom = `${year}-${month}-01`
        var coin_dateto = `${year}-${month}-${day}`
        this.setData({
            coin_datefrom,
            coin_dateto
        })
        this.getDriverCoin()
    },
    getDriverCoin() {
        const formatMoney = (money) => {
            return money.replace(new RegExp(`(?!^)(?=(\\d{3})+${money.includes('.') ? '\\.' : '$'})`, 'g'), ',')
        }
        tss.post({
            url: tss.url('') + '/data/json/driver_sum_coin',
            params: {
                datefrom: this.data.coin_datefrom,
                dateto: this.data.coin_dateto,
                domain: this.data.isTest ? this.data.testDomain : user.default.domain
            },
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        content: res.errorMsg,
                        showCancel: false
                    })
                    wx.hideLoading()
                    return
                }
                console.log(this.data.currentDriver)
                if (this.data.show) {
                    res.data = res.data.filter(item => item.driver.includes(this.data.currentDriver.driver))
                }
                let sumCoin = 0;
                let maxCoin = [];
                res.data.map(item => {
                    sumCoin += item.fee
                    maxCoin.push(item.fee)
                })
                console.log(maxCoin)
                this.setData({
                    driverCoin: res.data,
                    codeCoin:res.data,
                    sumCoin:formatMoney(String(sumCoin)),
                    otherList: [res.data.length, sumCoin / res.data.length, Math.max.apply(null, maxCoin)]
                })
            }
        })
    },
    changeDate(e) {
        console.log(e);
        let x = [12, 1];
        let y = 1;
        if (e.currentTarget.id == 'last' || e.currentTarget.id == 'i_last') {
            x.reverse()
            y = -1;
        }
        let date = this.data.coin_dateto;
        date = date.split('-')
        console.log(date)
        var year = Number(date[0]);
        var month = Number(date[1]);
        if (month != x[0]) {
            month += y;
        } else {
            year += y;
            month = x[1];
        }
        console.log(year, month)
        this.setCoinDate(year, month)
    },
    searchCoin: tss.debounce(function (e) {
        let value = e.detail.value
        if (value) {
            let driverCoin = this.data.codeCoin
                .filter(item => item.code.includes(value))
            this.setData({
                driverCoin
            })
        } else {
            this.setData({
                driverCoin: this.data.codeCoin
            })
        }
    }, 500),
});
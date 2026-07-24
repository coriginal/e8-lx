// pages-charts/customer-chart/index.js
const _app = getApp()
const tss = require('../../utils/tss.js');
const CANALLER = ["总经理", "副总经理", "会计", "财务主管", "项目会计"]
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dataList: [],
        sumInCome: 0,
        avgOrderCost: 0,
        customerArr: [],
        customerChecked: [],
        pageContainerShow: false,
        customerChecked_cpy: [],
        mode: 0,
        curOrderDetail: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        var date = new Date()
        this.setData({
            datefrom: `${date.getFullYear()}-${date.getMonth()+1<=9?0:''}${date.getMonth()+1}-01`,
            dateto: `${date.getFullYear()}-${date.getMonth()+1<=9?0:''}${date.getMonth()+1}-${date.getDate()}`
        })
        console.log(new Date(this.data.datefrom) - new Date(this.data.dateto))
        //this.getBarInfo('xcx_report3')
        this.getData();
        //this.queryDriverList()
    },
    changeDate(e) {
        let x = [12, 1];
        let y = 1;
        if (e.currentTarget.id == 'last' || e.currentTarget.id == 'i_last') {
            x.reverse()
            y = -1;
        }
        let date = this.data.dateto;
        date = date.split('-')
        var year = Number(date[0]);
        var month = Number(date[1]);
        if (month != x[0]) {
            month += y;
        } else {
            year += y;
            month = x[1];
        }
        this.setCoinDate(year, month)
    },
    setCoinDate(year, month) {
        var date = new Date(year, month, 0)
        let day = date.getDate()
        month = `${date.getMonth()+1<=9?0:''}${month}`
        var datefrom = `${year}-${month}-01`
        var dateto = `${year}-${month}-${day}`
        this.setData({
            datefrom,
            dateto
        })
        //获取数据
        this.getData()
    },
    getData() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        var roles = _app.globalData.user.roles,
            flag = 0
        for (var i in CANALLER) {
            if (roles.indexOf(CANALLER[i]) != -1) {
                flag = 1;
            }
        }
        console.log(_app.globalData.user)
        var customer_id
        tss.post({
            url: tss.url('') + '/api/data/sql/customer',
            params: {
                noCache: true,
                phone: _app.globalData.user.mobile
            },
            completion: res => {
                if (res.failed) {
                    customer_id = _app.globalData.user.uName
                } else {
                    customer_id = res.data.length ? res.data[0].id : _app.globalData.user.uName
                }
                tss.post({
                    url: tss.url('') + '/data/json/xcx_report4',
                    params: {
                        phone: flag ? "" : customer_id,
                        datefrom: this.data.datefrom,
                        dateto: this.data.dateto,
                        domain: _app.globalData.user.domain //"D195"
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
                        } else {
                            this.setData({
                                customerList: null,
                                customerChecked: [],
                                higherCost: 0,
                                customerOrderNum: 0
                            })
                            this.computingData(res.data)
                            wx.hideLoading()
                        }
                    }
                })
            }
        })
        
    },
    computingData(e) {
        var sumInCome = 0,
            dataList = [],
            x = 0;
        for (let i in e) {
            sumInCome += Number(e[i].fee) * 100
            //dataList为二维数组
            //2^13=8192
            //8192/16=2^13/2^4=2^9
            if (i == 0) {
                dataList.push([{
                    ...e[i]
                }])
            } else if (dataList[x][dataList[x].length - 1].order_id == e[i].order_id) {
                dataList[x].push({
                    ...e[i]
                })
            } else {
                dataList.push([{
                    ...e[i]
                }])
                x++;
            }
        }
        //10 4 6 5 4
        sumInCome /= 100
        this.setData({
            dataList,
            sumInCome,
            avgOrderCost: Number((sumInCome / dataList.length).toFixed(1))
        })
        this.insertSum();
    },
    getCustomerBelong() {
        var {
            dataList
        } = this.data, customerList = [], customerChecked = [];
        if (!dataList.length) return;
        for (let i in dataList) {
            if (dataList[i][0].customer_name) {
                if (customerList.length == 0) {
                    customerList.push(dataList[i][0].customer_name)
                } else {
                    if (customerList.indexOf(dataList[i][0].customer_name) != -1) {
                        continue
                    } else {
                        customerList.push(dataList[i][0].customer_name)
                    }
                }
            }
        }
        console.log(customerList)
        for (let i; i <= customerList.length; i++) {
            customerChecked.push(0)
        }
        customerChecked[0] = 1;

        this.setData({
            customerChecked,
            customerArr: ["全选", ...customerList],
            customerList: customerList.toString()
        })
    },
    insertSum() {
        var {
            dataList,
            dataList_cpy
        } = this.data;
        for (let i in dataList) {
            let sum_fee = 0
            if (dataList[i].length > 1) {
                for (let j in dataList[i]) {
                    sum_fee += dataList[i][j].fee * 100;
                }
                sum_fee /= 100
                dataList[i][0] = {
                    sum_fee,
                    ...dataList[i][0]
                }
                continue
            }
            dataList[i][0] = {
                sum_fee: dataList[i][0].fee,
                ...dataList[i][0]
            }
        }
        dataList_cpy = [...dataList]
        this.setData({
            dataList,
            dataList_cpy
        })
        this.getCustomerBelong()
        this.sortList()
        console.log(dataList);
    },
    sortList() {
        var {
            dataList,
            higherCost
        } = this.data, arr = []
        for (let i in dataList) {
            arr.push(dataList[i][0].sum_fee)
        }
        arr.sort(function (a, b) {
            return b - a
        });
        console.log(arr)
        higherCost = arr[0]
        this.setData({
            higherCost
        })
    },
    searchOrder: tss.debounce(function (e) {
        let value = e.detail.value
        if (value) {
            let dataList = this.data.dataList_cpy
                .filter(item => item[0].code.includes(value))
            this.setData({
                dataList
            })
        } else {
            this.setData({
                dataList: this.data.dataList_cpy
            })
        }
    }, 500),
    chooseCustomer(e) {
        var index = e.target.dataset.index,
            {
                customerChecked
            } = this.data
        console.log(customerChecked)
        if (index == 0) {
            for (let i = 1; i < customerChecked.length; i++) {
                customerChecked[i] = 0
            }
            customerChecked[0] = 1
        } else {
            customerChecked[0] = 1;
            customerChecked[index] = !customerChecked[index]
            for (let i = 1; i < customerChecked.length; i++) {
                if (customerChecked[i] == 1) {
                    customerChecked[0] = 0;
                    break;
                }
            }
        }
        this.setData({
            customerChecked
        })
        //this.filterDataList()
    },
    filterDataList() {
        var {
            customerChecked,
            customerArr,
            dataList_cpy
        } = this.data, filterList = []
        for (let i in customerChecked) {
            if (customerChecked[i]) {
                filterList.push(customerArr[i])
            }
        }
        if (customerChecked[0] != 1) {
            var dataList = this.data.dataList_cpy
                .filter(item => filterList.toString().includes(item[0].customer_name))
            this.setData({
                dataList
            })
            this.computingCustomerData(dataList)
            console.log(dataList)
        } else {
            this.setData({
                dataList: dataList_cpy
            })
            this.computingCustomerData(dataList_cpy)
        }
    },
    computingCustomerData(e) {
        let sumInCome = 0,
            arr = []
        console.log(e)
        for (let i in e) {
            sumInCome += e[i][0].sum_fee
            arr.push(e[i][0].sum_fee)
        }
        arr = arr.sort(function (a, b) {
            return b - a
        })
        this.setData({
            higherCost: arr[0],
            customerOrderNum: e.length,
            sumInCome,
            avgOrderCost: (sumInCome / e.length).toFixed(1)
        })
    },
    openFilter() {
        this.setData({
            pageContainerShow: true,
            mode: 1,
        })
    },
    confirmFilter() {
        this.filterDataList()
        this.setData({
            pageContainerShow: false
        })
    },
    backFilter() {
        if (this.data.mode == 0) return;
        console.log("还原筛选")
        this.setData({
            customerChecked: this.data.customerChecked_cpy
        })
        this.filterDataList()
    },
    backUpFilter() {
        if (this.data.mode == 0) return;
        console.log("备份筛选")
        this.setData({
            customerChecked_cpy: [...this.data.customerChecked]
        })
    },
    openDetail(e) {
        var {
            dataList
        } = this.data
        console.log(e.currentTarget.dataset.index)
        this.setData({
            curOrderDetail: dataList[e.currentTarget.dataset.index],
            pageContainerShow: true,
            mode: 0
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})
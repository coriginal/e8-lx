// pages-order/account/account_home/index.js
const tss = require('../../../utils/tss.js')
import {
    formatDate
} from '../../../utils/util'
const _App = getApp().globalData
Page({

    /**
     * 页面的初始数据
     */
    data: {
        modalName: null,
        wareHouseList: [],
        currentWareHouseIndex: 0,
        owner_ids: [],
        ownerList: [],
        locationList: [],
        skuList: []
    },
    wareHouseChange(e) {
        console.log(e)
        this.setData({
            currentWareHouseIndex: e.detai.value
        })
    },
    openWareHouseList() {
        this.setData({
            modalName: 'RadioModal'
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log(formatDate(new Date(), 'yyyy-MM-dd'))
        this.getTmsCustomer()
    },
    toDetail(e){
        console.log(e)
        let options=JSON.stringify(e.currentTarget.dataset)
        wx.navigateTo({
          url: '../detail/in?params='+options,
        })
    }, 
    getTmsCustomer() {
        tss.get({
            url: tss.url('sql') + '/tms_customer?joinOwnerId=true',
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.data,
                        showCancel: false
                    })
                    return
                }
                this.setData({
                    owner_ids: res.data.map(item => {
                        if (item.owner_id) {
                            return item.owner_id
                        }
                    }).filter(item => item != null)
                })
                this.getWareHouse()
            }
        })
    },
    async getSkuIos() {
        let get = (id) => {
            return new Promise((resolve, reject) => {
                tss.get({
                    url: tss.url('') + `/api/data/sku_ios?owner_id=${id}&wh_id=${this.data.wareHouseList[this.data.currentWareHouseIndex].id}&fromDate=2020-02-01&endDate=${formatDate(new Date(),'yyyy-MM-dd')}&dimension=,inv.owner_id,location_id&location_id=${this.data.locationList.map(item=>item.id)}`,
                    completion: res => {
                        if (res.failed) {
                            wx.showModal({
                                title: '提示',
                                content: res.data,
                                showCancel: false
                            })
                            return reject(false)
                        }
                        if (res.data.rows.length) {
                            resolve(res.data.rows)
                        } else {
                            resolve([])
                        }
                    }
                })
            })
        }
        let plist = []
        this.data.ownerList.map(item => {
            plist.push(get(item.id))
        })
        let result = await Promise.all(plist)
        let {
            ownerList
        } = this.data
        result.map((item, index) => {
            console.log(item)
            if (item.length) {
                result[index] = result[index].map(item => {
                    item.endqty =item.endqty && item.endqty.toFixed(2) + ''
                    item.inqty = item.inqty && item.inqty.toFixed(2) + ''
                    item.outqty =item.outqty && item.outqty.toFixed(2) + ''
                    return item
                })
            }
            ownerList[index]['sku_ios'] = item
        })
        ownerList.map((item, index) => {
            if (item.sku_ios.length && item.sku_ios[0].location_id) {
                ownerList[index]['c_account'] = this.data.locationList.filter(i => i.id == item.sku_ios[0].location_id)[0].name
            }
        })
        this.setData({
            ownerList
        })
        console.log(result)
    },
    getLocation() {
        tss.get({
            url: tss.url('xdata') + `/json/wms_location?all_status=true&warehouse_id=${this.data.wareHouseList[this.data.currentWareHouseIndex].id}&rows=5000`,
            completion: res => {
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.data,
                        showCancel: false
                    })
                    return
                }
                this.setData({
                    locationList: res.data.rows
                })
                this.getSkuList()
            }
        })
    },
    getOwner() {
        tss.get({
            url: tss.url('xdata') + '/json/wms_owner?status=1&sortField=code',
            completion: async res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.data,
                        showCancel: false
                    })
                    return
                }
                let list = this.data.owner_ids.map(item => {
                    return res.data.filter(i => i.id == item)[0]
                })
                this.setData({
                    ownerList: list
                })
                this.getLocation()
                // let ids=Array.from(new Set(this.data.ownerList.map(item=>item.warehouse_id)))
                // let plist=[]
                // ids.map(id=>{
                //     plist.push(this.getLocation(id))
                // })
                // let result=await Promise.all(plist)
                // console.log(result)
                // this.setData({
                //     locationList:result.map(item=>item)
                // })

                // let {ownerList}=this.data
                // ownerList=this.data.ownerList.map(item=>{
                //     let location=result.filter(i=>item.warehouse_id==i.warehouse_id)[0]
                //     item.location=location.data
                //     return item
                // })
                // this.setData({ownerList})
            }
        })
    },
    getSkuList() {
        tss.get({
            url: tss.url('') + `/api/bi/sql/skuList?wh_id=${this.data.wareHouseList[this.data.currentWareHouseIndex].id}&pagesize=50000&category=货币`,
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.data,
                        showCancel: false
                    })
                    return
                }
                this.setData({
                    skuList: res.data
                })
                this.getSkuIos()
            }
        })
    },
    getWareHouse() {
        tss.get({
            url: tss.url('xdata') + '/json/wms_warehouse?status=1',
            completion: res => {
                console.log(res)
                if (res.failed) {
                    wx.showModal({
                        title: '提示',
                        content: res.data,
                        showCancel: false
                    })
                    return
                }
                this.setData({
                    wareHouseList: res.data
                })
                this.getOwner()
            }
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    hideModal() {
        this.setData({
            modalName: null
        })
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
const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')
const tms = require('../../../../pages/tms.js')
const lc = require('../../../../utils/listenerCenter.js')
import Pages from '../../../../pages.js'

Page({
    data: {
        task_id: '',
        task_type:'',
        orderList: [],
        allOrder:[],
        flexObj: require('./source.js').flexObj,
        typeObj: require('./source.js').typeObj,
        flexTagObj: require('./source.js').flexTagObj,
        select_ids:[],
        show_done:false,
        if_list:true,
        markers:[],
        lng:'',
        lat:'',
        showCheck:false,
        if_op: false,
      just_see:false,
      show_sign:false,
      batch:{},
      receipt_tempid:'',
      suborderid_orderid_map:{},
      showLc: app.user.domain == 'D1028'
    },
    onLoad(options) {
      console.log(options)
      // options.task_id = 107
      // options.task_type = '提货'
      if (!options.task_id || !options.task_type) {
        alert.notice('未传递正确的参数（运输单ID或类型为空）')
      }
      else {
        this.setData({
          task_id: options.task_id,
          task_type: options.task_type
        })
        this.queryOrder()
      }
      if(options.task_status == '已到达'){
        this.setData({
          show_done: true,
          just_see:true
        })
      }
      if(app.user.roles.indexOf('运营')>=0){
        this.setData({
          if_op: true
        })
      }
    },
    // onReady(){
    //   lc.addListener('op', this.__wxWebviewId__.toString(), res => {
    //     this.queryOrder()
    //   })
    // },
    onShow(){
      console.log('onshow')
      this.queryOrder()
    },
    queryOrder(){
      tms.writeLocation(this.data.task_id)
      tss.query({
        url:tss.url('') + `/tms/task/${this.data.task_id}/subOrder2`,
        // url: tss.url('sql') + 'tms_sub_code',
        // params: { task_id: this.data.task_id },
        completion: res => {
          wx.hideLoading()
          if (res.failed) {
            alert.notice('获取包含订单失败。' + (res.errorMsg || ''))
            return
          }
          else {
            let all_key = [];
            let tt = ['提货','派送'].indexOf(this.data.task_type) > -1 ? this.data.task_type : 'other';
            if(app.DomainConfig['task_'+tt] && app.DomainConfig['task_'+tt].content){
              let c = JSON.parse(app.DomainConfig['task_'+tt].content);
              if(c.groupby){
                all_key = all_key.concat(c.groupby.split(','))
              }
              if(c.orderby){
                all_key = all_key.concat(c.orderby.split(','))
              }
            }  
            let compare_list = [],res_map = {};
            for (let i = 0; i < res.data.length; i++) {
              let item = res.data[i];
              let orderby_column = '';
              for(let j=0;j<all_key.length;j++){
                orderby_column += (item[all_key[j]] || '') + ';'
              }
              
              item['orderby_column'] = orderby_column;
              if(compare_list.indexOf(orderby_column) == -1){
                compare_list.push(orderby_column)
                res_map[orderby_column] = [item];
              }else{
                res_map[orderby_column].push(item);
              }
              item['send_addr'] = tms.joinAddr(item, 'send')
              item['receive_addr'] = tms.joinAddr(item, 'receive')
            }
            compare_list.sort()
            let r = [];
            for(var i = 0;i < compare_list.length;i++){
              r = r.concat(res_map[compare_list[i]]);
            }
            let suborderid_orderid_map = {};
            for(var i = 0;i<r.length;i++){
              suborderid_orderid_map[r[i].id] = r[i].order_id;
            }
            this.data.allOrder = r;
            this.data.suborderid_orderid_map = suborderid_orderid_map;
            this.getShowOrder()
          }
        }
      })
    },
    compare(property) {
      let _this = this;
      return function (a, b) {
        var value1 = a[property[i]];
        var value2 = b[property[i]];
        return value1 - value2;
      }
    },
    getCompareField(property){
      let _this = this;
      return function(a,b){
        let res = 0;
        for(let i=property.length - 1; i >= 0; i--){
          var value1 = a[property[i]] + '';
          var value2 = b[property[i]] + '';
          var v1 = _this.getHashCode(value1);
          var v2 = _this.getHashCode(value2);
          var c = 0;
          if(v1 > v2){
            c = 1
          }else if(v1 < v2){
            c = -1;
          }
          let c1 = 1;
          for(let j = 0;j < i + 1;j++){
            c1 = c1 * 10;
          }
          res += c * c1;
        }
        return res;
      }
    },
    getHashCode(str){
      var h = 0, len = str.length, t = 2147483648;
      for (var i = 0; i < len; i++) {
          h = 31 * h + str.charCodeAt(i);
          if(h > 2147483647) h %= t;
      }
      return h;
    },
    getShowOrder(){
      let show_order = [],markers = [];
      const status_code = this.data.typeObj[this.data.task_type].status_code
      let c = 0;
      for (let i = 0; i < this.data.allOrder.length; i++) {
        let item = this.data.allOrder[i];
        if (this.data.show_done || item.status_code < status_code) {
          let cont = '';
          if(item.send_site){
            cont += '\n' + '起始地:'+item.send_site;
          }
          if(item.receive_site){
            cont += '\n' + '目的地:' + item.receive_site;
          }
          show_order.push(item)
          if ((this.data.task_type != '派送' || item.tag == '直送') && item.send_lng_lat) {   
            markers.push({
              iconPath: "../../../../images/send.png",
              callout: { content: item.code+cont, bgColor: '#6dab79', textAlign: 'center', display: 'ALWAYS' },
              id: item.id,
              latitude: item.send_lng_lat.split(',')[1],
              longitude: item.send_lng_lat.split(',')[0],
              width: 30,
              height: 30
            })
          }
          if ((this.data.task_type != '提货' || item.tag == '直送') && item.receive_lng_lat) {
            markers.push({
              iconPath: "../../../../images/receive.png",
              callout: { content: item.code+cont, bgColor: '#6dab79', textAlign: 'center', display: 'ALWAYS' },
              id: item.id,
              latitude: item.receive_lng_lat.split(',')[1],
              longitude: item.receive_lng_lat.split(',')[0],
              width: 30,
              height: 30
            })
          }
        }
        if (item.status_code < status_code){
          c++
        }
      }
      if (this.data.task_type != '提货' && c == 0 && !this.data.just_see){
        this.dispDone()
      }
      const _this = this;
      tms.getLoc(function(loc){
        _this.setData({
          lng: markers.length ? markers[0].longitude : (loc.lng || 120),
          lat: markers.length ? markers[0].latitude : (loc.lat || 30)
        })
      })
      this.setData({
        orderList: show_order.map(i=>this.dealData(i)),
        markers:markers
      })
      let isDone = this.data.allOrder.filter(i => i.status_code >= status_code).length
      // wx.setNavigationBarTitle({
      //   title: `未完成：${this.data.allOrder.length - isDone} 完成：${isDone}`,
      // })
      wx.setNavigationBarTitle({
        title: `完成情况：${isDone} / ${this.data.allOrder.length}`
        // title: `未完成：${this.data.allData.length - isDone} 完成：${isDone}`,
      })
    },
  dealData(data) {
    var typeObj = this.data.typeObj, task_type = this.data.task_type
    return {
      ...data,
      title: `${(data.send_site || data.send_city || data.send_district) + ' — ' + (data.receive_site || data.receive_city || data.receive_district)}`,
      cargoInfo: `${data.num ? data.num + '票' : ''} ${data.amount || 0}件 / ${data.weight || 0}千克 / ${data.volume || 0}方`
    }
  },
    changeShow(e) {
      this.setData({
        show_done:!this.data.show_done
      })
      this.getShowOrder()
    },
    changeModal(e){
      this.setData({
        if_list: !this.data.if_list
      })
    },

    dispDone(e){
      alert.notice('全部订单已派送完成，是否结束此次运输？', {
        text: '结束', handler: () => {
          tms.saveWithAddr({
            url: tss.url('') + '/tms/task/driver_complete',
            params: {id: this.data.task_id },
            completion: res => {
              if (res.failed) {
                alert.notice('结束运输单失败。' + (res.errorMsg || ''))
              }
              else {
                lc.emitEvent('alltask', {})
                wx.navigateBack({})
              }
            }
          })
        }
      },
        { text: '取消', handler: () => { } })

    },

    switchChange: function (e) {
      let select_ids = this.data.select_ids;
      const id = e.target.dataset.id;
      let is_in = true;
      for (var i = 0; i < select_ids.length; i++) {
        if (select_ids[i] == id) {
          select_ids.splice(i, 1)
          is_in = false;
          break;
        }
      }
      if (is_in) {
        select_ids.push(id)
      }
      var orderList = this.data.orderList;
      for (var i = 0; i < orderList.length; i++) {
        var item = orderList[i];
        if (select_ids.indexOf(item.id) > -1) {
          item['selected'] = 'selected'
        }
        else {
          item['selected'] = ''
        }
      }
      this.data.allOrder = this.data.allOrder.map(i => ({ ...i, selected: select_ids.indexOf(i.id) > -1 ? 'selected' : '' }))
      this.setData({
        orderList: orderList
      })
    },
    goDetail(e) {
        const order_id = e.currentTarget.dataset.order_id || e.markerId;
        wx.navigateTo({
          url: `../capacity_order/index?order_id=${order_id}&task_id=${this.data.task_id}&task_type=${this.data.task_type}`
        })
    },
    scanOrder(){
      wx.scanCode({
        success: res => {
          if (!res.result) { return }
          if (res.result.indexOf("/") >= 0) { return }
          if(res.result){
            let allOrder = this.data.allOrder
            let order = allOrder.find(e => (e.code == res.result||e.code == res.result+'01'))
            if(order && order!=undefined ){
              wx.navigateTo({
                url: `../capacity_order/index?order_id=${order.id}&task_id=${this.data.task_id}&task_type=${this.data.task_type}`
              })
            }else{
              wx.showToast({ title: '此任务单无此单号', icon: 'none',duration: 2500 });
            }
          }
        }
      })
    },
    batchTodo(e){
      console.log(e)
      const check = e.currentTarget.dataset.check
      this.setData({
        showCheck: !check
      })
    },
    batchDone: function(){
      this.setData({
        show_sign:false,
        showCheck: false
      })
    },
    batchPrint(e){
      const ids = this.batchOpId();
      if(ids){
        tms.print(ids)  
      }
    },
    batchPick(e){
      const ids = this.batchOpId();
      if(ids){
        alert.notice('确认将选中的' + this.data.select_ids.length + '单批量取件？', { text: '确认', handler: () => { 
          tms.saveWithAddr({
            url: tss.url('tms') + '/task/batch_pick_order',
            params: { task_id: this.data.task_id, sub_order_ids: ids },
            completion: res => {
              this.setData({
                select_ids:[]
              })
              if (res.failed || res.data) {
                alert.notice('批量取件失败。' + (res.errorMsg || res.data.errorMsg || ''))
              }
              else {
                this.queryOrder()
                wx.showToast({
                  title: '批量取件成功'
                })
                this.batchDone()
              }
            }
          })
         } },
          { text: '取消', handler: () => { }})
        
      }
    },
    batchSign(e){
      const ids = this.batchOpId();
      if (ids) {
        let batch_need_rcode = false;
        for(let i = 0;i<this.data.allOrder.length;i++){
          let item = this.data.allOrder[i];
          if(item.rcode_type && ids.includes(item.id)){
            batch_need_rcode = true;
          }
        }
        
        this.setData({
          ['batch.rcode_type']:batch_need_rcode,
          ['batch.itemNum']:this.data.select_ids.length,
          show_sign:true
        })

      }
    },
    confirmSign(e){
      const ids = this.data.select_ids;
      if(ids){
        let orderids = [];
        for(let i = 0;i<ids.length;i++){
          orderids.push(this.data.suborderid_orderid_map[ids[i]])
        }
        let tempids = (this.data.receipt_tempid + '').split(',');
        let saveParams = [];
        for(let i=0;i<tempids.length;i++){
          saveParams.push({ tempid: tempids[i], 
            order_id:orderids[i],
            type: '电子回单',
            amount:1 })
        }
        tms.saveWithAddr({
          url: tss.url('tms') + '/order/receipts/submit',
          params: {list:JSON.stringify(saveParams)},
          completion: res => {
            if(res.failed){
              alert.notice('操作失败。' + (res.errorMsg || ''))
            }else{
              tms.saveWithAddr({
                url: tss.url('tms') + '/task/driver_batch_sign',
                params: { task_id: this.data.task_id, target_ids: this.batchOpId() },
                completion: res => {
                  if (res.failed || res.data) {
                    alert.notice('批量签收失败。' + (res.errorMsg || res.data.errorMsg || ''))
                  }
                  else {
                    this.queryOrder()
                    wx.showToast({
                      title: '批量签收成功'
                    })
                    this.batchDone()
                  }
                }
              })
            }
          }
        })
      }else{
        alert.notice('未选择数据')
      }
    },
    addreceipt(e) {
      this.setData({
        receipt_tempid:e.detail._tempID
      })
    },
    addsign(e) {
      tms.saveWithAddr({
        url: tss.url('tms') + '/task/suborder_signpic',
        params: { tempid: e.detail._tempID, sub_order_id: this.batchOpId() },
        completion: res => {
          if(res.failed){
            alert.notice('操作失败。' + (res.errorMsg || ''))
          }
        }
      })
    },
    batchOpId(e){
      const select_ids = this.data.select_ids;
      if (select_ids.length) {
        return select_ids.join(',')
      }
      else {
        alert.notice('未选择数据')
      }
    },
    addOrder(e){
      console.log('TODO 携带taskid=' + this.data.task_id + '到订单录入界面')
    },
    pickTruckArrive(e){
      alert.notice('确认已取到货物到仓库？', {
        text: '确认', handler: () => {
          tms.saveWithAddr({
            url: tss.url('tms') + '/task/truck_complete',
            params: { task_id: this.data.task_id },
            completion: res => {
              if (res.failed || res.data) {
                alert.notice('操作失败。' + (res.data.errorMsg || ''))
              }
              else {
                wx.showToast({
                  title: '操作成功'
                })
                lc.emitEvent('alltask', {})
                wx.navigateBack({})
              }
            }
          })
        }
      },
        { text: '取消', handler: () => { } })
      
    },
  batchRemove(e){
    const _this = this;
    tss.query({
      url:tss.url('sql') + 'task',
      params: { task_id: _this.data.taskid},
      completion:res=>{  
        if (res.failed) {
          wx.hideLoading()
          alert.notice('获取运输单详情失败。' + (res.errorMsg || ''))
          return
        }
        else{
          let params = res.data[0];
          tss.query({
            url:tss.url('') + `/tms/task/${_this.data.task_id}/subOrder2`,
            // url: tss.url('sql') + 'tms_sub_code',
            // params: { task_id: _this.data.task_id },
            completion: res => {
              console.log(res,_this.data)
              wx.hideLoading()
              if (res.failed) {
                alert.notice('获取运输单详情失败。' + (res.errorMsg || ''))
                return
              }
              else {
                let sub_orders = [];
                for(let i = 0;i<res.data.length;i++){
                  const the_id = res.data[i].id;
                  if (_this.data.select_ids.indexOf(the_id) == -1){
                    sub_orders.push({id:the_id + ""});
                  }                
                }
                params.sub_orders = JSON.stringify(sub_orders);
                tss.post({
                  url: tss.url('') + '/tms/task',
                  params,
                  completion: res => {
                    console.log(res)
                    if (res.failed) {
                      wx.showModal({ content: res.errorMsg })
                      return
                    }
                    wx.showToast({ title: '移除成功', icon: 'none', duration: 3000 })
                    lc.emitEvent('alltask', { msg: 'success' })
                    setTimeout(() => { this.queryOrder();this.batchDone() }, 1000)
                    // setTimeout(() => { wx.navigateBack() }, 1000)
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  onPullDownRefresh: function () {
    this.queryOrder();
    wx.stopPullDownRefresh();
  }

})
const ComputMargin = length => 64 / 3 * length
const _App = getApp().globalData
const tss = require('../../../utils/tss.js');
const QQMapWX = require('../../../utils/txmap.js');
const Map_Key = 'MNGBZ-6Y6YW-2XKRT-YIBL5-JBXD5-4HFOY';
import {
  $wuxToptips
} from '../../../components/index'
var qqmapsdk = new QQMapWX({
  key: Map_Key
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
        title: '订单详情',
        code: 'detail'
      },
      // { title: '轨迹信息', code: 'route' },
      // { title: '费用详情', code: 'feeinfo' }
    ],
    current: 0,
    chooseType: 'detail',
    order: {},
    send: "",
    receive: ""
  },

  chooseOrderType(e) {
    console.log(e)
    this.setData({
      chooseType: e.currentTarget.id,
      current: e.currentTarget.dataset.index
    })
  },
  swiperChange(e) {
    this.setData({
      chooseType: this.data.tabs[e.detail.current].code
    })
  },

  onLoad: function (options) {
    let {
      id = '', code = '', orderIdx = '', status_code = ''
    } = options
    console.log(id, code, orderIdx, options)
    this.setData(options)
    // this.setData({ id, code, orderIdx })
    // if (!_App.user.isCustomer) {
    this.data.tabs.push({
      title: '费用详情',
      code: 'feeinfo'
    })
    // if (!_App.user.isCustomer) {
    //   this.data.tabs.push({ title: '车辆位置', code: 'order_car_location' })
    // }
    this.setData({
      tabs: this.data.tabs
    })
    this.queryOrderDeail(id)
    // }
  },
  onReady() {
    wx.setNavigationBarTitle({
      title: `No.${this.data.code}`,
    })
  },

  getOrders(e) {
    const order = e.detail
    let task = {
      '提1': [],
      '转1': [],
      '转2': [],
      '转3': [],
      '派1': []
    };
    const reg = /^提1$|^转1$|^转2$|^转3$|^派1$/
    console.log(123)
    for (let key in order) {
      reg.test(key) && (task[key] = order[key])
    }
    this.setData({
      task
    })
  },
  goMap(e) {
    let type = e.currentTarget.dataset.type
    this.getLatLng(this.data[type]).then(res => {
      console.log(res)
      wx.openLocation({
        latitude: res.lat,
        longitude: res.lng,
        name: this.data[type],
        scale: 15
      })
    })
  },
  queryOrderDeail(tms_order_id) {
    return new Promise((resolve, reject) => {
      tss.query({
        url: tss.url('sql') + 'tms_order',
        params: {
          tms_order_id,
          task_info: true
        },
        completion: res => {
          console.log(res)
          if (res.failed) {
            wx.hideLoading()
            wx.showModal({
              content: res.errorMsg,
              showCancel: false
            })
            return
          }
          let order = res.data[0]
          let {
            send_addr,
            receive_addr,
            status_code,
          } = order
          this.setData({
            order,
            send: send_addr,
            receive: receive_addr,
            status_code
          })
        }
      })
    })
  },
  getLatLng(adr) {
    wx.showLoading()
    return new Promise((resolve, reject) => {
      qqmapsdk.geocoder({
        address: adr,
        complete: res => {
          if (res.status != "0") {
            wx.showModal({
              title: '提示',
              content: res.message,
              showCancel: false
            })
            reject(res.message)
          }
          wx.hideLoading()
          resolve(res.result.location)
        }
      })
    })
  },

  /* ===================== 保存为图片 ===================== */
  saveAsImage() {
    const order = this.data.order
    if (!order || !order.code) {
      wx.showToast({
        title: '订单信息加载中，请稍后再试',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '正在生成图片',
      mask: true
    })
    const brand = this.getBrand()
    Promise.all([
      this.getQrcodePath(order.code).catch(() => ''),
      this.getWatermarkInfo().catch(() => null)
    ]).then(([qrPath, wmInfo]) => {
      wmInfo.path = `/${wmInfo.path}`
      this.renderOrderImage(order, qrPath, wmInfo, brand)
    })
  },

  // 页面同款水印图片 /images/watermark.jpg
  getWatermarkInfo() {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: '/images/watermark.jpg',
        success: resolve,
        fail: reject
      })
    })
  },

  getBrand() {
    const cfg = _App.DomainConfig || {}
    const info = _App.companyInfo || {}
    const pick = (...keys) => {
      for (const k of keys) {
        const v = cfg[k]
        if (v && v.content) return v.content
      }
      return ''
    }
    return {
      name: pick('company_name', 'brand_name', 'name') || info.name || '立迅物流',
      tel: pick('company_tel', 'contact_tel', 'tel') || info.tel || ''
    }
  },

  getQrcodePath(code) {
    return new Promise((resolve, reject) => {
      let src = ''
      try {
        src = `${_App.app_host}/tss/wx/api/acode2?appId=${_App.app_id}&page=Cpts/order_query_route/order_query_route&onlyQparam=true&qparam=1,2,3,os,${code}`
      } catch (e) {
        reject(e)
        return
      }
      wx.getImageInfo({
        src,
        success: res => resolve(res.path),
        fail: reject
      })
    })
  },

  weightUnit() {
    const config = _App.DomainConfig || {}
    return config.weight_unit && config.weight_unit.content ? config.weight_unit.content : 'kg'
  },

  // 承运单号是否显示：非客户账号直接显示；客户账号按 customerInfo.show_lc 判断（1 显示，0/2/null 均不显示）
  tcodeVisible() {
    if (!(_App.user && _App.user.isCustomer)) return true
    return !!(_App.customerInfo && _App.customerInfo.show_lc == 1)
  },

  renderOrderImage(order, qrcodePath, wmInfo, brand) {
    wx.createSelectorQuery().select('#saveCanvas').fields({
      node: true
    }).exec(res => {
      if (!res || !res[0] || !res[0].node) {
        wx.hideLoading()
        wx.showToast({
          title: '生成图片失败',
          icon: 'none'
        })
        return
      }
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio || 2
      const W = 580
      canvas.width = W * dpr
      canvas.height = dpr
      const layout = this.buildOrderLayout(ctx, order, brand, !!qrcodePath)
      canvas.width = W * dpr
      canvas.height = layout.height * dpr
      ctx.scale(dpr, dpr)

      const loadImg = src => new Promise(resolve => {
        const img = canvas.createImage()
        img.onload = () => resolve(img)
        img.onerror = () => resolve(null)
        img.src = src
      })

      Promise.all([
        qrcodePath ? loadImg(qrcodePath) : Promise.resolve(null),
        wmInfo && wmInfo.path ? loadImg(wmInfo.path) : Promise.resolve(null)
      ]).then(([qrImg, wmImg]) => {
        this.paintOrderImage(ctx, layout, order, qrImg, wmImg, wmInfo, brand)
        wx.canvasToTempFilePath({
          canvas,
          success: r => {
            wx.hideLoading()
            this.saveImageToAlbum(r.tempFilePath)
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({
              title: '生成图片失败',
              icon: 'none'
            })
          }
        })
      })
    })
  },

  wrapText(ctx, text, font, maxW) {
    ctx.font = font
    text = String(text == null ? '' : text)
    if (!text) return ['']
    const lines = []
    let line = ''
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      const test = line + ch
      if (line && ctx.measureText(test).width > maxW) {
        lines.push(line)
        line = ch
      } else {
        line = test
      }
    }
    lines.push(line)
    return lines
  },

  ellipsize(ctx, text, font, maxW) {
    ctx.font = font
    text = String(text == null ? '' : text)
    if (ctx.measureText(text).width <= maxW) return text
    let s = text
    while (s.length > 0 && ctx.measureText(s + '…').width > maxW) s = s.slice(0, -1)
    return s + '…'
  },

  buildOrderLayout(ctx, order, brand, hasQrcode) {
    const W = 580
    const pad = 24
    const rows = []
    let y = 0
    const addRow = row => {
      row.y0 = y
      rows.push(row)
      y += row.height
    }

    // 1) 头部：目的地大字体 + 居中品牌 + 右上二维码
    addRow({
      type: 'header',
      height: 116,
      qrcodeSize: 88
    })

    // 2) 订单号
    addRow({
      type: 'code',
      height: 46,
      code: order.code || ''
    })
    addRow({
      type: 'rcode',
      height: 46,
      code: order.rcode || ''
    })
    // 承运单号（按 show_lc 配置显示）
    if (this.tcodeVisible() && order.tcode) {
      addRow({
        type: 'tcode',
        height: 46,
        code: order.tcode
      })
    }
    // 3) 路线：出发地 - 目的地（红字）
    if (order.send_city || order.receive_city) {
      addRow({
        type: 'route',
        height: 40,
        send: order.send_city || '',
        receive: order.receive_city || ''
      })
    }

    // 4) 寄件人
    const sendAddr = [order.send_province, order.send_city, order.send_district, order.send_town, order.send_street_no].filter(Boolean).join('')
    const sendAddrMaxW = W - pad - 36 - 14 - pad
    const sendAddrLines = this.wrapText(ctx, sendAddr, '14px sans-serif', sendAddrMaxW)
    const sendHeight = 12 + 28 + 8 + Math.max(sendAddrLines.length, 1) * 20 + 20
    addRow({
      type: 'person',
      height: sendHeight,
      badge: '寄',
      badgeColor: '#333333',
      name: order.send_man || '',
      phone: order.send_phone || '',
      addr: sendAddr,
      addrLines: sendAddrLines,
      addrMaxW: sendAddrMaxW
    })

    // 5) 收件人
    const recvAddr = [order.receive_province, order.receive_city, order.receive_district, order.receive_town, order.receive_street_no].filter(Boolean).join('')
    const recvAddrLines = this.wrapText(ctx, recvAddr, '14px sans-serif', sendAddrMaxW)
    const recvHeight = 12 + 28 + 8 + Math.max(recvAddrLines.length, 1) * 20 + 20
    addRow({
      type: 'person',
      height: recvHeight,
      badge: '收',
      badgeColor: '#e54d42',
      name: order.receive_man || '',
      phone: order.receive_phone || '',
      addr: recvAddr,
      addrLines: recvAddrLines,
      addrMaxW: sendAddrMaxW
    })

    // 6) 增值服务
    const services = []
    if (order.if_visit) services.push('上门取件')
    if (order.entry_type) services.push(order.entry_type)
    if (order.insurance_type) services.push(order.insurance_type)
    if (services.length) addRow({
      type: 'kv',
      height: 40,
      label: '增值服务',
      value: services.join(' ')
    })

    // 7) 预约取件时间
    if (order.if_visit && order.scheduled_pick_time) {
      addRow({
        type: 'kv',
        height: 40,
        label: '预约取件时间',
        value: order.scheduled_pick_time
      })
    }

    // 8) 业务类型（仅当非零担）
    if (order.trans_mode && order.trans_mode != '零担') {
      addRow({
        type: 'kv',
        height: 40,
        label: '业务类型',
        value: order.trans_mode
      })
    }
    // 9) 整车扩展
    if (order.trans_mode == '整车') {
      addRow({
        type: 'kv',
        height: 40,
        label: '车型',
        value: order.truck_type || ''
      })
      addRow({
        type: 'kv',
        height: 40,
        label: '托盘数量',
        value: order.pallet_num || ''
      })
      addRow({
        type: 'kv',
        height: 40,
        label: '装车时间',
        value: order.expect_arrive || ''
      })
      addRow({
        type: 'kv',
        height: 40,
        label: '卸车时间',
        value: order.expect_depart || ''
      })
    }

    // 10) 客户单号
    if (order.ccode) addRow({
      type: 'kv',
      height: 40,
      label: '客户单号',
      value: order.ccode
    })

    // 11) 双列字段
    const twoColRows = [
      ['件数', (order.amount || order.amount === 0) ? `${order.amount} 件` : '', '包装', order.pack || ''],
      ['录单体积', order.volume ? `${order.volume} m³` : '', '录单重量', order.weight ? `${order.weight} ${this.weightUnit()}` : ''],
      ['计费重量', (order.charged_weight || order.charged_weight === 0) ? `${order.charged_weight} ${this.weightUnit()}` : '', '货物名称', order.cargo || ''],
      ['结算方式', order.settle_type || '', '派送方式', order.service_mode || '']
    ].filter(r => r[1] || r[3])
    twoColRows.forEach(([l1, v1, l2, v2]) => addRow({
      type: 'twocol',
      height: 40,
      l1,
      v1,
      l2,
      v2
    }))

    // 12) 保价额（单列整行）
    if (order.insurance_limit) addRow({
      type: 'kv',
      height: 40,
      label: '保价额',
      value: order.insurance_limit
    })

    // 12) 单列费用
    if (order.cod) addRow({
      type: 'kv',
      height: 40,
      label: '代收货款',
      value: `¥ ${order.cod}`,
      color: '#e54d42'
    })
    if (order.arrive_pay) addRow({
      type: 'kv',
      height: 40,
      label: '到付款',
      value: `¥ ${order.arrive_pay}`,
      color: '#e54d42'
    })
    if (order.income_fee) addRow({
      type: 'kv',
      height: 40,
      label: '费用合计(CNY)',
      value: `¥ ${order.income_fee}`,
      color: '#e54d42'
    })

    // 13) 备注/业务员/录单时间
    if (order.remark) addRow({
      type: 'kv',
      height: 40,
      label: '备注',
      value: order.remark
    })
    if (order.clerk_name) addRow({
      type: 'kv',
      height: 40,
      label: '业务员',
      value: order.clerk_name
    })
    if (order.order_date) addRow({
      type: 'kv',
      height: 40,
      label: '录单时间',
      value: order.order_date
    })

    y += pad
    return {
      width: W,
      height: Math.ceil(y),
      pad,
      rows
    }
  },

  paintOrderImage(ctx, layout, order, qrcodeImg, wmImg, wmInfo, brand) {
    const W = layout.width
    const pad = layout.pad
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, layout.height)
    ctx.textBaseline = 'top'

    const halfW = (W - pad * 2) / 2
    const valueRight1 = pad + halfW - 14 // right boundary of left col value
    const valueRight2 = W - pad // right boundary of right col value
    const labelLeft1 = pad
    const labelLeft2 = pad + halfW

    layout.rows.forEach(row => {
      switch (row.type) {
        case 'header': {
          // 左侧：目的地 + 城市
          ctx.font = '13px sans-serif'
          ctx.fillStyle = '#999999'
          ctx.textAlign = 'left'
          ctx.fillText('目的地：', pad, row.y0 + 10)
          const city = this.ellipsize(ctx, order.receive_city || '', 'bold 30px sans-serif', 220)
          ctx.font = 'bold 30px sans-serif'
          ctx.fillStyle = '#1a1a1a'
          ctx.fillText(city, pad, row.y0 + 32)

          // 右上：二维码
          if (qrcodeImg) {
            const s = row.qrcodeSize
            ctx.drawImage(qrcodeImg, W - pad - s, row.y0 + (row.height - s) / 2, s, s)
          }
          // 顶部分隔线
          this.hLine(ctx, pad, row.y0 + row.height, W - pad, '#e5e5e5')
          break
        }
        case 'code': {
          ctx.font = '14px sans-serif'
          ctx.fillStyle = '#666666'
          ctx.textAlign = 'left'
          ctx.fillText('订单号：', pad, row.y0 + 14)
          ctx.font = '15px sans-serif'
          ctx.fillStyle = '#333333'
          ctx.textAlign = 'right'
          ctx.fillText(row.code, W - pad, row.y0 + 14)
          ctx.textAlign = 'left'
          this.hLine(ctx, pad, row.y0 + row.height, W - pad, '#e5e5e5')
          break
        }
        case 'rcode': {
          ctx.font = '14px sans-serif'
          ctx.fillStyle = '#666666'
          ctx.textAlign = 'left'
          ctx.fillText('回单号：', pad, row.y0 + 14)
          ctx.font = '15px sans-serif'
          ctx.fillStyle = '#333333'
          ctx.textAlign = 'right'
          ctx.fillText(row.code, W - pad, row.y0 + 14)
          ctx.textAlign = 'left'
          this.hLine(ctx, pad, row.y0 + row.height, W - pad, '#e5e5e5')
          break
        }
        case 'tcode': {
          ctx.font = '14px sans-serif'
          ctx.fillStyle = '#666666'
          ctx.textAlign = 'left'
          ctx.fillText('承运单号：', pad, row.y0 + 14)
          ctx.font = '15px sans-serif'
          ctx.fillStyle = '#333333'
          ctx.textAlign = 'right'
          ctx.fillText(row.code, W - pad, row.y0 + 14)
          ctx.textAlign = 'left'
          this.hLine(ctx, pad, row.y0 + row.height, W - pad, '#e5e5e5')
          break
        }
        case 'route': {
          ctx.font = 'bold 18px sans-serif'
          ctx.fillStyle = '#e54d42'
          ctx.textAlign = 'left'
          ctx.fillText(`${row.send} - ${row.receive}`, pad, row.y0 + 10)
          ctx.textAlign = 'left'
          this.hLine(ctx, pad, row.y0 + row.height, W - pad, '#e5e5e5')
          break
        }
        case 'person': {
          const b = 36
          // 圆形徽标
          ctx.fillStyle = row.badgeColor
          ctx.beginPath()
          ctx.arc(pad + b / 2, row.y0 + 12 + b / 2, b / 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 18px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(row.badge, pad + b / 2, row.y0 + 12 + b / 2 + 1)
          ctx.textBaseline = 'top'
          ctx.textAlign = 'left'

          // 姓名 + 电话
          const nameX = pad + b + 14
          const nameY = row.y0 + 14
          ctx.font = 'bold 18px sans-serif'
          ctx.fillStyle = '#1a1a1a'
          const nameText = row.name || ''
          const phoneText = row.phone || ''
          ctx.fillText(nameText, nameX, nameY)
          const nameW = ctx.measureText(nameText).width
          if (phoneText) {
            const phoneX = nameX + nameW + (nameText ? 16 : 0)
            ctx.fillText(phoneText, phoneX, nameY)
          }

          // 地址（多行）
          ctx.font = '14px sans-serif'
          ctx.fillStyle = '#666666'
          const addrY = row.y0 + 14 + 28
          row.addrLines.forEach((l, i) => ctx.fillText(l || ' ', nameX, addrY + i * 20))

          this.hLine(ctx, pad, row.y0 + row.height, W - pad, '#e5e5e5')
          break
        }
        case 'twocol': {
          // 左列
          ctx.font = '14px sans-serif'
          ctx.fillStyle = '#999999'
          ctx.textAlign = 'left'
          ctx.fillText(row.l1, labelLeft1, row.y0 + 12)
          ctx.textAlign = 'right'
          ctx.fillStyle = '#333333'
          const v1 = this.ellipsize(ctx, row.v1 || '', '14px sans-serif', halfW - 90)
          ctx.fillText(v1, valueRight1, row.y0 + 12)
          // 右列
          ctx.textAlign = 'left'
          ctx.fillStyle = '#999999'
          ctx.fillText(row.l2, labelLeft2, row.y0 + 12)
          ctx.textAlign = 'right'
          ctx.fillStyle = '#333333'
          const v2 = this.ellipsize(ctx, row.v2 || '', '14px sans-serif', halfW - 90)
          ctx.fillText(v2, valueRight2, row.y0 + 12)
          ctx.textAlign = 'left'
          this.hLine(ctx, pad, row.y0 + row.height, W - pad, '#eeeeee')
          break
        }
        case 'kv': {
          ctx.font = '14px sans-serif'
          ctx.fillStyle = '#999999'
          ctx.textAlign = 'left'
          ctx.fillText(row.label, pad, row.y0 + 12)
          ctx.textAlign = 'right'
          const v = this.ellipsize(ctx, row.value || '', row.color ? 'bold 15px sans-serif' : '14px sans-serif', W - pad * 2 - 130)
          ctx.fillStyle = row.color || '#333333'
          ctx.font = row.color ? 'bold 15px sans-serif' : '14px sans-serif'
          ctx.fillText(v, W - pad, row.y0 + 12)
          ctx.textAlign = 'left'
          this.hLine(ctx, pad, row.y0 + row.height, W - pad, '#eeeeee')
          break
        }
      }
    })

    // 水印覆盖层：与页面 CSS 一致（absolute top:30px / 40vw / opacity:.3），叠在最上层
    if (wmImg && wmInfo && wmInfo.width) {
      const wmW = W * 0.4
      const wmH = wmW * wmInfo.height / wmInfo.width
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.drawImage(wmImg, (W - wmW) / 2, 30, wmW, wmH)
      ctx.restore()
    } else if (brand.name) {
      // 兜底：水印图加载失败时用文字
      ctx.textAlign = 'center'
      ctx.font = 'bold 20px sans-serif'
      ctx.fillStyle = '#c0c4cc'
      ctx.fillText(brand.name, W / 2, 40)
      if (brand.tel) {
        ctx.font = '13px sans-serif'
        ctx.fillStyle = '#909399'
        ctx.fillText(brand.tel, W / 2, 68)
      }
      ctx.textAlign = 'left'
    }
  },

  hLine(ctx, x1, y, x2, color) {
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x1, y)
    ctx.lineTo(x2, y)
    ctx.stroke()
  },

  saveImageToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        wx.showToast({
          title: '已保存到相册'
        })
      },
      fail: res => {
        console.log(res)
        if (res.errMsg && res.errMsg.indexOf('cancel') != -1) return
        wx.showModal({
          title: '提示',
          content: '保存到相册需要相册权限，请在设置中开启',
          confirmText: '去设置',
          success(r) {
            if (r.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  }
})
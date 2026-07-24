const app = getApp().globalData
const tss = require('../../../../utils/tss.js')
const alert = require('../../../../utils/alert.js')

Page({
  data: {
    // Edit mode
    line_id: null,
    isEdit: false,

    // Basic form
    name: '',
    type: '单边',
    belong_type: '客户',
    belong_dim_id: null,
    belong_dim_name: '',

    // Picker options
    typeList: ['单边', '往返'],
    belongTypeList: ['客户', '承运商'],
    belongNameDataList: [],
    belongNameDisplayList: [],
    belongNameIndex: -1,
    typeIndex: 0,
    belongTypeIndex: 0,

    // Location cards (minimum 2: start + end)
    locations: [
      { site: '', site_id: 0, site_version: 0, name: '', phone: '', region: ['', '', '', ''], street_no: '' },
      { site: '', site_id: 0, site_version: 0, name: '', phone: '', region: ['', '', '', ''], street_no: '' }
    ],


    // Site search popup
    siteSearchVisible: false,
    siteSearchKeyword: '',
    siteSearchResults: [],
    allSites: [],
    cascaderCurrentIndex: -1,
    cascaderVisible: false,
    isLeaf: false,
    currentCardSiteIndex: -1,

    // Belong name search popup
    belongNameSearchVisible: false,
    belongNameSearchKeyword: '',
    belongNameSearchResults: [],

    domain: ''
  },

  onLoad(options) {
    const domain = app.user.domain
    this.setData({ domain })
    this.loadAllSites()
    console.log(options)
    if (options.line_id) {
      wx.setNavigationBarTitle({ title: '编辑线路' })
      this.setData({
        line_id: options.line_id,
        isEdit: true,
        name: options.name || '',
        type: options.type || '单边',
        belong_type: options.belong_type || '客户',
        belong_dim_id: options.belong_dim_id ? Number(options.belong_dim_id) : null,
        typeIndex: (options.type || '单边') === '往返' ? 1 : 0,
        belongTypeIndex: (options.belong_type || '客户') === '承运商' ? 1 : 0
      })
      this.loadBelongNameList(options.belong_type || '客户')
      this.loadLineLocations()
    } else {
      this.loadBelongNameList('客户')
    }
  },

  // Load all tms_contact sites (position points) at initialization
  loadAllSites() {
    tss.query({
      url: tss.url('sql') + 'tms_contact',
      params: { type: '位置点,域'},
      completion: res => {
        if (res.failed) return
        var sites = res.data.rows || res.data || []
        this.setData({ allSites: sites })
      }
    })
  },

  // Load belong name list based on belong_type
  loadBelongNameList(belongType) {
    const apiUrl = belongType === '客户' ? 'customer' : 'lc_info'
    this.setData({ belongNameDataList: [], belongNameDisplayList: [], belongNameIndex: -1 })
    tss.query({
      url: tss.url('sql') + apiUrl,
      params: {},
      completion: res => {
        if (res.failed) {
          alert.notice('获取' + belongType + '列表失败: ' + (res.errorMsg || ''))
          return
        }
        const list = res.data || []
        // Build display list (use name or text field, and keep original data for reference)
        const displayList = list.map(item => item.name || item.text || '')
        let belongNameIndex = -1
        if (this.data.isEdit && this.data.belong_dim_id) {
          const idx = list.findIndex(item => item.id === this.data.belong_dim_id)
          if (idx !== -1) belongNameIndex = idx
        }
        this.setData({ belongNameDataList: list, belongNameDisplayList: displayList, belongNameIndex,
          belong_dim_name: list.find(item=>item.id == this.data.belong_dim_id)?.name || ''
        })
      }
    })
  },

  // Load locations for editing mode
  loadLineLocations() {
    wx.showLoading({ title: '加载中' })
    var that = this
    tss.query({
      url: tss.url('') + '/tms/entity/LineLocation',
      params: { line_id: this.data.line_id, sortby: 'seq' },
      completion: function(res) {
        if (res.failed) {
          wx.hideLoading()
          alert.notice('获取线路位置失败: ' + (res.errorMsg || ''))
          return
        }
        var lineLocations = res.data || []
        if (lineLocations.length < 2) {
          while (lineLocations.length < 2) {
            lineLocations.push({ site: '', site_id: 0, site_version: 0, name: '', phone: '', region: ['', '', '', ''], street_no: '' })
          }
        }
        // Collect location IDs to fetch full contact data
        var ids = []
        for (var i = 0; i < lineLocations.length; i++) {
          if (lineLocations[i].location_id) {
            ids.push(lineLocations[i].location_id)
          }
        }
        if (ids.length === 0) {
          wx.hideLoading()
          // No IDs to fetch, use line location data as-is
          var fallbackLocations = lineLocations.map(function(item) {
            var addrParts = (item.address || '').split(/[\s]+/)
            return {
              site: item.site || '',
              site_id: item.id || 0,
              site_version: item.version || 0,
              name: item.name || '',
              phone: item.phone || '',
              region: [addrParts[0] || '', addrParts[1] || '', addrParts[2] || '', addrParts[3] || ''],
              street_no: item.street_no || ''
            }
          })
          that.setData({ locations: fallbackLocations })
          return
        }
        // Fetch full contact data
        tss.post({
          url: tss.url('sql') + 'tms_contact',
          params: { id: ids.join(',')},
          completion: function(contactRes) {
            wx.hideLoading()
            var contactMap = {}
            var contacts = contactRes.data || []
            if (!contactRes.failed) {
              for (var j = 0; j < contacts.length; j++) {
                contactMap[contacts[j].id] = contacts[j]
              }
            }
            var locations = lineLocations.map(function(item) {
              var contact = contactMap[item.location_id]
              if (contact) {
                return {
                  site: contact.site || contact.name || item.site || '',
                  site_id: contact.id,
                  site_version: contact.version || 0,
                  name: contact.name || '',
                  phone: contact.phone || '',
                  region: [contact.province || '', contact.city || '', contact.district || '', contact.town || ''],
                  street_no: contact.street_no || ''
                }
              } else {
                var addrParts = (item.address || '').split(/[\s]+/)
                return {
                  site: item.site || '',
                  site_id: item.id || 0,
                  site_version: item.version || 0,
                  name: item.name || '',
                  phone: item.phone || '',
                  region: [addrParts[0] || '', addrParts[1] || '', addrParts[2] || '', addrParts[3] || ''],
                  street_no: item.street_no || ''
                }
              }
            })
            that.setData({ locations: locations })
          }
        })
      }
    })
  },

  // --- Basic form handlers ---
  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onTypeChange(e) {
    const idx = e.detail.value
    this.setData({ typeIndex: idx, type: this.data.typeList[idx] })
  },

  onBelongTypeChange(e) {
    const idx = e.detail.value
    const belongType = this.data.belongTypeList[idx]
    this.setData({
      belongTypeIndex: idx,
      belong_type: belongType,
      belong_dim_id: null,
      belong_dim_name: '',
      belongNameIndex: -1,
      belongNameDataList: [],
      belongNameDisplayList: []
    })
    this.loadBelongNameList(belongType)
  },

 onBelongNameChange(e) {
    const idx = e.detail.value
    const list = this.data.belongNameDataList
    if (list[idx]) {
      this.setData({
        belongNameIndex: idx,
        belong_dim_id: list[idx].id,
        belong_dim_name: list[idx].name || list[idx].text || ''
      })
    }
  },

  // --- Belong name search selector ---
  openBelongNameSearch() {
    this.setData({
      belongNameSearchVisible: true,
      belongNameSearchKeyword: '',
      belongNameSearchResults: this.data.belongNameDataList || []
    })
  },

  onBelongNameSearchInput(e) {
    var keyword = e.detail.value
    this.setData({ belongNameSearchKeyword: keyword })
    if (!keyword) {
      // Show all results when empty
      this.setData({ belongNameSearchResults: this.data.belongNameDataList || [] })
      return
    }
    // Filter locally from loaded data
    var list = this.data.belongNameDataList || []
    var filtered = list.filter(function(item) {
      var name = (item.name || item.text || '').toLowerCase()
      return name.indexOf(keyword.toLowerCase()) !== -1
    })
    this.setData({ belongNameSearchResults: filtered })
  },

  selectBelongName(e) {
    var item = e.currentTarget.dataset.item
    this.setData({
      belong_dim_id: item.id,
      belong_dim_name: item.name || item.text || '',
      belongNameSearchVisible: false,
      belongNameSearchKeyword: '',
      belongNameSearchResults: []
    })
  },

  closeBelongNameSearch() {
    this.setData({ belongNameSearchVisible: false })
  },

  // --- Card data handlers ---
  onCardNameInput(e) {
    const idx = e.currentTarget.dataset.index
    const key = 'locations[' + idx + '].name'
    this.setData({ [key]: e.detail.value })
  },

  onCardPhoneInput(e) {
    const idx = e.currentTarget.dataset.index
    const key = 'locations[' + idx + '].phone'
    this.setData({ [key]: e.detail.value })
  },

  onCardStreetNoInput(e) {
    const idx = e.currentTarget.dataset.index
    const key = 'locations[' + idx + '].street_no'
    this.setData({ [key]: e.detail.value })
  },

  // --- Site selector (tms_contact search + pick) ---
  openSiteSearch(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({
      siteSearchVisible: true,
      siteSearchKeyword: '',
      siteSearchResults: [],
      siteSearchResults: this.data.allSites || [],
      currentCardSiteIndex: idx
    })
  },

  onSiteSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ siteSearchKeyword: keyword })
    if (!keyword) {
      this.setData({ siteSearchResults: this.data.allSites || [] })
      return
    }
    // Filter locally from preloaded allSites
    var list = this.data.allSites || []
    var filtered = list.filter(function(item) {
      var name = (item.site || item.name || '').toLowerCase()
      return name.indexOf(keyword.toLowerCase()) !== -1
    })
    this.setData({ siteSearchResults: filtered })
  },

  selectSite(e) {
    const item = e.currentTarget.dataset.item
    const idx = this.data.currentCardSiteIndex
    if (idx === -1) return
    const prefix = 'locations[' + idx + ']'
    this.setData({
      [prefix + '.site']: item.site || item.name || '',
      [prefix + '.site_id']: item.id,
      [prefix + '.site_version']: item.version || 0,
      [prefix + '.name']: item.name || '',
      [prefix + '.phone']: item.phone || '',
      [prefix + '.region']: [item.province || '', item.city || '', item.district || '', item.town || ''],
      [prefix + '.street_no']: item.street_no || '',
      siteSearchVisible: false
    })
  },

  closeSiteSearch() {
    this.setData({ siteSearchVisible: false })
  },

  // --- Region cascader ---
  openCascader(e) {
    var idx = e.currentTarget.dataset.index
    this.setData({
      cascaderCurrentIndex: idx,
      cascaderVisible: true
    })
  },

  onCascaderClose() {
    this.setData({ cascaderVisible: false, cascaderCurrentIndex: -1 })
  },

  onCascaderChange(e) {
    var detail = e.detail
    if (!detail.done) return
    var idx = this.data.cascaderCurrentIndex
    if (idx === -1) return
    var labels = detail.options.map(function(o) { return o.label })
    var key = 'locations[' + idx + '].region'
    this.setData({
      [key]: [labels[0] || '', labels[1] || '', labels[2] || '', labels[3] || ''],
      cascaderVisible: false,
      cascaderCurrentIndex: -1
    })
  },

 // --- Card management ---
 addMiddleNode(e) {
   const idx = e.currentTarget.dataset.index
   const locations = this.data.locations.slice()
   const newLocation = {
     site: '', site_id: 0, site_version: 0,
     name: '', phone: '',
     region: ['', '', '', ''],
     street_no: ''
   }
   locations.splice(idx + 1, 0, newLocation)
   this.setData({ locations: locations })
  },

 // --- Delete middle node ---
 deleteMiddleNode(e) {
   const idx = e.currentTarget.dataset.index
   const locations = this.data.locations.slice()
   if (idx <= 0 || idx >= locations.length - 1) return
   locations.splice(idx, 1)
   this.setData({ locations: locations })
 },

 // --- Save ---
  save() {
    if (!this.data.name) {
      alert.notice('名称为必填项')
      return
    }
    if (!this.data.belong_dim_id) {
      alert.notice('请选择归属方')
      return
    }
    for (var i = 0; i < this.data.locations.length; i++) {
      if (!this.data.locations[i].site) {
        alert.notice('第' + (i + 1) + '个位置的始发地为必填项')
        return
      }
    }

    wx.showLoading({ title: '保存中...', mask: true })

    var that = this
    var locations = this.data.locations.map(function (loc) {
      return {
        site: loc.site,
        address: loc.region.filter(function (r) { return r }).join(' '),
        street_no: loc.street_no,
        name: loc.name,
        phone: loc.phone,
        id: loc.site_id || 0,
        version: loc.site_version || 0
      }
    })

    var params = {
      name: this.data.name,
      type: this.data.type,
      belong_type: this.data.belong_type,
      belong_dim_id: this.data.belong_dim_id,
      locations: JSON.stringify(locations)
    }

    if (this.data.isEdit && this.data.line_id) {
      params.id = this.data.line_id
    }

    tss.post({
      url: tss.url('') + '/tms/Line',
      params: params,
      completion: function (res) {
        wx.hideLoading()
        if (res.failed) {
          alert.notice('保存失败: ' + (res.errorMsg || ''))
          return
        }
        wx.showToast({ title: '保存成功' })
        setTimeout(function () { wx.navigateBack() }, 1500)
      }
    })
  }
})

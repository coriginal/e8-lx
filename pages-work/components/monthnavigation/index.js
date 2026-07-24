Component({

  externalClasses: ['custom-class'],

  properties: {
    month: null
  },
  data:{
    monthList: [],
    monthSelect: 0,
    color: getApp().globalData.monthColor

  },
  attached:function() {  
    this.data.monthSelect = 0;
    this.data.monthList = [];
    var date = new Date();
    for (var i=0;this.data.monthList.length < 6;i++) {
      date.setDate(1);
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      if (month < 10) { month = '0' + month; }
      this.data.monthList.push({ text: month + '月', value: year + '-' + month + '-01', select: this.data.monthSelect++ })
      date.setDate(0);
    }
    this.setData({
      monthList: this.data.monthList,
      month: this.data.monthList[0].value
    })
   },
  methods: {
    
    monthChange: function monthChange(e) {
      if (e.target.id == e.currentTarget.id) {
        return
      }
      var month = e.target.id;
      this.setData({
        monthSelect: e.target.dataset.select
      })

      this.triggerEvent('navchange', { value: month });
    }
  }
});
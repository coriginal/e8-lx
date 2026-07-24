Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  data: {
    inputValue:''
  },
  properties: {
    code:{
      type: String,
      value: ''
    },
    label: {
      type: String,
      value: '关键词'
    },
    labelName: {
      type: String,
      value: ''
    },
    showLabel:{
      type:Boolean,
      value:true
    },
    autoSearch:{
      type: Boolean,
      value: false
    }
  },
  lifetimes:{
      ready(){
        if(this.data.code){
          this.setData({
            inputValue:this.data.code
          })
        }
      }
  },
  methods: {
    searchCode(e) {
      console.log(e)
      this.triggerEvent('change', { [this.data.labelName]: e.detail.value })
    },
    bindKeyInput(e) {
      if(e.detail.value.length){
        this.setData({
          inputValue: e.detail.value
        })
      }else{
        this.cleanInput()
      }
    },
    scanIconTapped(e) {
      wx.scanCode({
        success: res => {
          this.setData({
            inputValue: res.result
          },()=>{
            if(this.data.autoSearch){
              this.searchCode({
                detail:{
                  value: this.data.inputValue
                }
              })
            }
          })
        }
      })
    },
    cleanInput() {
      this.setData({ inputValue: '' })
      this.triggerEvent('change', {})
    },
  }
})
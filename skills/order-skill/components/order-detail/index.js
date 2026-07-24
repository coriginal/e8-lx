// skills/order-skill/components/order-detail/index.js
Component({
  lifetimes: {
    created() {
      const modelCtx = wx.modelContext.getContext(this);
      const {
        NotificationType
      } = wx.modelContext;
      modelCtx.on(NotificationType.Input, (data) => {
        // 原子接口的入参数据
        console.log("得到数据：",data)
      });
      modelCtx.on(NotificationType.Result, (data) => {
        // 原子接口的出参数据
        console.log("出参：", data)
        this.setData({
          orderInfo: data.result.structuredContent
        })
      });

      const viewCtx = wx.modelContext.getViewContext(this);
      const {
        minHeight,
        maxHeight,
        width
      } = viewCtx.getDimensions();
      viewCtx.on(NotificationType.Overflow, (data) => {
        // data.contentHeight: 内容总高
        // data.overflowHeight: 溢出高度
        // data.maxHeihgt: 当前卡片容器的硬性阈值
        // 如果给原子组件的 root element 设置 maxHeight 和 overflow: hidden 则无法触发
      });
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    orderInfo:null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
const painting = (bgUrl, user, url, companyInfo) => ({
  width: 375,
  height: 667,
  clear: true,
  views: [
    {
      // 背景图
      type: 'image',
      url: bgUrl,
      top: 0,
      left: 0,
      width: 375,
      height: 607
    },
    {
      // 背景图
      type: 'rect',
      background: 'white',
      top: 607,
      left: 0,
      width: 375,
      height: 60
    },
    // 二维码
    {
      type: 'image',
      url,
    //   top: 325,
    //   left: 98,
    //   width: 180,
    //   height: 180
    top:607,
    left:295,
    width:60,
    height:60

    },
    // 头像
    // {
    //   type: 'image',
    //   url: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83epJEPdPqQVgv6D8bojGT4DrGXuEC4Oe0GXs5sMsN4GGpCegTUsBgL9SPJkN9UqC1s0iakjQpwd4h4A/132',
    //   top: 27.5,
    //   left: 29,
    //   width: 55,
    //   height: 55
    // },
    // {
    //   type: 'text',
    //   content: '正品MAC魅可口红礼今年我看你发觉我那惹为了让你看玩儿盒生日唇膏小辣椒Chili西柚情人',
    //   fontSize: 16,
    //   lineHeight: 21,
    //   color: '#383549',
    //   textAlign: 'left',
    //   top: 336,
    //   left: 44,
    //   width: 287,
    //   MaxLineNumber: 2,
    //   breakWord: true,
    //   bolder: true
    // },
    // {
    //   type: 'text',
    //   content: '￥0.00',
    //   fontSize: 19,
    //   color: '#E62004',
    //   textAlign: 'left',
    //   top: 387,
    //   left: 44.5,
    //   bolder: true
    // },
    // {
    //   type: 'text',
    //   content: '原价:￥138.00',
    //   fontSize: 13,
    //   color: '#7E7E8B',
    //   textAlign: 'left',
    //   top: 391,
    //   left: 110,
    //   textDecoration: 'line-through'
    // },
    {
      type: 'text',
      content: companyInfo.name || '',
      fontSize: 20,
      color: '#383549',
      top: 637,
      left: 20,
      lineHeight: 20,
      MaxLineNumber: 1,
      breakWord: true,
      width: 245,
      bolder: true
    },
    {
      type: 'text',
      content: `${companyInfo.phone || ''}`,
      fontSize: 20,
      color: '#444',
      top: 613,
      left: 20,
      lineHeight: 20,
      bolder: true
      // MaxLineNumber: 2,
      // breakWord: true,
      // width: 125
    }
  ]
})
const paintingNew = (bgUrl, user, url, companyInfo) => ({
    width: 375,
    height: 667,
    clear: true,
    views: [
      {
        // 背景图
        type: 'image',
        url: bgUrl,
        top: 0,
        left: 0,
        width: 375,
        height: 607
      },
      {
        // 背景图
        type: 'rect',
        background: 'white',
        top: 607,
        left: 0,
        width: 375,
        height: 60
      },
    //   {
    //     type: 'rect',
    //     background: 'white',
    //     top: 320,
    //     left: 87,
    //     width: 200,
    //     height: 200
    //   },
      // 二维码
      {
        type: 'image',
        url: url.replace("isHyaline=true","isHyaline=false"),
        top: 325,
        left: 98,
        width: 180,
        height: 180
      },
      {
        type: 'text',
        content: companyInfo.name || '',
        fontSize: 20,
        color: '#383549',
        top: 637,
        left: 20,
        lineHeight: 20,
        MaxLineNumber: 1,
        breakWord: true,
        width: 245,
        bolder: true
      },
      {
        type: 'text',
        content: `${companyInfo.phone || ''}`,
        fontSize: 20,
        color: '#444',
        top: 613,
        left: 20,
        lineHeight: 20,
        bolder: true
      }
    ]
  })
const paintingCard = (bgUrl, user, url, companyInfo) => ({
  width: 390,
  height: 240,
  clear: true,
  views: [
    {
      // 背景图
      type: 'image',
      url: bgUrl,
      top: 0,
      left: 0,
      width: 390,
      height: 240
    },
    {
      type: 'text',
      content: companyInfo.name || '',
      fontSize: 23,
      color: '#383549',
      top: 40,
      left: 250,
      lineHeight: 30,
      textAlign: 'center',
      MaxLineNumber: 2,
      breakWord: true,
      width: 245,
      bolder: true
    },
    {
      type: 'text',
      content: `${companyInfo.person || ''}`,
      fontSize: 12,
      color: '#444',
      top: 121,
      left: 220,
      lineHeight: 20
    },
    {
      type: 'text',
      content: `${companyInfo.phone || ''}`,
      fontSize: 12,
      color: '#444',
      top: 143,
      left: 220,
      lineHeight: 20
    },
    {
      type: 'text',
      content: `${companyInfo.email || ''}`,
      fontSize: 12,
      color: '#444',
      top: 164,
      left: 220
    },
    {
      type: 'text',
      content: `${companyInfo.address || ''}`,
      fontSize: 12,
      color: '#444',
      top: 186,
      left: 220,
      lineHeight: 20
    },
    {
      type: 'image',
      url,
      top: 152,
      left: 9,
      width: 78,
      height: 78
    },
    {
      type: 'text',
      content: '杭州卜数科技有限公司 提供技术服务',
      fontSize: 5,
      color: 'gray',
      textAlign:'right',
      top: 235,
      left: 375
    },
  ]
})


export default {
  painting,paintingCard,paintingNew
}
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
      height: 667
    },
    // {
    //   // 背景图
    //   type: 'rect',
    //   background: 'white',
    //   top: 607,
    //   left: 0,
    //   width: 375,
    //   height: 60
    // },
    // 二维码
    {
      type: 'image',
      url,
      top: 253.5,
      left: 87.5,
      width: 210,
      height: 210
    },
    {
      type: 'text',
      content: (companyInfo.name || '') +  "请你",
      fontSize: 24,
      color: '#f48f70',
      top: 140,
      left: 200,
      textAlign: 'center',
      lineHeight: 30,
      MaxLineNumber: 1,
      breakWord: true,
      width: 375,
      bolder: true
    },
    // {
    //   type: 'text',
    //   content: `${companyInfo.phone || ''}`,
    //   fontSize: 20,
    //   color: '#444',
    //   top: 613,
    //   left: 20,
    //   lineHeight: 20,
    //   bolder: true
    //   // MaxLineNumber: 2,
    //   // breakWord: true,
    //   // width: 125
    // }
  ]
})

export default {
  painting
}
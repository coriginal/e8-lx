const painting = (data) => ({
  width: 375,
  height: 667,
  clear: true,
  views: [
    {
      // 背景图
      type: 'image',
      url: data.bgUrl,
      top: 0,
      left: 0,
      width: 375,
      height: 667
    },
    // 二维码
    {
      type: 'image',
      url: data.qrcode || '',
      top: 220,
      left: 95,
      width: 200,
      height: 200
    }
  ]
})


export { painting }
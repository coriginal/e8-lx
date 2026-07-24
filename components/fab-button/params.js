const params = {
  date: [
    { title: '起始日期', code: 'date1', value: '' },
    { title: '截止日期', code: 'date2', value: '' }
  ],
  customer: [
    { title: '姓名', code: 'name', value: '' },
    { title: '电话', code: 'phone', value: '' }
  ],
  order: [
    { title: '单号', code: 'code', value: '' },
    { title: '运单号', code: 'tcode', value: '' },
    { title: '客户单号', code: 'ccode', value: '' }
  ],
  status: [
    { title: '新建', code: '1', value: '' },
    { title: '在途', code: '2', value: '' },
    { title: '已签', code: '3', value: '' },
    { title: '取消', code: '4', value: '' }
  ],
  send_addr: [
    { title: '省', code: 'send_province', value: '' },
    { title: '市', code: 'send_city', value: '' },
    { title: '区', code: 'send_district', value: '' },
  ],
  receive_addr: [
    { title: '省', code: 'receive_province', value: '' },
    { title: '市', code: 'receive_city', value: '' },
    { title: '区', code: 'receive_district', value: '' },
  ]
}


export default params
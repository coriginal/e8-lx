const FilterList = [{
  type: 'filter',
  label: '筛选',
  value: 'filter',
  checked: true,
  children: [{
      type: 'radio',
      label: '寄件日期（ 单选 ）',
      value: 'days',
      selected: '近三个月',
      children: [{
          label: '今天',
          value: '1'
        }, {
          label: '最近七天',
          value: '7'
        },
        {
          label: '近一个月',
          value: '30'
        },
        {
          label: '近三个月',
          value: '90',
          checked: true,
          defaultChecked: true
        }
      ],
    },
    // {
    //   type: 'checkbox',
    //   label: '运单状态（ 多选 ）',
    //   value: 'status',
    //   children: [{
    //     label: '已接单',
    //     value: '已接单'
    //   },
    //   {
    //     label: '在途',
    //     value: '在途'
    //   },
    // {
    //   label: '已签',
    //   value: '已签'
    // },
    // {
    //   label: '取消',
    //   value: '取消'
    // },
    // ],
    // },
    {
      type: 'radio',
      label: '类型（ 单选 ）',
      value: 'task_type',
      selected: '提货',
      children: [{
          label: '提货',
          value: '提货',
          checked: true,
          defaultChecked: true
        },
        {
          label: '中转',
          value: '中转'
        },
        {
          label: '派送',
          value: '派送'
        },
        {
          label: '直送',
          value: '直送'
        },
        {
          label: '整车',
          value: '整车'
        },
      ],
    }
  ],
}]


module.exports = {
  FilterList
}
/*

    title  -- 左侧名字
    placeholder -- 'input'的默认值
    type -- 'input','checkbox_group','radio_group','input_grids','grids',
    value -- ''
    unit -- '右侧的单位'
    display -- 'block','inline-block'

*/

const cargoList = () => {
  const isD1005 = getApp().globalData.user?.domain === 'D1005';
  const base = {
    "cargo": {
      title: isD1005 ? '物品名称' : '货物名称',
      placeholder: isD1005 ? '请选择物品名称' : '请填写货物名称',
      type: isD1005 ? 'cargo_selector' : 'tag',
      value: '',
      inputType: 'text'
    },
    "amount": {
      title: '件数（件）',
      placeholder: '( 必填 )',
      type: 'input',
      value: '',
      inputType: 'number',
      // unit: '单位（件）'
    },
    ...(isD1005 ? {
      "unit_weight": {
        title: `单件重量（KG）`,
        placeholder: '请输入单件重量',
        type: 'input',
        value: '',
        inputType: 'digit'
      }
    } : {}),
    "weight": {
      title: `重量（${getApp().globalData.DomainConfig.weight_unit?.content=="t"?"T":"KG"}）`,
      placeholder: '( 必填 )',
      type: 'input',
      value: '',
      inputType: 'digit',
      // unit: `单位（${getApp().globalData.DomainConfig.weight_unit?(getApp().globalData.DomainConfig.weight_unit.content=="kg"?"千克":"吨"):"千克"}）`
    },
    // "V_volume": {
    //   title: '智能体积计算',
    //   placeholder: '',
    //   type: 'navigate',
    //   children: [{ title: '长(cm)', code: 'v1' }, { title: '宽(cm)', code: 'v2' }, { title: '高(cm)', code: 'v3' }]
    // },
    "C_volume_list": {
      title: '',
      type: 'input_grids_list',
      children: [{
        title: '长(cm)',
        code: 'long'
      }, {
        title: '宽(cm)',
        code: 'width'
      }, {
        title: '高(cm)',
        code: 'height'
      }, {
        title: '件数',
        code: 'c_amount'
      }]
    },
    "volume_table": {
      type: 'table',
    },
    //   "C_volume": {
    //     title: '体积计算',
    //     placeholder: '',
    //     type: 'input_grids',
    //     children: [{ title: '长(cm)', code: 'v1' }, { title: '宽(cm)', code: 'v2' }, { title: '高(cm)', code: 'v3' },{ title: '件数', code: 'v4' }]
    //   },
    ...(isD1005 ? {
      "unit_volume": {
        title: '单件体积（m³）',
        placeholder: '请输入单件体积',
        type: 'input',
        value: '',
        inputType: 'digit'
      }
    } : {}),
    "volume": {
      title: '体积（m³）',
      placeholder: '请输入体积( 必填 )',
      type: 'input',
      value: '',
      unit: '单位（立方米）'
    },
    "specs": {
      title: '规格',
      type: 'input',
      value: '',
      placeholder: '请输入规格( 选填 )'
    },
    ...(isD1005 ? {
      "sudf1": {
        title: "标记",
        type: "text",
        placeholder:"请输入标记"
      }
    } : {}),
    "package": {
      title: '货物包装',
      type: 'input',
      disabled: true
    },
    "pack": {
      type: 'grids',
      children: ['纸箱', '木箱', '编织袋', '托盘', '木架', '纸/木', '桶', '裸装', '膜', '泡沫箱', '长纸筒', '塑料箱', '纸托', '圆纸筒', '纸袋', '铁架', '膜包纸箱', '布袋', '圆盘', '塑料', '其他']
    }
  }
  return base;
}

export default cargoList
/*

    title  -- 左侧名字
    placeholder -- 'input'的默认值
    type -- 'input','checkbox_group','radio_group','input_grids','grids',
    value -- ''
    unit -- '右侧的单位'
    display -- 'block','inline-block'

*/
const cargoList = () => ({
    "service_mode": {
        title: '派送方式',
        placeholder: '( 选填 )',
        value: '',
        children: [{
            name: '派送',
            checked: ''
        }, {
            name: '自提',
            checked: ''
        }]
    },
    "entry_type": {
        title: '进仓类型',
        placeholder: '( 选填 )',
        value: '',
        children: [{
            name: '海运进仓',
            checked: ''
        }, {
            name: '空运进仓',
            checked: ''
        }, {
            name: '保税进仓',
            checked: ''
        }],
    },
    "upstairs_type": {
        title: '上楼类型',
        placeholder: '( 选填 )',
        value: '',
        children: [{
            name: '普通上楼',
            checked: ''
        }, {
            name: '大件上楼',
            checked: ''
        }]
    },
    "insurance_type": {
        title: '保险类型',
        placeholder: '( 选填 )',
        value: '',
        children: [{
            name: '普通货险',
            checked: ''
        }, {
            name: '易碎品险',
            checked: ''
        }]
    },
    "rcode_type": {
        title: '回单类型',
        placeholder: '( 选填 )',
        value: '',
        children: [{
            name: '纸质回单',
            checked: ''
        }, {
            name: '电子回单',
            checked: ''
        }]
    }
})

const fieldMap = new Map([
    ['numberbox', {
        fieldType: 'input',
        inputType: 'digit'
    }],
    ['tiled', {
        fieldType: 'list'
    }],
    ['input', {
        fieldType: 'input',
        inputType: 'text'
    }],
    ['checkbox', {
        fieldType: 'checkbox'
    }]
])


export {
    fieldMap,
    cargoList
}
const OrderStatusColor = {
    '新建': 'green',
    '待取': 'cyan',
    '在途': 'blue',
    '已签收': 'gold',
    '已接单': 'green',
    '已取消': 'gray',
    '待接单': 'red',
}

const FilterList = [{
    // m5默认进来是收件门店
    // 其他默认进来是订单号
    type: 'filter',
    label: '筛选',
    value: 'filter',
    checked: true,
    children: [{
            type: 'radio',
            label: '外部查询框（ 单选 ）',
            value: 'type',
            selected: '订单号',
            children: [{
                    label: '单号',
                    value: 'sscode',
                    checked: true,
                    defaultChecked: true
                },{
                    label: '创建人',
                    value: 'creator'
                },
                {
                    label: '运单号',
                    value: 'tcode'
                },
                {
                    label: '订单号',
                    value: 'ocode'
                },
                {
                    label: '寄件人',
                    value: 'send_man'
                },
                {
                    label: '寄件电话',
                    value: 'send_phone'
                },
                {
                    label: '收件人',
                    value: 'receive_man'
                },
                {
                    label: '收件电话',
                    value: 'receive_phone'
                },
                {
                    label: '收件省',
                    value: 'receive_province'
                },
                {
                    label: '收件门店',
                    value: 'receive_site',
                }
            ]
        },
        {
            type: 'radio',
            label: '寄件日期（ 单选 ）',
            value: 'days',
            selected: '近一个月',
            children: [{
                    label: '今天',
                    value: '1'
                }, {
                    label: '最近七天',
                    value: '7'
                },
                {
                    label: '近一个月',
                    value: '30',
                    checked: true,
                    defaultChecked: true
                },
                {
                    label: '近三个月',
                    value: '90'
                },
            ],
        },
        {
            type: 'radio',
            label: '运单状态（ 单选 ）',
            value: 'status_code',
            children: [{
                    label: '待接单',
                    value: '99'
                }, {
                    label: '已接单',
                    value: '100'
                },
                {
                    label: '在途',
                    value: '203,213,214,303,304,313,314,315,403,404,413,414,415,503,504,513,514,515,613'
                },
                // {
                //     label: '已签',
                //     value: '624'
                // },
                // {
                //     label: '取消',
                //     value: '999'
                // },
            ],
        },
        {
            type: 'radio',
            label: '承运商（ 单选 ）',
            value: 'lc_id',
            children: [{
                label: '有',
                value: 'is_not_null'
            }, {
                label: '无',
                value: 'is_null'
            }],
        }
    ],
}]

const SearchLabel = FilterList[0].children.filter(n => n.value == 'type')[0]

const OrderList = [{
    id: 37,
    code: '18874839234',
    order_date: '2018-8-25 10:12:42',
    cargo: '空调，热水，洗衣机，蔬菜',
    amount: 7,
    status: '新建',
    weight: 18,
    volume: 2.33,
    send_man: '张三',
    send_phone: '1887738223',
    send_province: '湖北省',
    send_city: '乌鲁木齐市',
    send_district: '武昌区',
    send_town: '汉阳大道',
    send_addr: '金额仅为而为i俄军人请问1号 37门',
    receive_man: '李四',
    receive_phone: '18877448832',
    receive_province: '浙江省',
    receive_city: '请问家里可能拉开是否能拉上市',
    receive_district: '江干区',
    receive_town: '1号大街',
    receive_addr: '华媒科创园A2-225'
}]

const dealData = (value, name) => {
    switch (name) {
        case 'cod': {
            return value ? value : 0
        };
        break;
    case 'arrive_pay': {
        return value ? value : 0
    };
    break;
    case 'rcode': {
        return value ? value : ' '
    };
    break;
    case 'amount': {
        return value ? `${value}件` : ''
    };
    break;
    case 'weight': {
        return value ? `${value}kg` : ''
    };
    break;
    case 'volume': {
        return value ? `${value}m³` : ''
    };
    break;
    case 'if_visit': {
        return value ? '上门取件' : ''
    };
    break;
    case 'udf1': {
        let x = value ? value.split('|').filter(i => i.substr(0, i.length - 1) > 0) : ' '
        return x
    };
    break;
    case '': {};
    break;
    }
}

const painting = (data, _App) => ({
    width: 375,
    height: 555,
    clear: true,
    views: [
        // top1
        {
            type: 'rect',
            background: '#fff',
            top: 0,
            left: 0,
            width: 375,
            height: 555
        },
        // top1
        {
            type: 'rect',
            background: '#444',
            top: 40,
            left: 0,
            width: 375,
            height: 1
        },
        // top2
        {
            type: 'rect',
            background: '#444',
            top: 80,
            left: 0,
            width: 375,
            height: 1
        },
        // top3
        {
            type: 'rect',
            background: '#444',
            top: 160,
            left: 0,
            width: 375,
            height: 1
        },
        // top4
        {
            type: 'rect',
            background: '#444',
            top: 270,
            left: 0,
            width: 375,
            height: 1
        },
        // top5
        {
            type: 'rect',
            background: '#444',
            top: 370,
            left: 0,
            width: 375,
            height: 1
        },
        // top6
        // {
        //   type: 'rect',
        //   background: '#444',
        //   top: 410,
        //   left: 0,
        //   width: 375,
        //   height: 1
        // },
        // top7
        {
            type: 'rect',
            background: '#444',
            top: 450,
            left: 0,
            width: 375,
            height: 1
        },
        // top8
        {
            type: 'rect',
            background: '#444',
            top: 490,
            left: 0,
            width: 255,
            height: 1
        },
        // left2
        {
            type: 'rect',
            background: '#444',
            top: 450,
            left: 255,
            width: 1,
            height: 110
        },
        // left1
        {
            type: 'rect',
            background: '#444',
            top: 40,
            left: 120,
            width: 1,
            height: 120
        },
        // text1
        {
            type: 'text',
            content: data.c11,
            fontSize: 22,
            color: '#444',
            textAlign: 'center',
            top: 10,
            left: 185.5,
            bolder: true
        },
        // text2
        {
            type: 'text',
            content: data.c21,
            fontSize: 18,
            color: '#444',
            textAlign: 'center',
            top: 50,
            left: 60,
            width: 120,
            breakWord: true,
            MaxLineNumber: 1
        },
        // text3
        {
            type: 'text',
            content: data.c31,
            fontSize: 18,
            color: '#444',
            textAlign: 'center',
            top: 50,
            left: 247.5,
            width: 240,
            breakWord: true,
            MaxLineNumber: 1
        },
        // text4
        {
            type: 'text',
            content: data.c41,
            fontSize: 24,
            color: '#444',
            textAlign: 'center',
            top: 95,
            left: 60,
            bolder: true
        },
        {
            type: 'text',
            content: data.c51,
            fontSize: 18,
            color: '#444',
            textAlign: 'center',
            top: 125,
            left: 60
        },
        {
            type: 'image',
            url: `${_App.app_host}/tss/img/api/bar/${data.c61}.png?size=2`,
            top: 85,
            left: 130,
            height: 70,
            width: 235
        },
        // rect1
        {
            type: 'rect',
            background: '#444',
            top: 161,
            left: 30,
            width: 1,
            height: 109
        },
        // rect2
        {
            type: 'rect',
            background: '#444',
            top: 271,
            left: 30,
            width: 1,
            height: 99
        },
        // text6
        {
            type: 'text',
            content: data.c71,
            fontSize: 22,
            color: '#444',
            textAlign: 'center',
            top: 205,
            left: 15,
            bolder: true
        },
        // text7
        {
            type: 'text',
            content: [2, 3, 4, 5, 6, 7, 8].map(i => data[`c7${i}`]).filter(i => i).join(' '),
            fontSize: 22,
            color: '#444',
            top: 180,
            left: 40,
            bolder: true
        },
        // text8
        {
            type: 'text',
            content: [
                [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c8${i}`]).filter(i => i).join(' '), [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c16${i}`]).filter(i => i).join(' ')
            ].join(' '),
            fontSize: 18,
            color: '#444',
            textAlign: 'left',
            top: 210,
            left: 40,
            width: 315,
            breakWord: true,
            MaxLineNumber: 3,
            lineHeight: 24,
        },
        // text9
        {
            type: 'text',
            content: data.c91,
            fontSize: 18,
            color: '#444',
            textAlign: 'center',
            top: 310,
            left: 15,
            bolder: true
        },
        // text10
        {
            type: 'text',
            content: [2, 3, 4, 5, 6, 7, 8].map(i => data[`c9${i}`]).filter(i => i).join(' '),
            fontSize: 18,
            color: '#444',
            top: 285,
            left: 40,
            bolder: true
        },
        // text11
        {
            type: 'text',
            content: [
                [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c10${i}`] && data[`c10${i}`].replace(/\&nbsp\;/g, ' ')).filter(i => i).join(' '), [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c17${i}`] && data[`c17${i}`].replace(/\&nbsp\;/g, ' ')).filter(i => i).join(' ')
            ].join(' '),
            fontSize: 18,
            color: '#444',
            top: 310,
            left: 40,
            width: 315,
            breakWord: true,
            MaxLineNumber: 3,
            lineHeight: 24
        },
        // {
        //   type: 'text',
        //   content: [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c12${i}`]).filter(i=>i).join('-'),
        //   fontSize: 16,
        //   color: '#444',
        //   top: 420,
        //   left: 5,
        //   width: 365,
        //   breakWord: true,
        //   MaxLineNumber: 2
        // },
        {
            type: 'text',
            content: data.c141,
            fontSize: 16,
            color: '#444',
            top: 495,
            left: 5,
            width: 235,
            breakWord: true,
            MaxLineNumber: 3
        },
        {
            type: 'text',
            content: [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c12${i}`] && data[`c12${i}`].replace(/\&nbsp\;/g, ' ')).filter(i => i).join(' '),
            fontSize: 16,
            color: '#444',
            top: 380,
            left: 5,
            width: 365,
            breakWord: true,
            MaxLineNumber: 2
        },
        {
            type: 'text',
            content: [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c13${i}`] && data[`c13${i}`].replace(/\&nbsp\;/g, ' ')).filter(i => i).join(' '),
            fontSize: 16,
            color: '#444',
            top: 460,
            left: 5,
            width: 235,
            breakWord: true,
            MaxLineNumber: 1
        },
        {
            type: 'image',
            // url: `${_App.app_host}/tss/img/api/qrbar/1?appId=${_App.app_id}&page=pages/homepage/homepage/homepage&onlyQparam=true&qparam=1,2,3,os,${order.code}&uName=${_App.user.uName}&uToken=${_App.user.uToken}`,
            url: `${_App.app_host}/tss/img/api/qrbar/1?msg=${_App.app_host}?code=${data.c61}&uName=${_App.user.uName}&uToken=${_App.user.uToken}`,
            top: 451,
            left: 263,
            height: 105,
            width: 105
        },
        // {
        //   type: 'rect',
        //   background: '#eee',
        //   top: 451,
        //   left: 258,
        //   height: 105,
        //   width: 120
        // },
    ]
})
const painting_032 = (data, _App) => ({
    width: 375,
    height: 555,
    clear: true,
    views: [
        // top1
        {
            type: 'rect',
            background: '#fff',
            top: 0,
            left: 0,
            width: 375,
            height: 555
        },
        // top1
        {
            type: 'rect',
            background: '#444',
            top: 40,
            left: 0,
            width: 375,
            height: 1
        },
        // top2
        {
            type: 'rect',
            background: '#444',
            top: 80,
            left: 0,
            width: 375,
            height: 1
        },
        // top3
        {
            type: 'rect',
            background: '#444',
            top: 160,
            left: 0,
            width: 375,
            height: 1
        },
        // top4
        {
            type: 'rect',
            background: '#444',
            top: 270,
            left: 0,
            width: 375,
            height: 1
        },
        // top5
        {
            type: 'rect',
            background: '#444',
            top: 370,
            left: 0,
            width: 375,
            height: 1
        },
        // top6
        // {
        //   type: 'rect',
        //   background: '#444',
        //   top: 410,
        //   left: 0,
        //   width: 375,
        //   height: 1
        // },
        // top7
        {
            type: 'rect',
            background: '#444',
            top: 450,
            left: 0,
            width: 375,
            height: 1
        },
        // top8
        {
            type: 'rect',
            background: '#444',
            top: 490,
            left: 0,
            width: 255,
            height: 1
        },
        // left2
        {
            type: 'rect',
            background: '#444',
            top: 370,
            left: 255,
            width: 1,
            height: 190
        },
        {
            type: 'rect',
            background: '#444',
            top: 410,
            left: 0,
            width: 255,
            height: 1
        },
        // left1
        {
            type: 'rect',
            background: '#444',
            top: 40,
            left: 120,
            width: 1,
            height: 120
        },
        // text1
        {
            type: 'text',
            content: data.c11,
            fontSize: 22,
            color: '#444',
            textAlign: 'center',
            top: 10,
            left: 185.5,
            bolder: true
        },
        // text2
        {
            type: 'text',
            content: data.c21,
            fontSize: 18,
            color: '#444',
            textAlign: 'center',
            top: 50,
            left: 60,
            width: 120,
            breakWord: true,
            MaxLineNumber: 1
        },
        // text3
        {
            type: 'text',
            content: data.c31,
            fontSize: 18,
            color: '#444',
            textAlign: 'center',
            top: 50,
            left: 247.5,
            width: 240,
            breakWord: true,
            MaxLineNumber: 1
        },
        // text4
        {
            type: 'text',
            content: data.c41,
            fontSize: 24,
            color: '#444',
            textAlign: 'center',
            top: 95,
            left: 60,
            bolder: true
        },
        {
            type: 'text',
            content: data.c51,
            fontSize: 18,
            color: '#444',
            textAlign: 'center',
            top: 125,
            left: 60
        },
        {
            type: 'image',
            url: `${_App.app_host}/tss/img/api/bar/${data.c61}.png?size=2`,
            top: 85,
            left: 130,
            height: 70,
            width: 235
        },
        // rect1
        {
            type: 'rect',
            background: '#444',
            top: 161,
            left: 30,
            width: 1,
            height: 109
        },
        // rect2
        {
            type: 'rect',
            background: '#444',
            top: 271,
            left: 30,
            width: 1,
            height: 99
        },
        // text6
        {
            type: 'text',
            content: data.c71,
            fontSize: 22,
            color: '#444',
            textAlign: 'center',
            top: 205,
            left: 15,
            bolder: true
        },
        // text7
        {
            type: 'text',
            content: [2, 3, 4, 5, 6, 7, 8].map(i => data[`c7${i}`]).filter(i => i).join(' '),
            fontSize: 22,
            color: '#444',
            top: 180,
            left: 40,
            bolder: true
        },
        // text8
        {
            type: 'text',
            content: [
                [1, 2, 3, 4, 5,6 ,7, 8].map(i => data[`c8${i}`]).filter(i => i).join(' '), [1, 2, 3, 4, 5,6, 7, 8].map(i => data[`c16${i}`]).filter(i => i).join(' ')
            ].join(' '),
            fontSize: 18,
            color: '#444',
            textAlign: 'left',
            top: 210,
            left: 40,
            width: 315,
            breakWord: true,
            MaxLineNumber: 3,
            lineHeight: 24,
        },
        {
            type: 'text',
            content: data.c126,
            fontSize: 16,
            color: '#444',
            textAlign: 'left',
            top: 420,
            left: 5,
            width: 365,
            breakWord: true,
            MaxLineNumber: 3,
            lineHeight: 24,
        },
        {
            type: 'text',
            content: '客户签收：',
            fontSize: 16,
            color: '#444',
            textAlign: 'left',
            top: 375,
            left: 260,
            width: 115,
            breakWord: true,
            MaxLineNumber: 3,
            lineHeight: 24,
        },

        // text9
        {
            type: 'text',
            content: data.c91,
            fontSize: 18,
            color: '#444',
            textAlign: 'center',
            top: 310,
            left: 15,
            bolder: true
        },
        // text10
        {
            type: 'text',
            content: [2, 3, 4, 5, 6, 7, 8].map(i => data[`c9${i}`]).filter(i => i).join(' '),
            fontSize: 18,
            color: '#444',
            top: 285,
            left: 40,
            bolder: true
        },
        // text11
        {
            type: 'text',
            content: [
                [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c10${i}`] && data[`c10${i}`].replace(/\&nbsp\;/g, ' ')).filter(i => i).join(' '), [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c17${i}`] && data[`c17${i}`].replace(/\&nbsp\;/g, ' ')).filter(i => i).join(' ')
            ].join(' '),
            fontSize: 18,
            color: '#444',
            top: 310,
            left: 40,
            width: 315,
            breakWord: true,
            MaxLineNumber: 3,
            lineHeight: 24
        },
        // {
        //   type: 'text',
        //   content: [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c12${i}`]).filter(i=>i).join('-'),
        //   fontSize: 16,
        //   color: '#444',
        //   top: 420,
        //   left: 5,
        //   width: 365,
        //   breakWord: true,
        //   MaxLineNumber: 2
        // },
        {
            type: 'text',
            content: data.c141,
            fontSize: 16,
            color: '#444',
            top: 495,
            left: 5,
            width: 235,
            breakWord: true,
            MaxLineNumber: 3
        },
        {
            type: 'text',
            content: [1, 2, 3, 4, 5, 7, 8].map(i => data[`c12${i}`] && data[`c12${i}`].replace(/\&nbsp\;/g, ' ')).filter(i => i).join(' '),
            fontSize: 16,
            color: '#444',
            top: 380,
            left: 5,
            width: 365,
            breakWord: true,
            MaxLineNumber: 2
        },
        {
            type: 'text',
            content: [1, 2, 3, 4, 5, 6, 7, 8].map(i => data[`c13${i}`] && data[`c13${i}`].replace(/\&nbsp\;/g, ' ')).filter(i => i).join(' '),
            fontSize: 16,
            color: '#444',
            top: 460,
            left: 5,
            width: 235,
            breakWord: true,
            MaxLineNumber: 1
        },
        {
            type: 'image',
            // url: `${_App.app_host}/tss/img/api/qrbar/1?appId=${_App.app_id}&page=pages/homepage/homepage/homepage&onlyQparam=true&qparam=1,2,3,os,${order.code}&uName=${_App.user.uName}&uToken=${_App.user.uToken}`,
            url: `${_App.app_host}/tss/img/api/qrbar/1?msg=${_App.app_host}?code=${data.c61}&uName=${_App.user.uName}&uToken=${_App.user.uToken}`,
            top: 451,
            left: 263,
            height: 105,
            width: 105
        },
        // {
        //   type: 'rect',
        //   background: '#eee',
        //   top: 451,
        //   left: 258,
        //   height: 105,
        //   width: 120
        // },
    ]
})

module.exports = {
    FilterList,
    SearchLabel,
    OrderList,
    OrderStatusColor,
    painting,
    painting_032
}
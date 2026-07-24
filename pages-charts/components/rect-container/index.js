// pages-charts/components/rect-container/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        boxTitle:{
            type:String,
            value:"今日运营情况"
        },
        title:{
            type:Object,
            value:{
                title:"营业额",
                value:40.7,
                unit:"万元"
            }
        },
        list: {
            type: Array,
            value: [{
                    title: "今日件数",
                    value: 29385,
                    unit: "件"
                },
                {
                    title: "库存件数",
                    value: 73798,
                    unit: "件"
                },
                {
                    title: "今日吨数",
                    value: 1024.0,
                    unit: "T"
                },
                {
                    title: "库存吨数",
                    value: 2262.1,
                    unit: "T"
                },
            ]
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})
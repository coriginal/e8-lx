import {
    formatDate
} from '../../utils/util'
Component({
    options: {
        styleIsolation: 'apply-shared',
    },
    /**
     * 组件的属性列表
     */
    properties: {
        showPickTime: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        tabList: [{
                title: '今天',
                code: 0,
                child: [],
                childChoosed: ''
            },
            {
                title: '明天',
                code: 1,
                child: [],
                childChoosed: ''
            },
            {
                title: '后天',
                code: 2,
                child: [],
                childChoosed: ''
            },
        ],
        current: 0
    },
    ready() {
        const getHours = new Date().getHours()
        let time = ['07', '08', '09', 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
        let countHours = 13
        if (getApp().globalData.user.domain == 'D717') {
            time = ['00', '01', '02', '03', '04', '05', '06', ...time, 23, 24]
            countHours = 22
        }
        const tabList = this.data.tabList
        tabList.forEach(item => {
            time.forEach((times, idx) => {
                if (idx <= countHours) {
                    if (item.code == 0 && (getApp().globalData.user.domain == 'D717' ? times < getHours - 1 : times < getHours)) {
                        //console.log(times, getHours)
                    } else {
                        item.child.push({
                            label: `${times}:00~${time[idx + 2]}:00`,
                            choosed: false
                        })
                    }
                }
            })
        })
        this.setData({
            tabList
        })
    },
    methods: {
        close() {
            this.setData({
                showPickTime: false
            })
        },
        changeTabs(e) {
            const {
                key
            } = e.detail
            this.setData({
                current: key
            })
        },
        choosedTime(e) {
            const {
                id
            } = e.currentTarget
            const {
                current
            } = this.data
            this.setData({
                [`tabList[${current}].childChoosed`]: Number(id)
            })
        },
        confirm(e) {
            const todayTimes = new Date().getTime()
            const {
                current,
                tabList
            } = this.data
            const {
                code,
                child,
                childChoosed
            } = tabList[current]
            if (childChoosed === "") {
                this.triggerEvent('change')
                return
            }
            const choosedTime = child[childChoosed].label
            const date = formatDate(todayTimes + 86400000 * code, 'yyyy-MM-dd')
            const exportDate = `${date} ${choosedTime}`
            this.triggerEvent('change', exportDate)
        }
    }
})
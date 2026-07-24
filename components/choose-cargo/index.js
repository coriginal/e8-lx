Component({
    options: {
        styleIsolation: 'apply-shared',
    },
    /**
     * 组件的属性列表
     */
    properties: {
        showPickCargo: {
            type: Boolean,
            value: false
        },
        cargoList: {
            type: Array,
            value: []
        },
        current: {
            type: String,
            value: '0'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },
    ready() {

    },
    methods: {
        onClose() {
            this.setData({
                showPickCargo: false
            })
        },
        choosedCargo(e) {
            console.log(e)
            this.setData({
                current: e.currentTarget.id
            })
        },
        confirm(e) {
            const {
                current,
                cargoList
            } = this.data
            this.setData({
                current: e.currentTarget.id
            })
            this.triggerEvent('cargoChange', current)
        },
        search(e) {
            console.log(e)
            var {
                cargoList
            } = this.data
            var item = cargoList[0].cargo ? "cargo" : "name"
            if (e.detail.value == "") {
                cargoList = cargoList.map(obj => ({
                    ...obj,
                    hidden: false
                }))
            } else {
                cargoList = cargoList.map(obj => ({
                    ...obj,
                    hidden: true
                }))
                for (var i = 0; i < cargoList.length; i++) {
                    console.log(cargoList[i][item].indexOf(e.detail.value) != -1)
                    if (cargoList[i][item].indexOf(e.detail.value) != -1) {
                        cargoList[i].hidden = false
                    }
                }
            }
            this.setData({
                cargoList: cargoList
            })
        }
    }
})
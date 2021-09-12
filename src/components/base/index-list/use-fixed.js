import { ref, watch, nextTick, computed } from 'vue'

export default function useFixed(props) {
    // 层高
    const TITLE_HEIGHT = 30
    // 利用ul中的ref函数拿到DOM元素
    const groupRef = ref(null)
    // 各个group的高度区间数组创建
    // 这里使用ref []只是为了给一个默认值为[]
    const listHeights = ref([])
    // 滚动的实时Y值
    const scrollY = ref(0)
    // 当前的索引值
    const currentIndex = ref(0)
    // 下一个组和当前组的距离
    const distance = ref(0)

    // 根据索引得到fixedttile值
    const fixedTitle = computed(() => {
        if (scrollY.value < 0) {
            return ''
        }
        const currentGroup = props.data[currentIndex.value]
        // 做一层保护
        return currentGroup ? currentGroup.title : ''
    })

    // 判断是否要发生偏移以及偏移量计算和实现
    const fixedStyle = computed(() => {
        const distanceVal = distance.value
        const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0
        return {
            transform: `translate3d(0, ${diff}px, 0)`
        }
    })

    // 监听props.data数据的变化
    watch(() => props.data, async () => {
        // data变化之后DOM还没有发生变化，因此需要先用一个nextTick
        await nextTick()
        calculate()
    })

    // 监听scrollY相当于在监听滚动事件
    watch(scrollY, (newY) => {
        const listHeightsVal = listHeights.value
        for (let i = 0; i < listHeightsVal.length - 1; i++) {
            const heightTop = listHeightsVal[i]
            const heightBottom = listHeightsVal[i + 1]
            if (newY >= heightTop && newY <= heightBottom) {
                currentIndex.value = i
                distance.value = heightBottom - newY
            }
        }
    })
    // 实时滚动的Y值从Scroll组件中得到
    // 设置probeType属性为3
    // 求解列表高度函数
    function calculate() {
        // 读取其Children
        const list = groupRef.value.children
        // 定义局部变量listHeightsVal避免多次重复使用
        const listHeightsVal = listHeights.value
        // 第一个高度给个0，形成区间
        let height = 0

        // 初始化操作
        listHeightsVal.length = 0
        listHeightsVal.push(height)

        // 循环赋值
        for (let i = 0; i < list.length; i++) {
            // 因为越往下高度是一个累加的数值
            // clientHeight函数用于得到DOM的高度值
            height += list[i].clientHeight
            listHeightsVal.push(height)
        }
    }
    function onScroll(pos) {
        scrollY.value = -pos.y
    }
    return {
        groupRef,
        onScroll,
        fixedTitle,
        fixedStyle,
        currentIndex
    }
}

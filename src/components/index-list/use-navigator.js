import { ref, computed } from 'vue'

export default function useNavigator(props, groupRef) {
    const ANCHOR_HEIGHT = 18
    const scrollRef = ref(null)
    const titleList = computed(() => {
        return props.data.map((group) => {
            return group.title
        })
    })
    // 存储touch点位
    const touch = {}
    // e 是event缩写
    function onNavigatorTouchStart(e) {
        // 获取到事件作用的DOM对象
        // 让DOM添加data-index属性，然后在这里就可以通过dataset.index拿到索引
        const anchorIndex = parseInt(e.target.dataset.index)
        // 存储touch事件触发的点位的y坐标
        touch.y1 = e.touches[0].pageY
        touch.anchorIndex = anchorIndex
        scrollTo(anchorIndex)
    }

    function onNavigatorTouchMove(e) {
        // 存储touch事件拖动到的点位的y坐标
        touch.y2 = e.touches[0].pageY
        // 正数向下取整方法：y值插值除以高度得到移动了多少个组
        const delta = (touch.y2 - touch.y1) / ANCHOR_HEIGHT | 0
        // 使用touch.anchorIndex拿到初始anchorIndex，简单的闭包技巧，传递function内部数据
        const anchorIndex = touch.anchorIndex + delta
        scrollTo(anchorIndex)
    }

    function scrollTo(anchorIndex) {
        // 封装滚动逻辑
        // 读取其Children
        // 如果Nan就不滚动
        if (isNaN(anchorIndex)) {
            return
        }
        // 实际拖动产生的y值可能会超出导航栏范围，产生一些报错，因此需要对其添加边界条件
        anchorIndex = Math.max(0, Math.min(titleList.value.length - 1, anchorIndex))
        const targetEl = groupRef.value.children[anchorIndex]
        const scroll = scrollRef.value.scroll
        scroll.scrollToElement(targetEl, 0)
    }

    // 使用对象方式，为了以后return更多东西
    return {
        titleList,
        scrollRef,
        onNavigatorTouchStart,
        onNavigatorTouchMove
    }
}

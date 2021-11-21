import BScroll from '@better-scroll/core'
import PullUp from '@better-scroll/pull-up'
import ObserveDOM from '@better-scroll/observe-dom'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
BScroll.use(PullUp)
// 重复注册没关系，内部会做判断
BScroll.use(ObserveDOM)

export default function usePullUpLoad(requestData, preventPullUpLoad) {
    // 实例化scroll用的
    const scroll = ref(null)
    // 容器根节点
    const rootRef = ref(null)
    // 标志位，拉取过程判断
    const isPullUpLoad = ref(false)

    onMounted(() => {
        // 实例化
        const scrollVal = scroll.value = new BScroll(rootRef.value, {
            pullUpLoad: true, // 上拉加载的能力
            observeDOM: true, // 观测变化，自动刷新
            click: true // 允许列表点击
        })
        // 监听pullingup事件
        scrollVal.on('pullingUp', pullingUpHandler)

        async function pullingUpHandler() {
            if (preventPullUpLoad.value) {
                scrollVal.finishPullUp()
                return
            }
            isPullUpLoad.value = true
            await requestData()
            scrollVal.finishPullUp()
            scrollVal.refresh()
            isPullUpLoad.value = false
        }
    })
    onUnmounted(() => {
        scroll.value.destroy()
    })
    onActivated(() => {
        scroll.value.enable()
        scroll.value.refresh()
    })

    onDeactivated(() => {
        scroll.value.disable()
    })

    return {
        scroll,
        rootRef,
        isPullUpLoad
    }
}

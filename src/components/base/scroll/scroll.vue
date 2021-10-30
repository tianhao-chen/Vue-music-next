<template>
    <div ref="rootRef">
        <slot></slot>
    </div>
</template>

<script>
import useScroll from './use-scroll'
import { ref } from 'vue'
export default {
    name: 'scroll',
    props: {
        click: {
            type: Boolean,
            default: true
        },
        probeType: {
            type: Number,
            default: 0
        }
    },
    // 组件派发事件属性
    emits: ['scroll'],
    setup(props, { emit }) {
        const rootRef = ref(null)
        const { scroll } = useScroll(rootRef, props, emit)

        return {
            rootRef,
            scroll
        }
    }
}
</script>

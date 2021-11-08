<template>
    <teleport to="body">
        <transition name="slide-down">
            <div
            class="message"
            @click="hide"
            v-show="visible">
                <slot></slot>
            </div>
        </transition>
    </teleport>
</template>

<script>
import { ref } from 'vue'
export default {
    name: 'message',
    props: {
        delay: {
            type: Number,
            default: 5000
        }
    },
    setup(props) {
        const visible = ref(false)
        const timer = ref(null)
        function show() {
            visible.value = true
            clearTimeout(timer.value)
            timer.value = setTimeout(() => {
                hide()
            }, props.delay)
        }
        function hide() {
            clearTimeout(timer.value)
            visible.value = false
        }
        return {
            visible,
            show,
            hide
        }
    }
}
</script>

<style lang="scss" scoped>
.message {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 400;
    background: $color-dialog-background;
    &.slide-down-enter-active, &.slide-down-leave-active {
        transition: all 0.3s;
    }
    &.slide-down-enter-from, &.slide-down-leave-to {
        transform: translate3d(0, -100%, 0);
    }
}
</style>

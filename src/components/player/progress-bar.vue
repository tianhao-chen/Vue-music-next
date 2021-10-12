<template>
    <div class="progress-bar"
    @click="onClick">
        <div class="bar-inner">
            <div class="progress" :style="progressStyle"
            ref="progress"></div>
            <div class="progress-btn-wrapper" :style="btnStyle"
            @touchstart.prevent = "onTouchStart"
            @touchmove.prevent = "onTouchMove"
            @touchend.prevent = "onTouchEnd"
            >
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
const progressBtnWidth = 16
// options api
export default {
    name: 'progress-bar',
    emits: ['progress-changing', 'progress-changed'],
    props: {
        // 接受progress进度
        progress: {
            type: Number,
            default: 0
        }
    },
    data() {
        // 宽度通过offset来定义
        return {
            offset: 0
        }
    },
    computed: {
        progressStyle() {
            return `width: ${this.offset}px`
        },
        btnStyle() {
            return `transform: translate3d(${this.offset}px, 0, 0)`
        }

    },
    watch: {
        // watch 的函数名为监听的变量名，这里是progress，可以传入newVal和oldVal两个参数
        progress(newProgress) {
            this.setOffset(newProgress)
        }
    },
    created() {
        // 共享变量而并不需要观测变化，因此放在created函数中，data中都是响应式的，会造成性能浪费
        this.touch = {}
    },
    methods: {
        onTouchStart(e) {
            this.touch.x1 = e.touches[0].pageX
            // 进度条初始宽度
            this.touch.beginWidth = this.$refs.progress.clientWidth
        },
        onTouchMove(e) {
            const delta = e.touches[0].pageX - this.touch.x1
            const tempWidth = this.touch.beginWidth + delta
            const barWidth = this.$el.clientWidth - progressBtnWidth
            const progress = Math.min(1, Math.max(tempWidth / barWidth, 0))
            this.offset = barWidth * progress
            this.$emit('progress-changing', progress)
        },
        onTouchEnd() {
            const barWidth = this.$el.clientWidth - progressBtnWidth
            const progress = this.$refs.progress.clientWidth / barWidth
            this.$emit('progress-changed', progress)
        },
        onClick(e) {
            const rect = this.$el.getBoundingClientRect()
            // rect.left = 进度条开始位置
            const offsetWidth = e.pageX - rect.left
            const barWidth = this.$el.clientWidth - progressBtnWidth
            const progress = offsetWidth / barWidth
            this.$emit('progress-changed', progress)
        },
        setOffset(progress) {
            // 监听的对象也自然可以找到他对应的el，变化时组件已经渲染了
            const barWidth = this.$el.clientWidth - progressBtnWidth
            this.offset = barWidth * progress
        }
    }
}
</script>

<style lang="scss" scoped>
.progress-bar {
    height: 30px;
    .bar-inner {
        position: relative;
        top: 13px;
        height: 4px;
        background: rgba(0,0,0,0.3);
        .progress {
            position: absolute;
            height: 100%;
            background: $color-theme;
        }
        .progress-btn-wrapper {
            position: absolute;
            left: -8px;
            top: -13px;
            width: 30px;
            height: 30px;
            .progress-btn {
                position: relative;
                top: 7px;
                left: 7px;
                box-sizing: border-box;
                width: 16px;
                height: 16px;
                border: 3px solid $color-text;
                border-radius: 50%;
                background: $color-theme;
            }
        }
    }
}
</style>

<template>
    <div class="player">
        <div
        class="normal-player"
        v-show="fullScreen">
            <template v-if="currentSong">
                <div class="background">
                    <img :src="currentSong.pic">
                </div>
                <div class="top">
                    <div
                    class="back"
                    @click="goBack">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title">{{currentSong.name}}</h1>
                    <h2 class="subtitle">{{currentSong.singer}}</h2>
                </div>
                <div class="bottom">
                    <div class="operators">
                        <div class="icon i-left" >
                            <i @click="changeMode" :class="modeIcon"></i>
                        </div>
                        <div class="icon i-left" :class="disableCls">
                            <i class="icon-prev"  @click="prev"></i>
                        </div>
                        <div
                        class="icon i-center" :class="disableCls">
                            <i :class="playIcon" @click="togglePlay"></i>
                        </div>
                        <div class="icon i-right" :class="disableCls">
                            <i class="icon-next" @click="next"></i>
                        </div>
                        <div class="icon i-right" >
                            <i @click="toggleFavorite(currentSong)"
                            :class="getFavoriteIcon(currentSong)"></i>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <audio
        ref="audioRef"
        @pause="pause"
        @canplay="ready"
        @error="error"
        ></audio>
    </div>
</template>

<script>
// 不能使用mapActions，因为这里逻辑比较复杂，计划使用composition API来写
// 没有this来给我们读，所以使用useStore
import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorite'

export default {
    name: 'player',
    // fullScreen以及currentSong的数据均在stroe中定义了方法
    setup() {
        // data
        const audioRef = ref(null)
        const songReady = ref(false)

        // fullScreen的变化应当为响应式的，这样一旦state里的属性发生变化就会改变
        // useStore返回的是createStore里的属性 vuex
        const store = useStore()
        const fullScreen = computed(() => store.state.fullScreen)
        const currentSong = computed(() => store.getters.currentSong)
        const currentIndex = computed(() => store.state.currentIndex)
        const playing = computed(() => store.state.playing)
        const playlist = computed(() => store.state.playlist)

        // hooks
        const { modeIcon, changeMode } = useMode()
        const { getFavoriteIcon, toggleFavorite } = useFavorite()

        // computed 因为playing是一个计算属性，需要.value获取到值
        const playIcon = computed(() => {
            return playing.value ? 'icon-pause' : 'icon-play'
        })
        const disableCls = computed(() => {
            return songReady.value ? '' : 'disable'
        })

        // watch API
        // 歌曲播放
        watch(currentSong, (newSong) => {
            if (!newSong.id || !newSong.url) {
                // newSong为空
                return
            }
            // 还没设url，肯定没准备好，因此要定义false
            songReady.value = false
            const audioEl = audioRef.value
            audioEl.src = newSong.url
            audioEl.play()
        })
        // 歌曲暂停/续播
        watch(playing, (newPlaying) => {
            if (!songReady.value) {
                return
            }
            const audioEl = audioRef.value
            playing.value ? audioEl.play() : audioEl.pause()
        })

        // methods
        // 收缩fullScreen
        function goBack() {
            return store.commit('setFullScreen', false)
        }
        // togglePlay切换播放状态
        function togglePlay() {
            if (!songReady.value) {
                return
            }
            store.commit('setPlayingState', !playing.value)
        }
        // 监听原生audio非交互pause的事件，播放完或者电脑待机
        function pause() {
            store.commit('setPlayingState', false)
        }
        // 前进
        function prev() {
            const list = playlist.value
            // 无数据情况
            if (!list.length || !songReady.value) {
                return
            }
            if (list.length === 1) {
                loop()
            } else {
                let index = currentIndex.value - 1
                if (index === -1) {
                    index = list.length - 1
                }
                store.commit('setCurrentIndex', index)
                // 暂停状态，点了前进后退之后开始播放
                if (!playing.value) {
                    store.commit('setPlayingState', true)
                }
            }
        }
        // 后退
        function next() {
            const list = playlist.value
            // 无数据情况
            if (!list.length || !songReady.value) {
                return
            }
            // 如果只有一首歌边界条件
            if (list.length === 1) {
                loop()
            } else {
                let index = currentIndex.value + 1
                if (index === list.length) {
                    index = 0
                }
                store.commit('setCurrentIndex', index)
                // 暂停状态，点了前进后退之后开始播放
                if (!playing.value) {
                    store.commit('setPlayingState', true)
                }
            }
        }
        // canplay回调函数，歌曲准备好时触发，返回true
        function ready() {
            if (songReady.value) {
                return
            }
            songReady.value = true
        }
        // 防止一首歌有问题而无法切换的问题
        function error() {
            songReady.value = true
        }
        // 循环辅助函数
        function loop() {
            const audioEl = audioRef.value
            audioEl.currentTime = 0
            audioEl.play()
        }

        return {
            audioRef,
            disableCls,
            fullScreen,
            currentSong,
            goBack,
            playIcon,
            togglePlay,
            pause,
            prev,
            next,
            ready,
            error,
            // mode
            modeIcon,
            changeMode,
            // favorite
            getFavoriteIcon,
            toggleFavorite
        }
    }
}
</script>

<style lang="scss" scoped>
.player {
    .normal-player {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 150;
        background: $color-background;
        .background {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            // 不透明度
            opacity: 0.6;
            filter: blur(20px);

            img {
                width: 100%;
                height: 100%;
            }
        }
        .top {
            position: relative;
            margin-bottom: 25px;
            .back {
                position: absolute;
                top: 0;
                left: 6px;
                z-index: 50;
            }
            .icon-back {
                display: block;
                padding: 9px;
                font-size: $font-size-large-x;
                color: $color-theme;
                transform: rotate(-90deg);
            }
            .title {
                width: 70%;
                margin: 0 auto;
                line-height: 40px;
                text-align: center;
                @include no-wrap();
                font-size: $font-size-large;
                color: $color-text;
            }
            .subtitle {
                line-height: 20px;
                text-align: center;
                font-size: $font-size-medium;
                color: $color-text;
            }
        }
        .bottom {
            position: absolute;
            bottom: 50px;
            width: 100%;
            .operators {
                display: flex;
                align-items: center;
                .icon {
                    flex: 1;
                    color: $color-theme;
                    &.disable {
                        color: $color-theme-d;
                    }
                    i {
                    font-size: 30px;
                    }
                }
                .i-left {
                    text-align: right;
                }
                .i-center {
                    // 左右间距
                    padding: 0 20px;
                    text-align: center;
                    i {
                        font-size: 40px;
                    }
                }
                .i-right {
                    text-align: left;
                    .icon-favorite {
                        color: $color-sub-theme;
                    }
                }
            }
        }
    }
}
</style>

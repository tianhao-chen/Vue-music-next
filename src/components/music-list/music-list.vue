<template>
<div class="music-list">
    <div
    class="back"
    @click="goBack">
        <i class="icon-back"></i>
    </div>
    <h1 class="title">{{ title }}</h1>
    <div
    class="bg-image"
    :style="bgImageStyle"
    ref="bgImage">
        <div
        class="play-btn-wrapper"
        :style="playBtnStyle"
        >
            <div
            v-show="songs.length > 0"
            class="play-btn"
            @click="random">
                <i class="icon-play"></i>
                <span class="text">随机播放全部</span>
            </div>
        </div>
        <div
        class="filter"
        :style="filterStyle"
        ></div>
    </div>
    <scroll
    class="list"
    :style="scrollStyle"
    v-loading:[loadingText] = "loading"
    v-no-result:[noResultText]="noResult"
    :probeType="3"
    @scroll="onScroll">
        <div class ="song-list-wrapper">
            <song-list
            :songs="songs"
            @select="selectItem">
            </song-list>
        </div>
    </scroll>
</div>
</template>

<script>
import Scroll from '../wrap-scroll'
import SongList from '@/components/base/song-list/song-list'
import { mapActions, mapState } from 'vuex'

const RESERVED_HEIGHT = 40

export default {
  components: {
      Scroll,
      SongList
   },
   // 接收3个props：songs歌曲列表，title显示标题，pic背景图片
    props: {
        songs: {
            type: Array,
            default() {
                return []
            }
        },
        title: String,
        pic: String,
        loading: Boolean,
        noResultText: {
            type: String,
            default: '出错啦'
        }
    },
    data() {
        return {
            imageHeight: 0,
            scrollY: 0,
            maxTranslateY: 0,
            loadingText: `载入${this.title}的歌单中...`
        }
    },
    computed: {
        noResult() {
            return !this.loading && !this.songs.length
        },
        bgImageStyle() {
            const scrollY = this.scrollY
            // Default
            let zIndex = 0
            // 10:7宽高比
            let paddingTop = '70%'
            let height = 0
            let translateZ = 0

            if (scrollY > this.maxTranslateY) {
                zIndex = 10
                paddingTop = 0
                height = `${RESERVED_HEIGHT}px`
                translateZ = 1
            }

            let scale = 1
            if (scrollY < 0) {
                scale = 1 + Math.abs(scrollY / this.imageHeight)
            }

            return {
                paddingTop,
                height,
                zIndex,
                backgroundImage: `url(${this.pic})`,
                transform: `scale(${scale})translateZ(${translateZ}px)`
            }
        },
        scrollStyle() {
            const bottom = this.playlist.length ? '60px' : '0'
            return {
                top: `${this.imageHeight}px`,
                bottom
            }
        },
        filterStyle() {
            // blur为模糊不清的意思
            let blur = 0
            // 减少this.xxx的依赖收集过程，定义了再用就避免多次触发过程实现优化
            const scrollY = this.scrollY
            const imageHeight = this.imageHeight
            if (scrollY >= 0) {
                blur = Math.min(this.maxTranslateY / imageHeight, scrollY / imageHeight) * 20
            }
            return {
                backdropFilter: `blur(${blur}px)`
            }
        },
        playBtnStyle() {
            let display = ''
            if (this.scrollY >= this.maxTranslateY) {
                display = 'none'
            }
            return {
                display
            }
        },
        ...mapState([
            'playlist'
        ])
    },
    // 拿到图片高度的时机:MOUNTED
    mounted() {
        this.imageHeight = this.$refs.bgImage.clientHeight
        // 最大滚动高度
        this.maxTranslateY = this.imageHeight - RESERVED_HEIGHT
    },
    // 监听事件回调函数定义在method里面
    methods: {
        goBack() {
            // router back方法，回到上一层
            this.$router.back()
        },
        onScroll(pos) {
            this.scrollY = -pos.y
        },
        selectItem({ song, index }) {
            this.selectPlay({
                list: this.songs,
                index
            })
        },
        random() {
            this.randomPlay(this.songs)
        },
        ...mapActions([
            'selectPlay',
            'randomPlay'
        ])
    }
}
</script>

<style lang="scss" scoped>
.music-list {
    position: relative;
    height: 100%;
    .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 20;
        transform: translateZ(2px);
        .icon-back {
            display: block;
            padding: 10px;
            font-size: $font-size-large-x;
            color: $color-theme;
        }
    }
    .title {
        position: absolute;
        top: 0;
        left: 10%;
        width: 80%;
        z-index: 20;
        transform: translateZ(2px);
        @include no-wrap();
        text-align: center;
        line-height: 40px;
        font-size: $font-size-large;
        color: $color-text;
    }
    .bg-image {
        position:relative;
        transform-origin: top;
        background-size: cover;
        .play-btn-wrapper {
            position: absolute;
            bottom: 20px;
            z-index: 10;
            width: 100%;
            .play-btn {
                box-sizing: border-box;
                width: 135px;
                padding: 7px 0;
                margin: 0 auto;
                text-align: center;
                border: 2px solid $color-theme;
                border-radius: 100px;
                font-size: 0;
            }
            .icon-play {
                display: inline-block;
                vertical-align: middle;
                margin-right: 6px;
                font-size: $font-size-large-x;
            }
            .text {
                display: inline-block;
                vertical-align: middle;
                font-size: $font-size-medium;
            }
        }
        .filter {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(7,17,27,0.4);
        }
    }
    .list {
        position: absolute;
        bottom: 0;
        width: 100%;
        z-index: 0;
        .song-list-wrapper {
            padding: 20px 30px;
            background: $color-background;
        }
    }
}
</style>

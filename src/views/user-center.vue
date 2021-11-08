<template>
    <div class="user-center">
        <div class="back" @click="Back">
            <i class="icon-back"></i>
        </div>
        <div class="switches-wrapper">
            <switches
            :items="['我喜欢的', '最近播放']"
            v-model="currentIndex"
            ></switches>
        </div>
        <div class="play-btn"
        v-if="currentList.length"
        @click="random">
            <i class="icon-play"></i>
            <span class="text">随机播放全部</span>
        </div>
        <div class="list-wrapper"
        v-no-result:[noResultText]="noResult">
            <scroll class="list-scroll" v-if="currentIndex === 0" ref="scrollRef">
                <div class="list-inner">
                    <song-list
                    :songs="favoriteList"
                    @select="selectSong"></song-list>
                </div>
            </scroll>
            <scroll class="list-scroll" v-if="currentIndex === 1" ref="scrollRef">
                <div class="list-inner">
                    <song-list
                    :songs="playHistory"
                    @select="selectSong"></song-list>
                </div>
            </scroll>
        </div>
    </div>
</template>

<script>
import SongList from '@/components/base/song-list/song-list'
import Switches from '@/components/base/switches/switches'
import Scroll from '@/components/wrap-scroll'
import { useStore } from 'vuex'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
export default {
    name: 'user-center',
    components: {
        SongList,
        Switches,
        Scroll
    },
    setup() {
        const currentIndex = ref(0)
        const scrollRef = ref(null)
        const store = useStore()
        const router = useRouter()
        const favoriteList = computed(() => store.state.favoriteList)
        const playHistory = computed(() => store.state.playHistory)
        function Back() {
            router.back()
        }
        const currentList = computed(() => {
            return currentIndex.value ? playHistory.value : favoriteList.value
        })
        const noResult = computed(() => {
            return !currentList.value.length
        })
        const noResultText = computed(() => {
            return currentIndex.value ? '你还没有收藏任何歌曲哟' : '你还没播放过任何歌曲哦'
        })
        function selectSong({ song }) {
            store.dispatch('addSong', song)
        }
        function random() {
            store.dispatch('randomPlay', currentList.value)
        }
        return {
            currentIndex,
            scrollRef,
            favoriteList,
            playHistory,
            currentList,
            noResult,
            noResultText,
            Back,
            selectSong,
            random
        }
    }
}
</script>

<style lang="scss" scoped>
  .user-center {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 100%;
    background: $color-background;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 50;
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .switches-wrapper {
      margin: 10px 0 30px 0;
    }
    .play-btn {
      box-sizing: border-box;
      width: 135px;
      padding: 7px 0;
      margin: 0 auto;
      text-align: center;
      border: 1px solid $color-text-l;
      color: $color-text-l;
      border-radius: 100px;
      font-size: 0;
      .icon-play {
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
        font-size: $font-size-medium-x;
      }
      .text {
        display: inline-block;
        vertical-align: middle;
        font-size: $font-size-small;
      }
    }
    .list-wrapper {
      position: absolute;
      top: 110px;
      bottom: 0;
      width: 100%;
      .list-scroll {
        height: 100%;
        overflow: hidden;
        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }
</style>

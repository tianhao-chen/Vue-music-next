<template>
<teleport to="body">
    <transition name="slide">
        <div class="add-song" v-show="visible">
            <div class="header">
                <h1 class="title">添加歌曲到队列</h1>
                <div class="close" @click="hide">
                    <i class="icon-close"></i>
                </div>
            </div>
            <div class="search-input-wrapper">
                <search-input
                v-model="query"
                placeholder="搜索歌曲"></search-input>
            </div>
            <div v-show="!query">
                <switches
                :items="['最近播放','搜索历史']"
                v-model="currentIndex">
                </switches>
                <div class="list-wrapper">
                    <scroll class="list-scroll"
                    ref="scrollRef"
                    v-if="currentIndex === 0">
                        <div class="list-inner">
                            <song-list
                            :songs="playHistory"
                            @select="selectSongBySongList"></song-list>
                        </div>
                    </scroll>
                    <scroll class="list-scroll"
                    ref="scrollRef"
                    v-if="currentIndex === 1">
                        <div class="list-inner">
                            <search-list
                            :searches="searchHistory"
                            :showDelete="false"
                            @select="addQuery"></search-list>
                        </div>
                    </scroll>
                </div>
            </div>
            <div class="search-result" v-show="query">
                <suggest
                :query="query"
                :showSinger="false"
                @select-song="selectSongBySuggest"></suggest>
            </div>
            <message ref="messageRef">
                <div class="message-title">
                    <i class="icon-ok"></i>
                    <span class="text">1首歌曲已经添加入播放列表</span>
                </div>
            </message>
        </div>
    </transition>
</teleport>
</template>

<script>
import SearchInput from '@/components/search/search-input'
import Suggest from '@/components/search/suggest'
import SearchList from '../search/search-list.vue'
import Switches from '@/components/base/switches/switches'
import SongList from '@/components/base/song-list/song-list'
import Scroll from '@/components/base/scroll/scroll'
import useSearchHistory from '@/components/search/use-search-history'
import { ref, computed, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import Message from '../base/message/message.vue'

export default {
    name: 'add-song',
    components: {
        SearchInput,
        Suggest,
        Scroll,
        SongList,
        SearchList,
        Switches,
        Message
    },
    setup() {
        const visible = ref(false)
        const query = ref('')
        const currentIndex = ref(0)
        const scrollRef = ref(null)
        const messageRef = ref(null)
        const store = useStore()
        const searchHistory = computed(() => store.state.searchHistory)
        const playHistory = computed(() => store.state.playHistory)

        const { saveSearch } = useSearchHistory()

        watch(query, async () => {
            if (!query.value) {
                await nextTick()
                scrollRefresh()
            }
        })

        async function show() {
            await nextTick()
            scrollRefresh()
            visible.value = true
        }
        function hide() {
            visible.value = false
        }
        function addQuery(item) {
            query.value = item
        }
        function selectSongBySongList({ song }) {
            addSong(song)
        }
        function selectSongBySuggest(song) {
            addSong(song)
            saveSearch(query.value)
        }
        function addSong(song) {
            store.dispatch('addSong', song)
            messageRef.value.show()
        }
        function scrollRefresh() {
            scrollRef.value.scroll.refresh()
        }
        return {
            visible,
            query,
            scrollRef,
            messageRef,
            currentIndex,
            searchHistory,
            playHistory,
            show,
            hide,
            addQuery,
            selectSongBySongList,
            selectSongBySuggest
        }
    }
}
</script>

<style lang="scss" scoped>
    .add-song {
        position: fixed;
        top: 0;
        bottom: 0;
        width: 100%;
        z-index: 300;
        background: $color-background;
        .header {
            position: relative;
            height: 44px;
            text-align: center;
            .title {
                line-height: 44px;
                font-size: $font-size-large;
                color: $color-text;
            }
            .close {
                position: absolute;
                top: 0;
                right: 8px;
                .icon-close {
                    display: block;
                    padding: 12px;
                    font-size: 20px;
                    color: $color-theme;
                }
            }
        }
        .search-input-wrapper {
            margin: 20px;
        }
        .list-wrapper {
            position: absolute;
            top: 165px;
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
        .search-result {
            position: fixed;
            top: 124px;
            bottom: 0;
            width: 100%;
        }
    }
    // slot组件的样式要在外面
    .message-title {
    text-align: center;
    padding: 18px 0;
    font-size: 0;
    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }
    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
</style>

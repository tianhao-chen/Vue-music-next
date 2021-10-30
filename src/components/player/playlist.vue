<template>
    <teleport to="body">
        <transition name="list-fade">
            <div
            class="playlist"
            v-show="visible && playlist.length"
            @click="hide">
                <div class="list-wrapper" @click.stop>
                    <div class="list-header">
                        <h1 class="title">
                            <i
                            class="icon"
                            :class="modeIcon"
                            @click="changeMode">
                            </i>
                            <span
                            class="text">
                            {{modeText}}
                            </span>
                            <span class="clear" @click="showConfirm">
                                <i class="icon-clear"></i>
                            </span>
                        </h1>
                    </div>
                    <div>
                        <scroll class="list-content"
                        ref="scrollRef">
                            <transition-group
                            ref="listRef"
                            name="list"
                            tag="ul">
                                <li
                                class="item"
                                v-for="song in sequenceList"
                                :key="song.id"
                                @click="selectItem(song)">
                                <i class="current"
                                :class="getCurrentIcon(song)">
                                </i>
                                <span class="text">{{song.name}}</span>
                                <span class="favorite"
                                @click.stop="toggleFavorite(song)">
                                    <i :class="getFavoriteIcon(song)"></i>
                                </span>
                                <span class="delete" @click.stop="removeSong(song)"
                                :class="{'disable': removing}">
                                    <i class="icon-delete"></i>
                                </span>
                                </li>
                            </transition-group>
                        </scroll>
                    </div>
                    <div class="list-footer" @click="hide">
                        <span>Close</span>
                    </div>
                </div>
                <confirm
                ref = "confirmRef"
                text = "是否清空播放列表？"
                @confirm="confirmClean"
                @cancel="cancel"
                confirmBtnText= "清空"
                ></confirm>
            </div>
        </transition>
    </teleport>
</template>

<script>
import Scroll from '../base/scroll/scroll.vue'
import { computed, ref, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import useMode from './use-mode'
import useFavorite from './use-favorite'
import Confirm from '../base/confirm/confirm.vue'

export default {
    name: 'playlist',
    components: { Scroll, Confirm },
    setup() {
        // 定义响应式变量的初始值为false
        const visible = ref(false)
        const removing = ref(false)
        // dom
        const listRef = ref(null)
        const scrollRef = ref(null)
        const confirmRef = ref(null)
        // vuex: store
        const store = useStore()
        const playlist = computed(() => store.state.playlist)
        const sequenceList = computed(() => store.state.sequenceList)
        const currentSong = computed(() => store.getters.currentSong)

        // hooks
        const { modeIcon, modeText, changeMode } = useMode()
        const { getFavoriteIcon, toggleFavorite } = useFavorite()

        // watch
        watch(currentSong, async (newSong) => {
            if (!visible.value || !newSong.id) {
                return
            }
            await nextTick()
                scrollRefresh()
                scrollToCurrent()
        })
        // methods
        function hide() {
            visible.value = false
        }
        async function show() {
            visible.value = true
            await nextTick()
            // scrollRefresh 等正确dom渲染出来然后再次获取dom高度实现scroll的正确滚动
            scrollRefresh()
            scrollToCurrent()
        }
        function getCurrentIcon(song) {
            if (song.id === currentSong.value.id) {
                return 'icon-play'
            }
        }
        function scrollRefresh() {
            scrollRef.value.scroll.refresh()
        }
        function scrollToCurrent() {
            const index = sequenceList.value.findIndex((song) => {
                return song.id === currentSong.value.id
            })

            const target = listRef.value.$el.children[index]
            if (index === -1) {
                return
            }
            scrollRef.value.scroll.scrollToElement(target, 300)
        }
        function selectItem(song) {
            const index = playlist.value.findIndex((item) => {
                return item.id === song.id
            })
            store.commit('setCurrentIndex', index)
            store.commit('setPlayingState', true)
        }
        function removeSong(song) {
            // 避免多次点击触发bug
            if (removing.value === true) {
                return
            }
            removing.value = true
            store.dispatch('removeSong', song)
            setTimeout(() => {
                removing.value = false
            }, 300)
            if (!playlist.value.length) {
                hide()
            }
        }
        function showConfirm() {
            confirmRef.value.show()
        }
        function confirmClean() {
            store.dispatch('clearSongList')
            hide()
        }
        function cancel() {}
        return {
            visible,
            scrollRef,
            listRef,
            confirmRef,
            playlist,
            sequenceList,
            hide,
            show,
            selectItem,
            // mode
            modeIcon,
            modeText,
            changeMode,
            // favorite
            getFavoriteIcon,
            toggleFavorite,
            getCurrentIcon,
            // delete
            removeSong,
            removing,
            showConfirm,
            confirmClean,
            cancel
        }
    }
}
</script>

<style lang="scss" scoped>
    .playlist {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 200;
        background-color: $color-background-d;
        &.list-fade-enter-active, &.list-fade-leave-active {
            transition: opacity .3s;
            .list-wrapper {
                transition: all .3s;
            }
        }
        &.list-fade-enter-from, &.list-fade-leave-to {
            opacity: 0;
            .list-wrapper{
                transform: translate3d(0, 100%, 0);
            }
        }
        .list-wrapper {
            position: fixed;
            left: 0;
            bottom: 0;
            z-index: 210;
            width: 100%;
            background: $color-highlight-background;
            .list-header {
                position: relative;
                padding: 20px 30px 10px 20px;
                .title {
                    display: flex;
                    align-items: center;
                    .icon {
                        margin-right: 10px;
                        font-size: 24px;
                        color: $color-theme-d;
                    }
                    .text {
                        flex: 1;
                        font-size: $font-size-medium;
                        color: $color-text-l;
                    }
                }
            }
            .list-content {
                max-height: 240px;
                overflow: hidden;
                .item {
                    display: flex;
                    align-items: center;
                    height: 40px;
                    padding: 0 30px 0 20px;
                    overflow: hidden;
                    .current {
                        flex: 0 0 20px;
                        width: 20px;
                        font-size: $font-size-small;
                        color: $color-theme-d;
                    }
                    .text {
                        flex: 1;
                        @include no-wrap();
                        font-size: $font-size-medium;
                        color: $color-text-d;
                    }
                    .favorite {
                        @include extend-click();
                        margin-right: 15px;
                        font-size: $font-size-small;
                        color: $color-theme;
                        .icon-favorite {
                        color: $color-sub-theme;
                        }
                    }
                    .delete {
                        @include extend-click();
                        font-size: $font-size-small;
                        color: $color-theme;
                        &.disable {
                        color: $color-theme-d;
                        }
                    }
                }
            }
            .list-footer {
            text-align: center;
            line-height: 50px;
            background: $color-background;
            font-size: $font-size-medium-x;
            color: $color-text-l;
            }
        }
    }
</style>

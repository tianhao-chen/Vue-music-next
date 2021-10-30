<template>
    <div class="singer" v-loading:[loadingText] = "!singers.length">
        <index-list
        :data = "singers"
        @select="selectSinger"
        ></index-list>
        <router-view v-slot="{ Component }">
            <transition appear name="slide">
                <component :is="Component" :data="selectedSinger"/>
            </transition>
        </router-view>
    </div>
</template>

<script>
    import { getSingerList } from '@/service/singer'
    import IndexList from '@/components/index-list/index-list'
    import storage from 'good-storage'
    // 不加花括号的话，需要用export default
    import { SINGER_KEY } from '@/assets/js/constants'

    export default {
    name: 'singer',
    components: {
        IndexList
    },
    data() {
        return {
            singers: [],
            selectedSinger: null,
            loadingText: '载入歌手列表中...'
        }
    },
    async created() {
        const result = await getSingerList()
        this.singers = result.singers
    },
    methods: {
        selectSinger(item) {
            this.selectedSinger = item
            // 缓存选中的singer
            this.cacheSinger(item)
            // 路由跳转
            this.$router.push({
                path: `/singer/${item.mid}`
            })
        },
        cacheSinger(singer) {
            storage.session.set(SINGER_KEY, singer)
        }
    }
}
</script>

<style lang="scss" scoped>
.singer {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
}
</style>

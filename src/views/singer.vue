<template>
    <div class="singer" v-loading:[loadingText] = "!singers.length">
        <index-list
        :data = "singers"
        @select="selectSinger"
        ></index-list>
        <router-view :singer="selectedSinger"></router-view>
    </div>
</template>

<script>
    import { getSingerList } from '@/service/singer'
    import IndexList from '@/components/base/index-list/index-list'
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
            // 路由跳转
            this.$router.push({
                path: `/singer/${item.mid}`
            })
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

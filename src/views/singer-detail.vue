<template>
    <div class="singer-detail">
        <music-list
        :songs="songs"
        :title="title"
        :pic="pic"></music-list>
    </div>
</template>

<script>
import { getSingerDetail } from '@/service/singer'
import { processSongs } from '@/service/song'
import MusicList from '@/components/music-list/music-list'

export default {
    name: 'singer-detail',
    // 注册MusicList组件
    components: {
        MusicList
    },
    props: {
        singer: Object
    },
    // music-list组件使用需要3个props，songs，title，pic
    // data不是对象，是一个函数，因此需要return
    data() {
        return {
            songs: []
        }
    },
    // title 和 pic 都可以通过singer对象拿到（props中）=>this.singer
    // 使用计算属性定义，计算属性为对象，内部定义两个函数
    computed: {
        pic() {
            // 确保singer为空时不报错
            return this.singer && this.singer.pic
        },
        title() {
            return this.singer && this.singer.name
        }
    },
    async created() {
        const result = await getSingerDetail(this.singer)
        const songs = await processSongs(result.songs)
        // 对于data里的数据对象传递，需要this.songs =songs赋值
        this.songs = songs
        console.log(songs)
    }
}
</script>

<style lang="scss" scoped>
    .singer-detail {
        position: fixed;
        z-index: 10;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: $color-background;
    }
</style>

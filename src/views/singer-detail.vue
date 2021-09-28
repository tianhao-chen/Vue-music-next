<template>
    <div class="singer-detail">
        <music-list
        :songs="songs"
        :title="title"
        :pic="pic"
        :loading="loading"></music-list>
    </div>
</template>

<script>
import { getSingerDetail } from '@/service/singer'
import { processSongs } from '@/service/song'
import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
// 不加花括号的话，需要用export default
import { SINGER_KEY } from '@/assets/js/constants'

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
            songs: [],
            loading: true
        }
    },
    // title 和 pic 都可以通过singer对象拿到（props中）=>this.singer
    // 使用计算属性定义，计算属性为对象，内部定义两个函数
    computed: {
        computedSinger() {
            let ret = null
            const singer = this.singer
            if (singer) {
                // 如果有singer对象缓存了就直接用
                ret = singer
            } else {
                // 如果没有就get获取前面set的SINGERKEY
                const cachedSinger = storage.session.get(SINGER_KEY)
                // 是否有缓存+缓存mid是否匹配来给ret
                if (cachedSinger && cachedSinger.mid === this.$route.params.id) {
                    ret = cachedSinger
                }
            }
            return ret
        },
        pic() {
            const singer = this.computedSinger
            // 确保singer为空时不报错
            return singer && singer.pic
        },
        title() {
            const singer = this.computedSinger
            return singer && singer.name
        }
    },
    async created() {
        if (!this.computedSinger) {
            // 当修改了地址路由中的mid（mid不匹配）时返回上一级页面
            const path = this.$route.matched[0].path
            this.$router.push({
                path
                })
            return
        }
        const result = await getSingerDetail(this.computedSinger)
        const songs = await processSongs(result.songs)
        // 对于data里的数据对象传递，需要this.songs =songs赋值
        this.songs = songs
        this.loading = false
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

import { processSongs } from '@/service/song'
import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'

export default function createDetailComponent(name, key, fetch) {
    return {
        name: name,
        // 注册MusicList组件
        components: {
            MusicList
        },
        props: {
            data: Object
        },
        // music-list组件使用需要3个props，songs，title，pic
        // data不是对象，是一个函数，因此需要return
        data() {
            return {
                songs: [],
                loading: true
            }
        },
        // title 和 pic 都可以通过data对象拿到（props中）=>this.data
        // 使用计算属性定义，计算属性为对象，内部定义两个函数
        computed: {
            computedData() {
                let ret = null
                const data = this.data
                if (data) {
                    // 如果有data对象缓存了就直接用
                    ret = data
                } else {
                    // 如果没有就get获取前面set的SINGERKEY
                    const cachedData = storage.session.get(key)
                    // 是否有缓存+缓存mid是否匹配来给ret
                    if (cachedData && cachedData.mid === this.$route.params.id) {
                        ret = cachedData
                    }
                }
                return ret
            },
            pic() {
                const data = this.computedData
                // 确保data为空时不报错
                return data && data.pic
            },
            title() {
                const data = this.computedData
                return data && data.name
            }
        },
        async created() {
            const data = this.computedData
            if (!data) {
                // 当修改了地址路由中的mid（mid不匹配）时返回上一级页面
                const path = this.$route.matched[0].path
                this.$router.push({
                    path
                    })
                return
            }
            const result = await fetch(data)
            const songs = await processSongs(result.songs)
            // 对于data里的数据对象传递，需要this.songs =songs赋值
            this.songs = songs
            this.loading = false
        }
    }
}

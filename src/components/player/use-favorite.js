import { useStore } from 'vuex'
import { computed } from 'vue'
import { FAVORITE_KEY } from '@/assets/js/constants'
import { save, remove } from '@/assets/js/array-store'

export default function useFavorite() {
    const store = useStore()
    const favoriteList = computed(() => store.state.favoriteList)
    const maxLen = 100
    // 1.点击favorite 按钮切换样式
    function getFavoriteIcon(song) {
        return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
    }
    // 本地存储（用于保存本地信息）和vuex全局状态组件通信之间的配合
    function toggleFavorite(song) {
        let list
        if (isFavorite(song)) {
            // remove
            list = remove(FAVORITE_KEY, compare)
        } else {
            // add to the top
            list = save(song, FAVORITE_KEY, compare, maxLen)
        }
        store.commit('setFavoriteList', list)
        function compare(item) {
            return item.id === song.id
        }
    }

    function isFavorite(song) {
        return favoriteList.value.findIndex((item) => {
            return item.id === song.id
        }) > -1
    }

    return {
        getFavoriteIcon,
        toggleFavorite
    }
}

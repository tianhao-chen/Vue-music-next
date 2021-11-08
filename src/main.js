import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 全局注册插件, 自定义指令
import lazyPlugin from 'vue3-lazy'
import loadingDirective from './components/base/loading/directive'
import noResultDirective from './components/base/no-result/directive'
import { load, saveAll } from '@/assets/js/array-store'
import { FAVORITE_KEY, PLAY_KEY } from '@/assets/js/constants'
import { processSongs } from './service/song'
// 引入全局样式文件
import '@/assets/scss/index.scss'

// 项目初始化入口 main.js
const favoriteList = load(FAVORITE_KEY)
if (favoriteList.length > 0) {
    processSongs(favoriteList).then((songs) => {
        store.commit('setFavoriteList', songs)
        saveAll(songs, FAVORITE_KEY)
    })
}

const playHistory = load(PLAY_KEY)
if (playHistory.length > 0) {
    processSongs(playHistory).then((songs) => {
        store.commit('setPlayHistory', songs)
        saveAll(songs, PLAY_KEY)
    })
}

createApp(App).use(store).use(router).use(lazyPlugin, {
    loading: require('@/assets/images/default.png')
}).directive('loading', loadingDirective).directive('no-result', noResultDirective).mount('#app')

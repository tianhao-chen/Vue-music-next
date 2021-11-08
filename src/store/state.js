import { PLAY_MODE, SEARCH_KEY } from '@/assets/js/constants'
import { load } from '@/assets/js/array-store'

// 播放器的初始状态
const state = {
    sequenceList: [],
    playlist: [],
    playing: false,
    playMode: PLAY_MODE.sqeuence,
    currentIndex: 0,
    fullScreen: false,
    // 初始化: 加载本地数据
    favoriteList: [],
    searchHistory: load(SEARCH_KEY),
    playHistory: []
}

export default state

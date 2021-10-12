// 对state数据的进行修改
const mutations = {
    setPlayingState(state, playing) {
        state.playing = playing
    },
    setSequenceList(state, list) {
        state.sequenceList = list
    },
    setPlaylist(state, list) {
        state.playlist = list
    },
    setPlayMode(state, mode) {
        state.playMode = mode
    },
    setCurrentIndex(state, index) {
        state.currentIndex = index
    },
    setFullScreen(state, fullScreen) {
        state.fullScreen = fullScreen
    },
    setFavoriteList(state, list) {
        state.favoriteList = list
    },
    addSongLyric(state, { song, lyric }) {
        // 因为sequenclist这里是一个对象化属性，因此这里修改了item的lyric，playlist里面的也会修改
        state.sequenceList.map((item) => {
            if (item.mid === song.mid) {
                item.lyric = lyric
            }
            return item
        })
    }
}

export default mutations

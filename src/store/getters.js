export const currentSong = (state) => {
    // 得到当前播放的歌曲
    return state.playlist[state.currentIndex] || {}
}

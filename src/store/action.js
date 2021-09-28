import { PLAY_MODE } from '@/assets/js/constants'
import { shuffle } from '@/assets/js/util'

export function selectPlay({ commit }, { list, index }) {
    commit('setPlayMode', PLAY_MODE.sequence)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', list)
    commit('setCurrentIndex', index)
}

export function randomPlay({ commit }, list) {
    commit('setPlayMode', PLAY_MODE.random)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', shuffle(list))
    commit('setCurrentIndex', 0)
}

export function changeMode({ commit, state, getters }, mode) {
    const currentSong = getters.currentSong
    const currentId = currentSong.id

    if (mode === PLAY_MODE.random) {
        commit('setPlaylist', shuffle(state.sequenceList))
    } else {
        commit('setPlaylist', state.sequenceList)
    }
    const index = state.playlist.findIndex((song) => {
        return song.id === currentId
    })
    if (mode === PLAY_MODE.loop) {
        commit('setPlaylist', new Array(state.sequenceList[index]))
    }

    commit('setCurrentIndex', index)
    commit('setPlayMode', mode)
}

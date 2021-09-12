import { get } from './base'

export function processSongs(songs) {
    if (!songs.length) {
        return Promise.resolve(songs)
    }
    return get('/api/getSongUrl', {
        mid: songs.map((song) => {
            return song.mid
        })
    }).then((result) => {
        const map = result.map
        return songs.map((song) => {
            song.url = map[song.mid]
            return song
        }).filter((song) => {
            // 含有vkey才是有效的，为了避免无效播放
            return song.url && song.url.indexOf('vkey') > -1
        })
    })
}

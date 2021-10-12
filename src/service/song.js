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
// key: id
const lyricMap = {}

export function getLyric(song) {
    if (song.lyric) {
        return Promise.resolve(song.lyric)
    }
    const mid = song.mid
    // 不同歌曲对象但是mid可能是一致的且对应同一首歌，避免重复请求。
    const lyric = lyricMap[mid]
    if (lyric) {
        return Promise.resolve(lyric)
    }
    return get('api/getLyric', {
        mid
    }).then((result) => {
        const lyric = result ? result.lyric : '[00:00:00]该歌曲暂时无法获取歌词'
        lyricMap[mid] = lyric
        return lyric
    })
}

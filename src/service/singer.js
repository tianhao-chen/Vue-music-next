import { get } from './base'

export function getSingerList() {
    return get('/api/getSingerList')
}

export function getSingerDetail(singer) {
    return get('/api/getSingerDetail', {
        // 传入歌手的mid来获取数据
        mid: singer.mid
    })
}

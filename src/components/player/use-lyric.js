import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '../../service/song'
import Lyric from 'lyric-parser'

export default function useLyric(songReady, currentTime) {
    const currentLyric = ref(null)
    const lyricScrollRef = ref(null)
    const lyricListRef = ref(null)
    const currentLineNum = ref(0)
    const pureMusicLyric = ref('')
    const playingLyric = ref('')

    const store = useStore()
    const currentSong = computed(() => store.getters.currentSong)

    watch(currentSong, async (newSong) => {
        if (!newSong.url || !newSong.id) {
            return
        }
        // 切换歌曲时的数据重置
        stopLyric()
        currentLyric.value = null
        currentLineNum.value = 0
        pureMusicLyric.value = ''
        // 切换歌曲时，由于getlyric是异步过程，而songready可能已经触发了
        // playlyric（）
        const lyric = await getLyric(newSong)
        store.commit('addSongLyric', {
            song: newSong,
            lyric
        })
        // 当getlyric没有执行完就切换了歌曲时做一个判断避免，歌词错误
        if (currentSong.value.lyric !== lyric) {
            return
        }
        currentLyric.value = new Lyric(lyric, handleLyric)
        const hasLyric = currentLyric.value.lines.length
        if (hasLyric) {
            if (songReady.value) {
                playLyric()
            }
        } else {
            playingLyric.value = pureMusicLyric.value = lyric.replace(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '')
        }
    })

    function handleLyric({ lineNum, txt }) {
        currentLineNum.value = lineNum
        playingLyric.value = txt
        const scrollComp = lyricScrollRef.value
        const listEl = lyricListRef.value
        if (!listEl) {
            // listEl
            return
        }
        if (lineNum > 5) {
            // 高亮位置
            const lineEl = listEl.children[lineNum - 5]
            scrollComp.scroll.scrollToElement(lineEl, 1000)
        } else {
            scrollComp.scroll.scrollTo(0, 0, 1000)
        }
    }
    function playLyric() {
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            // ms
            currentLyricVal.seek(currentTime.value * 1000)
        }
    }
    function stopLyric() {
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            // ms
            currentLyricVal.stop()
        }
    }
    return {
        currentLyric,
        currentLineNum,
        playLyric,
        stopLyric,
        lyricScrollRef,
        lyricListRef,
        playingLyric
    }
}

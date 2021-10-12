import { ref } from 'vue'

export default function useMiddleInteractive() {
    // default as 'cd'
    const currentShow = ref('cd')
    const middleLStyle = ref(null)
    const middleRStyle = ref(null)

    const touch = {}
    let currentView = 'cd'

    function onMiddleTouchStart(e) {
        touch.startX = e.touches[0].pageX
        touch.startY = e.touches[0].pageY
        touch.directionLocked = ''
    }
    function onMiddleTouchMove(e) {
        // movement for lyric page
        // deltaX = distance from finger now on to start
        const deltaX = e.touches[0].pageX - touch.startX
        const deltaY = e.touches[0].pageY - touch.startY

        if (!touch.directionLocked) {
            touch.directionLocked = Math.abs(deltaX) >= Math.abs(deltaY) ? 'h' : 'v'
        }
        if (touch.directionLocked === 'v') {
            return
        }
        // initial position, different along the initial view
        // 'cd' view: 0+ deltaX
        // 'lyric' view: -300
        const left = currentView === 'cd' ? 0 : -window.innerWidth
        // left+deltax
        // 实现正滑和反滑操作, 同时限制范围
        const offsetWidth = Math.min(0, Math.max(left + deltaX, -window.innerWidth))
        touch.precent = Math.abs(offsetWidth / window.innerWidth)

        if (currentView === 'cd') {
            if (touch.precent > 0.2) {
                currentShow.value = 'lyric'
            } else {
                currentShow.value = 'cd'
            }
        } else if (currentView === 'lyric') {
            if (touch.precent < 0.8) {
                currentShow.value = 'cd'
            } else {
                currentShow.value = 'lyric'
            }
        }

        middleLStyle.value = {
            opacity: 1 - touch.precent
        }

        middleRStyle.value = {
            transform: `translate3d(${offsetWidth}px,0 ,0)`
        }
    }

    function onMiddleTouchEnd() {
        let offsetWidth
        let opacity
        if (currentShow.value === 'cd') {
            currentView = 'cd'
            offsetWidth = 0
            opacity = 1
        } else {
            currentView = 'lyric'
            offsetWidth = -window.innerWidth
            opacity = 0
        }

        const duration = 300

        middleLStyle.value = {
            opacity: opacity,
            transitionDuration: `${duration}ms`
        }

        middleRStyle.value = {
            transform: `translate3d(${offsetWidth}px,0 ,0)`,
            transitionDuration: `${duration}ms`
        }
    }
    return {
        currentShow,
        middleRStyle,
        middleLStyle,
        onMiddleTouchStart,
        onMiddleTouchMove,
        onMiddleTouchEnd
    }
}

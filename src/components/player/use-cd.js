import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'

export default function useCd() {
    const cdRef = ref(null)
    const cdImageRef = ref(null)

    const store = useStore()
    const playing = computed(() => store.state.playing)

    const cdCls = computed(() => {
        return playing.value ? 'playing' : ''
    })
    // cd图片是相对cd wrapper旋转的
    watch(playing, (newPlaying) => {
        if (!newPlaying) {
            syncTransform(cdRef.value, cdImageRef.value)
        }
    })

    function syncTransform(wrapper, inner) {
        // cd图片是相对cd旋转的, 所以需要在暂停时把wrapper上次转的角度加上
        // 不然由于每次暂停再播playing是从0开始转，就会跳回wrapper的位置开始转
        // 因此需要将wrapper的旋转+inner的角度，这样在每次暂停后两者的角度是相同的。
        const wrapperTransform = getComputedStyle(wrapper).transform
        const innerTransform = getComputedStyle(inner).transform
        wrapper.style.transform = wrapperTransform === 'none' ? innerTransform : innerTransform.concat(' ', wrapperTransform)
    }
    return {
        cdCls,
        cdRef,
        cdImageRef
    }
}

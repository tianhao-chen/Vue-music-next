<template>
    <ul class="song-list">
        <li
        class="item"
        v-for="(song, index) in songs"
        :key="song.id"
        @click="selectItem(song, index)">
            <div class="content">
                <h2 class="name">{{song.name}}</h2>
                <p class="description">{{getDescrip(song)}}</p>
            </div>
        </li>
    </ul>
</template>

<script>
export default {
    name: 'song-list',
    props: {
        songs: {
            type: Array,
            default() {
                return []
            }
        }
    },
    emits: ['select'],
    methods: {
        // 描述=歌手名称+专辑名
        getDescrip(song) {
            return `${song.singer}-《 ${song.album} 》`
        },
        selectItem(song, index) {
            this.$emit('select', { song, index })
        }
    }

}
</script>

<style lang="scss" scoped>
.song-list {
    .item {
        // flex布局实现自适应
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 64px;
        font-size: $font-size-medium;
        .content {
            flex:1;
            line-height: 20px;
            overflow: hidden;
            .name {
                @include no-wrap();
                color: $color-text
            }
            .description {
                @include no-wrap();
                margin-top: 4px;
                color: $color-text-d;
            }
        }
    }
}
</style>

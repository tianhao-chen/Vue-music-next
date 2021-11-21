<template>
  <m-header></m-header>
  <tab></tab>
  <router-view :style="viewStyle" v-slot="{ Component }">
    <keep-alive>
      <component :is="Component"/>
    </keep-alive>
  </router-view>

  <router-view name="user"
  v-slot="{ Component }" :style="viewStyle">
    <transition appear name="slide">
      <keep-alive>
        <component :is="Component"/>
      </keep-alive>
    </transition>
  </router-view>
  <player></player>
</template>

<script>
  import Header from '@/components/header/header'
  import Tab from '@/components/tab/tab'
  import player from '@/components/player/player'
  import { mapState } from 'vuex'
  export default {
    components: {
      MHeader: Header,
      Tab,
      // 由于player在各级路由下都要可以获得，因此要注册为全局组件
      player
    },
    computed: {
      viewStyle() {
        const bottom = this.playlist.length ? '60px' : '0'
        return {
          bottom
        }
      },
      ...mapState([
      'playlist'
    ])
    }

  }

</script>

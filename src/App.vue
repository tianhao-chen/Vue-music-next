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
  <div id="master">
    <a href="https://beian.miit.gov.cn/" target="_blank">沪ICP备2021034236号-1</a>
  </div>
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

<style type="text/css">
  #master {
    position: absolute;
    width:100%;
    bottom:0;
    text-align: center;
    font-size: 9pt;
  }
</style>

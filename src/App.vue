<template>
  <m-header></m-header>
  <tab></tab>
  <router-view></router-view>
  <player></player>
</template>

<script>
  import Header from '@/components/header/header'
  import Tab from '@/components/tab/tab'
  import player from '@/components/player/player'

  export default {
    components: {
      MHeader: Header,
      Tab,
      // 由于player在各级路由下都要可以获得，因此要注册为全局组件
      player
    }
  }

</script>

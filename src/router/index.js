import { createRouter, createWebHashHistory } from 'vue-router'
// 对引入组件使用首字母大写的形式
import Recommend from '@/views/recommend'
import Singer from '@/views/singer'
import TopList from '@/views/top-list'
import Search from '@/views/search'
import SingerDetail from '@/views/singer-detail'
import Album from '@/views/album'
import TopDetail from '@/views/top-detail'
import UserCenter from '@/views/user-center'

const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    component: Recommend,
    children: [
      {
        path: ':id',
        component: Album
      }

    ]
  },
  {
    path: '/singer',
    component: Singer,
    children: [
      {
        // 不能写死，path是一个动态的参数
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/top-list',
    component: TopList,
    children: [
      {
        // 不能写死，path是一个动态的参数
        path: ':id',
        component: TopDetail
      }
    ]
  },
  {
    path: '/search',
    component: Search,
    children: [
      {
        // 不能写死，path是一个动态的参数
        path: ':id',
        component: SingerDetail
      }
    ]
  },
  {
    path: '/user',
    components: {
      user: UserCenter
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

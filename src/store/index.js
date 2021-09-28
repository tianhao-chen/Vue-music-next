import { createStore, createLogger } from 'vuex'
import state from './state'
import mutations from './mutation'
import * as getters from './getters'
import * as actions from './action'
// 开发环境判断
const debug = process.env.NODE_ENV !== 'production'

export default createStore({
  state,
  mutations,
  getters,
  actions,
  // 严格模式会深度watch mutations
  strict: debug,
  plugins: debug ? [createLogger()] : []
})

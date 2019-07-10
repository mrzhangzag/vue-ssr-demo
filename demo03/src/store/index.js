import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

function getDataApi () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('模拟异步获取数据');
    }, 1000);
  });
}

function createStore () {
  const store = new Vuex.Store({
    state: {
      datas: '' // 数据
    },

    mutations: {
      setData (state, data) {
        state.datas = data // 赋值
      }
    },

    actions: {
      fetchData ({ commit }) {
        return getDataApi().then(res => {
          commit('setData', res)
        })
      }
    }
  })

  return store
}

export default createStore
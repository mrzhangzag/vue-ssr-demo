import Vue from 'vue'
import Router from 'vue-router'
import Home from '../components/Home.vue'
import List from '../components/List.vue'

Vue.use(Router)

function createRouter () {
  const routes  = [
    {
      path: '/',
      component: Home
    },
    {
      path: '/list',
      component: List
    }
  ]

  const router = new Router({
    mode: 'history',
    routes
  })

  return router
}

export default createRouter
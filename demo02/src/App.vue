<template>
  <section id="app">
    <p>服务端渲染（不含 vue-router 和 vuex） - vue ssr案例第二步</p>
    <home />
    <list />
  </section>
</template>

<script>
import home from './components/Home.vue'
import list from './components/list.vue'

export default {
  name: 'App',
  components: {
    home,
    list
  }
}
</script>

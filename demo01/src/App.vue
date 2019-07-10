<template>
  <section>
    <p>vue ssr案例第一步 - 客户端渲染</p>
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

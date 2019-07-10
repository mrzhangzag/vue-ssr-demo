<template>
  <section class="home">
    home --- home --- homr 123321
    <h2>从服务端去获取的数据 ===> {{$store.state.datas}}</h2>
  </section>
</template>

<script>
export default {
  name: 'Home',
  asyncData ({ store, route }) {
    return store.dispatch('fetchData') // 服务端获取异步数据
  },
  data () {
    return {

    }
  },
  mounted () {
    // 客户端不存在 created 和 beforeCreated 生命周期
    console.log('store', this.$store)
  }
}
</script>

<style>
  .home {
    background-color: aquamarine;
    margin: 20px;
    padding: 20px;
  }
</style>

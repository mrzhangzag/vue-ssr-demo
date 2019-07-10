import Vue from 'vue';
import App from './App.vue';

// Node.js 服务器是一个长期运行的进程。当我们的代码进入该进程时，它将进行一次取值并留存在内存中。这意味着如果创建一个单例对象，它将在每个传入的请求之间共享。如果我们在多个请求之间使用一个共享的实例，很容易导致交叉请求状态污染 (cross-request state pollution)。
// 暴露一个可以重复执行的工厂函数，为每个请求创建新的应用程序实例
export function createApp() {
  const app = new Vue({
    render: h => h(App)
  });

  return { app };
}
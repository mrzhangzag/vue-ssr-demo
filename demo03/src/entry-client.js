import { createApp } from './app.js';

const { app, router, store } = createApp();

// 客户端在挂载到应用程序之前，同步store状态
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

app.$mount('#app');
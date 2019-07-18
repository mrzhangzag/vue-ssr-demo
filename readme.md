## 前言
<hr>
可能我们平常接触比较多的是使用 vue + vue全家桶来搭建起一个单页（SPA）应用。用 ssr 搭建项目比较少，本文是记录我在学习 ssr 过程中的一些见解，如有出错或疏漏，麻烦帮忙指正！文章共分为三个步骤来实现搭建一个简单 ssr 项目：

* 1.搭建 SPA 项目（实现客户端渲染）
* 2.简单实现ssr服务端渲染（不包含 vue-router 和 vuex）
* 3.实现ssr服务端渲染增加 vue-router 和 vuex

首先按国际惯例来，分析 **客户端渲染（SPA） 和 服务端渲染（SSR） 的区别**：

* 使用服务端渲染，内容到达时间更快。无需等待所有的 JavaScript都完成下载并执行，所以用户将会更快速地看到完整渲染的页面，通常可以产生更好的用户体验。
* 使用服务端渲染有更好的 SEO，由于搜索引擎爬虫抓取工具可以直接查看完全渲染的页面。如果你的应用程序初始展示 loading 菊花图，然后通过 Ajax 获取内容，抓取工具并不会等待异步完成后再行抓取页面内容。也就是说，如果 SEO 对你的站点至关重要，而你的页面又是异步获取内容，则你可能需要服务器端渲染(SSR)解决此问题。

如果只是少些页面需要 ssr 来实现SEO,或许你可以了解下 **[prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin#readme)**，使用 **预渲染** 来实现。
<br>
另外 vue 官网还提供了 **[nuxt](https://zh.nuxtjs.org)** 框架，可以开箱即用，进行 srr 项目开发。
<br>
接下来，一步步来独立配置一个 ssr 项目。

## 正文
<hr>

### 一、第一步，实现客户端渲染
第一步我们先配置一个常用的 SPA 应用，也就是在客户端实现渲染。使用的是 webpack + vue ，这个大家应该比较熟悉：
<br>
目录结构：
<br>



![ssr-vue-demo01-目录结构](https://user-gold-cdn.xitu.io/2019/6/15/16b5a6be60dd6d0b?w=186&h=374&f=png&s=14851)
package.json:
<br>


```
{
  "name": "demo01",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "webpack-dev-server --config config/webpack.config.js --port 3000",
    "build": "webpack --config config/webpack.config.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "vue": "^2.6.10"
  },
  "devDependencies": {
    "@babel/core": "^7.4.5",
    "autoprefixer": "^9.6.0",
    "babel-loader": "^8.0.6",
    "@babel/preset-env": "^7.4.5",
    "clean-webpack-plugin": "^3.0.0",
    "css-loader": "^3.0.0",
    "file-loader": "^4.0.0",
    "html-webpack-plugin": "^3.2.0",
    "postcss-loader": "^3.0.0",
    "url-loader": "^2.0.0",
    "vue-loader": "^15.7.0",
    "vue-style-loader": "^4.1.2",
    "vue-template-compiler": "^2.6.10",
    "webpack": "^4.34.0",
    "webpack-cli": "^3.3.4",
    "webpack-dev-server": "^3.7.1"
  }
}
```
webpack配置：（/config/webpack.config.js）

```
var path = require('path')
var VueLoaderPlugin = require('vue-loader/lib/plugin')
var HtmlWebpackPlugin  = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, '../src/app.js'),
  output: {
    path: path.resolve(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000    // 10Kb
          }
        }
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html')
    })
  ]
}

```
.babelrc配置：

```
{
  "presets": [
    "@babel/preset-env"
  ]
}
```
postcss.config.js配置：

```
module.exports = {
  plugins: [
    require('autoprefixer'),
  ]
}
```
app.js：

```
import Vue from 'vue'
import App from './App.vue'

new Vue({
  el: '#app',
  render: h => h(App)
})
```
App.vue：

```
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

```
index.html：

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>客户端渲染 - vue ssr案例第一步</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>
```
/src/components/List.vue:

```
<template>
  <section class="list">
    list --- list --- list
  </section>
</template>

<style>
.list {
  background-color:darksalmon;
  margin: 20px;
  padding: 20px;
}
</style>


```
/src/components/Home.vue:

```
<template>
  <section class="home">
    home --- home --- homr 123321
  </section>
</template>

<style>
  .home {
    background-color: aquamarine;
    margin: 20px;
    padding: 20px;
  }
</style>


```
以上就是一个简单的SPA项目。但运行 npm run build 时可以对项目进行一个打包，生成如下文件（可投放于生产）：

![](https://user-gold-cdn.xitu.io/2019/6/15/16b5a75b6a5b5fad?w=178&h=91&f=png&s=3512)
也可以借助 webpack-dev-server 来运行我们的项目，执行 npm run start ,然后在浏览器打开 http://localhost:3000：

![](https://user-gold-cdn.xitu.io/2019/6/15/16b5a85e1e42ae67?w=1128&h=306&f=png&s=28742)
查看网页原代码可以发现，home组件和list组件的内容并不存在，因为除了index.html的内容外，其他内容都是由js在客户端渲染出来的，所以网页原代码里看不到这些由js渲染出来的内容，爬虫也是找不到这些内容（爬虫不会等到页面中的js执行完在抓取数据）。

![](https://user-gold-cdn.xitu.io/2019/7/1/16baddc2bc232fd1?w=495&h=240&f=png&s=5848)

[案例源码](https://github.com/mrzhangzag/vue-ssr-demo/tree/master/demo01)
### 二、第二步，简单实现ssr服务端渲染（不包含 vue-router 和 vuex）
第二步，我们来实现一个简单ssr，首先分析下思路，那肯定要拿出官网提供原理图了，如下：

![ssr原理图](https://user-gold-cdn.xitu.io/2019/6/15/16b5aaec129415ab?w=1946&h=892&f=png&s=142896)

从图中可以看到，webpack会从两个入口来进行打包处理，其中通过 **Client entry** 入口进行客户端的打包，从 **Server entry** 入口进行服务端打包。
<br>
**Server entry** 打包的文件会在 Node Server （也就是服务端）运行，通过 Bundle Renderer 渲染成了 Html，然后把 HTML 丢给浏览器，浏览器根据得到的 HTML 渲染出页面。
<br>
到浏览器端时，此时浏览器已经拿到服务端渲染出来的 HTML ，通过 **Client entry** 打包出来的 **Client Bundle** 是用来在浏览器执行（就是 客户端激活 ），用以vue在浏览器端的激活，这样，在浏览器端才能正常执行vue的生命周期以及指令等。
<br>

那接下来进行项目的改造。
目录结构：

![](https://user-gold-cdn.xitu.io/2019/7/1/16badd675f87f6f7?w=203&h=496&f=png&s=22854)
<br>
1.增加客户端编译入口文件（entry-client.js），用以创建实例，并且挂载。

```
import { createApp } from './app.js';

const { app } = createApp();

app.$mount('#app');
```
<br>
2.增加服务端编译入口文件（entry-server.js）。
<br>
在客户端，每个用户访问应用都会产生一个新的实例，每个实例都是独立的，有自己的数据。但是在服务端，我们的应用是一直处于开启的状态，如果在全局声明一个实例，实例会一直存在于内存中，这样会照成 状态污染 (cross-request state pollution)，当有其他用户来访问时，声明的实例并不是全新的，而是从内存中获取，从而使得实例中数据不是初始化状态。
<br>
所以这里我们返回一个函数，使得每次有用户访问的时候都在服务端重新生成一个实例，这样每个用户访问应用才不会照成数据污染。

```
import { createApp } from './app.js';

export default context => {
  return new Promise((resolve, reject) => {
    const { app } = createApp();
    resolve(app);
  });
}
```
3.修改app.js。同样也需要返回一个函数，这样每次调用才能产生一个全新的实例。

```
import Vue from 'vue';
import App from './App.vue';

export function createApp() {
  const app = new Vue({
    render: h => h(App)
  });

  return { app };
}
```
4.将webpack的配置分成三部分：公用配置（webpack.base.config.js）、服务端配置（webpack.server.config.js）、客户端配置（webpack.client.config.js）

```
// webpack.base.config.js

var path = require('path')
var VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: ['.js', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000    // 10Kb
          }
        }
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}

```

```
// webpack.client.config.js

const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
var HtmlWebpackPlugin  = require('html-webpack-plugin')
const base = require('./webpack.base.config');

module.exports = merge(base, {
  entry: {
    client: path.resolve(__dirname, '../src/entry-client.js')
  },
  plugins: [
    new CleanWebpackPlugin(),
    // 客户端激活
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.template.html'),
      filename: 'index.template.html'
    })
  ]
})
```

```
// webpack.server.config.js

const path = require('path');
const merge = require('webpack-merge');
const base = require('./webpack.base.config');

module.exports = merge(base, {
  // 这允许 webpack 以 Node 适用方式处理动态导入(dynamic import)，
  // 并且还会在编译 Vue 组件时，告知 `vue-loader` 输送面向服务器代码。
  target: 'node',
  // 对 bundle renderer 提供 source map 支持
  devtool: 'source-map',
  entry: {
    server: path.resolve(__dirname, '../src/entry-server.js')
  },
  // 使用 Node 风格导出模块(Node-style exports)
  output: {
    libraryTarget: 'commonjs2'
  }
})
```
5.增加服务配置文件 /bin/www.js ，使用koa来搭建一个服务。

```
const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const path = require('path');
const fs = require('fs');
const app = new Koa()
const router = new Router()
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer

// 服务端执行vue操作
const bundle = fs.readFileSync(path.resolve(__dirname, '../dist/server.bundle.js'), 'utf-8');
// 客户端激活
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.template.html'), 'utf-8')
const renderer = createBundleRenderer(bundle, {
  template
})

// 资源文件
app.use(static(path.resolve(__dirname, '../dist')));

router.get('/', (ctx, next) => {
  // 服务端渲染结果转换成字符串
  renderer.renderToString((err, html) => {
    if (err) {
      console.error(err);
      ctx.status = 500;
      ctx.body = '服务器内部错误';
    } else {
      ctx.status = 200;
      ctx.body = html; // 将html字符串传到浏览器渲染
    }
  });
});

// 开启路由
app
  .use(router.routes())
  .use(router.allowedMethods());

// 应用监听端口
app.listen(3002, () => {
  console.log('服务器端渲染地址： http://localhost:3002');
});
```
6.其他文件的代码也贴出来

```
// App.js

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
```

```
// index.template.html

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>服务端渲染（不含 vue-router 和 vuex） - vue ssr案例第二步</title>
</head>
<body>
  <!--vue-ssr-outlet-->
</body>
</html>
```

```
// Home.vue

<template>
  <section class="home">
    home --- home --- homr 123321
  </section>
</template>

<style>
  .home {
    background-color: aquamarine;
    margin: 20px;
    padding: 20px;
  }
</style>
```

```
// List.vue

<template>
  <section class="list">
    list --- list --- list
  </section>
</template>

<style>
.list {
  background-color:darksalmon;
  margin: 20px;
  padding: 20px;
}
</style>
```
npm run build，打包后产生如下文件：

![](https://user-gold-cdn.xitu.io/2019/7/1/16badd82e9b5ee8b?w=193&h=141&f=png&s=6274)
在浏览器中打开 http://localhost:3002

![](https://user-gold-cdn.xitu.io/2019/7/1/16badd9d1986162b?w=1059&h=293&f=png&s=31751)
查看网页原代码，可以发现之前没有出现的内容（home组件和list组件的内容）都出现了，因为我们的应用已经在服务端渲染了之后才丢到浏览器解析的。

![](https://user-gold-cdn.xitu.io/2019/7/1/16bade1c27ca624e?w=951&h=471&f=png&s=21579)

[案例源码](https://github.com/mrzhangzag/vue-ssr-demo/tree/master/demo02)
### 三、第三步，实现ssr服务端渲染增加 vue-router 和 vuex
目录如下：

![](https://user-gold-cdn.xitu.io/2019/7/9/16bd73ba9d5bef44?w=191&h=577&f=png&s=24922)
首先来优化下打包，将我们原本打包出来的 server.bundle.js文件换成json文件，这样做有以下几个有点：

* 内置的 source map 支持（在 webpack 配置中使用 devtool: 'source-map'）

* 在开发环境甚至部署过程中热重载（通过读取更新后的 bundle，然后重新创建 renderer 实例）

* 关键 CSS(critical CSS) 注入（在使用 *.vue 文件时）：自动内联在渲染过程中用到的组件所需的CSS。更多细节请查看 CSS 章节。

* 使用 clientManifest 进行资源注入：自动推断出最佳的预加载(preload)和预取(prefetch)指令，以及初始渲染所需的代码分割 chunk。
1.修改webpack.client.config.js

```
const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
var HtmlWebpackPlugin  = require('html-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const base = require('./webpack.base.config');

module.exports = merge(base, {
  entry: {
    client: path.resolve(__dirname, '../src/entry-client.js')
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueSSRClientPlugin(), // 打包成 vue-ssr-client-manifest.json
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.template.html'),
      filename: 'index.template.html'
    })
  ]
})
```
2.修改webpack.server.config.js

```
const path = require('path');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const base = require('./webpack.base.config');

module.exports = merge(base, {
  // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
  // 并且还会在编译 Vue 组件时，
  // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
  target: 'node',
  // 对 bundle renderer 提供 source map 支持
  devtool: 'source-map',
  // 因为是服务端引用模块，所以不需要打包node_modules中的依赖，直接在代码中require引用就好，生成较小的 bundle 文件。
  externals: [nodeExternals({
    // 不要外置化 webpack 需要处理的依赖模块。
    // 你可以在这里添加更多的文件类型。例如，未处理 *.vue 原始文件，
    // 你还应该将修改 `global`（例如 polyfill）的依赖模块列入白名单
    whitelist: /\.css$/
  })],
  entry: {
    server: path.resolve(__dirname, '../src/entry-server.js')
  },
  // 使用 Node 风格导出模块(Node-style exports)
  output: {
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new VueSSRServerPlugin(), //  // 打包成 vue-ssr-server-bundle.json
  ]
})
```
3.新增 /router/index.js。同样的作为一个函数引出，避免在服务器上运行时产生数据交叉污染。

```
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
```
4.修改app.js。在createApp时带上router

```
import Vue from 'vue';
import App from './App.vue';
import createRouter from './router/index.js'

export function createApp() {
  const router = createRouter()

  const app = new Vue({
    router,
    render: h => h(App)
  });

  return { app, router };
}
```
5.修改 entry-server.js 。这时需要对路由进行匹配，我们会从服务端获得当前用户输入的 url 作为 context 参数传进来，然后通过 router.push(context.url) 进行路由跳转，再通过匹配是否能找到该组件来返回对应的状态。

```
import { createApp } from './app.js';

export default context => {
  return new Promise((resolve, reject) => {
    const { app, router } = createApp();

    // 根据匹配到的路径进行路由跳转
    router.push(context.url);

    // 在router.onReady的成功回调中，找寻与url所匹配到的组件
    router.onReady(() => {
      // 查找所匹配到的组件
      const matchedComponents = router.getMatchedComponents()

      // 未找到组件
      if (matchedComponents.length <= 0) {
        return reject({
          state: 404,
          msg: '未找到页面'
        })
      }

      // 成功并返回实例
      resolve(app)
    }, reject)
  });
}
```
6.修改www.js文件。router通过 '*' 来获取所有的请求拦截，并将 ctx.url 获取到的用户当前输入的url作为 renderToString 的参数传，上面第5小步的 'context'也就是这里 renderToString 的一个个参数。
```
const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const path = require('path');
const fs = require('fs');
const app = new Koa()
const router = new Router()
const favicon = require('koa-favicon')
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer

// 记录js文件的内容
const serverBundle = require(path.resolve(__dirname, '../dist/vue-ssr-server-bundle.json'))
// 记录静态资源文件的配置信息
const clientManifest = require(path.resolve(__dirname, '../dist/vue-ssr-client-manifest.json'))
// 客户端激活
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.template.html'), 'utf-8')
const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: template,
  clientManifest: clientManifest
})

// 资源文件
app.use(static(path.resolve(__dirname, '../dist')))
app.use(favicon(path.resolve(__dirname, '../favicon.ico')))

router.get('*', (ctx, next) => {
  let context = {
    url: ctx.url
  }
  // 服务端渲染结果转换成字符串
  renderer.renderToString(context, (err, html) => {
    if (err) {
      console.error(err);
      ctx.status = 500;
      ctx.body = '服务器内部错误';
    } else {
      ctx.status = 200;
      ctx.body = html; // 将html字符串传到浏览器渲染
    }
  });
});

// 开启路由
app
  .use(router.routes())
  .use(router.allowedMethods());

// 应用监听端口
app.listen(3003, () => {
  console.log('服务器端渲染地址： http://localhost:3003');
});
```
6.修改App.js

```
<template>
  <section id="app">
    <p>实现ssr服务端渲染增加 vue-router 和 vuex - vue ssr案例第三步</p>
    <br>
    <div>当前的页面路径： <span style="font-size: 20px; color:#f52811;">{{$router.currentRoute.path}}</span></div>
    <br>
    <router-link to="/">Home</router-link>
    <router-link to="/list">List</router-link>
    <router-view></router-view>
  </section>
</template>

<script>
export default {
  name: 'App'
}
</script>
```
执行npm run start，在浏览器打开 http://localhost:3003/

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb346d580a1421?w=1025&h=397&f=png&s=45943)
在浏览器打开 http://localhost:3003/list

![](https://user-gold-cdn.xitu.io/2019/7/2/16bb347474db8d1b?w=1051&h=379&f=png&s=45459)
同样，打开查看源代码都可以看到页面内容都渲染出来了。
### 接下来把 vuex 结合进项目
现在 vue-router 也能正常使用了，接下来需要思考一件事，平常我们都需要从后端交互拿到数据，那在 **服务端数据又怎么同步到我们的组件中呢？**
<br>
平常我们多用 created 和 mounted 进行数据的获取，然后将得到数据放在 data 里，最后再到视图中进行数据渲染。但是，在服务端 vue 只进行了 beforeCreate 和 created，然后就会生成html字符串，最后再浏览器端，再浏览器端进行挂载（也就是说 **浏览器端vue的生命周期是从 beforeMount 开始，不存在beforeCreate 和 created** ）。所以在 **服务端 vue 的生命周期只有 beforeCreate 和 created 。**
<br>
到后台请求数据都是异步的，如果在服务端的 beforeCreate 或 created 中去获取数据，可能接口数据还没返回到给我们，服务端已经把html字符串传到浏览器渲染了，所以数据内容还是无法显示出来。
<br>
在客户端是直接进行挂载，所以客户端生命周期是总beforeMounted开始的，由于爬虫不会等待客户端js执行完，所以在客户端获取数据也是不可取的。
<br>
官网推荐使用 **vuex**，在页面渲染前将获取到的数据存于 store 中，这样在挂载到客户端之前就可以通过 store 得到数据。
大概的思路是：
* 在组件内自定义一个函数（例如：asyncData），用于调用后端接口获取数据。
* 将获取到的数据存于 store 中，在服务端，组件通过 store 调取数据。
* 服务端将渲染完 html 字符串传到浏览器，浏览器在挂载实例前同步 store 数据。

<br>
接下来调整项目：
<br>
7.增加 /store/index.js。同样也是导出一个函数，防止数据交叉污染。<br>
getDataApi 用于模拟调用后台数据的接口

```
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
```
8.app.js

```
import Vue from 'vue';
import App from './App.vue';
import createRouter from './router/index.js'
import createStore from './store/index.js'

export function createApp() {
  const router = createRouter()
  const store = createStore()

  const app = new Vue({
    router,
    store,
    render: h => h(App)
  });

  return { app, router, store };
}
```
9.entry-server。如果匹配到路由，在Promise.all里面会筛选出组件里拥有 **asyncData** 函数的组件，并执行 **asyncData** 函数。往下面的看 第11 小结源码可知道，**asyncData** 就是执行 **dispatch** 去触发 store获取数据和保存数据。这里是关键，只有等Promise.all执行完了，获取到数据，填充好 store 才返回 app实例，服务端才将 html 字符串传到浏览器，数据才能同步。<br>
<span style="color:#ec6716;">context.state = store.state</span> 作用是，当服务端 createBundleRenderer 时，如果有template参数，就会把 context.state 的值作为 <span style="color:#ec6716;">window.__INITIAL_STATE__</span> 自动插入到html模板中。

```
import { createApp } from './app.js';

export default context => {
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp();

    // 根据匹配到的路径进行路由跳转
    router.push(context.url);

    // 在router.onReady的成功回调中，找寻与url所匹配到的组件
    router.onReady(() => {
      // 查找所匹配到的组件
      const matchedComponents = router.getMatchedComponents()

      // 未找到组件
      if (matchedComponents.length <= 0) {
        return reject({
          state: 404,
          msg: '未找到页面'
        })
      }

      // 对所有匹配的路由组件调用 `asyncData()`
      Promise.all(matchedComponents.map(component => {
        if (component.asyncData) {
          console.log(component.asyncData)
          // 匹配的组件存在 asyncData 就将其执行
          return component.asyncData({ store, route: router.currentRoute })
        }
      })).then(res => {
        // 在所有预取钩子(preFetch hook) resolve 后，我们的 store 现在已经填充入渲染应用程序所需的状态。
        // 当我们将状态附加到上下文，并且 `template` 选项用于 renderer 时，状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
        context.state = store.state

        // 成功并返回实例
        resolve(app)
      }).catch(reject)
    }, reject)
  });
}
```
10.entry-client。客户端在挂载之前，先通过 **store.replaceState(window.__INITIAL_STATE__)** 将服务端得到的 store 数据进行同步，这样客户端 store 初始化的数据就和服务端 store 同步了。

```
import { createApp } from './app.js';

const { app, router, store } = createApp();

// 客户端在挂载到应用程序之前，同步store状态
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

app.$mount('#app');
```
11.Home.vue组件。**asyncData** 用于在服务端获取数据，这样 **{{$store.state.datas}}** 在服务端中就可以实现数据数据读取了。

```
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
```
12.www.js。koa 路由拦截里改为 async/await 写法，否则，程序就不等组件渲染好，就直接跑下个 middleware 去了,页面会渲染不出来。

```
const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const path = require('path');
const fs = require('fs');
const app = new Koa()
const router = new Router()
const favicon = require('koa-favicon')
const createBundleRenderer = require('vue-server-renderer').createBundleRenderer

// 记录js文件的内容
const serverBundle = require(path.resolve(__dirname, '../dist/vue-ssr-server-bundle.json'))
// 记录静态资源文件的配置信息
const clientManifest = require(path.resolve(__dirname, '../dist/vue-ssr-client-manifest.json'))
// 客户端激活
const template = fs.readFileSync(path.resolve(__dirname, '../dist/index.template.html'), 'utf-8')
const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template: template,
  clientManifest: clientManifest
})

// 资源文件
app.use(static(path.resolve(__dirname, '../dist')))
app.use(favicon(path.resolve(__dirname, '../favicon.ico')))

router.get('*', async (ctx, next) => {
  let context = {
    url: ctx.url
  }

  // 服务端渲染结果转换成字符串
  await new Promise((resolve, reject) => {
    renderer.renderToString(context, (err, html) => {
      if (err) {
        console.error(err);
        ctx.status = 500;
        ctx.body = '服务器内部错误';
        reject
      } else {
        ctx.status = 200;
        ctx.type = 'html';
        ctx.body = html; // 将html字符串传到浏览器渲染
        resolve(next())
      }
    });
  })
});

// 开启路由
app
  .use(router.routes())
  .use(router.allowedMethods());

// 应用监听端口
app.listen(3003, () => {
  console.log('服务器端渲染地址： http://localhost:3003');
});
```
执行 http://localhost:3003

![](https://user-gold-cdn.xitu.io/2019/7/9/16bd728b22708e24?w=1164&h=379&f=png&s=73535)
图中可以看到，服务端 store 已经嵌入在 html 中，可通过 window.__INITIAL_STATE__ 获取，所以 entry-client.js 中挂载前就是通过一下代码进行客户端 store 和服务端 store 同步。

```
// 客户端在挂载到应用程序之前，同步store状态
if (window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}
```
查看源代码，如下图：

![](https://user-gold-cdn.xitu.io/2019/7/9/16bd737a8e8eab12?w=791&h=366&f=png&s=29753)
我们模拟后台请求接口获得的数据 “模拟异步获取数据” 也在源代码中看到了。
<br>
[案例源码](https://github.com/mrzhangzag/vue-ssr-demo/tree/master/demo03)
<br>
到这里，一个简单的 vue ssr 服务端渲染项目就搭建起来了。

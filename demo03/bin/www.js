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
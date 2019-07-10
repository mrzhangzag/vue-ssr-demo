const Koa = require('koa');
const Router = require('koa-router');
const static = require('koa-static');
const path = require('path');
const fs = require('fs');
const app = new Koa()
const router = new Router()
const { createBundleRenderer } = require('vue-server-renderer')

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
      ctx.body = '服务器内部错误, ' + err;
    } else {
      ctx.status = 200;
      ctx.body = html; // 将html字符串传到浏览器渲染
    }
  });
});

// 开启路由
app
  .use(router.routes()) /*启动路由*/
  .use(router.allowedMethods());
/*
  * router.allowedMethods()用在了路由匹配 router.routes()之后,所以在当所有路由中间件最后调用.此时根据 ctx.status 设置 response 响应头 
*/

// 应用监听端口
app.listen(3002, () => {
  console.log('demo02 - 渲染地址： http://localhost:3002');
});
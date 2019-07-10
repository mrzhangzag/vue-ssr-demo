import { createApp } from './app.js';

export default context => {
  return new Promise((resolve, reject) => {
    const { app } = createApp();
    resolve(app);
  });
}
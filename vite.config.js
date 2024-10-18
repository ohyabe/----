// import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';
// import { createProxy } from 'vite-plugin-mock'; // 引入 Vite 插件用于代理

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//   ],
//   server: {
//     proxy: createProxy({
//       // 将以 /quiz 开头的请求代理到后端服务
//       '/quiz': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/quiz/, ''),
//       },
//     }),
//   },
// });

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    proxy: {
      // 将以 /quiz 开头的请求代理到后端服务
      '/quiz': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/quiz/, ''),
      },
    },
  },
});

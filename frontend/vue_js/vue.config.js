const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // [추가] 배포(production)일 때만 /api/를 경로 앞에 붙입니다.
  publicPath: process.env.NODE_ENV === 'production' ? '/api/' : '/',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

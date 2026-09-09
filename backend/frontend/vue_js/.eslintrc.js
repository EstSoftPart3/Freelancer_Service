module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential', // 또는 'plugin:vue/essential'
    'eslint:recommended',
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  plugins: ['vue'],
  rules: {
    // 원하는 룰 추가
  },
}

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './fo/router'
import { Tooltip } from 'bootstrap'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.directive('tooltip', {
  mounted(el, binding) {
    new Tooltip(el, {
      title: binding.value || '',
      placement: binding.arg || 'top',
      trigger: 'hover'
    });
  },
  unmounted(el) {
    const tooltip = Tooltip.getInstance(el);
    if (tooltip) {
      tooltip.dispose();
    }
  }
});

app.mount('#app')

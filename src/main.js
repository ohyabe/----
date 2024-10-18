import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia} from 'pinia';

import PrimeVue from 'primevue/config';// 載入 PrimeVue
import Aura from '@primevue/themes/aura';// PrimeVue 載入主題
import 'element-plus/theme-chalk/dark/css-vars.css'

// import accordion from '@primevue/themes/aura/accordion';
// ... imports of other component tokens




const pinia = createPinia();

const app = createApp(App)

app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.my-app-dark', // 暗模式選擇器
            order: 'tailwind-base, tailwind-utilities, primevue', // CSS 層的順序
            cssLayer: false
        }
    }
 });
// app.use(PrimeVue, {
//     theme: {
//         preset: Aura
//     }
// });
// app.use(PrimeVue, {
//     unstyled: true
// });

app.use(router)
app.use(pinia)
app.mount('#app')


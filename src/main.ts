import { createApp } from 'vue';
import './index.css';
import App from './App.vue';
import i18n from './i18n';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import VueApexCharts from 'vue3-apexcharts';

const app = createApp(App);

app.use(i18n);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.dark',
      cssLayer: false,
    },
  },
});
app.use(VueApexCharts);

app.mount('#app');

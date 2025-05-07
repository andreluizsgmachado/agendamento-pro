import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import './style.css';
import App from './App.vue';

// Create the app instance
const app = createApp(App);

// Install plugins
app.use(createPinia());
app.use(router);

// Mount the app
app.mount('#app');
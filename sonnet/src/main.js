import { createApp } from 'vue'
import App from './App.vue'
import '@/styles/main.css'

// Initialize Vue application
const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err, info)
}

// Mount application
app.mount('#app')

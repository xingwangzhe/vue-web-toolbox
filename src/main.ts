import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Font Awesome 配置
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'

// 添加图标到库中
library.add(fas, fab, far)

// 设置暗色模式
document.documentElement.classList.add('dark')
document.documentElement.setAttribute('data-theme', 'dark')

const app = createApp(App)

app.use(router)
// 注册全局组件
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')

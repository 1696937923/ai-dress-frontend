<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/" class="logo">
          <span class="logo-icon">👗</span>
          <span class="logo-text">AI DRESS</span>
        </router-link>
      </div>

      <div class="navbar-center">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </router-link>
        <router-link to="/wardrobe" class="nav-item" :class="{ active: $route.path === '/wardrobe' }">
          <el-icon><Grid /></el-icon>
          <span>橱窗</span>
        </router-link>
        <router-link to="/profile" class="nav-item" :class="{ active: $route.path === '/profile' }">
          <el-icon><User /></el-icon>
          <span>我的形象</span>
        </router-link>
        <router-link to="/history" class="nav-item" :class="{ active: $route.path === '/history' }">
          <el-icon><Clock /></el-icon>
          <span>试衣记录</span>
        </router-link>
      </div>

      <div class="navbar-right">
        <div v-if="isLoggedIn" class="user-section">
          <div class="quota-badge">
            <el-icon><MagicStick /></el-icon>
            <span>剩余试衣次数: {{ userQuota }}</span>
          </div>
          <div class="user-dropdown">
            <el-button type="text" class="user-name">
              <el-icon><UserFilled /></el-icon>
              {{ userName }}
            </el-button>
            <el-button type="text" class="logout-btn" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </div>
        <router-link v-else to="/login" class="login-btn">
          登录 / 注册
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const userName = ref('')
const userQuota = ref(0)
const isLoggedIn = ref(false)

const loadUserInfo = () => {
  isLoggedIn.value = !!localStorage.getItem('user_id')
  const name = localStorage.getItem('user_name')
  const quota = localStorage.getItem('user_quota')
  if (name) userName.value = name
  if (quota !== null) userQuota.value = parseInt(quota, 10)
}

const handleLogout = () => {
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_name')
  localStorage.removeItem('user_quota')
  isLoggedIn.value = false
  userName.value = ''
  userQuota.value = 0
  ElMessage.success('已退出登录')
  router.push('/')
}

// 监听路由变化，每次路由变化时重新加载用户信息
watch(() => router.currentRoute.value, () => {
  loadUserInfo()
}, { immediate: true })

onMounted(() => {
  loadUserInfo()
})

// 监听存储变化
window.addEventListener('storage', loadUserInfo)

// 监听自定义事件，用于登录后刷新用户信息
const handleAuthStateChanged = () => {
  loadUserInfo()
}

window.addEventListener('auth-state-changed', handleAuthStateChanged)
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--color-text-primary);
  font-weight: 700;
  font-size: 20px;
  transition: all 0.3s ease;
}

.logo:hover {
  color: var(--color-primary);
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-center {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  font-weight: 500;
  border-radius: var(--radius-button);
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.08);
}

.nav-item.active {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.1);
}

.nav-item .el-icon {
  font-size: 18px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quota-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #8B5CF6;
}

.quota-badge .el-icon {
  font-size: 16px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-text-secondary);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.login-btn {
  padding: 10px 28px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  color: white;
  text-decoration: none;
  font-size: var(--font-size-body);
  font-weight: 500;
  border-radius: var(--radius-button);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

@media (max-width: 900px) {
  .navbar-container {
    padding: 0 16px;
  }

  .navbar-center {
    display: none;
  }

  .nav-item span {
    display: none;
  }

  .quota-badge span {
    display: none;
  }
}
</style>

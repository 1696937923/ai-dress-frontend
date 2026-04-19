<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1 class="auth-title">
            <span class="logo-text">AI试衣</span>
          </h1>
          <p class="auth-subtitle">{{ isLogin ? '欢迎回来' : '创建新账号' }}</p>
        </div>

        <el-tabs v-model="activeTab" class="auth-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="登录" name="login">
            <form @submit.prevent="handleLogin" class="auth-form">
              <el-form-item>
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  size="large"
                  prefix-icon="User"
                />
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="loading"
                  @click="handleLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </form>
          </el-tab-pane>

          <el-tab-pane label="注册" name="register">
            <form @submit.prevent="handleRegister" class="auth-form">
              <el-form-item>
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入用户名 (3-20个字符)"
                  size="large"
                  prefix-icon="User"
                />
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码 (6-32个字符)"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  size="large"
                  prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleRegister"
                />
              </el-form-item>
              <el-form-item>
                <div class="quota-hint">
                  <el-icon><Gift /></el-icon>
                  <span>注册即送 10 次免费试衣额度</span>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  class="submit-btn"
                  :loading="loading"
                  @click="handleRegister"
                >
                  注册
                </el-button>
              </el-form-item>
            </form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, register } from '../api/index.js'

const router = useRouter()

const activeTab = ref('login')
const isLogin = ref(true)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleTabChange = (tab) => {
  isLogin.value = tab === 'login'
}

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const res = await login(loginForm.username, loginForm.password)
    if (res.data.code === 200) {
      const user = res.data.data
      localStorage.setItem('user_id', user.id)
      localStorage.setItem('user_name', user.username)
      localStorage.setItem('user_quota', user.tryOnQuota)
      // 触发认证状态变化事件
      window.dispatchEvent(new CustomEvent('auth-state-changed'))
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(res.data.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败: ' + (error.response?.data?.message || error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.username || !registerForm.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  if (registerForm.username.length < 3 || registerForm.username.length > 20) {
    ElMessage.warning('用户名长度需要在3-20个字符之间')
    return
  }

  if (registerForm.password.length < 6 || registerForm.password.length > 32) {
    ElMessage.warning('密码长度需要在6-32个字符之间')
    return
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    const res = await register(registerForm.username, registerForm.password)
    if (res.data.code === 200) {
      const user = res.data.data
      localStorage.setItem('user_id', user.id)
      localStorage.setItem('user_name', user.username)
      localStorage.setItem('user_quota', user.tryOnQuota)
      // 触发认证状态变化事件
      window.dispatchEvent(new CustomEvent('auth-state-changed'))
      ElMessage.success('注册成功，已赠送10次免费试衣额度！')
      router.push('/')
    } else {
      ElMessage.error(res.data.message || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败: ' + (error.response?.data?.message || error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-text {
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-title {
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.auth-tabs {
  margin-top: 24px;
}

.auth-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.auth-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.auth-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

.auth-form {
  margin-top: 24px;
}

.auth-form .el-form-item {
  margin-bottom: 20px;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 0 0 1px var(--color-border) inset;
  transition: box-shadow 0.3s ease;
}

.auth-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-primary) inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--color-primary) inset;
}

.auth-form :deep(.el-input__inner) {
  font-size: 15px;
}

.quota-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  color: #8B5CF6;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  border: none;
  margin-top: 8px;
}

.submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 24px;
  }
}
</style>

<template>
  <div class="profile-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">我的形象</h1>
        <p class="page-subtitle">管理你的个人形象照片</p>
      </div>

      <div v-if="!isLoggedIn" class="login-prompt-section">
        <div class="login-prompt-card card">
          <el-icon class="prompt-icon"><Lock /></el-icon>
          <h3 class="prompt-title">请先登录</h3>
          <p class="prompt-desc">登录后即可管理你的个人形象照片</p>
          <el-button type="primary" class="login-btn" @click="goToLogin">
            <el-icon><User /></el-icon>
            去登录
          </el-button>
        </div>
      </div>

      <div v-else class="profile-content">
        <div class="photos-grid">
          <div
            v-for="profile in profiles"
            :key="profile.id"
            class="photo-item card"
          >
            <div class="photo-image-wrapper">
              <img :src="getFileUrl(profile.fileId)" :alt="profile.name || '我的形象'" class="photo-image" />
              <div class="photo-overlay">
                <el-button type="primary" size="small" class="use-btn" @click="selectProfile(profile)">
                  <el-icon><MagicStick /></el-icon>
                  试穿
                </el-button>
              </div>
            </div>
            <div class="photo-info">
              <div class="photo-name">{{ profile.name || '未命名' }}</div>
              <el-button
                type="danger"
                size="small"
                circle
                @click="deleteProfile(profile.id)"
                class="delete-btn"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="upload-card card" @click="openUploadDialog">
            <div class="upload-card-content">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span class="upload-text">添加形象照</span>
            </div>
          </div>
        </div>

        <div v-if="profiles.length === 0" class="empty-state">
          <el-icon class="empty-icon"><User /></el-icon>
          <p class="empty-text">还没有形象照，快来添加一张吧！</p>
        </div>
      </div>
    </div>

    <!-- 隐藏的上传组件 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".jpg,.jpeg,.png"
      style="display: none"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  uploadFile,
  addUserProfile,
  deleteUserProfile,
  getAllUserProfiles
} from '../api/index.js'

const router = useRouter()

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user_id')
})

const goToLogin = () => {
  router.push('/login')
}
const fileInputRef = ref(null)
const profiles = ref([])

const loadProfiles = async () => {
  const userId = localStorage.getItem('user_id')
  if (!userId) {
    profiles.value = []
    return
  }

  try {
    const res = await getAllUserProfiles(userId)
    if (res.data.code === 200) {
      profiles.value = res.data.data
    }
  } catch (error) {
    console.error('加载形象照失败:', error)
  }
}

onMounted(() => {
  loadProfiles()
})

const openUploadDialog = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event) => {
  const userId = localStorage.getItem('user_id')
  if (!userId) {
    ElMessage.warning('请先登录')
    event.target.value = ''
    return
  }

  const file = event.target.files[0]
  if (!file) return

  if (!checkFile(file)) {
    event.target.value = ''
    return
  }

  try {
    ElMessage.info('正在上传...')
    const uploadRes = await uploadFile(file)
    if (uploadRes.data.code === 200) {
      const fileId = uploadRes.data.data.fileId
      const addRes = await addUserProfile(userId, file.name, fileId)
      if (addRes.data.code === 200) {
        ElMessage.success('添加形象照成功!')
        loadProfiles()
      } else {
        ElMessage.error(addRes.data.message || '添加失败')
      }
    } else {
      ElMessage.error(uploadRes.data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
  } finally {
    event.target.value = ''
  }
}

const checkFile = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!')
    return false
  }
  return true
}

const deleteProfile = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这张形象照吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteUserProfile(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功!')
      loadProfiles()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }
}

const selectProfile = (profile) => {
  ElMessage.info('已选择这张形象照，跳转到试衣间...')
  setTimeout(() => {
    router.push('/')
  }, 500)
}

const getFileUrl = (fileId) => {
  return `/api/files/download/${fileId}`
}
</script>

<style scoped>
.profile-page {
  padding: 60px 0 80px;
}

.login-prompt-section {
  padding: 60px 0;
}

.login-prompt-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  padding: 60px 40px;
}

.prompt-icon {
  font-size: 72px;
  color: var(--color-primary);
  margin-bottom: 24px;
}

.prompt-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.prompt-desc {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.login-prompt-card .login-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  border: none;
  border-radius: var(--radius-button);
  padding: 12px 36px;
  font-size: 16px;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.profile-content {
  min-height: 300px;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.photo-item {
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-item:hover {
  transform: translateY(-6px);
}

.photo-image-wrapper {
  position: relative;
  height: 280px;
  overflow: hidden;
  margin: 0 0 16px 0;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-item:hover .photo-image {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photo-item:hover .photo-overlay {
  opacity: 1;
}

.use-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  border: none;
}

.photo-info {
  padding: 0 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-prim
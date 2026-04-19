<template>
  <div class="wardrobe-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">我的衣橱</h1>
        <p class="page-subtitle">管理你的专属时尚收藏</p>
      </div>

      <div v-if="!isLoggedIn" class="login-prompt-section">
        <div class="login-prompt-card card">
          <el-icon class="prompt-icon"><Lock /></el-icon>
          <h3 class="prompt-title">请先登录</h3>
          <p class="prompt-desc">登录后即可管理你的专属衣橱</p>
          <el-button type="primary" class="login-btn" @click="goToLogin">
            <el-icon><User /></el-icon>
            去登录
          </el-button>
        </div>
      </div>

      <el-tabs v-else v-model="activeCategory" class="wardrobe-tabs">
        <el-tab-pane label="全部" name="all">
          <div class="wardrobe-content">
            <div class="clothes-grid">
              <div
                v-for="item in allItems"
                :key="item.id"
                class="clothing-item card"
                @click="selectItem(item)"
              >
                <div class="clothing-image-wrapper">
                  <img :src="getFileUrl(item.fileId)" :alt="item.name || '衣服'" class="clothing-image" />
                  <div class="clothing-overlay">
                    <el-button type="primary" size="small" class="use-btn">
                      <el-icon><MagicStick /></el-icon>
                      试穿
                    </el-button>
                  </div>
                </div>
                <div class="clothing-info">
                  <div class="clothing-name">{{ item.name || '未命名' }}</div>
                  <div class="clothing-actions">
                      <span v-if="getCategoryLabel(item.category) ==='上装'" class="category-tag tops-tag">{{ getCategoryLabel(item.category) }}</span>
                      <span v-if="getCategoryLabel(item.category) ==='下装'" class="category-tag bottoms-tag">{{ getCategoryLabel(item.category) }}</span>
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click.stop="deleteItem(item.id)"
                      class="delete-btn"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>

              <div class="upload-card card" @click="openUploadDialog">
                <div class="upload-card-content">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <span class="upload-text">添加新衣服</span>
                </div>
              </div>
            </div>
            <div v-if="allItems.length === 0" class="empty-state">
              <el-icon class="empty-icon"><Box /></el-icon>
              <p class="empty-text">衣橱还没有衣服，快来添加一些吧！</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="上装" name="TOPS">
          <div class="wardrobe-content">
            <div class="clothes-grid">
              <div
                v-for="item in topsItems"
                :key="item.id"
                class="clothing-item card"
                @click="selectItem(item)"
              >
                <div class="clothing-image-wrapper">
                  <img :src="getFileUrl(item.fileId)" :alt="item.name || '衣服'" class="clothing-image" />
                  <div class="clothing-overlay">
                    <el-button type="primary" size="small" class="use-btn">
                      <el-icon><MagicStick /></el-icon>
                      试穿
                    </el-button>
                  </div>
                </div>
                <div class="clothing-info">
                  <div class="clothing-name">{{ item.name || '未命名' }}</div>
                  <div class="clothing-actions">
                    <span class="category-tag tops-tag">上装</span>
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click.stop="deleteItem(item.id)"
                      class="delete-btn"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>

              <div class="upload-card card" @click="() => openUploadDialogWithCategory('TOPS')">
                <div class="upload-card-content">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <span class="upload-text">添加上装</span>
                </div>
              </div>
            </div>
            <div v-if="topsItems.length === 0" class="empty-state">
              <el-icon class="empty-icon"><Box /></el-icon>
              <p class="empty-text">还没有上装，快来添加一些吧！</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="下装" name="BOTTOMS">
          <div class="wardrobe-content">
            <div class="clothes-grid">
              <div
                v-for="item in bottomsItems"
                :key="item.id"
                class="clothing-item card"
                @click="selectItem(item)"
              >
                <div class="clothing-image-wrapper">
                  <img :src="getFileUrl(item.fileId)" :alt="item.name || '衣服'" class="clothing-image" />
                  <div class="clothing-overlay">
                    <el-button type="primary" size="small" class="use-btn">
                      <el-icon><MagicStick /></el-icon>
                      试穿
                    </el-button>
                  </div>
                </div>
                <div class="clothing-info">
                  <div class="clothing-name">{{ item.name || '未命名' }}</div>
                  <div class="clothing-actions">
                    <span class="category-tag bottoms-tag">下装</span>
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click.stop="deleteItem(item.id)"
                      class="delete-btn"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>

              <div class="upload-card card" @click="() => openUploadDialogWithCategory('BOTTOMS')">
                <div class="upload-card-content">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <span class="upload-text">添加下装</span>
                </div>
              </div>
            </div>
            <div v-if="bottomsItems.length === 0" class="empty-state">
              <el-icon class="empty-icon"><Box /></el-icon>
              <p class="empty-text">还没有下装，快来添加一些吧！</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 隐藏的上传组件 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".jpg,.jpeg,.png"
      style="display: none"
      @change="handleFileSelect"
    />

    <el-dialog
      v-model="categoryDialogVisible"
      title="选择分类"
      width="420px"
      class="category-dialog"
    >
      <div class="dialog-content">
        <p class="dialog-desc">请选择这件衣服的分类：</p>
        <div class="category-options">
          <div
            class="category-option"
            :class="{ active: selectedCategory === 'TOPS' }"
            @click="selectedCategory = 'TOPS'"
          >
            <span class="option-icon">👔</span>
            <span class="option-label">上装</span>
          </div>
          <div
            class="category-option"
            :class="{ active: selectedCategory === 'BOTTOMS' }"
            @click="selectedCategory = 'BOTTOMS'"
          >
            <span class="option-icon">👖</span>
            <span class="option-label">下装</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryDialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="confirmAddToWardrobe" class="confirm-btn">确认添加</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  uploadFile,
  addWardrobeItem,
  deleteWardrobeItem,
  getAllWardrobeItems,
  getWardrobeItemsByCategory
} from '../api/index.js'

const router = useRouter()

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user_id')
})

const goToLogin = () => {
  router.push('/login')
}
const fileInputRef = ref(null)
const pendingCategory = ref(null)

const activeCategory = ref('all')
const allItems = ref([])
const topsItems = ref([])
const bottomsItems = ref([])
const categoryDialogVisible = ref(false)
const selectedCategory = ref('TOPS')
const pendingFile = ref(null)

const loadWardrobeItems = async () => {
  const userId = localStorage.getItem('user_id')
  if (!userId) {
    allItems.value = []
    topsItems.value = []
    bottomsItems.value = []
    return
  }

  try {
    const [allRes, topsRes, bottomsRes] = await Promise.all([
      getAllWardrobeItems(userId),
      getWardrobeItemsByCategory(userId, 'TOPS'),
      getWardrobeItemsByCategory(userId, 'BOTTOMS')
    ])

    if (allRes.data.code === 200) allItems.value = allRes.data.data
    if (topsRes.data.code === 200) topsItems.value = topsRes.data.data
    if (bottomsRes.data.code === 200) bottomsItems.value = bottomsRes.data.data
  } catch (error) {
    console.error('加载衣橱失败:', error)
  }
}

onMounted(() => {
  loadWardrobeItems()
})

const openUploadDialog = () => {
  pendingCategory.value = null
  fileInputRef.value?.click()
}

const openUploadDialogWithCategory = (category) => {
  pendingCategory.value = category
  fileInputRef.value?.click()
}

const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!checkFile(file)) {
    event.target.value = ''
    return
  }

  pendingFile.value = file

  if (pendingCategory.value) {
    await uploadWithCategory(pendingCategory.value)
  } else {
    selectedCategory.value = 'TOPS'
    categoryDialogVisible.value = true
  }

  event.target.value = ''
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

const uploadWithCategory = async (category) => {
  const userId = localStorage.getItem('user_id')
  if (!userId) {
    ElMessage.warning('请先登录')
    return
  }

  if (!pendingFile.value) return

  try {
    ElMessage.info('正在上传...')
    const uploadRes = await uploadFile(pendingFile.value)
    if (uploadRes.data.code === 200) {
      const fileId = uploadRes.data.data.fileId
      const addRes = await addWardrobeItem(userId, pendingFile.value.name, category, fileId)
      if (addRes.data.code === 200) {
        ElMessage.success('添加到衣橱成功!')
        loadWardrobeItems()
      } else {
        ElMessage.error(addRes.data.message || '添加到衣橱失败')
      }
    } else {
      ElMessage.error(uploadRes.data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
  } finally {
    pendingFile.value = null
    pendingCategory.value = null
  }
}

const confirmAddToWardrobe = async () => {
  const userId = localStorage.getItem('user_id')
  if (!userId) {
    ElMessage.warning('请先登录')
    categoryDialogVisible.value = false
    return
  }

  if (!pendingFile.value) return

  try {
    ElMessage.info('正在上传...')
    const uploadRes = await uploadFile(pendingFile.value)
    if (uploadRes.data.code === 200) {
      const fileId = uploadRes.data.data.fileId
      const addRes = await addWardrobeItem(userId, pendingFile.value.name, selectedCategory.value, fileId)
      if (addRes.data.code === 200) {
        ElMessage.success('添加到衣橱成功!')
        loadWardrobeItems()
      } else {
        ElMessage.error(addRes.data.message || '添加到衣橱失败')
      }
    } else {
      ElMessage.error(uploadRes.data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传错误:', error)
    ElMessage.error('上传失败: ' + (error.message || '未知错误'))
  } finally {
    categoryDialogVisible.value = false
    pendingFile.value = null
    pendingCategory.value = null
  }
}

const deleteItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这件衣服吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteWardrobeItem(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功!')
      loadWardrobeItems()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }
}

const selectItem = (item) => {
  ElMessage.info('已选择这件衣服，跳转到试衣间...')
  setTimeout(() => {
    router.push('/')
  }, 500)
}

const getCategoryLabel = (category) => {
  const labels = {
    'TOPS': '上装',
    'BOTTOMS': '下装'
  }
  return labels[category] || category
}

const getFileUrl = (fileId) => {
  return `/api/files/download/${fileId}`
}
</script>

<style scoped>
.wardrobe-page {
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

.wardrobe-tabs {
  margin-bottom: 30px;
}

.wardrobe-tabs :deep(.el-tabs__header) {
  margin: 0 0 40px 0;
  justify-content: center;
}

.wardrobe-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.wardrobe-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  padding: 0 32px;
  color: var(--color-text-secondary);
}

.wardrobe-tabs :deep(.el-tabs__item.is-active) {
  color: var(--color-primary);
}

.wardrobe-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  height: 3px;
  border-radius: 2px;
}

.wardrobe-content {
  min-height: 300px;
}

.clothes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

.clothing-item {
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clothing-item:hover {
  transform: translateY(-6px);
}

.clothing-image-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
  margin: 0 0 16px 0;
}

.clothing-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.clothing-item:hover .clothing-image {
  transform: scale(1.05);
}

.clothing-overlay {
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

.clothing-item:hover .clothing-overlay {
  opacity: 1;
}

.use-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  border: none;
}

.clothing-info {
  padding: 0 20px 20px;
}

.clothing-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clothing-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-tag {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
}

.tops-tag {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-primary);
}

.bottoms-tag {
  background: rgba(236, 72, 153, 0.1);
  color: var(--color-accent);
}

.delete-btn {
  width: 32px;
  height: 32px;
  padding: 0;
}

/* Upload Card */
.upload-card {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  cursor: pointer;
  border: 2px dashed var(--color-border);
  background: var(--color-bg);
  transition: all 0.3s ease;
}

.upload-card:hover {
  border-color: var(--color-primary);
  background: rgba(99, 102, 241, 0.05);
  transform: translateY(-6px);
}

.upload-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
}

.upload-icon {
  font-size: 48px;
  color: var(--color-primary);
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  color: var(--color-border);
}

.empty-text {
  font-size: 16px;
}

.category-dialog :deep(.el-dialog__header) {
  text-align: center;
  padding-bottom: 8px;
}

.category-dialog :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.dialog-content {
  padding: 20px 0;
}

.dialog-desc {
  text-align: center;
  font-size: 15px;
  color: var(--color-text-seconda
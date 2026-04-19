<template>
  <div class="wardrobe">
    <div class="wardrobe-header">
      <h2>我的衣橱</h2>
    </div>

    <el-tabs v-model="activeCategory" class="wardrobe-tabs">
      <el-tab-pane label="全部" name="all">
        <div class="wardrobe-content">
          <div class="upload-section">
            <el-upload
              drag
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="handleUpload"
              accept=".jpg,.jpeg,.png"
              class="upload-box"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽图片到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  上传衣服到衣橱
                </div>
              </template>
            </el-upload>
          </div>
          <div class="clothes-grid">
            <div
              v-for="item in allItems"
              :key="item.id"
              class="clothing-item"
              @click="selectItem(item)"
            >
              <img :src="getFileUrl(item.fileId)" :alt="item.name || '衣服'" class="clothing-image" />
              <div class="clothing-info">
                <span v-if="getCategoryLabel(item.category) ==='TOPS'" class="clothing-category tops-tag">{{ getCategoryLabel(item.category) }}</span>
                <span v-if="getCategoryLabel(item.category) ==='BOTTOMS'" class="clothing-category bottoms-tag">{{ getCategoryLabel(item.category) }}</span>
                <el-button
                  type="danger"
                  size="small"
                  @click.stop="deleteItem(item.id)"
                  class="delete-btn"
                >
                  <el-icon><delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="allItems.length === 0" class="empty-state">
            <el-icon><box /></el-icon>
            <p>衣橱还没有衣服，快来添加一些吧！</p>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="上装" name="TOPS">
        <div class="wardrobe-content">
          <div class="upload-section">
            <el-upload
              drag
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="(options) => handleUploadWithCategory(options, 'TOPS')"
              accept=".jpg,.jpeg,.png"
              class="upload-box"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽图片到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  上传上装
                </div>
              </template>
            </el-upload>
          </div>
          <div class="clothes-grid">
            <div
              v-for="item in topsItems"
              :key="item.id"
              class="clothing-item"
              @click="selectItem(item)"
            >
              <img :src="getFileUrl(item.fileId)" :alt="item.name || '衣服'" class="clothing-image" />
              <div class="clothing-info">
                <span class="clothing-category">上装</span>
                <el-button
                  type="danger"
                  size="small"
                  @click.stop="deleteItem(item.id)"
                  class="delete-btn"
                >
                  <el-icon><delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="topsItems.length === 0" class="empty-state">
            <el-icon><box /></el-icon>
            <p>还没有上装，快来添加一些吧！</p>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="下装" name="BOTTOMS">
        <div class="wardrobe-content">
          <div class="upload-section">
            <el-upload
              drag
              action="#"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :http-request="(options) => handleUploadWithCategory(options, 'BOTTOMS')"
              accept=".jpg,.jpeg,.png"
              class="upload-box"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽图片到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  上传下装
                </div>
              </template>
            </el-upload>
          </div>
          <div class="clothes-grid">
            <div
              v-for="item in bottomsItems"
              :key="item.id"
              class="clothing-item"
              @click="selectItem(item)"
            >
              <img :src="getFileUrl(item.fileId)" :alt="item.name || '衣服'" class="clothing-image" />
              <div class="clothing-info">
                <span class="clothing-category">下装</span>
                <el-button
                  type="danger"
                  size="small"
                  @click.stop="deleteItem(item.id)"
                  class="delete-btn"
                >
                  <el-icon><delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div v-if="bottomsItems.length === 0" class="empty-state">
            <el-icon><box /></el-icon>
            <p>还没有下装，快来添加一些吧！</p>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="categoryDialogVisible" title="选择分类" width="400px">
      <p>请选择这件衣服的分类：</p>
      <div class="category-options">
        <el-radio v-model="selectedCategory" label="TOPS">上装</el-radio>
        <el-radio v-model="selectedCategory" label="BOTTOMS">下装</el-radio>
      </div>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddToWardrobe">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  uploadFile,
  addWardrobeItem,
  deleteWardrobeItem,
  getAllWardrobeItems,
  getWardrobeItemsByCategory
} from '../api/index.js'

const emit = defineEmits(['select-item'])

const activeCategory = ref('all')
const allItems = ref([])
const topsItems = ref([])
const bottomsItems = ref([])
const categoryDialogVisible = ref(false)
const selectedCategory = ref('TOPS')
const pendingFile = ref(null)

const loadWardrobeItems = async () => {
  try {
    const [allRes, topsRes, bottomsRes] = await Promise.all([
      getAllWardrobeItems(),
      getWardrobeItemsByCategory('TOPS'),
      getWardrobeItemsByCategory('BOTTOMS')
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

const beforeUpload = (file) => {
  console.log('beforeUpload called with file:', file)
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

const handleUpload = async ({ file }) => {
  console.log('handleUpload called with file:', file)
  pendingFile.value = file
  categoryDialogVisible.value = true
}

const handleUploadWithCategory = async ({ file }, category) => {
  console.log('handleUploadWithCategory called with file:', file, 'category:', category)
  try {
    ElMessage.info('正在上传...')
    const uploadRes = await uploadFile(file)
    console.log('uploadRes:', uploadRes)
    if (uploadRes.data.code === 200) {
      const fileId = uploadRes.data.data.fileId
      const addRes = await addWardrobeItem(file.name, category, fileId)
      console.log('addRes:', addRes)
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
  }
}

const confirmAddToWardrobe = async () => {
  console.log('confirmAddToWardrobe called, pendingFile:', pendingFile.value)
  if (!pendingFile.value) return

  try {
    ElMessage.info('正在上传...')
    const uploadRes = await uploadFile(pendingFile.value)
    console.log('uploadRes:', uploadRes)
    if (uploadRes.data.code === 200) {
      const fileId = uploadRes.data.data.fileId
      const addRes = await addWardrobeItem(pendingFile.value.name, selectedCategory.value, fileId)
      console.log('addRes:', addRes)
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
  emit('select-item', item)
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
.wardrobe {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  padding: 30px;
  margin-bottom: 40px;
}

.wardrobe-header h2 {
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 28px;
}

.wardrobe-tabs :deep(.el-tabs__header) {
  margin: 0 0 20px 0;
}

.wardrobe-content {
  min-height: 200px;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-box {
  width: 100%;
}

.clothes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.clothing-item {
  position: relative;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.clothing-item:hover {
  border-color: #409eff;
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.clothing-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.clothing-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
}

.clothing-category {
  font-size: 12px;
  color: #666;
  background: #e8f4ff;
  padding: 2px 8px;
  border-radius: 10px;
}

.delete-btn {
  padding: 4px 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state .el-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.category-options {
  padding: 20px 0;
  display: flex;
  gap: 40px;
  justify-content: center;
}
</style>

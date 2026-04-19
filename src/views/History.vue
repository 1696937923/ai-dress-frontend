<template>
  <div class="history-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">我的试衣记录</h1>
        <p class="page-subtitle">查看你的AI试衣历史和结果</p>
      </div>

      <div class="history-content">
        <div v-if="loading" class="loading-state">
          <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
          <p>加载中...</p>
        </div>

        <div v-else-if="tasks.length === 0" class="empty-state">
          <el-icon class="empty-icon"><Clock /></el-icon>
          <p class="empty-text">还没有试衣记录，快去体验AI试衣吧！</p>
          <el-button type="primary" @click="goToHome" class="start-btn">
            <el-icon><MagicStick /></el-icon>
            开始试衣
          </el-button>
        </div>

        <div v-else class="tasks-grid">
          <div v-for="task in tasks" :key="task.taskId" class="task-card card">
            <div class="task-header">
              <div class="task-time">{{ formatTime(task.createdAt) }}</div>
<!--              <div class="task-id">任务ID: {{ task.taskId.substring(0, 8) }}...</div>-->
              <div class="task-status" :class="getStatusClass(task.status)">
                <el-icon v-if="task.status === 'PROCESSING'" class="status-icon"><Loading /></el-icon>
                <el-icon v-else-if="task.status === 'SUCCESS'" class="status-icon"><CircleCheck /></el-icon>
                <el-icon v-else-if="task.status === 'FAILED'" class="status-icon"><CircleClose /></el-icon>
                <span>{{ getStatusText(task.status) }}</span>
              </div>
            </div>

            <div class="task-result">
              <div v-if="task.status === 'SUCCESS' && task.resultFileUrl" class="result-image-wrapper">
                <img :src="task.resultFileUrl" alt="试衣结果" class="result-image" @click="previewImage(task.resultFileUrl)" />
                <div class="result-overlay">
                  <el-button type="primary" size="small" @click="previewImage(task.resultFileUrl)">
                    <el-icon><View /></el-icon>
                    查看大图
                  </el-button>
                  <el-button size="small" @click="downloadImage(task.resultFileUrl)">
                    <el-icon><Download /></el-icon>
                    保存
                  </el-button>
                </div>
              </div>

              <div v-else-if="task.status === 'PROCESSING'" class="processing-state">
                <el-icon class="processing-icon" :size="48"><Loading /></el-icon>
                <p class="processing-text">AI正在努力生成试衣效果...</p>
                <p class="processing-hint">这可能需要1-3分钟，请稍后刷新页面查看</p>
              </div>

              <div v-else-if="task.status === 'FAILED'" class="failed-state">
                <el-icon class="failed-icon" :size="48"><Warning /></el-icon>
                <p class="failed-text">生成失败</p>
                <p class="failed-error" v-if="task.errorMessage">{{ task.errorMessage }}</p>
              </div>

              <div v-else class="pending-state">
                <el-icon class="pending-icon" :size="48"><Clock /></el-icon>
                <p class="pending-text">等待处理...</p>
              </div>
            </div>

            <div class="task-footer">
              <div class="task-actions">
                <el-button
                  class="favorite-btn"
                  :class="{ 'is-favorited': task.isFavorited }"
                  size="small"
                  @click="handleToggleFavorite(task.taskId)"
                >
                  <el-icon><Star /></el-icon>
                  收藏
                </el-button>
                <el-button v-if="task.status === 'PROCESSING'" size="small" @click="refreshTask(task.taskId)">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
                <el-button class="delete-btn" size="small" @click="handleDeleteTask(task.taskId)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-image-viewer
      v-if="showPreview"
      :url-list="[previewUrl]"
      :initial-index="0"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAllTasks,
  getTaskStatus,
  deleteTask,
  toggleFavorite
} from '../api/index.js'

const router = useRouter()

const loading = ref(false)
const tasks = ref([])
const showPreview = ref(false)
const previewUrl = ref('')

const loadTasks = async () => {
  loading.value = true
  try {
    const res = await getAllTasks()
    if (res.data.code === 200) {
      tasks.value = res.data.data
    } else {
      ElMessage.error(res.data.message || '获取试衣记录失败')
    }
  } catch (error) {
    console.error('获取试衣记录失败:', error)
    ElMessage.error('获取试衣记录失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const refreshTask = async (taskId) => {
  try {
    const res = await getTaskStatus(taskId)
    if (res.data.code === 200) {
      const index = tasks.value.findIndex(t => t.taskId === taskId)
      if (index !== -1) {
        tasks.value[index] = res.data.data
      }
      ElMessage.success('状态已更新')
    }
  } catch (error) {
    console.error('刷新任务状态失败:', error)
    ElMessage.error('刷新失败')
  }
}

const handleDeleteTask = async (taskId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条试衣记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await deleteTask(taskId)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      loadTasks()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除试衣记录失败:', error)
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }
}

const handleToggleFavorite = async (taskId) => {
  try {
    const res = await toggleFavorite(taskId)
    if (res.data.code === 200) {
      const index = tasks.value.findIndex(t => t.taskId === taskId)
      if (index !== -1) {
        tasks.value[index].isFavorited = res.data.data.isFavorited
      }
      ElMessage.success(res.data.message)
    } else {
      ElMessage.error(res.data.message || '操作失败')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败: ' + (error.message || '未知错误'))
  }
}

const previewImage = (url) => {
  previewUrl.value = url
  showPreview.value = true
}

const downloadImage = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.download = 'ai-tryon-result.jpg'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatTime = (timeStr) => {
  if (!timeStr) return '未知时间'
  // 直接返回后端格式化好的时间字符串
  return timeStr
}

const goToHome = () => {
  router.push('/')
}

const getStatusClass = (status) => {
  const classes = {
    'PROCESSING': 'status-processing',
    'SUCCESS': 'status-success',
    'FAILED': 'status-failed'
  }
  return classes[status] || 'status-pending'
}

const getStatusText = (status) => {
  const texts = {
    'PROCESSING': '处理中',
    'SUCCESS': '已完成',
    'FAILED': '失败'
  }
  return texts[status] || '等待中'
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.history-page {
  padding: 60px 0 80px;
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

.history-content {
  min-height: 400px;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-secondary);
}

.loading-icon,
.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  color: var(--color-border);
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-text {
  font-size: 16px;
  margin-bottom: 24px;
}

.start-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  border: none;
  padding: 12px 32px;
  border-radius: var(--radius-button);
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.task-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.task-id {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-family: monospace;
}

.task-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 20px;
}

.status-processing {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.status-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-failed {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.status-pending {
  background: rgba(107, 114, 128, 0.1);
  color: #6B7280;
}

.status-icon {
  font-size: 16px;
}

.task-result {
  flex: 1;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  position: relative;
}

.result-image-wrapper {
  width: 100%;
  height: 100%;
  min-height: 280px;
  position: relative;
  cursor: pointer;
}

.result-image {
  width: 100%;
  height: 280px;
  object-fit: contain;
  background: white;
}

.result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-image-wrapper:hover .result-overlay {
  opacity: 1;
}

.processing-state,
.failed-state,
.pending-state {
  text-align: center;
  padding: 40px 20px;
}

.processing-icon,
.failed-icon,
.pending-icon {
  margin-bottom: 16px;
  color: var(--color-text-secondary);
}

.processing-icon {
  animation: spin 1s linear infinite;
  color: #F59E0B;
}

.failed-icon {
  color: #EF4444;
}

.processing-text,
.failed-text,
.pending-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.processing-hint {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.failed-error {
  font-size: 13px;
  color: var(--color-text-secondary);
  max-width: 260px;
  word-break: break-all;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.task-time {
  margin-left: -18px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.task-actions {
  display: flex;
  gap: 8px;
}

/* 收藏按钮样式 */
.favorite-btn {
  border-radius: 20px;
  padding: 8px 16px;
  color: #909399;
  border: 1px solid #dcdfe6;
  background: white;
}

.favorite-btn:hover {
  color: #e6643c;
  border-color: #e6643c;
}

.favorite-btn.is-favorited {
  color: #e6643c;
  border-color: #e6643c;
  background: rgba(230, 162, 60, 0.1);
}

.favorite-btn.is-favorited:hover {
  background: rgba(230, 162, 60, 0.2);
}

/* 删除按钮椭圆形样式 */
.delete-btn {
  border-radius: 20px;
  padding: 8px 16px;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
  background: white;
}

.delete-btn:hover {
  color: white;
  background: #f56c6c;
  border-color: #f56c6c;
}

.refresh-section {
  text-align: center;
  margin-top: 40px;
}

@media (max-width: 768px) {
  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>

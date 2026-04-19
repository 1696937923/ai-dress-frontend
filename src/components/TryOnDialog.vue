<template>
  <el-dialog
    v-model="visible"
    title="选择照片和衣服"
    width="1100px"
    class="tryon-dialog"
    :close-on-click-modal="false"
  >
    <div class="dialog-content">
      <!-- 左侧：选择我的形象 -->
      <div class="selection-section">
        <h3 class="section-title">
          <el-icon><User /></el-icon>
          选择我的形象
        </h3>
        <div class="profile-list">
          <div
            v-for="profile in profiles"
            :key="profile.id"
            class="profile-card card"
            :class="{ selected: selectedProfile?.id === profile.id }"
            @click="selectProfile(profile)"
          >
            <img :src="getFileUrl(profile.fileId)" :alt="profile.name" class="profile-img" />
            <div class="profile-name">{{ profile.name || '未命名' }}</div>
            <el-icon v-if="selectedProfile?.id === profile.id" class="check-icon"><CircleCheck /></el-icon>
          </div>
          <div v-if="profiles.length === 0" class="empty-hint">
            <p>暂无形象照</p>
            <router-link to="/profile" class="add-link">去添加 &rarr;</router-link>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 右侧：选择衣服 -->
      <div class="selection-section">
        <h3 class="section-title">
          <el-icon><Tshirt /></el-icon>
          选择衣服
        </h3>
        <el-tabs v-model="clothingTab" class="clothing-tabs">
          <el-tab-pane label="全部" name="all">
            <div class="clothing-list">
              <div
                v-for="item in allClothes"
                :key="item.id"
                class="clothing-card card"
                :class="{ selected: selectedClothing?.id === item.id }"
                @click="selectClothing(item)"
              >
                <img :src="getFileUrl(item.fileId)" :alt="item.name" class="clothing-img" />
                <div class="clothing-info">
                  <span class="clothing-name">{{ item.name || '未命名' }}</span>
                  <span v-if="getCategoryLabel(item.category) === '上装'" class="clothing-cat tops-tag">{{ getCategoryLabel(item.category) }}</span>
                  <span v-if="getCategoryLabel(item.category) === '下装'" class="clothing-cat bottoms-tag">{{ getCategoryLabel(item.category) }}</span>
                </div>
                <el-icon v-if="selectedClothing?.id === item.id" class="check-icon"><CircleCheck /></el-icon>
              </div>
              <div v-if="allClothes.length === 0" class="empty-hint">
                <p>暂无衣服</p>
                <router-link to="/wardrobe" class="add-link">去添加 &rarr;</router-link>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="上装" name="TOPS">
            <div class="clothing-list">
              <div
                v-for="item in topsClothes"
                :key="item.id"
                class="clothing-card card"
                :class="{ selected: selectedClothing?.id === item.id }"
                @click="selectClothing(item)"
              >
                <img :src="getFileUrl(item.fileId)" :alt="item.name" class="clothing-img" />
                <div class="clothing-info">
                  <span class="clothing-name">{{ item.name || '未命名' }}</span>
                  <span class="clothing-cat tops-tag">上装</span>
                </div>
                <el-icon v-if="selectedClothing?.id === item.id" class="check-icon"><CircleCheck /></el-icon>
              </div>
              <div v-if="topsClothes.length === 0" class="empty-hint">
                <p>暂无上装</p>
                <router-link to="/wardrobe" class="add-link">去添加 &rarr;</router-link>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="下装" name="BOTTOMS">
            <div class="clothing-list">
              <div
                v-for="item in bottomsClothes"
                :key="item.id"
                class="clothing-card card"
                :class="{ selected: selectedClothing?.id === item.id }"
                @click="selectClothing(item)"
              >
                <img :src="getFileUrl(item.fileId)" :alt="item.name" class="clothing-img" />
                <div class="clothing-info">
                  <span class="clothing-name">{{ item.name || '未命名' }}</span>
                  <span class="clothing-cat bottoms-tag">下装</span>
                </div>
                <el-icon v-if="selectedClothing?.id === item.id" class="check-icon"><CircleCheck /></el-icon>
              </div>
              <div v-if="bottomsClothes.length === 0" class="empty-hint">
                <p>暂无下装</p>
                <router-link to="/wardrobe" class="add-link">去添加 &rarr;</router-link>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 额度提示 -->
      <span/>
    <div v-if="isLoggedIn" class="quota-hint">
      <el-icon><MagicStick /></el-icon>
      <span>剩余试衣次数: <strong>{{ userQuota }}</strong></span>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedProfile || !selectedClothing"
          :loading="loading"
          @click="handleConfirm"
          class="confirm-btn"
        >
          <el-icon><MagicStick /></el-icon>
          开始试穿
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAllUserProfiles,
  getAllWardrobeItems,
  getWardrobeItemsByCategory,
  generateTryOn,
  getTaskStatus
} from '../api/index.js'

const router = useRouter()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const clothingTab = ref('all')
const profiles = ref([])
const wardrobeItems = ref([])
const selectedProfile = ref(null)
const selectedClothing = ref(null)
const userQuota = ref(0)

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('user_id')
})

const userId = computed(() => {
  return localStorage.getItem('user_id')
})

const allClothes = computed(() => wardrobeItems.value)
const topsClothes = computed(() => wardrobeItems.value.filter(item => item.category === 'TOPS'))
const bottomsClothes = computed(() => wardrobeItems.value.filter(item => item.category === 'BOTTOMS'))

const loadData = async () => {
  try {
    const [profileRes, wardrobeRes] = await Promise.all([
      getAllUserProfiles(),
      getAllWardrobeItems()
    ])

    if (profileRes.data.code === 200) profiles.value = profileRes.data.data
    if (wardrobeRes.data.code === 200) wardrobeItems.value = wardrobeRes.data.data
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const loadUserQuota = () => {
  const quota = localStorage.getItem('user_quota')
  if (quota !== null) {
    userQuota.value = parseInt(quota, 10)
  }
}

onMounted(() => {
  loadData()
  loadUserQuota()
})

const selectProfile = (profile) => {
  selectedProfile.value = profile
}

const selectClothing = (item) => {
  selectedClothing.value = item
}

const handleCancel = () => {
  visible.value = false
  selectedProfile.value = null
  selectedClothing.value = null
}

const handleConfirm = async () => {
  if (!isLoggedIn.value) {
    try {
      await ElMessageBox.confirm('请先登录后再使用试衣功能', '提示', {
        confirmButtonText: '去登录',
        cancelButtonText: '取消',
        type: 'warning'
      })
      visible.value = false
      router.push('/login')
    } catch {
      // 用户取消
    }
    return
  }

  if (!selectedProfile.value || !selectedClothing.value) {
    ElMessage.warning('请选择形象照和衣服')
    return
  }

  loading.value = true

  try {
    // 直接提交试衣任务，后端会检查并扣减额度
    const res = await generateTryOn(userId.value, selectedProfile.value.fileId, selectedClothing.value.fileId)
    if (res.data.code === 200) {
      ElMessage.success('试衣任务已提交！您可以在"我的试衣记录"中查看结果')

      // 更新本地剩余额度（从后端返回的数据）
      if (res.data.data.remainingQuota !== undefined && res.data.data.remainingQuota !== null) {
        userQuota.value = res.data.data.remainingQuota
        localStorage.setItem('user_quota', userQuota.value)
        // 触发一个自定义事件，通知Navbar更新额度显示
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user_quota',
          newValue: String(userQuota.value)
        }))
      }

      visible.value = false
      selectedProfile.value = null
      selectedClothing.value = null
      emit('taskSubmitted')
    } else {
      ElMessage.error(res.data.message || '提交失败')
    }
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || '未知错误'
    ElMessage.error('提交失败: ' + errorMsg)
  } finally {
    loading.value = false
  }
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
.tryon-dialog :deep(.el-dialog) {
  display: flex;
  flex-direction: column;
  margin: 5vh auto !important;
  max-height: 90vh;
  overflow: hidden;
}

.tryon-dialog :deep(.el-dialog__header) {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.tryon-dialog :deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tryon-dialog :deep(.el-dialog__body) {
  flex: 1;
  overflow: hidden;
  padding: 20px;
}

.dialog-content {
  display: flex;
  gap: 24px;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.selection-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  flex-shrink: 0;
}

.divider {
  width: 1px;
  background: var(--color-border);
  flex-shrink: 0;
}

.profile-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  flex: 1;
  align-content: start;
}

.profile-list::-webkit-scrollbar {
  width: 6px;
}

.profile-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.profile-list::-webkit-scrollbar-track {
  background: transparent;
}

.profile-card {
  position: relative;
  padding: 0;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.profile-card:hover {
  border-color: var(--color-primary);
}

.profile-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.profile-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius-card) var(--radius-card) 0 0;
}

.profile-name {
  padding: 10px 12px;
  font-size: 13px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clothing-tabs {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.clothing-tabs :deep(.el-tabs__header) {
  margin: 0 0 16px 0;
}

.clothing-tabs :deep(.el-tabs__item) {
  padding: 0 16px;
  font-size: 14px;
}

.clothing-tabs :deep(.el-tabs__content) {
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.clothing-tabs :deep(.el-tab-pane) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.clothing-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
  flex: 1;
  align-content: start;
}

.clothing-list::-webkit-scrollbar {
  width: 6px;
}

.clothing-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.clothing-list::-webkit-scrollbar-track {
  background: transparent;
}

.clothing-card {
  position: relative;
  padding: 0;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.clothing-card:hover {
  border-color: var(--color-primary);
}

.clothing-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.clothing-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: var(--radius-card) var(--radius-card) 0 0;
}

.clothing-info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.clothing-name {
  font-size: 13px;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clothing-cat {
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: 10px;
  width: fit-content;
}

.tops-tag {
    background: rgba(99, 102, 241, 0.1);
    color: var(--color-primary);
}

.bottoms-tag {
    background: rgba(236, 72, 153, 0.1);
    color: var(--color-accent);
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 24px;
  color: var(--color-primary);
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.empty-hint {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.empty-hint p {
  margin-bottom: 12px;
}

.add-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.add-link:hover {
  text-decoration: underline;
}

.quota-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  margin: 0px 20px 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
  border-radius: 12px;
  font-size: 14px;
  color: #8B5CF6;
}

.quota-hint strong {
  font-size: 18px;
  font-weight: 700;
}

.tryon-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.confirm-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  border: none;
  padding: 12px 28px;
  border-radius: var(--radius-button);
}
</style>

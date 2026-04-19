<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text fade-in">
            <h1 class="hero-title">
              AI 虚拟试衣
              <span class="gradient-text">遇见更美的自己</span>
            </h1>
            <p class="hero-subtitle">
              上传你的照片，选择心仪的衣服，AI 为你呈现完美试穿效果
            </p>
            <div class="hero-actions">
              <button class="btn-primary" @click="openTryOnDialog">
                <el-icon><MagicStick /></el-icon>
                开始试衣
              </button>
              <button class="btn-secondary" @click="goToWardrobe">
                <el-icon><Grid /></el-icon>
                浏览衣橱
              </button>
            </div>
          </div>
          <div class="hero-image fade-in">
            <div class="hero-illustration">
              <div class="fashion-card card-1">
                <div class="card-content">
                  <span class="card-icon">👔</span>
                  <span class="card-label">上装</span>
                </div>
              </div>
              <div class="fashion-card card-2">
                <div class="card-content">
                  <span class="card-icon">👗</span>
                  <span class="card-label">连衣裙</span>
                </div>
              </div>
              <div class="fashion-card card-3">
                <div class="card-content">
                  <span class="card-icon">👖</span>
                  <span class="card-label">下装</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Try-On Result Section -->
    <section v-if="resultUrl" class="tryon-result-section">
      <div class="container">
        <div class="result-card card">
          <h2 class="result-title">试穿效果</h2>
          <div class="result-image-container">
            <img :src="resultUrl" class="result-image" alt="试穿效果" />
          </div>
          <div class="result-actions">
            <el-button type="primary" @click="downloadResult" class="download-btn">
              <el-icon><Download /></el-icon>
              下载图片
            </el-button>
            <el-button @click="resultUrl = ''" class="try-again-btn">
              <el-icon><RefreshLeft /></el-icon>
              再试一次
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="gallery-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">精选时尚</h2>
          <p class="section-subtitle">发现更多穿搭灵感</p>
        </div>

        <div class="gallery-grid">
          <div v-for="(item, index) in galleryItems" :key="index" class="gallery-item card" :style="{ animationDelay: `${index * 0.1}s` }">
            <div class="gallery-image">
              <div class="placeholder-image" :style="{ background: item.color }">
                <span class="placeholder-icon">{{ item.icon }}</span>
              </div>
            </div>
            <div class="gallery-info">
              <h4 class="gallery-title">{{ item.title }}</h4>
              <p class="gallery-desc">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Try-On Dialog -->
    <TryOnDialog
      v-model="showTryOnDialog"
      @taskSubmitted="handleTaskSubmitted"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import TryOnDialog from '../components/TryOnDialog.vue'

const router = useRouter()

const showTryOnDialog = ref(false)
const resultUrl = ref('')

const galleryItems = ref([
  { icon: '🌸', title: '春日浪漫', desc: '轻盈碎花，温柔绽放', color: 'linear-gradient(135deg, #FFE5EC 0%, #FFC3D0 100%)' },
  { icon: '☘️', title: '清新绿意', desc: '自然气息，舒适自在', color: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)' },
  { icon: '🌙', title: '优雅夜空', desc: '深邃神秘，气质非凡', color: 'linear-gradient(135deg, #E8EAF6 0%, #9FA8DA 100%)' },
  { icon: '☀️', title: '暖阳橙金', desc: '活力四射，明媚动人', color: 'linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)' },
  { icon: '💜', title: '梦幻薰衣草', desc: '浪漫优雅，独具品味', color: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)' },
  { icon: '🤍', title: '经典纯白', desc: '简约大气，永不过时', color: 'linear-gradient(135deg, #FAFAFA 0%, #EEEEEE 100%)' }
])

const openTryOnDialog = async () => {
  const userId = localStorage.getItem('user_id')
  if (!userId) {
    try {
      await ElMessageBox.confirm('请先登录后再使用试衣功能', '提示', {
        confirmButtonText: '去登录',
        cancelButtonText: '取消',
        type: 'warning'
      })
      router.push('/login')
    } catch {
      // 用户取消
    }
    return
  }
  showTryOnDialog.value = true
}

const goToWardrobe = () => {
  router.push('/wardrobe')
}

const handleTaskSubmitted = () => {
  // 任务已提交，用户可以去试衣记录页面查看
}

const downloadResult = () => {
  if (!resultUrl.value) return

  const link = document.createElement('a')
  link.href = resultUrl.value
  link.download = 'ai-tryon-result.jpg'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.home {
  padding-bottom: 80px;
}

/* Hero Section */
.hero-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 50%, #FDF2F8 100%);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-text {
  animation-delay: 0.2s;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.gradient-text {
  display: block;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-bottom: 40px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  color: white;
  border: none;
  border-radius: var(--radius-button);
  padding: 14px 36px;
  font-size: var(--font-size-body);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-button);
  padding: 14px 36px;
  font-size: var(--font-size-body);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background: rgba(99, 102, 241, 0.05);
  transform: translateY(-2px);
}

.hero-image {
  animation-delay: 0.4s;
}

.hero-illustration {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fashion-card {
  position: absolute;
  background: white;
  border-radius: var(--radius-card);
  padding: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  animation: float 3s ease-in-out infinite;
}

.fashion-card.card-1 {
  top: 20px;
  left: 20px;
  animation-delay: 0s;
}

.fashion-card.card-2 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 0.5s;
}

.fashion-card.card-3 {
  bottom: 20px;
  right: 20px;
  animation-delay: 1s;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 48px;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Try-On Result Section */
.tryon-result-section {
  padding: 60px 0;
}

.result-card {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 24px;
}

.result-image-container {
  margin-bottom: 24px;
}

.result-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.result-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.download-btn {
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B5CF6 100%);
  border: none;
  border-radius: var(--radius-button);
  padding: 12px 28px;
}

.try-again-btn {
  border-radius: var(--radius-button);
  padding: 12px 28px;
}

/* Section Common */
.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 16px;
  color: var(--color-text-secondary);
}

/* Gallery Section */
.gallery-section {
  padding: 80px 0;
  background: white;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.gallery-item {
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fadeIn 0.6s ease forwards;
  opacity: 0;
}

.gallery-item:hover {
  transform: translateY(-8px);
}

.gallery-image {
  height: 200px;
  overflow: hidden;
  border-radius: var(--radius-card);
  margin: -24px -24px 20px -24px;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 64px;
}

.gallery-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.gallery-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .hero-content {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 36px;
  }

  .hero-illustration {
    height: 300px;
  }
}
</style>

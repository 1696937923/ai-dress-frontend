<template>
  <div id="app">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--color-bg);
}

.main-content {
  padding-top: 72px;
  min-height: calc(100vh - 72px);
}

.page-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.page-placeholder h1 {
  color: var(--color-text-primary);
  font-size: 32px;
  margin-bottom: 16px;
}

.page-placeholder p {
  color: var(--color-text-secondary);
  font-size: 18px;
}
</style>

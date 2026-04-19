import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Wardrobe from '../views/Wardrobe.vue'
import Profile from '../views/Profile.vue'
import History from '../views/History.vue'
import Auth from '../views/Auth.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/wardrobe',
    name: 'Wardrobe',
    component: Wardrobe
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/history',
    name: 'History',
    component: History
  },
  {
    path: '/login',
    name: 'Login',
    component: Auth
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000
})

// 请求拦截器：自动添加token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const generateTryOn = (userId, userPhotoFileId, clothingFileId) => {
  return api.post('/tryon/generate', {
    userId,
    userPhotoFileId,
    clothingFileId
  })
}

export const getTaskStatus = (taskId) => {
  return api.get(`/tryon/status/${taskId}`)
}

export const getAllTasks = (userId) => {
  const params = new URLSearchParams()
  if (userId) params.append('userId', userId)
  return api.get(`/tryon/list?${params.toString()}`)
}

export const deleteTask = (taskId) => {
  return api.delete(`/tryon/delete/${taskId}`)
}

export const toggleFavorite = (taskId) => {
  return api.post(`/tryon/favorite/${taskId}`)
}

export const getFileUrl = (fileId) => {
  return `/api/files/download/${fileId}`
}

export const addWardrobeItem = (userId, name, category, fileId) => {
  return api.post('/wardrobe/add', { userId, name, category, fileId })
}

export const updateWardrobeItem = (id, name, category) => {
  const params = new URLSearchParams()
  if (name) params.append('name', name)
  if (category) params.append('category', category)
  return api.put(`/wardrobe/update/${id}?${params.toString()}`)
}

export const deleteWardrobeItem = (id) => {
  return api.delete(`/wardrobe/delete/${id}`)
}

export const getWardrobeItem = (id) => {
  return api.get(`/wardrobe/item/${id}`)
}

export const getAllWardrobeItems = (userId) => {
  const params = new URLSearchParams()
  if (userId) params.append('userId', userId)
  return api.get(`/wardrobe/all?${params.toString()}`)
}

export const getWardrobeItemsByCategory = (userId, category) => {
  const params = new URLSearchParams()
  if (userId) params.append('userId', userId)
  return api.get(`/wardrobe/category/${category}?${params.toString()}`)
}

export const addUserProfile = (userId, name, fileId) => {
  return api.post('/user-profile/add', { userId, name, fileId })
}

export const updateUserProfile = (id, name) => {
  const params = new URLSearchParams()
  if (name) params.append('name', name)
  return api.put(`/user-profile/update/${id}?${params.toString()}`)
}

export const deleteUserProfile = (id) => {
  return api.delete(`/user-profile/delete/${id}`)
}

export const getUserProfile = (id) => {
  return api.get(`/user-profile/item/${id}`)
}

export const getAllUserProfiles = (userId) => {
  const params = new URLSearchParams()
  if (userId) params.append('userId', userId)
  return api.get(`/user-profile/all?${params.toString()}`)
}

// 用户相关API
export const register = (username, password) => {
  return api.post('/user/register', { username, password })
}

export const login = (username, password) => {
  return api.post('/user/login', { username, password })
}

export const getUserInfo = (userId) => {
  return api.get(`/user/info/${userId}`)
}

export const useTryOnQuota = (userId) => {
  return api.post(`/user/use-quota/${userId}`)
}

export const addTryOnQuota = (userId, count) => {
  return api.post(`/user/add-quota/${userId}?count=${count}`)
}

export default api

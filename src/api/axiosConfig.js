// frontend/src/api/axiosConfig.js
import axios from 'axios';

// 1. Solo creamos y exportamos la instancia base.
// Ya no sabe nada sobre el store de Zustand.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default api;
// frontend/src/store/userStore.js (VERSIÓN DE EMERGENCIA)
import { create } from 'zustand';
import api from '../api/axiosConfig';

const useUserStore = create(
  (set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoadingAuth: true,
    settings: null,
    
    syncUserWithBackend: async (telegramUser, refCode) => {
      set({ isLoadingAuth: true });
      try {
        console.log('[Store-DEBUG] Intentando llamar a /auth/sync...');
        
        const response = await api.post('/auth/sync', { user: telegramUser, refCode });
        
        // ¡SI LLEGAMOS AQUÍ, LA CONEXIÓN FUNCIONÓ!
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.log('[Store-DEBUG] ¡RESPUESTA RECIBIDA DEL BACKEND!', response.data);
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        
        // Usamos los datos falsos del backend para desbloquear la UI
        const { token, user, settings } = response.data;
        set({ user, token, isAuthenticated: true, settings, isLoadingAuth: false });
        
      } catch (error) {
        // Si hay un error, lo mostraremos de forma muy visible
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        console.error('[Store-DEBUG] CATCH - FALLO FATAL EN LA CONEXIÓN:', error.response || error);
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        alert("FALLO DE CONEXIÓN. Revisa la consola del navegador (F12) y del backend.");
        set({ isLoadingAuth: false });
      }
    },
    logout: () => set({ user: null, token: null, isAuthenticated: false }),
  })
);
export default useUserStore;
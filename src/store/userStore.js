// frontend/src/store/userStore.js (VERSIÓN FINAL CON ESTADO DE CARGA PARA PREVENIR RACE CONDITIONS)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axiosConfig';

// Se envuelve toda la lógica en el middleware 'persist'
const useUserStore = create(
  persist(
    (set, get) => ({
      // --- ESTADO INICIAL ---
      user: null, // 'null' indica que no hay usuario; 'undefined' podría usarse para un estado no determinado. Usaremos null.
      token: null,
      error: null,
      isAuthenticated: false,
      
      // <<< ESTADO CRÍTICO PARA LA SOLUCIÓN DEL RACE CONDITION >>>
      // Inicia en 'true'. La UI principal (App.jsx) mostrará una pantalla de carga
      // mientras este valor sea 'true', esperando a que la autenticación inicial se complete.
      isLoadingAuth: true, 

      /**
       * Verifica si hay un token en el almacenamiento persistente y lo valida con el backend.
       * Esta es la función principal que se llama al iniciar la aplicación.
       */
      checkAuthStatus: async () => {
        const token = get().token;
        if (!token) {
          // Si no hay token, la autenticación ha terminado y no estamos autenticados.
          set({ user: null, isAuthenticated: false, isLoadingAuth: false });
          return 'no-token';
        }

        try {
          // Si hay un token, intentamos obtener el perfil del usuario para validarlo.
          const response = await api.get('/auth/profile');
          // Si tiene éxito, estamos autenticados y la carga ha terminado.
          set({ user: response.data, error: null, isAuthenticated: true, isLoadingAuth: false });
          return 'authenticated';
        } catch (error) {
          // Si falla, el token es inválido o expirado. Limpiamos todo.
          console.error("Fallo en checkAuthStatus (token inválido):", error);
          set({ user: null, token: null, error: 'Tu sesión ha expirado.', isAuthenticated: false, isLoadingAuth: false });
          return 'invalid-token';
        }
      },

      /**
       * Realiza el proceso de login contra el backend.
       * Esta función es llamada por App.jsx cuando no hay una sesión válida o se fuerza un re-login.
       */
      login: async ({ initData, startParam }) => {
        if (!initData) {
          const errorMessage = "No se pudo obtener la información de Telegram (initData).";
          set({ error: errorMessage, token: null, user: null, isAuthenticated: false, isLoadingAuth: false });
          return; // Salimos temprano si no hay datos de Telegram.
        }
        
        set({ error: null }); // Limpiamos errores anteriores
        try {
          const response = await api.post('/auth/login', { initData, startParam });
          const { token, user } = response.data;
          set({ user, token, error: null, isAuthenticated: true, isLoadingAuth: false });
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Error en la autenticación con el servidor.";
          console.error("Fallo en la función login:", errorMessage);
          set({ error: errorMessage, token: null, user: null, isAuthenticated: false, isLoadingAuth: false });
        }
      },

      /**
       * Cierra la sesión del usuario, limpiando el estado.
       */
      logout: () => {
        set({ user: null, token: null, error: null, isAuthenticated: false });
      },
      
      /**
       * Actualiza parcialmente el objeto de usuario (ej. después de una compra o reclamo).
       */
      updateUser: (updatedUserData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUserData } : updatedUserData,
        }));
      },
    }),
    {
      // --- CONFIGURACIÓN DE PERSISTENCIA ---
      name: 'neuro-link-storage', // Nombre de la clave en el localStorage.
      storage: createJSONStorage(() => localStorage), // Usa el localStorage del navegador.
      
      // <<< ESTRATEGIA DE PERSISTENCIA CLAVE >>>
      // Solo guardamos el token en el localStorage. No guardamos el objeto 'user'
      // para asegurar que siempre obtenemos los datos más frescos del servidor.
      // Tampoco guardamos 'isLoadingAuth' porque siempre debe ser 'true' al recargar.
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useUserStore;
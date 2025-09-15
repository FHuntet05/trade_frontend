// RUTA: frontend/src/store/adminStore.js (VERSIÓN "NEXUS - AUTH FIX")
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// [NEXUS AUTH FIX] - Se refactoriza el estado inicial para ser más claro.
const initialState = {
  admin: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // isLoading debe ser parte del estado inicial, pero no persistido.
};

const useAdminStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // [NEXUS AUTH FIX] - Simplificamos la acción de login.
      // La página (AdminLoginPage) ahora es responsable de la llamada a la API.
      // El store solo se encarga de GUARDAR el estado exitoso.
      // Esto desacopla el store de la capa de API.
      loginSuccess: (token, adminData) => {
        set({
          token: token,
          admin: adminData,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // [NEXUS AUTH FIX] - Acción para manejar el inicio de una petición.
      setLoading: (loadingState) => {
        set({ isLoading: loadingState });
      },
      
      // [NEXUS AUTH FIX] - Acción para manejar un fallo de login.
      loginFail: () => {
        set({
          token: null,
          admin: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      logout: () => {
        // Al hacer logout, reseteamos al estado inicial completo.
        set(initialState);
      },
    }),
    {
      name: 'neuro-link-admin-storage', // El nombre de la clave en localStorage.
      storage: createJSONStorage(() => localStorage),

      // [NEXUS AUTH FIX - CORRECCIÓN CRÍTICA]
      // Solo persistimos el token y la información del admin.
      // isAuthenticated se derivará de la existencia del token al cargar la app.
      // isLoading NUNCA debe ser persistido.
      partialize: (state) => ({ 
        token: state.token, 
        admin: state.admin, 
      }),

      // [NEXUS AUTH FIX - NUEVA FUNCIÓN]
      // Esta función se ejecuta DESPUÉS de que el estado ha sido rehidratado desde localStorage.
      // Es el lugar perfecto para sincronizar el resto del estado.
      onRehydrateStorage: (state) => {
        console.log('[adminStore] Estado rehidratado desde localStorage.');
        // Si tenemos un token después de rehidratar, entonces estamos autenticados.
        if (state.token) {
          state.isAuthenticated = true;
        }
      }
    }
  )
);

// Sincronización inicial fuera del componente de React.
// Esto asegura que al recargar la página, el estado de 'isAuthenticated' se establezca correctamente.
const unsub = useAdminStore.persist.onRehydrateStorage((state) => {
  if (state.token && state.admin) {
    useAdminStore.setState({ isAuthenticated: true });
    console.log('[adminStore] Sincronización post-rehidratación completa. Autenticado.');
  }
  unsub(); // Nos desuscribimos para que solo se ejecute una vez.
});


export default useAdminStore;
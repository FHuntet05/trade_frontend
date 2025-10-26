// RUTA: src/store/investmentStore.js (VERSIÓN CON RUTA CORREGIDA)

import create from 'zustand';
import api from '@/api/axiosConfig';

const useInvestmentStore = create((set, get) => ({
  investmentPackages: [],
  isLoading: true,
  error: null,

  fetchInvestmentPackages: async () => {
    // Si ya no estamos cargando, y ya tenemos datos, no hacemos nada para evitar peticiones innecesarias.
    const { isLoading, investmentPackages } = get();
    if (!isLoading && investmentPackages.length > 0) {
      // Opcional: se podría añadir una lógica de caché por tiempo aquí si se desea.
    }

    set({ isLoading: true, error: null });

    try {
      // --- CORRECCIÓN CRÍTICA: Se añade el segmento '/items' a la ruta para que coincida con el backend. ---
      const response = await api.get('/investments/items'); 
      
      set({
        investmentPackages: response.data.data || response.data,
        isLoading: false,
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || "No se pudieron cargar los paquetes de inversión.";
      console.error("Error al obtener paquetes de inversión:", err);
      
      // Mantenemos los datos antiguos si existen, pero actualizamos el estado de error y carga.
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
}));

export default useInvestmentStore;
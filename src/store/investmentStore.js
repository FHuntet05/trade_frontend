// RUTA: src/store/investmentStore.js
// --- VERSIÓN FINAL Y COMPLETA CON RUTA DE API CORREGIDA ---

import create from 'zustand';
import api from '@/api/axiosConfig';

const useInvestmentStore = create((set, get) => ({
  investmentPackages: [],
  isLoading: true,
  error: null,

  fetchInvestmentPackages: async () => {
    const { isLoading, investmentPackages } = get();
    if (!isLoading && investmentPackages.length > 0) {
      // Lógica de caché opcional podría ir aquí
    }

    set({ isLoading: true, error: null });

    try {
      // --- CORRECCIÓN CRÍTICA APLICADA ---
      // Se añade el segmento '/items' a la ruta para que coincida con la definición del backend.
      // La llamada a la API ahora apunta a '/investments/items'.
      const response = await api.get('/investments/items'); 
      
      set({
        investmentPackages: response.data.data || response.data,
        isLoading: false,
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || "No se pudieron cargar los paquetes de inversión.";
      console.error("Error al obtener paquetes de inversión:", err);
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
}));

export default useInvestmentStore;
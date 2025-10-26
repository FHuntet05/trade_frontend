// RUTA: src/store/investmentStore.js (NUEVO ARCHIVO)
// --- STORE DEDICADO PARA LOS PAQUETES DE INVERSIÓN DE MARKETPAGE ---

import create from 'zustand';
import api from '@/api/axiosConfig';

const useInvestmentStore = create((set, get) => ({
  investmentPackages: [], // Usamos un nombre claro y específico
  isLoading: true,
  error: null,

  // Asumimos que el endpoint correcto para los paquetes es '/investments'
  fetchInvestmentPackages: async () => {
    set({ isLoading: true });

    try {
      // NOTA: Si el endpoint es diferente, ajústalo aquí.
      const response = await api.get('/investments'); 
      
      set({
        investmentPackages: response.data.data || response.data, // Flexible para manejar diferentes estructuras de respuesta
        isLoading: false,
        error: null,
      });

    } catch (err) {
      const errorMessage = err.response?.data?.message || "No se pudieron cargar los paquetes de inversión.";
      console.error("Error al obtener paquetes de inversión. Se mostrarán datos anteriores si existen.", err);
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
}));

export default useInvestmentStore;
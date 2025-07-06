// src/store/toolsStore.js (NUEVO ARCHIVO)
import { create } from 'zustand';
import api from '../api/axiosConfig'; // Usamos la misma instancia de Axios configurada

const useToolsStore = create((set) => ({
  tools: [],
  loading: false,
  error: null,

  // Acción para buscar las herramientas en la API
  fetchTools: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/tools');
      set({ tools: response.data, loading: false });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar las herramientas.';
      set({ error: errorMessage, loading: false, tools: [] });
      // Opcional: mostrar un toast de error
      // toast.error(errorMessage);
    }
  },
}));

export default useToolsStore;
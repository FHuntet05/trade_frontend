// frontend/src/store/teamStore.js
import { create } from 'zustand';
import api from '../api/axiosConfig';

const useTeamStore = create((set) => ({
  stats: {
    totalTeamMembers: 0,
    totalCommission: 0,
    totalTeamRecharge: 0,
    totalTeamWithdrawals: 0,
    levels: [],
  },
  loading: true,
  error: null,

  fetchTeamStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/team/stats');
      set({ stats: response.data, loading: false });
    } catch (err) {
      console.error("Error fetching team stats:", err);
      set({ error: 'No se pudieron cargar los datos del equipo.', loading: false });
    }
  },
}));

export default useTeamStore;
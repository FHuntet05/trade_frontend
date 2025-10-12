import create from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axiosConfig';

const useStore = create(
  persist(
    (set, get) => ({
      // Estado de UI
      theme: 'light',
      currentModal: null,
      modalConfig: {},
      notifications: [],
      isLoading: true,

      // Estado de autenticación
      isAuthenticated: false,
      user: null,
      token: null,

      // Estado de trading
      balance: 0,
      investments: [],
      profits: {
        daily: 0,
        total: 0,
        nextClaimTime: null
      },

      // Estado de la ruleta
      spins: 0,
      xp: 0,
      xpHistory: [],

      // Estado del mercado
      marketItems: [],
      stockPackages: [],
      cryptoPrices: [],

      // Acciones de UI
      setTheme: (theme) => set({ theme }),
      
      showModal: (type, config) => set({
        currentModal: type,
        modalConfig: config
      }),
      
      closeModal: () => set({
        currentModal: null,
        modalConfig: {}
      }),
      
      addNotification: (notification) => set(state => ({
        notifications: [...state.notifications, {
          id: Date.now(),
          ...notification
        }]
      })),

      // Acciones de autenticación
      login: async (telegramData) => {
        try {
          const response = await api.post('/auth/login', telegramData);
          set({
            isAuthenticated: true,
            user: response.data.user,
            token: response.data.token,
            balance: response.data.user.balance,
            spins: response.data.user.spins,
            xp: response.data.user.xp
          });
          return response.data;
        } catch (error) {
          throw error;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          balance: 0,
          spins: 0,
          xp: 0
        });
      },

      // Acciones de trading
      updateBalance: (newBalance) => set({ balance: newBalance }),
      
      fetchInvestments: async () => {
        try {
          const [marketRes, stockRes] = await Promise.all([
            api.get('/market/investments'),
            api.get('/market/stock-investments')
          ]);
          set({ 
            investments: [...marketRes.data, ...stockRes.data]
          });
        } catch (error) {
          console.error('Error fetching investments:', error);
        }
      },

      claimProfits: async (investmentId) => {
        try {
          const response = await api.post('/market/claim-profits', { investmentId });
          set(state => ({
            balance: response.data.newBalance,
            investments: state.investments.map(inv => 
              inv._id === investmentId 
                ? { ...inv, lastClaim: Date.now() }
                : inv
            )
          }));
          return response.data;
        } catch (error) {
          throw error;
        }
      },

      // Acciones de la ruleta
      spinWheel: async () => {
        if (get().spins <= 0) throw new Error('No spins available');
        
        try {
          const response = await api.post('/wheel/spin');
          set(state => ({
            spins: state.spins - 1,
            xp: state.xp + (response.data.reward.type === 'xp' ? response.data.reward.value : 0),
            xpHistory: [...state.xpHistory, {
              type: response.data.reward.type,
              value: response.data.reward.value,
              timestamp: Date.now()
            }]
          }));
          return response.data.reward;
        } catch (error) {
          throw error;
        }
      },

      convertXPToUSDT: async () => {
        try {
          const response = await api.post('/wheel/convert-xp');
          set(state => ({
            xp: 0,
            balance: response.data.newBalance
          }));
          return response.data;
        } catch (error) {
          throw error;
        }
      },

      // Acciones del mercado
      fetchMarketData: async () => {
        try {
          const [itemsRes, packagesRes, pricesRes] = await Promise.all([
            api.get('/market/items'),
            api.get('/market/stock-packages'),
            api.get('/market/crypto-prices')
          ]);
          
          set({
            marketItems: itemsRes.data,
            stockPackages: packagesRes.data,
            cryptoPrices: pricesRes.data
          });
        } catch (error) {
          console.error('Error fetching market data:', error);
        }
      },

      // Inicialización de la app
      initializeApp: async () => {
        try {
          const token = get().token;
          if (!token) {
            set({ isLoading: false });
            return;
          }

          const response = await api.get('/auth/me');
          set({
            isAuthenticated: true,
            user: response.data,
            balance: response.data.balance,
            spins: response.data.spins,
            xp: response.data.xp,
            isLoading: false
          });

          // Cargar datos iniciales
          get().fetchMarketData();
          get().fetchInvestments();
        } catch (error) {
          console.error('Init error:', error);
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false
          });
        }
      }
    }),
    {
      name: 'app-storage',
      whitelist: ['theme', 'token']
    }
  )
);

export default useStore;
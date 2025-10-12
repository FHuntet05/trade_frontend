import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRewardStore = create(
  persist(
    (set, get) => ({
      level: 1,
      xp: 0,
      dailyStreak: 0,
      lastDailyCheck: null,
      completedMissions: {},
      collections: {},
      achievements: {},
      
      // Sistema de niveles
      addXP: (amount) => {
        set(state => {
          const newXP = state.xp + amount;
          const xpForNextLevel = state.level * 1000; // 1000 XP por nivel
          
          if (newXP >= xpForNextLevel) {
            return {
              xp: newXP - xpForNextLevel,
              level: state.level + 1
            };
          }
          
          return { xp: newXP };
        });
      },

      // Misiones diarias
      dailyMissions: [
        {
          id: 'trade',
          type: 'trade',
          requirement: 3,
          xp: 100,
          description: 'Realizar 3 trades'
        },
        {
          id: 'spin',
          type: 'spin',
          requirement: 1,
          xp: 50,
          description: 'Usar la ruleta'
        },
        {
          id: 'refer',
          type: 'refer',
          requirement: 1,
          xp: 200,
          description: 'Invitar un amigo'
        }
      ],

      // Verificar y actualizar misiones diarias
      checkDailyMissions: () => {
        const today = new Date().toDateString();
        const { lastDailyCheck } = get();

        if (lastDailyCheck !== today) {
          set(state => ({
            completedMissions: {},
            lastDailyCheck: today,
            dailyStreak: state.lastDailyCheck === new Date(Date.now() - 86400000).toDateString()
              ? state.dailyStreak + 1
              : 1
          }));
        }
      },

      // Completar una misión
      completeMission: (missionId) => {
        set(state => ({
          completedMissions: {
            ...state.completedMissions,
            [missionId]: true
          }
        }));

        const mission = get().dailyMissions.find(m => m.id === missionId);
        if (mission) {
          get().addXP(mission.xp);
        }
      },

      // NFT Coleccionables
      nftCollections: [
        {
          id: 'traders',
          name: 'Famous Traders',
          items: [
            { id: 1, name: 'Warren Buffett', rarity: 'legendary' },
            { id: 2, name: 'George Soros', rarity: 'epic' },
            // ... más items
          ]
        },
        {
          id: 'crypto',
          name: 'Crypto Icons',
          items: [
            { id: 1, name: 'Bitcoin Genesis', rarity: 'legendary' },
            { id: 2, name: 'Ethereum Dawn', rarity: 'epic' },
            // ... más items
          ]
        }
      ],

      // Recompensas por racha
      streakRewards: [
        { days: 3, reward: { type: 'xp', amount: 300 } },
        { days: 7, reward: { type: 'nft', id: 'traders-1' } },
        { days: 14, reward: { type: 'usdt', amount: 1 } },
        { days: 30, reward: { type: 'special-nft', id: 'crypto-1' } }
      ],

      // Reclamar recompensa por racha
      claimStreakReward: () => {
        const { dailyStreak, streakRewards } = get();
        const availableReward = streakRewards.find(r => r.days === dailyStreak);

        if (availableReward) {
          switch (availableReward.reward.type) {
            case 'xp':
              get().addXP(availableReward.reward.amount);
              break;
            case 'nft':
              get().addNFT(availableReward.reward.id);
              break;
            case 'usdt':
              // Integrar con el sistema de billetera
              break;
          }
        }
      },

      // Añadir NFT a la colección
      addNFT: (nftId) => {
        set(state => ({
          collections: {
            ...state.collections,
            [nftId]: {
              obtained: Date.now(),
              equipped: false
            }
          }
        }));
      },

      // Logros
      achievements: [
        {
          id: 'first_trade',
          name: 'First Step',
          description: 'Complete your first trade',
          xp: 100
        },
        {
          id: 'streak_7',
          name: 'Consistency is Key',
          description: 'Maintain a 7-day streak',
          xp: 500
        }
        // ... más logros
      ],

      // Desbloquear un logro
      unlockAchievement: (achievementId) => {
        set(state => ({
          achievements: {
            ...state.achievements,
            [achievementId]: {
              unlockedAt: Date.now()
            }
          }
        }));

        const achievement = get().achievements.find(a => a.id === achievementId);
        if (achievement) {
          get().addXP(achievement.xp);
        }
      }
    }),
    {
      name: 'reward-store',
      partialize: (state) => ({
        level: state.level,
        xp: state.xp,
        dailyStreak: state.dailyStreak,
        lastDailyCheck: state.lastDailyCheck,
        completedMissions: state.completedMissions,
        collections: state.collections,
        achievements: state.achievements
      })
    }
  )
);

export default useRewardStore;
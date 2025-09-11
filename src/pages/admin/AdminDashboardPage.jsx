// RUTA: admin-frontend/src/pages/admin/AdminDashboardPage.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Página principal del panel, consumiendo el endpoint de estadísticas del backend.

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader'; // Asumiendo un componente loader genérico.
import StatCard from './components/StatCard';
import UserGrowthChart from './components/UserGrowthChart';
import { 
  HiOutlineUsers, 
  HiOutlineCurrencyDollar, 
  HiOutlineQuestionMarkCircle, 
  HiOutlineBanknotes 
} from 'react-icons/hi2';

// Estado inicial para evitar errores de renderizado antes de que lleguen los datos.
const initialStatsState = {
  totalUsers: 0,
  totalDepositVolume: 0,
  pendingWithdrawals: 0,
  centralWalletBalances: { usdt: 0, bnb: 0 },
  userGrowthData: [],
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(initialStatsState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Hacemos la llamada al endpoint /admin/stats que creamos en el backend.
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'No se pudieron cargar las estadísticas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar el componente.

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader text="Cargando estadísticas..." /></div>;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sección de Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Usuarios" 
            value={stats.totalUsers.toLocaleString('es-ES')} 
            icon={HiOutlineUsers} 
        />
        <StatCard 
            title="Volumen Depósitos" 
            value={`$${stats.totalDepositVolume.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            icon={HiOutlineCurrencyDollar} 
        />
        <StatCard 
            title="Retiros Pendientes" 
            value={stats.pendingWithdrawals.toLocaleString('es-ES')} 
            icon={HiOutlineQuestionMarkCircle} 
        />
        
        {/* Tarjeta de Balance de la Wallet Central, estilizada directamente */}
        <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex items-center gap-6">
            <div className="bg-accent-start/20 p-4 rounded-full"><HiOutlineBanknotes className="w-8 h-8 text-accent-start" /></div>
            <div>
                <p className="text-sm text-text-secondary font-medium">Balance Billetera Central</p>
                <div className="text-lg font-mono text-white mt-1">
                    <p>USDT: {stats.centralWalletBalances?.usdt?.toFixed(2) || '0.00'}</p>
                    <p>BNB: {stats.centralWalletBalances?.bnb?.toFixed(4) || '0.0000'}</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Sección del Gráfico de Crecimiento */}
      <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-white">Crecimiento de Usuarios (Últimos 14 días)</h2>
        <UserGrowthChart data={stats.userGrowthData || []} />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
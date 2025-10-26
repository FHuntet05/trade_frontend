// RUTA: frontend/src/pages/admin/AdminDashboardPage.jsx
// --- VERSIÓN RECONSTRUIDA, FUNCIONAL Y VISUALMENTE CORRECTA ---

import React, { useEffect } from 'react';
import useAdminStore from '@/store/adminStore';
import toast from 'react-hot-toast';
import Loader from '@/components/common/Loader';
import StatCard from '@/pages/admin/components/StatCard';
import UserGrowthChart from '@/pages/admin/components/UserGrowthChart';
import RecentUsersTable from '@/pages/admin/components/RecentUsersTable';
import { 
  HiOutlineUsers, 
  HiOutlineCurrencyDollar, 
  HiOutlineQuestionMarkCircle, 
  HiOutlineBanknotes 
} from 'react-icons/hi2';

const AdminDashboardPage = () => {
  // Obtenemos los datos y acciones del store centralizado
  const { dashboardStats, isLoading, fetchDashboardStats } = useAdminStore();

  useEffect(() => {
    // Usamos la acción del store para cargar los datos
    fetchDashboardStats().catch(error => {
      toast.error(error.response?.data?.message || 'No se pudieron cargar los datos del dashboard.');
    });
  }, [fetchDashboardStats]);

  // El estado de carga ahora es manejado por el store global
  if (isLoading && !dashboardStats.totalUsers) { // Muestra el loader solo en la carga inicial
    return <div className="flex justify-center items-center h-full"><Loader text="Cargando dashboard..." /></div>;
  }
  
  return (
    // Contenedor principal con animación de entrada
    <div className="space-y-6 animate-fade-in">
      
      {/* Sección de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Usuarios" value={dashboardStats.totalUsers.toLocaleString('es-ES')} icon={HiOutlineUsers} />
        <StatCard title="Volumen Depósitos" value={`$${dashboardStats.totalDepositVolume.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={HiOutlineCurrencyDollar} />
        <StatCard title="Retiros Pendientes" value={dashboardStats.pendingWithdrawals.toLocaleString('es-ES')} icon={HiOutlineQuestionMarkCircle} />
        
        {/* Tarjeta de Balance de Billetera Central */}
        <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex items-center gap-6">
            <div className="bg-accent-start/20 p-4 rounded-full">
              <HiOutlineBanknotes className="w-8 h-8 text-accent-start" />
            </div>
            <div>
                <p className="text-sm text-text-secondary font-medium">Balance Billetera Central</p>
                <div className="text-lg font-mono text-white mt-1">
                    <p>USDT: {dashboardStats.centralWalletBalances?.usdt?.toFixed(2) || '0.00'}</p>
                    <p>BNB: {dashboardStats.centralWalletBalances?.bnb?.toFixed(4) || '0.0000'}</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Sección de Gráficos y Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-dark-secondary p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-white">Crecimiento de Usuarios (Últimos 14 días)</h2>
          <UserGrowthChart data={dashboardStats.userGrowthData || []} />
        </div>
        
        <div className="lg:col-span-2 bg-dark-secondary p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-white">Usuarios Recientes</h2>
          <RecentUsersTable users={dashboardStats.recentUsers || []} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
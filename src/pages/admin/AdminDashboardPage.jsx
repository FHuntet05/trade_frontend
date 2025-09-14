// RUTA: frontend/src/pages/admin/AdminDashboardPage.jsx (ACTUALIZADO CON USUARIOS RECIENTES)
import React, { useState, useEffect } from 'react';
import adminApi from '../../admin/api/adminApi'; // Asegurarse de usar la instancia de API correcta
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import StatCard from './components/StatCard';
import UserGrowthChart from './components/UserGrowthChart';
import RecentUsersTable from './components/RecentUsersTable'; // Importamos el nuevo componente
import { 
  HiOutlineUsers, 
  HiOutlineCurrencyDollar, 
  HiOutlineQuestionMarkCircle, 
  HiOutlineBanknotes 
} from 'react-icons/hi2';

const initialStatsState = {
  totalUsers: 0,
  totalDepositVolume: 0,
  pendingWithdrawals: 0,
  centralWalletBalances: { usdt: 0, bnb: 0 },
  userGrowthData: [],
  recentUsers: [], // Añadimos el estado inicial para los usuarios recientes
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(initialStatsState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // [MODIFICACIÓN CLAVE] Usamos Promise.all para hacer ambas llamadas en paralelo
        const [statsResponse, usersResponse] = await Promise.all([
          adminApi.get('/admin/stats'),
          adminApi.get('/admin/users/recent') // Nuevo endpoint para obtener los últimos 5-10 usuarios
        ]);
        
        setStats({
          ...statsResponse.data,
          recentUsers: usersResponse.data.users,
        });

      } catch (error) {
        toast.error(error.response?.data?.message || 'No se pudieron cargar los datos del dashboard.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader text="Cargando dashboard..." /></div>;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sección de Tarjetas de Estadísticas (sin cambios) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Usuarios" value={stats.totalUsers.toLocaleString('es-ES')} icon={HiOutlineUsers} />
        <StatCard title="Volumen Depósitos" value={`$${stats.totalDepositVolume.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={HiOutlineCurrencyDollar} />
        <StatCard title="Retiros Pendientes" value={stats.pendingWithdrawals.toLocaleString('es-ES')} icon={HiOutlineQuestionMarkCircle} />
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
      
      {/* [NUEVA SECCIÓN] Contenedor de dos columnas para el gráfico y los nuevos usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Columna del Gráfico (ocupa 3 de 5 columnas en pantallas grandes) */}
        <div className="lg:col-span-3 bg-dark-secondary p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-white">Crecimiento de Usuarios (Últimos 14 días)</h2>
          <UserGrowthChart data={stats.userGrowthData || []} />
        </div>
        
        {/* Columna de Nuevos Usuarios (ocupa 2 de 5 columnas en pantallas grandes) */}
        <div className="lg:col-span-2 bg-dark-secondary p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold mb-4 text-white">Usuarios Recientes</h2>
          <RecentUsersTable users={stats.recentUsers || []} />
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboardPage;
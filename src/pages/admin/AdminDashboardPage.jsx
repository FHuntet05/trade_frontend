// RUTA: frontend/src/pages/admin/AdminDashboardPage.jsx (VERSIÓN LIMPIA DE PRODUCCIÓN v20.1)

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

import Loader from '../../components/common/Loader';
import StatCard from './components/StatCard';
import UserGrowthChart from './components/UserGrowthChart';
import { HiOutlineUsers, HiOutlineCurrencyDollar } from 'react-icons/hi2';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'No se pudieron cargar las estadísticas.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader text="Cargando estadísticas..." /></div>;
  }
  
  if (!stats) {
    return <div className="text-center text-text-secondary">No se pudieron cargar los datos del dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Usuarios" value={stats.totalUsers.toLocaleString('es-ES')} icon={HiOutlineUsers} />
        <StatCard title="Volumen Depósitos" value={`$${stats.totalDepositVolume.toLocaleString('es-ES')}`} icon={HiOutlineCurrencyDollar} />
        <StatCard title="Retiros Pendientes" value={stats.pendingWithdrawals.toLocaleString('es-ES')} icon={HiOutlineClock} />
        {/* Nueva StatCard para la Billetera Central */}
        <div className="bg-dark-primary p-6 rounded-lg border border-white/10">
            <div className="flex items-center gap-6">
                <div className="bg-accent-start/20 p-4 rounded-full"><HiOutlineBanknotes className="w-8 h-8 text-accent-start" /></div>
                <div>
                    <p className="text-sm text-text-secondary font-medium">Balance Billetera Central</p>
                    <div className="text-sm font-mono text-white mt-1">
                        <p>USDT: {stats.centralWalletBalances.usdt.toFixed(2)}</p>
                        <p>BNB: {stats.centralWalletBalances.bnb.toFixed(4)}</p>
                        <p>TRX: {stats.centralWalletBalances.trx.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <h2 className="text-xl font-semibold mb-4">Crecimiento de Usuarios (Últimos 14 días)</h2>
        <UserGrowthChart data={stats.userGrowthData || []} />
      </div>
    </div>
  );
};


export default AdminDashboardPage;
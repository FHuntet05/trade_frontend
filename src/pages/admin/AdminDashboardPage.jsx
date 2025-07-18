// RUTA: frontend/src/pages/admin/AdminDashboardPage.jsx (VERSIÓN CORREGIDA Y FUNCIONAL)

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

import Loader from '../../components/common/Loader';
import StatCard from './components/StatCard';
import UserGrowthChart from './components/UserGrowthChart';
import { HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineKey } from 'react-icons/hi2';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDebugging, setIsDebugging] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (error) { // <--- INICIO DE LA CORRECCIÓN
        // Esta es la estructura correcta del bloque catch.
        toast.error(error.response?.data?.message || 'No se pudieron cargar las estadísticas.');
      } // <--- FIN DE LA CORRECCIÓN
      finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleRevealWallets = async () => {
    setIsDebugging(true);
    try {
        const { data } = await api.get('/admin/debug/get-central-wallets');
        
        window.alert(
            '¡Direcciones de la Billetera Central Obtenidas!\n\n' +
            '========================================\n\n' +
            `Dirección BSC (para depositar BNB):\n${data.bsc_central_wallet_address}\n\n` +
            `Dirección TRON (para depositar TRX):\n${data.tron_central_wallet_address}\n\n` +
            '========================================\n\n' +
            'Copie y guarde estas direcciones en un lugar seguro. Luego, elimine el código de depuración.'
        );

    } catch (error) {
        toast.error(error.response?.data?.message || 'Error al obtener las direcciones. Verifique la ruta en el backend.');
    } finally {
        setIsDebugging(false);
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader text="Cargando estadísticas..." /></div>;
  }
  
  return (
    <div className="space-y-6">
        
      {/* ===== INICIO DEL BLOQUE DE CÓDIGO TEMPORAL ===== */}
      <div className="bg-red-900/50 p-6 rounded-lg border border-red-500/50 space-y-4">
          <h2 className="text-xl font-bold text-red-300">Herramienta de Depuración ÚNICA</h2>
          <p className="text-red-300/80">
              Use este botón una sola vez para obtener las direcciones de la billetera central del sistema.
              Una vez que las haya copiado, este botón y su lógica deben ser eliminados del código fuente por seguridad.
          </p>
          <button
              onClick={handleRevealWallets}
              disabled={isDebugging}
              className="flex items-center gap-2 px-4 py-2 font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:cursor-wait"
          >
              <HiOutlineKey />
              {isDebugging ? 'Obteniendo Direcciones...' : 'Revelar Wallets Centrales'}
          </button>
      </div>
      {/* ===== FIN DEL BLOQUE DE CÓDIGO TEMPORAL ===== */}

      {!stats ? (
        <div className="text-center text-text-secondary">No se pudieron cargar los datos del dashboard.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              title="Total de Usuarios" 
              value={stats.totalUsers.toLocaleString('es-ES')} 
              icon={HiOutlineUsers} 
            />
            <StatCard 
              title="Volumen Total de Depósitos" 
              value={`${stats.totalDepositVolume.toLocaleString('es-ES', { style: 'currency', currency: 'USD' })}`} 
              icon={HiOutlineCurrencyDollar} 
            />
          </div>
          
          <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Crecimiento de Usuarios (Últimos 14 días)</h2>
            <UserGrowthChart data={stats.userGrowthData || []} /> 
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
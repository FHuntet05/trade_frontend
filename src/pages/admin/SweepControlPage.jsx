// frontend/src/pages/admin/SweepControlPage.jsx (VERSIÓN v15.1 - CON BARRIDO REAL)
import React, { useState, useEffect, useCallback } from 'react';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { LoaderIcon } from '@/components/icons/AppIcons';

const SweepControlPage = () => {
  const [wallets, setWallets] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sweeping, setSweeping] = useState(null);
  const { adminInfo } = useAdminStore();
  const [password, setPassword] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  const fetchSweepableWallets = useCallback(async (currentPage, token) => {
    currentPage === 1 ? setLoading(true) : setLoadingMore(true);
    try {
      const { data } = await api.get(`/api/treasury/sweepable-wallets?page=${currentPage}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWallets(prev => currentPage === 1 ? data.wallets : [...prev, ...data.wallets]);
      setHasMore(data.page < data.pages);
      setPage(data.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar billeteras.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (adminInfo?.token) {
      fetchSweepableWallets(1, adminInfo.token);
    }
  }, [adminInfo, fetchSweepableWallets]);

  const loadMore = () => {
    if (hasMore && !loadingMore && adminInfo?.token) {
      fetchSweepableWallets(page + 1, adminInfo.token);
    }
  };

  // --- FUNCIÓN DE BARRIDO MODIFICADA PARA LLAMADA REAL ---
  const handleSweep = async (address, currency) => {
    if (!destinationAddress || !password) {
      return toast.error('Por favor, introduce la dirección de destino y tu contraseña de administrador.');
    }
    const sweepKey = `${address}-${currency}`;
    setSweeping(sweepKey);

    const payload = {
      fromAddress: address,
      currency,
      destinationAddress,
      adminPassword: password
    };

    const sweepPromise = api.post('/api/treasury/sweep', payload, {
      headers: { Authorization: `Bearer ${adminInfo.token}` },
    });

    try {
      await toast.promise(sweepPromise, {
        loading: `Iniciando barrido de ${currency}...`,
        success: (res) => {
          fetchSweepableWallets(1, adminInfo.token); // Recargar la lista desde la página 1
          return `¡Barrido iniciado! Hash: ${res.data.transactionHash.substring(0, 15)}...`;
        },
        error: (err) => err.response?.data?.message || `Error al barrer ${currency}.`
      });
    } catch (error) {
      // El toast ya maneja el mensaje de error, aquí solo loggeamos si es necesario.
      console.error("Error en el proceso de barrido:", error);
    } finally {
      setSweeping(null);
      // Opcional: limpiar la contraseña por seguridad después de cada intento
      // setPassword(''); 
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Panel de Control de Barrido</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-3">Configuración de Barrido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Dirección de Destino</label>
            <input type="text" value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} placeholder="Pega la dirección de tu billetera principal aquí" className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-accent-start outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña de Administrador</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Necesaria para confirmar el barrido" className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-accent-start outline-none" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Billeteras con Fondos para Barrer</h2>
      
      {loading && <div className="flex items-center justify-center h-64"><FaSpinner className="animate-spin text-4xl text-white" /></div>}

      {!loading && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg border border-gray-700">
          <table className="w-full text-left">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-3">Usuario</th>
                <th className="p-3">Dirección de Depósito</th>
                <th className="p-3">Moneda</th>
                <th className="p-3">Saldo Real</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {wallets.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-6 text-gray-400">No hay billeteras con fondos para barrer en este momento.</td></tr>
              ) : (
                wallets.flatMap(wallet => 
                  wallet.balances.map(balance => (
                    <tr key={`${wallet.address}-${balance.currency}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-3">{wallet.user}</td>
                      <td className="p-3 font-mono text-sm truncate" style={{maxWidth: '150px'}} title={wallet.address}>{wallet.address}</td>
                      <td className="p-3 font-semibold">{balance.currency}</td>
                      <td className="p-3 font-mono">{parseFloat(balance.amount).toFixed(6)}</td>
                      <td className="p-3">
                        <button onClick={() => handleSweep(wallet.address, balance.currency)} disabled={!!sweeping} className="bg-accent-start hover:bg-accent-end text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-wait">
                          {sweeping === `${wallet.address}-${balance.currency}` ? <FaSpinner className="animate-spin" /> : 'Barrer'}
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && !loadingMore && (
        <div className="mt-6 text-center">
          <button onClick={loadMore} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded">Cargar Más</button>
        </div>
      )}
      {loadingMore && (
        <div className="mt-6 flex items-center justify-center"><FaSpinner className="animate-spin text-2xl text-white" /></div>
      )}
    </div>
  );
};

export default SweepControlPage;
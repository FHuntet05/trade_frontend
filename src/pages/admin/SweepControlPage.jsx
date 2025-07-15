// frontend/src/pages/admin/SweepControlPage.jsx (NUEVO ARCHIVO)
import React, { useState, useEffect } from 'react';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const SweepControlPage = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sweeping, setSweeping] = useState(null); // Almacena la dirección que se está barriendo
  const { adminInfo } = useAdminStore();
  const [password, setPassword] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  
  const fetchSweepableWallets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/treasury/sweepable-wallets', {
        headers: { Authorization: `Bearer ${adminInfo.token}` }
      });
      setWallets(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cargar las billeteras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminInfo) {
      fetchSweepableWallets();
    }
  }, [adminInfo]);

  const handleSweep = async (address, currency) => {
    if (!destinationAddress) {
      return toast.error('Por favor, introduce una dirección de destino.');
    }
    if (!password) {
      return toast.error('Por favor, introduce tu contraseña de administrador.');
    }

    const sweepKey = `${address}-${currency}`;
    setSweeping(sweepKey);
    try {
      // NOTA: El barrido de billeteras individuales no está implementado en el backend actual.
      // Esta es una llamada placeholder que necesitará un nuevo endpoint.
      // Por ahora, simularemos la acción y daremos un mensaje.
      
      // const { data } = await api.post('/api/treasury/sweep-individual', {
      //   fromAddress: address,
      //   currency: currency,
      //   destinationAddress: destinationAddress,
      //   adminPassword: password
      // }, { headers: { Authorization: `Bearer ${adminInfo.token}` } });
      
      // toast.success(data.message);

      // Simulación por ahora:
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Simulación: Barrido de ${currency} desde ${address} iniciado.`);

      // Refrescar la lista después del barrido
      fetchSweepableWallets();

    } catch (error) {
      toast.error(error.response?.data?.message || `Error al barrer ${currency}.`);
    } finally {
      setSweeping(null);
      setPassword(''); // Limpiar contraseña por seguridad
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><FaSpinner className="animate-spin text-4xl text-white" /></div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Panel de Control de Barrido</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-3">Configuración de Barrido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Dirección de Destino</label>
            <input
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="Pega la dirección de tu billetera principal aquí"
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-accent-start outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña de Administrador</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Necesaria para confirmar el barrido"
              className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-accent-start outline-none"
            />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Billeteras con Fondos para Barrer</h2>
      
      <div className="overflow-x-auto bg-gray-800 rounded-lg">
        <table className="w-full text-left">
          <thead className="bg-gray-700">
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
              <tr>
                <td colSpan="5" className="text-center p-6 text-gray-400">No hay billeteras con fondos para barrer en este momento.</td>
              </tr>
            ) : (
              wallets.flatMap(wallet => 
                wallet.balances.map(balance => (
                  <tr key={`${wallet.address}-${balance.currency}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-3">{wallet.user}</td>
                    <td className="p-3 font-mono text-sm truncate" style={{maxWidth: '150px'}} title={wallet.address}>{wallet.address}</td>
                    <td className="p-3 font-semibold">{balance.currency}</td>
                    <td className="p-3 font-mono">{parseFloat(balance.amount).toFixed(6)}</td>
                    <td className="p-3">
                      <button 
                        onClick={() => handleSweep(wallet.address, balance.currency)}
                        disabled={sweeping === `${wallet.address}-${balance.currency}`}
                        className="bg-accent-start hover:bg-accent-end text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-wait"
                      >
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
    </div>
  );
};

export default SweepControlPage;
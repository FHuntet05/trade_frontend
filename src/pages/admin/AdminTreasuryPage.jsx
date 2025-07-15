// frontend/src/pages/admin/AdminTreasuryPage.jsx (CORREGIDO Y COMPLETO)
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import useAdminStore from '../../store/adminStore'; // <-- IMPORTANTE: Necesitamos el token
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import SweepModal from './components/SweepModal';

const BalanceCard = ({ currency, balance, onSweep }) => (
  <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex flex-col justify-between">
    <div>
      <p className="text-sm text-text-secondary">Saldo en Hot Wallet</p>
      <p className="text-3xl font-bold font-mono text-white">{parseFloat(balance).toFixed(6)}</p>
      <p className="text-accent-start font-semibold">{currency}</p>
    </div>
    <button onClick={() => onSweep({ currency, balance })} className="mt-4 w-full px-4 py-2 font-bold text-white bg-accent-start rounded-lg hover:opacity-90 transition-opacity">
      Barrer Fondos
    </button>
  </div>
);

const AdminTreasuryPage = () => {
  const [balances, setBalances] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sweepContext, setSweepContext] = useState(null);
  const { adminInfo } = useAdminStore(); // Obtenemos el token del store

  const fetchBalances = useCallback(async () => {
    if (!adminInfo?.token) return;
    setIsLoading(true);
    try {
      // --- CORRECCIÓN CLAVE ---
      // La ruta correcta es /api/treasury/hot-balances
      // Y necesita el token de autorización
      const { data } = await api.get('/api/treasury/hot-balances', {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      });
      setBalances(data);
    } catch (error) { toast.error('No se pudieron cargar los saldos de tesorería.'); }
    finally { setIsLoading(false); }
  }, [adminInfo]);

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  const handleOpenModal = (context) => { setSweepContext(context); setIsModalOpen(true); };
  const handleCloseModal = () => { setSweepContext(null); setIsModalOpen(false); };

  const handleSweep = async (sweepData) => {
    // Añadimos el token a la petición de barrido
    const sweepPromise = api.post('/api/treasury/sweep', sweepData, {
      headers: { Authorization: `Bearer ${adminInfo.token}` },
    });
    toast.promise(sweepPromise, {
      loading: 'Enviando transacción de barrido...',
      success: (res) => {
        fetchBalances();
        handleCloseModal();
        return `¡Barrido iniciado! Hash: ${res.data.transactionHash.substring(0, 20)}...`;
      },
      error: (err) => err.response?.data?.message || 'Error al ejecutar el barrido.',
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
          <h1 className="text-2xl font-semibold mb-1">Panel de Tesorería</h1>
          <p className="text-text-secondary">Aquí puedes visualizar los saldos acumulados en las hot wallets de depósito y transferirlos a una dirección segura.</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><Loader text="Consultando saldos en la blockchain..." /></div>
        ) : balances ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BalanceCard currency="BNB" balance={balances.BNB} onSweep={handleOpenModal} />
            <BalanceCard currency="USDT_BSC" balance={balances.USDT_BSC} onSweep={handleOpenModal} />
            <BalanceCard currency="TRX" balance={balances.TRX} onSweep={handleOpenModal} />
            <BalanceCard currency="USDT_TRON" balance={balances.USDT_TRON} onSweep={handleOpenModal} />
          </div>
        ) : (
          <p className="text-center text-red-400">No se pudieron cargar los saldos.</p>
        )}
      </div>
      <AnimatePresence>
        {isModalOpen && sweepContext && (
          <SweepModal 
            currency={sweepContext.currency}
            balance={sweepContext.balance}
            onClose={handleCloseModal}
            onSweep={handleSweep}
          />
        )}
      </AnimatePresence>
    </>
  );
};
export default AdminTreasuryPage;
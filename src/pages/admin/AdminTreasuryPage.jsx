// frontend/src/pages/admin/AdminTreasuryPage.jsx (VERSIÓN FINAL v18.1 - CON LÓGICA DE BARRIDO)
import React, { useState, useEffect, useCallback } from 'react';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { HiOutlineBanknotes, HiOutlineCpuChip, HiOutlineArrowDownTray } from 'react-icons/hi2';
import SweepConfirmationModal from './components/SweepConfirmationModal';
import SweepReportModal from './components/SweepReportModal';

const SummaryCard = ({ title, amount, currency, icon }) => (
  <div className="bg-dark-tertiary p-4 rounded-lg border border-white/10 flex items-center gap-4">
    <div className="p-3 bg-dark-secondary rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-xl font-bold font-mono text-white">{parseFloat(amount || 0).toFixed(6)} <span className="text-base font-sans text-accent-start">{currency}</span></p>
    </div>
  </div>
);

const AdminTreasuryPage = () => {
  const [treasuryData, setTreasuryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { adminInfo } = useAdminStore();
  
  // State para los modales
  const [isSweepModalOpen, setIsSweepModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [sweepContext, setSweepContext] = useState(null);
  const [sweepReport, setSweepReport] = useState(null);

  const fetchTreasuryData = useCallback(async () => {
    if (!adminInfo?.token) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/treasury-data', {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
      });
      setTreasuryData(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudieron cargar los datos de tesorería.');
    } finally {
      setLoading(false);
    }
  }, [adminInfo]);

  useEffect(() => {
    fetchTreasuryData();
  }, [fetchTreasuryData]);

  const handleOpenSweepModal = (chain) => {
    setSweepContext({ chain, token: 'USDT' });
    setIsSweepModalOpen(true);
  };

  const handleSweepConfirm = async (sweepDetails) => {
    setIsSweepModalOpen(false);
    const sweepPromise = api.post('/api/admin/sweep-funds', sweepDetails, {
        headers: { Authorization: `Bearer ${adminInfo.token}` },
    });

    toast.promise(sweepPromise, {
      loading: 'Ejecutando barrido masivo... Esta operación puede tardar varios minutos.',
      success: (res) => {
        setSweepReport(res.data);
        setIsReportModalOpen(true);
        fetchTreasuryData(); // Recargar datos después del barrido
        return 'Operación de barrido completada. Revisa el reporte.';
      },
      error: (err) => err.response?.data?.message || 'Error crítico durante el barrido.',
    });
  };

  const renderGasBalance = (wallet) => {
    const balance = wallet.chain === 'BSC' ? wallet.balances.bnb : wallet.balances.trx;
    const currency = wallet.chain === 'BSC' ? 'BNB' : 'TRX';
    return `${parseFloat(balance).toFixed(6)} ${currency}`;
  };

  const hasFundsOnChain = (chain) => {
    if (!treasuryData || !treasuryData.wallets) return false;
    return treasuryData.wallets.some(w => w.chain === chain && parseFloat(w.balances.usdt) > 0);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
          <h1 className="text-2xl font-semibold mb-1">Tesorería de Depósitos</h1>
          <p className="text-text-secondary">Visión general de los fondos en wallets de depósito, listos para ser barridos a la wallet central.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><Loader text="Consultando saldos de todas las wallets..." /></div>
        ) : !treasuryData ? (
          <p className="text-center text-red-400">No se pudieron cargar los datos de tesorería.</p>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Resumen Total</h2>
                <div className="flex gap-4">
                  <button onClick={() => handleOpenSweepModal('BSC')} disabled={!hasFundsOnChain('BSC')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <HiOutlineArrowDownTray /> Barrer USDT (BSC)
                  </button>
                  <button onClick={() => handleOpenSweepModal('TRON')} disabled={!hasFundsOnChain('TRON')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <HiOutlineArrowDownTray /> Barrer USDT (TRON)
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryCard title="Total USDT" amount={treasuryData.summary.usdt} currency="USDT" icon={<HiOutlineBanknotes className="w-6 h-6 text-green-400"/>} />
                <SummaryCard title="Total BNB (Gas)" amount={treasuryData.summary.bnb} currency="BNB" icon={<HiOutlineCpuChip className="w-6 h-6 text-yellow-400"/>} />
                <SummaryCard title="Total TRX (Gas)" amount={treasuryData.summary.trx} currency="TRX" icon={<HiOutlineCpuChip className="w-6 h-6 text-red-400"/>} />
              </div>
            </div>

            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
               <h2 className="text-xl font-semibold mb-4">Wallets con Saldo</h2>
               <div className="overflow-x-auto"><table className="w-full text-left">{/* ... (tabla existente, sin cambios) ... */}</table></div>
            </div>
          </>
        )}
      </div>
      
      <SweepConfirmationModal 
        isOpen={isSweepModalOpen}
        onClose={() => setIsSweepModalOpen(false)}
        onConfirm={handleSweepConfirm}
        context={sweepContext}
      />
      <SweepReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={sweepReport}
      />
    </>
  );
};

export default AdminTreasuryPage;
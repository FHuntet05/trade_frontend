// frontend/src/pages/admin/AdminTreasuryPage.jsx (LÓGICA DE PERMISOS REFORZADA)
import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '../../admin/api/adminApi'; // Asegúrate de usar adminApi
import toast from 'react-hot-toast';
import useAdminStore from '../../store/adminStore';

import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import SweepConfirmationModal from './components/SweepConfirmationModal';
import SweepReportModal from './components/SweepReportModal';
import { HiOutlineBanknotes, HiOutlineCpuChip, HiOutlineArrowDownTray, HiOutlineTrash } from 'react-icons/hi2';

const SUPER_ADMIN_TELEGRAM_ID = import.meta.env.VITE_SUPER_ADMIN_TELEGRAM_ID;

const SummaryCard = ({ title, amount, currency, icon }) => (
  <div className="bg-dark-tertiary p-4 rounded-lg border border-white/10 flex items-center gap-4">
    <div className="p-3 bg-dark-secondary rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-text-secondary uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold font-mono text-white">{parseFloat(amount || 0).toFixed(6)} <span className="text-base font-sans text-accent-start">{currency}</span></p>
    </div>
  </div>
);

const AdminTreasuryPage = () => {
    const [data, setData] = useState({ wallets: [], summary: { usdt: 0, bnb: 0 }, pagination: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWallets, setSelectedWallets] = useState(new Set());
    
    const [isSweepModalOpen, setIsSweepModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [sweepContext, setSweepContext] = useState(null);
    const [sweepReport, setSweepReport] = useState(null);

    const { admin } = useAdminStore();
    // [MODIFICACIÓN CLAVE] La lógica para determinar si es Super Admin ahora es robusta.
    const isSuperAdmin = admin?.telegramId?.toString() === SUPER_ADMIN_TELEGRAM_ID;

    const fetchTreasuryData = useCallback(async (page) => {
        setIsLoading(true);
        try {
            const { data: responseData } = await adminApi.get(`/admin/treasury/wallets-list`, { params: { page, limit: 15 }});
            setData(responseData);
        } catch (error) { 
            toast.error(error.response?.data?.message || 'Error al obtener los datos de tesorería.'); 
        } finally { 
            setIsLoading(false); 
        }
    }, []);

    useEffect(() => { fetchTreasuryData(currentPage); }, [currentPage, fetchTreasuryData]);

    const handlePageChange = (newPage) => { if (newPage > 0 && newPage <= (data.pagination.totalPages || 1)) { setSelectedWallets(new Set()); setCurrentPage(newPage); } };
    const handleWalletSelection = (address) => { setSelectedWallets(prev => { const newSelection = new Set(prev); if (newSelection.has(address)) newSelection.delete(address); else newSelection.add(address); return newSelection; }); };
    const handleSelectAllOnPage = (e) => { if (e.target.checked) { setSelectedWallets(new Set(data.wallets.map(w => w.address))); } else { setSelectedWallets(new Set()); } };
    
    const handleOpenUsdtSweepModal = () => {
        if (selectedWallets.size === 0) return toast.error(`Seleccione las wallets que desea barrer.`);
        const walletsCandidatas = data.wallets.filter(w => selectedWallets.has(w.address) && w.chain === 'BSC' && w.usdtBalance > 0.000001 && w.gasBalance >= w.estimatedRequiredGas);
        if (walletsCandidatas.length === 0) return toast.error("Ninguna wallet seleccionada tiene USDT y gas suficiente para barrer.");
        const totalUsdtToSweep = walletsCandidatas.reduce((sum, w) => sum + w.usdtBalance, 0);
        setSweepContext({ chain: 'BSC', token: 'USDT', walletsCandidatas, totalUsdtToSweep });
        setIsSweepModalOpen(true);
    };

    const handleSweepConfirm = async () => {
        setIsSweepModalOpen(false);
        const payload = { walletsToSweep: sweepContext.walletsCandidatas.map(w => w.address) };
        const sweepPromise = adminApi.post('/admin/sweep-funds', payload);
        toast.promise(sweepPromise, {
          loading: `Ejecutando barrido de ${payload.walletsToSweep.length} wallets...`,
          success: (res) => { setSweepReport(res.data); setIsReportModalOpen(true); setSelectedWallets(new Set()); fetchTreasuryData(currentPage); return 'Operación de barrido USDT completada.'; },
          error: (err) => err.response?.data?.message || 'Error crítico durante el barrido.',
        });
    };
    
    const handleSweepGas = async () => {
        if (selectedWallets.size === 0) return toast.error("Selecciona al menos una wallet.");
        const payload = { walletsToSweep: Array.from(selectedWallets) };
        const sweepGasPromise = adminApi.post('/admin/sweep-gas', payload);
        toast.promise(sweepGasPromise, {
            loading: `Barriendo gas BNB de ${payload.walletsToSweep.length} wallets...`,
            success: (res) => { setSweepReport(res.data); setIsReportModalOpen(true); setSelectedWallets(new Set()); fetchTreasuryData(currentPage); return `Operación de barrido de gas BNB completada.`; },
            error: (err) => err.response?.data?.message || `Error crítico durante el barrido de BNB.`
        });
    };
    
    const isAllOnPageSelected = selectedWallets.size > 0 && data.wallets.length > 0 && selectedWallets.size === data.wallets.length;
    const walletsSelectedForAction = selectedWallets.size > 0;
    
    return (
        <>
            <div className="space-y-6">
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                    <h1 className="text-2xl font-semibold mb-1">Tesorería de Depósitos</h1>
                    <p className="text-text-secondary">Seleccione wallets para barrer USDT o el gas restante a la wallet central.</p>
                </div>
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <h2 className="text-xl font-semibold">Resumen de Fondos en Página</h2>
                        {/* [MODIFICACIÓN CLAVE] El contenedor de botones solo es visible para el Super Admin */}
                        {isSuperAdmin && (
                            <div className="flex flex-wrap gap-2">
                                <button onClick={handleSweepGas} disabled={!walletsSelectedForAction || isLoading} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600">
                                    <HiOutlineTrash /> Barrer Gas BNB
                                </button>
                                <button onClick={handleOpenUsdtSweepModal} disabled={!walletsSelectedForAction || isLoading} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 disabled:bg-gray-600">
                                    <HiOutlineArrowDownTray /> Barrer USDT (BSC)
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SummaryCard title="Total USDT en Página" amount={data.summary.usdt} currency="USDT" icon={<HiOutlineBanknotes className="w-6 h-6 text-green-400"/>} />
                        <SummaryCard title="Total BNB en Página" amount={data.summary.bnb} currency="BNB" icon={<HiOutlineCpuChip className="w-6 h-6 text-yellow-400"/>} />
                    </div>
                </div>
                {/* El resto de la tabla y la lógica se mantienen igual */}
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                    <h2 className="text-xl font-semibold mb-4">Wallets de Depósito ({data.pagination.totalWallets || 0} en total)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                                <tr>
                                    <th className="p-3"><input type="checkbox" onChange={handleSelectAllOnPage} checked={isAllOnPageSelected} /></th>
                                    <th className="p-3">Usuario</th>
                                    <th className="p-3">Dirección de Wallet</th>
                                    <th className="p-3 text-right">Saldo USDT</th>
                                    <th className="p-3 text-right">Saldo Gas (BNB)</th>
                                    <th className="p-3 text-right">Gas Requerido (Est.)</th>
                                </tr>
                            </thead>
                            {isLoading ? <tbody><tr><td colSpan="6"><Loader /></td></tr></tbody> : (
                                <tbody className="divide-y divide-white/10">
                                    {data.wallets.map((wallet) => (
                                        <tr key={wallet.address} className={`hover:bg-dark-tertiary ${selectedWallets.has(wallet.address) ? 'bg-blue-900/50' : ''}`}>
                                            <td className="p-3"><input type="checkbox" checked={selectedWallets.has(wallet.address)} onChange={() => handleWalletSelection(wallet.address)} /></td>
                                            <td className="p-3 font-medium">{wallet.user?.username || 'N/A'}</td>
                                            <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                            <td className="p-3 text-right font-mono text-green-400">{parseFloat(wallet.usdtBalance).toFixed(6)}</td>
                                            <td className="p-3 text-right font-mono text-text-secondary">{parseFloat(wallet.gasBalance).toFixed(6)}</td>
                                            <td className="p-3 text-right font-mono text-yellow-400">{parseFloat(wallet.estimatedRequiredGas).toFixed(6)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            )}
                        </table>
                    </div>
                    {!isLoading && <Pagination currentPage={currentPage} totalPages={data.pagination.totalPages} onPageChange={handlePageChange} />}
                </div>
            </div>
            <SweepConfirmationModal isOpen={isSweepModalOpen} onClose={() => setIsSweepModalOpen(false)} onConfirm={handleSweepConfirm} context={sweepContext} />
            <SweepReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} report={sweepReport} />
        </>
    );
};

export default AdminTreasuryPage;
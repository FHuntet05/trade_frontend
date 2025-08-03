// RUTA: frontend/src/pages/admin/AdminTreasuryPage.jsx (v39.3 - LÓGICA DE CONFIRMACIÓN ROBUSTA)

import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { HiOutlineBanknotes, HiOutlineCpuChip, HiOutlineArrowDownTray, HiOutlineTrash } from 'react-icons/hi2';
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

const TableSkeleton = ({ rows = 10 }) => (
    <tbody>
        {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="animate-pulse">
                <td className="p-3"><div className="h-6 w-6 bg-gray-700 rounded-md"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-700 rounded w-3/4"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-700 rounded w-full"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-700 rounded w-1/2"></div></td>
                <td className="p-3 text-right"><div className="h-4 bg-gray-700 rounded w-1/2 ml-auto"></div></td>
                <td className="p-3 text-right"><div className="h-4 bg-gray-700 rounded w-1/2 ml-auto"></div></td>
                <td className="p-3 text-right"><div className="h-4 bg-gray-700 rounded w-1/2 ml-auto"></div></td>
            </tr>
        ))}
    </tbody>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-between items-center mt-4 text-sm">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} className="px-4 py-2 rounded bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
            <span className="text-text-secondary">Página {currentPage} de {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="px-4 py-2 rounded bg-dark-tertiary disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
        </div>
    );
};

const AdminTreasuryPage = () => {
    const [data, setData] = useState({ wallets: [], summary: { usdt: 0, bnb: 0, trx: 0 }, pagination: { currentPage: 1, totalPages: 0, totalWallets: 0 } });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWallets, setSelectedWallets] = useState(new Set());
    
    const [isSweepModalOpen, setIsSweepModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [sweepContext, setSweepContext] = useState(null);
    const [sweepReport, setSweepReport] = useState(null);

    const fetchTreasuryData = useCallback(async (page) => {
        setIsLoading(true);
        try {
            const { data: responseData } = await api.get(`/admin/treasury/wallets-list?page=${page}&limit=15`);
            setData(responseData);
        } catch (error) { 
            toast.error(error.response?.data?.message || 'Error al obtener la lista de wallets.'); 
        } finally { 
            setIsLoading(false); 
        }
    }, []);

    useEffect(() => {
        fetchTreasuryData(currentPage);
    }, [currentPage, fetchTreasuryData]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= (data.pagination.totalPages || 1)) {
            setSelectedWallets(new Set());
            setCurrentPage(newPage);
        }
    };

    const handleWalletSelection = (address) => {
        setSelectedWallets(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(address)) newSelection.delete(address);
            else newSelection.add(address);
            return newSelection;
        });
    };

    const handleSelectAllOnPage = (e) => {
        if (e.target.checked) {
            const allAddressesOnPage = new Set(data.wallets.map(w => w.address));
            setSelectedWallets(allAddressesOnPage);
        } else {
            setSelectedWallets(new Set());
        }
    };

    const handleOpenUsdtSweepModal = (chain) => {
        if (selectedWallets.size === 0) {
            toast.error(`Por favor, seleccione las wallets de la cadena ${chain} que desea barrer.`);
            return;
        }

        const walletsSeleccionadas = data.wallets.filter(w => selectedWallets.has(w.address));
        const walletsCandidatas = walletsSeleccionadas.filter(w =>
            w.chain === chain && w.usdtBalance > 0.000001 && w.gasBalance >= w.estimatedRequiredGas 
        );

        if (walletsCandidatas.length === 0) {
            toast.error("Ninguna de las wallets seleccionadas tiene USDT y gas suficiente para el barrido.");
            return;
        }

        const totalUsdtToSweep = walletsCandidatas.reduce((sum, w) => sum + w.usdtBalance, 0);
        setSweepContext({ chain, token: 'USDT', walletsCandidatas, totalUsdtToSweep });
        setIsSweepModalOpen(true);
    };

    // [CORRECCIÓN] - Lógica de confirmación simplificada y más robusta.
    const handleSweepConfirm = async (recipientAddress) => {
        setIsSweepModalOpen(false);

        const payload = {
            chain: sweepContext.chain,
            token: sweepContext.token,
            recipientAddress: recipientAddress,
            walletsToSweep: sweepContext.walletsCandidatas.map(w => w.address)
        };

        const sweepPromise = api.post('/admin/sweep-funds', payload);

        toast.promise(sweepPromise, {
          loading: `Ejecutando barrido de ${payload.walletsToSweep.length} wallets...`,
          success: (res) => {
            setSweepReport(res.data);
            setIsReportModalOpen(true);
            setSelectedWallets(new Set());
            fetchTreasuryData(currentPage);
            return 'Operación de barrido USDT completada. Revisa el reporte.';
          },
          error: (err) => err.response?.data?.message || 'Error crítico durante el barrido.',
        });
    };

    const handleSweepGas = async (chain) => {
        if (selectedWallets.size === 0) {
            toast.error("Por favor, selecciona al menos una wallet.");
            return;
        }

        const walletsToSweepAddresses = Array.from(selectedWallets);
        let recipientAddress = '';
        let currency = '';

        if (chain === 'BSC') {
            recipientAddress = "0xc5a3d612a5A07C3f4eFdB00A26335D657EE093bE"; 
            currency = 'BNB';
        } else if (chain === 'TRON') {
            recipientAddress = "TTzEPPZm7nWLd7M4AvQU3ecH7TmESEDabW"; 
            currency = 'TRX';
        }

        if (recipientAddress.includes("...")) {
            toast.error(`Dirección de wallet central para ${chain} no configurada en el frontend.`);
            return;
        }

        const sweepGasPromise = api.post('/admin/sweep-gas', {
            chain: chain,
            recipientAddress: recipientAddress,
            walletsToSweep: walletsToSweepAddresses
        });

        toast.promise(sweepGasPromise, {
            loading: `Barriendo gas ${currency} de ${walletsToSweepAddresses.length} wallets...`,
            success: (res) => {
                setSweepReport(res.data);
                setIsReportModalOpen(true);
                setSelectedWallets(new Set());
                fetchTreasuryData(currentPage);
                return `Operación de barrido de gas ${currency} completada. Revisa el reporte.`;
            },
            error: (err) => err.response?.data?.message || `Error crítico durante el barrido de ${currency}.`
        });
    };
    
    const isAllOnPageSelected = selectedWallets.size > 0 && data.wallets.length > 0 && selectedWallets.size === data.wallets.length;
    const bnbWalletsSelected = data.wallets.some(w => selectedWallets.has(w.address) && w.chain === 'BSC' && w.gasBalance > 0);
    const trxWalletsSelected = data.wallets.some(w => selectedWallets.has(w.address) && w.chain === 'TRON' && w.gasBalance > 0);

    return (
        <>
            <div className="space-y-6">
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                    <h1 className="text-2xl font-semibold mb-1">Tesorería de Depósitos</h1>
                    <p className="text-text-secondary">Seleccione wallets para barrer USDT o el gas restante.</p>
                </div>
                
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <h2 className="text-xl font-semibold">Resumen por Página</h2>
                        <div className="flex flex-wrap gap-2">
                             <button onClick={() => handleSweepGas('BSC')} disabled={!bnbWalletsSelected || isLoading} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                <HiOutlineTrash /> Barrer Gas BNB
                            </button>
                             <button onClick={() => handleSweepGas('TRON')} disabled={!trxWalletsSelected || isLoading} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                <HiOutlineTrash /> Barrer Gas TRX
                            </button>
                            <button onClick={() => handleOpenUsdtSweepModal('BSC')} disabled={selectedWallets.size === 0 || isLoading} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                <HiOutlineArrowDownTray /> Barrer USDT (BSC)
                            </button>
                            <button onClick={() => handleOpenUsdtSweepModal('TRON')} disabled={selectedWallets.size === 0 || isLoading} className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                <HiOutlineArrowDownTray /> Barrer USDT (TRON)
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SummaryCard title="Total USDT en Página" amount={data.summary.usdt} currency="USDT" icon={<HiOutlineBanknotes className="w-6 h-6 text-green-400"/>} />
                        <SummaryCard title="Total BNB en Página" amount={data.summary.bnb} currency="BNB" icon={<HiOutlineCpuChip className="w-6 h-6 text-yellow-400"/>} />
                        <SummaryCard title="Total TRX en Página" amount={data.summary.trx} currency="TRX" icon={<HiOutlineCpuChip className="w-6 h-6 text-red-400"/>} />
                    </div>
                </div>

                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                    <h2 className="text-xl font-semibold mb-4">Wallets con Saldo ({data.pagination.totalWallets || 0} en total)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                                <tr>
                                    <th className="p-3"><input type="checkbox" className="form-checkbox bg-dark-tertiary rounded" onChange={handleSelectAllOnPage} checked={isAllOnPageSelected} /></th>
                                    <th className="p-3">Usuario</th>
                                    <th className="p-3">Wallet Address</th>
                                    <th className="p-3">Chain</th>
                                    <th className="p-3 text-right">Saldo USDT</th>
                                    <th className="p-3 text-right">Saldo Gas</th>
                                    <th className="p-3 text-right">Gas Requerido (Est.)</th>
                                </tr>
                            </thead>
                            {isLoading ? <TableSkeleton /> : (
                                <tbody className="divide-y divide-white/10">
                                    {data.wallets.length > 0 ? data.wallets.map((wallet) => (
                                        <tr key={wallet.address} className={`hover:bg-dark-tertiary ${selectedWallets.has(wallet.address) ? 'bg-blue-900/50' : ''}`}>
                                            <td className="p-3"><input type="checkbox" className="form-checkbox bg-dark-tertiary rounded" checked={selectedWallets.has(wallet.address)} onChange={() => handleWalletSelection(wallet.address)} /></td>
                                            <td className="p-3 font-medium">{wallet.user?.username || 'N/A'}</td>
                                            <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                            <td className="p-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${wallet.chain === 'BSC' ? 'bg-yellow-400/20 text-yellow-300' : 'bg-red-400/20 text-red-300'}`}>{wallet.chain}</span></td>
                                            <td className="p-3 text-right font-mono text-green-400">{parseFloat(wallet.usdtBalance).toFixed(6)}</td>
                                            <td className="p-3 text-right font-mono text-text-secondary">{parseFloat(wallet.gasBalance).toFixed(6)} {wallet.chain === 'BSC' ? 'BNB' : 'TRX'}</td>
                                            <td className="p-3 text-right font-mono text-yellow-400">{parseFloat(wallet.estimatedRequiredGas).toFixed(6)} {wallet.chain === 'BSC' ? 'BNB' : 'TRX'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" className="text-center p-6 text-text-secondary">No se encontraron wallets en esta página.</td></tr>
                                    )}
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
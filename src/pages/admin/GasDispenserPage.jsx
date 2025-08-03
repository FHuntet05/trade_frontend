// RUTA: frontend/src/pages/admin/GasDispenserPage.jsx (v37.1 - CORRECCIÓN DE REFERENCE ERROR)

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import Loader from '../../components/common/Loader';
import { HiOutlineFunnel, HiCheckCircle, HiXCircle, HiOutlineArrowPath } from 'react-icons/hi2';
import Modal from '../../components/common/Modal';

// [CORRECCIÓN] - Declaración de la constante que faltaba
const GAS_SUFFICIENT_TOLERANCE = 0.000000001; 

// --- COMPONENTES DE UI REUTILIZABLES ---
const TableSkeleton = ({ rows = 5 }) => (
    <tbody>
        {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="animate-pulse">
                <td className="p-3"><div className="h-6 w-6 bg-gray-700 rounded"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-700 rounded w-full"></div></td>
                <td className="p-3 text-right"><div className="h-4 bg-gray-700 rounded w-1/2 ml-auto"></div></td>
                <td className="p-3 text-right"><div className="h-4 bg-gray-700 rounded w-1/2 ml-auto"></div></td>
                <td className="p-3 text-right"><div className="h-4 bg-gray-700 rounded w-1/2 ml-auto"></div></td>
                <td className="p-3 text-right"><div className="h-4 bg-gray-700 rounded w-1/2 ml-auto"></div></td>
                <td className="p-3 text-center"><div className="h-6 w-20 bg-gray-700 rounded-md mx-auto"></div></td>
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
// --- FIN DE COMPONENTES DE UI ---

const GasDispenserPage = () => {
    const [activeChain, setActiveChain] = useState('BSC');
    const [data, setData] = useState({ centralWalletBalance: 0, wallets: [], pagination: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [processingWallets, setProcessingWallets] = useState(new Set());
    const [selectedWallets, setSelectedWallets] = useState(new Set());
    
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [allWallets, setAllWallets] = useState([]);
    const [selectedManualWallet, setSelectedManualWallet] = useState(null);
    const [manualAmount, setManualAmount] = useState('');
    const [isManualLoading, setIsManualLoading] = useState(false);

    const analyzeGas = useCallback(async (page, chain) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/gas-dispenser/analyze?page=${page}&limit=15&chain=${chain}`);
            setData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al analizar las wallets.');
            setData({ centralWalletBalance: 0, wallets: [], pagination: {} });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1); 
        setSelectedWallets(new Set()); 
        analyzeGas(1, activeChain);
    }, [activeChain, analyzeGas]);

    useEffect(() => {
        analyzeGas(currentPage, activeChain);
    }, [currentPage, activeChain, analyzeGas]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= data.pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleWalletSelection = (address) => {
        setSelectedWallets(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(address)) {
                newSelection.delete(address);
            } else {
                newSelection.add(address);
            }
            return newSelection;
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allAddressesOnPage = new Set(data.wallets.map(w => w.address));
            setSelectedWallets(allAddressesOnPage);
        } else {
            setSelectedWallets(new Set());
        }
    };
    
    const updateWalletState = (address, updates) => {
        setData(prev => ({
            ...prev,
            wallets: prev.wallets.map(w => w.address === address ? { ...w, ...updates } : w)
        }));
    };

    const handleSingleDispatch = async (wallet) => {
        const amountToDispense = Math.max(0, wallet.requiredGas - wallet.gasBalance);
        setProcessingWallets(prev => new Set(prev).add(wallet.address));
        try {
            await api.post('/admin/gas-dispenser/dispatch', { chain: activeChain, targets: [{ address: wallet.address, amount: amountToDispense }] });
            toast.success(`Gas dispensado a ${wallet.address.substring(0, 8)}...`);
            updateWalletState(wallet.address, { gasBalance: wallet.requiredGas });
        } catch (error) {
            toast.error(`Fallo al dispensar a ${wallet.address.substring(0, 8)}...`);
        } finally {
            setProcessingWallets(prev => {
                const newSet = new Set(prev);
                newSet.delete(wallet.address);
                return newSet;
            });
        }
    };

    const handleBulkDispatch = async () => {
        const targets = Array.from(selectedWallets).map(address => {
            const wallet = data.wallets.find(w => w.address === address);
            return { address, amount: Math.max(0, wallet.requiredGas - wallet.gasBalance) };
        }).filter(t => t.amount > 0);

        if (targets.length === 0) {
            toast.error("Ninguna de las wallets seleccionadas necesita gas.");
            return;
        }

        const toastId = toast.loading(`Iniciando dispensación a ${targets.length} wallets...`);
        setProcessingWallets(new Set(targets.map(t => t.address)));

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < targets.length; i++) {
            const target = targets[i];
            toast.loading(`Dispensando ${i + 1} de ${targets.length} a ${target.address.substring(0,8)}...`, { id: toastId });
            try {
                await api.post('/admin/gas-dispenser/dispatch', { chain: activeChain, targets: [target] });
                successCount++;
                updateWalletState(target.address, { gasBalance: data.wallets.find(w => w.address === target.address).requiredGas });
            } catch (error) {
                failCount++;
            }
        }
        
        setProcessingWallets(new Set());
        setSelectedWallets(new Set());
        toast.success(`Dispensación completada. Éxitos: ${successCount}, Fallos: ${failCount}.`, { id: toastId, duration: 5000 });
    };

    const currency = activeChain === 'BSC' ? 'BNB' : 'TRX';
    const isAllOnPageSelected = selectedWallets.size === data.wallets.length && data.wallets.length > 0;

    return (
        <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3"><HiOutlineFunnel /> Dispensador de Gas</h1>
                <p className="text-text-secondary">Analiza y fondea con gas las wallets que tienen USDT pero no suficiente combustible para el barrido.</p>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button onClick={() => setActiveChain('BSC')} className={`px-4 py-2 rounded-md font-bold ${activeChain === 'BSC' ? 'bg-yellow-500 text-black' : 'bg-dark-tertiary'}`}>BSC (BNB)</button>
                    <button onClick={() => setActiveChain('TRON')} className={`px-4 py-2 rounded-md font-bold ${activeChain === 'TRON' ? 'bg-red-500 text-white' : 'bg-dark-tertiary'}`}>TRON (TRX)</button>
                </div>
                <div className="bg-dark-tertiary p-3 rounded-lg text-right">
                    <p className="text-sm text-text-secondary">Balance Wallet Central</p>
                    <p className="text-xl font-bold font-mono">{data.centralWalletBalance.toFixed(6)} {currency}</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button onClick={handleBulkDispatch} disabled={selectedWallets.size === 0 || isLoading} className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                    Dispensar a {selectedWallets.size} Seleccionados
                </button>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Wallets que Necesitan Gas ({data.pagination.totalWallets || 0} en total)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                            <tr>
                                <th className="p-3"><input type="checkbox" className="form-checkbox bg-dark-tertiary rounded" onChange={handleSelectAll} checked={isAllOnPageSelected} /></th>
                                <th className="p-3">Dirección</th>
                                <th className="p-3 text-right">Saldo USDT</th>
                                <th className="p-3 text-right">Gas Actual ({currency})</th>
                                <th className="p-3 text-right">Gas Requerido (Est.)</th>
                                <th className="p-3 text-right">Gas a Dispensar</th>
                                <th className="p-3 text-center">Acción</th>
                            </tr>
                        </thead>
                        {isLoading ? <TableSkeleton /> : (
                            <tbody>
                                {data.wallets.map(wallet => {
                                    const isProcessing = processingWallets.has(wallet.address);
                                    const hasEnoughGas = wallet.gasBalance >= wallet.requiredGas - GAS_SUFFICIENT_TOLERANCE;
                                    const amountToDispense = Math.max(0, wallet.requiredGas - wallet.gasBalance);

                                    return (
                                    <tr key={wallet.address} className={`hover:bg-dark-tertiary ${isProcessing ? 'opacity-50' : ''}`}>
                                        <td className="p-3"><input type="checkbox" className="form-checkbox bg-dark-tertiary rounded" checked={selectedWallets.has(wallet.address)} onChange={() => handleWalletSelection(wallet.address)} /></td>
                                        <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                        <td className="p-3 text-right font-mono text-green-400">{wallet.usdtBalance.toFixed(4)}</td>
                                        <td className="p-3 text-right font-mono text-red-400">{wallet.gasBalance.toFixed(8)}</td>
                                        <td className="p-3 text-right font-mono text-yellow-400">{wallet.requiredGas.toFixed(8)}</td>
                                        <td className="p-3 text-right font-mono text-blue-400">{amountToDispense.toFixed(8)}</td>
                                        <td className="p-3 text-center">
                                            {isProcessing ? <HiOutlineArrowPath className="w-5 h-5 text-gray-400 animate-spin mx-auto" /> :
                                            hasEnoughGas ? <span className="text-green-500 text-sm">✅ Suficiente</span> :
                                            <button onClick={() => handleSingleDispatch(wallet)} className="px-3 py-1 text-xs font-bold bg-accent-start text-white rounded-md hover:bg-accent-end">Dispensar</button>
                                            }
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        )}
                    </table>
                    {!isLoading && data.wallets.length === 0 && <p className="text-center p-6 text-text-secondary">¡Excelente! Ninguna wallet necesita gas en esta red.</p>}
                </div>
                {!isLoading && <Pagination currentPage={currentPage} totalPages={data.pagination.totalPages} onPageChange={handlePageChange} />}
            </div>
        </div>
    );
};

export default GasDispenserPage;
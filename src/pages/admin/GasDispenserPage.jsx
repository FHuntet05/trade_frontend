// RUTA: frontend/src/pages/admin/GasDispenserPage.jsx (v40.0 - INCLUYE DISPENSACIÓN MANUAL)

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import { HiOutlineFunnel, HiOutlineArrowPath, HiOutlinePaperAirplane, HiOutlineWallet } from 'react-icons/hi2';

const GAS_SUFFICIENT_TOLERANCE = 0.000000001; 

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

const GasDispenserPage = () => {
    const [activeChain, setActiveChain] = useState('BSC');
    const [data, setData] = useState({ centralWalletBalance: 0, wallets: [], pagination: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [processingWallets, setProcessingWallets] = useState(new Set());
    const [selectedWallets, setSelectedWallets] = useState(new Set());
    const [editableAmounts, setEditableAmounts] = useState({});

    // --- [NUEVO] Estados para la dispensación manual ---
    const [manualAddress, setManualAddress] = useState('');
    const [manualAmount, setManualAmount] = useState('');
    const [isManualDispatching, setIsManualDispatching] = useState(false);

    const analyzeGas = useCallback(async (page, chain) => {
        setIsLoading(true);
        setEditableAmounts({}); 
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
        analyzeGas(currentPage, activeChain);
    }, [currentPage, activeChain, analyzeGas]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= (data.pagination?.totalPages || 1)) {
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

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allAddressesOnPage = new Set(data.wallets.map(w => w.address));
            setSelectedWallets(allAddressesOnPage);
        } else {
            setSelectedWallets(new Set());
        }
    };
    
    const handleAmountChange = (address, value) => {
        setEditableAmounts(prev => ({ ...prev, [address]: value }));
    };

    const getAmountToDispense = (wallet) => {
        if (editableAmounts[wallet.address] !== undefined) return editableAmounts[wallet.address];
        return Math.max(0, wallet.requiredGas - wallet.gasBalance).toFixed(8);
    };

    const handleDispatch = async (targets, isManual = false) => {
        if (targets.length === 0) {
            toast.error("No hay wallets válidas para la dispensación.");
            return;
        }
        
        const toastId = toast.loading(`Iniciando dispensación a ${targets.length} wallets...`);
        if (isManual) setIsManualDispatching(true);
        else setProcessingWallets(new Set(targets.map(t => t.address)));

        let successCount = 0, failCount = 0;

        for (const target of targets) {
            toast.loading(`Dispensando ${target.amount} a ${target.address.substring(0,8)}...`, { id: toastId });
            try {
                await api.post('/admin/gas-dispenser/dispatch', { chain: activeChain, targets: [target] });
                successCount++;
            } catch (error) {
                failCount++;
            }
        }
        
        if (isManual) {
            setIsManualDispatching(false);
            setManualAddress('');
            setManualAmount('');
        } else {
            setProcessingWallets(new Set());
            setSelectedWallets(new Set());
            analyzeGas(currentPage, activeChain);
        }
        toast.success(`Dispensación completada. Éxitos: ${successCount}, Fallos: ${failCount}.`, { id: toastId, duration: 5000 });
    };

    const handleBulkDispatch = () => {
        const targets = Array.from(selectedWallets).map(address => {
            const wallet = data.wallets.find(w => w.address === address);
            if (!wallet) return null;
            const amount = parseFloat(getAmountToDispense(wallet));
            return { address, amount };
        }).filter(t => t && t.amount > 0);
        handleDispatch(targets, false);
    };
    
    const handleSingleDispatch = (wallet) => {
        const amount = parseFloat(getAmountToDispense(wallet));
        if (amount <= 0) {
            toast.error("El monto a dispensar debe ser mayor que cero.");
            return;
        }
        handleDispatch([{ address: wallet.address, amount }], false);
    };

    // --- [NUEVO] Lógica para la dispensación manual ---
    const handleManualDispatch = () => {
        const amount = parseFloat(manualAmount);
        if (!manualAddress.trim()) {
            toast.error("Por favor, ingrese una dirección de wallet.");
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            toast.error("Por favor, ingrese un monto válido mayor a cero.");
            return;
        }
        handleDispatch([{ address: manualAddress, amount }], true);
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
                    <button onClick={() => { setActiveChain('BSC'); setCurrentPage(1); }} className={`px-4 py-2 rounded-md font-bold ${activeChain === 'BSC' ? 'bg-yellow-500 text-black' : 'bg-dark-tertiary'}`}>BSC (BNB)</button>
                    <button onClick={() => { setActiveChain('TRON'); setCurrentPage(1); }} className={`px-4 py-2 rounded-md font-bold ${activeChain === 'TRON' ? 'bg-red-500 text-white' : 'bg-dark-tertiary'}`}>TRON (TRX)</button>
                </div>
                <div className="bg-dark-tertiary p-3 rounded-lg text-right">
                    <p className="text-sm text-text-secondary">Balance Wallet Central</p>
                    <p className="text-xl font-bold font-mono">{data.centralWalletBalance.toFixed(6)} {currency}</p>
                </div>
            </div>

            {/* --- [NUEVO] SECCIÓN DE DISPENSACIÓN MANUAL --- */}
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 space-y-4">
                <h2 className="text-xl font-semibold">Dispensación Manual</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="manualAddress" className="block text-sm font-medium text-text-secondary mb-1">Dirección de Destino</label>
                        <input id="manualAddress" type="text" placeholder={`Pegue la dirección ${activeChain} aquí`} value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} className="w-full bg-dark-primary p-2 rounded-md border border-white/20"/>
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="manualAmount" className="block text-sm font-medium text-text-secondary mb-1">Monto a Enviar ({currency})</label>
                        <input id="manualAmount" type="number" placeholder="Ej: 0.005" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} className="w-full bg-dark-primary p-2 rounded-md border border-white/20"/>
                    </div>
                    <div className="md:col-span-1">
                        <button onClick={handleManualDispatch} disabled={isManualDispatching} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-600">
                            {isManualDispatching ? <HiOutlineArrowPath className="w-5 h-5 animate-spin"/> : <HiOutlinePaperAirplane className="w-5 h-5" />}
                            <span>Dispensar Manualmente</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Análisis Automático: Wallets que Necesitan Gas</h2>
                <div className="flex gap-4 mb-4">
                    <button onClick={handleBulkDispatch} disabled={selectedWallets.size === 0 || isLoading} className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">Dispensar a {selectedWallets.size} Seleccionados</button>
                </div>
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
                                    const amountToDispense = getAmountToDispense(wallet);
                                    return (
                                    <tr key={wallet.address} className={`hover:bg-dark-tertiary ${isProcessing ? 'opacity-50' : ''}`}>
                                        <td className="p-3"><input type="checkbox" className="form-checkbox bg-dark-tertiary rounded" checked={selectedWallets.has(wallet.address)} onChange={() => handleWalletSelection(wallet.address)} /></td>
                                        <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                        <td className="p-3 text-right font-mono text-green-400">{wallet.usdtBalance.toFixed(4)}</td>
                                        <td className="p-3 text-right font-mono text-red-400">{wallet.gasBalance.toFixed(8)}</td>
                                        <td className="p-3 text-right font-mono text-yellow-400">{wallet.requiredGas.toFixed(8)}</td>
                                        <td className="p-3 text-right font-mono text-blue-400"><input type="text" className="w-32 bg-dark-primary text-right p-1 rounded border border-white/20" value={amountToDispense} onChange={(e) => handleAmountChange(wallet.address, e.target.value)}/></td>
                                        <td className="p-3 text-center">
                                            {isProcessing ? <HiOutlineArrowPath className="w-5 h-5 text-gray-400 animate-spin mx-auto" /> : <button onClick={() => handleSingleDispatch(wallet)} className="px-3 py-1 text-xs font-bold bg-accent-start text-white rounded-md hover:bg-accent-end">Dispensar</button>}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        )}
                    </table>
                    {!isLoading && data.wallets.length === 0 && <p className="text-center p-6 text-text-secondary">¡Excelente! Ninguna wallet necesita gas en esta red según el análisis automático.</p>}
                </div>
                {!isLoading && <Pagination currentPage={currentPage} totalPages={data.pagination?.totalPages} onPageChange={handlePageChange} />}
            </div>
        </div>
    );
};

export default GasDispenserPage;
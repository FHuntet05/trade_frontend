// RUTA: admin-frontend/src/pages/admin/GasDispenserPage.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Basada en el Modelo, pero simplificada para operar exclusivamente en la red BSC.

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import { HiOutlineFunnel, HiOutlineArrowPath, HiOutlinePaperAirplane } from 'react-icons/hi2';

// --- Componente de UI para el esqueleto de la tabla ---
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
                <td className="p-3 text-center"><div className="h-8 w-24 bg-gray-700 rounded-md mx-auto"></div></td>
            </tr>
        ))}
    </tbody>
);

const GasDispenserPage = () => {
    // --- Estado de la Página ---
    const [data, setData] = useState({ centralWalletBalance: 0, wallets: [], pagination: {} });
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWallets, setSelectedWallets] = useState(new Set());
    const [processingWallets, setProcessingWallets] = useState(new Set());
    const [editableAmounts, setEditableAmounts] = useState({});

    // --- Estado para el formulario de dispensación manual ---
    const [manualAddress, setManualAddress] = useState('');
    const [manualAmount, setManualAmount] = useState('');
    const [isManualDispatching, setIsManualDispatching] = useState(false);

    // --- Lógica de Carga de Datos ---
    const analyzeGas = useCallback(async (page) => {
        setIsLoading(true);
        setEditableAmounts({}); 
        try {
            // [BLOCKSPHERE] Se elimina el parámetro 'chain' ya que ahora es siempre 'BSC'.
            const response = await api.get(`/admin/gas-dispenser/analyze`, { params: { page, limit: 15 }});
            setData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al analizar las wallets.');
            setData({ centralWalletBalance: 0, wallets: [], pagination: {} });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        analyzeGas(currentPage);
    }, [currentPage, analyzeGas]);

    // --- Handlers de Interacción de UI ---
    const handlePageChange = (newPage) => { if (newPage > 0 && newPage <= (data.pagination?.totalPages || 1)) setCurrentPage(newPage); };
    const handleWalletSelection = (address) => { setSelectedWallets(prev => { const newSelection = new Set(prev); if (newSelection.has(address)) newSelection.delete(address); else newSelection.add(address); return newSelection; }); };
    const handleSelectAll = (e) => { if (e.target.checked) setSelectedWallets(new Set(data.wallets.map(w => w.address))); else setSelectedWallets(new Set()); };
    const handleAmountChange = (address, value) => { setEditableAmounts(prev => ({ ...prev, [address]: value })); };
    const getAmountToDispense = (wallet) => editableAmounts[wallet.address] ?? Math.max(0, wallet.requiredGas - wallet.gasBalance).toFixed(8);

    // --- Lógica Principal de Envío de Gas ---
    const handleDispatch = async (targets, isManual = false) => {
        if (targets.length === 0) return toast.error("No hay wallets válidas para la dispensación.");
        
        const toastId = toast.loading(`Iniciando dispensación a ${targets.length} wallets...`);
        const processingAddresses = new Set(targets.map(t => t.address));
        if (isManual) setIsManualDispatching(true);
        else setProcessingWallets(processingAddresses);

        try {
            const response = await api.post('/admin/gas-dispenser/dispatch', { chain: 'BSC', targets });
            const { success, failed } = response.data.summary;
            toast.success(`Dispensación completada. Éxitos: ${success}, Fallos: ${failed}.`, { id: toastId, duration: 5000 });
            
            if (isManual) {
                setManualAddress('');
                setManualAmount('');
            } else {
                setSelectedWallets(new Set());
                analyzeGas(currentPage); // Recargar datos
            }
        } catch(error) {
            toast.error(error.response?.data?.message || 'Error en la operación de dispensación.', { id: toastId });
        } finally {
            if(isManual) setIsManualDispatching(false);
            else setProcessingWallets(new Set());
        }
    };

    const handleBulkDispatch = () => {
        const targets = Array.from(selectedWallets).map(address => {
            const wallet = data.wallets.find(w => w.address === address);
            if (!wallet) return null;
            const amount = parseFloat(getAmountToDispense(wallet));
            return { address, amount };
        }).filter(t => t && t.amount > 0);
        handleDispatch(targets);
    };
    
    const handleSingleDispatch = (wallet) => {
        const amount = parseFloat(getAmountToDispense(wallet));
        if (amount <= 0) return toast.error("El monto a dispensar debe ser mayor a cero.");
        handleDispatch([{ address: wallet.address, amount }]);
    };
    
    const handleManualDispatch = () => {
        const amount = parseFloat(manualAmount);
        if (!manualAddress.trim()) return toast.error("Por favor, ingrese una dirección de wallet.");
        if (isNaN(amount) || amount <= 0) return toast.error("Por favor, ingrese un monto válido mayor a cero.");
        handleDispatch([{ address: manualAddress, amount }], true);
    };
    
    const isAllOnPageSelected = selectedWallets.size === data.wallets.length && data.wallets.length > 0;

    return (
        <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-3"><HiOutlineFunnel /> Dispensador de Gas (BNB)</h1>
                    <p className="text-text-secondary">Analiza y fondea wallets con USDT que no tienen suficiente BNB para el barrido.</p>
                </div>
                <div className="bg-dark-tertiary p-3 rounded-lg text-right">
                    <p className="text-sm text-text-secondary">Balance Wallet Central</p>
                    <p className="text-xl font-bold font-mono">{data.centralWalletBalance.toFixed(6)} BNB</p>
                </div>
            </div>

            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 space-y-4">
                <h2 className="text-xl font-semibold">Dispensación Manual</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div><label className="block text-sm font-medium text-text-secondary mb-1">Dirección de Destino</label><input type="text" placeholder="Pegue la dirección BSC aquí" value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} className="w-full bg-dark-primary p-2 rounded-md border border-white/20"/></div>
                    <div><label className="block text-sm font-medium text-text-secondary mb-1">Monto a Enviar (BNB)</label><input type="number" placeholder="Ej: 0.005" value={manualAmount} onChange={(e) => setManualAmount(e.target.value)} className="w-full bg-dark-primary p-2 rounded-md border border-white/20"/></div>
                    <div><button onClick={handleManualDispatch} disabled={isManualDispatching} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-600">{isManualDispatching ? <HiOutlineArrowPath className="w-5 h-5 animate-spin"/> : <HiOutlinePaperAirplane className="w-5 h-5" />}<span>Dispensar</span></button></div>
                </div>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Análisis Automático: Wallets que Necesitan Gas</h2>
                <div className="flex gap-4 mb-4">
                    <button onClick={handleBulkDispatch} disabled={selectedWallets.size === 0 || isLoading} className="px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600">Dispensar a {selectedWallets.size} Seleccionados</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                            <tr>
                                <th className="p-3"><input type="checkbox" onChange={handleSelectAll} checked={isAllOnPageSelected} /></th>
                                <th className="p-3">Dirección</th>
                                <th className="p-3 text-right">Saldo USDT</th>
                                <th className="p-3 text-right">Gas Actual (BNB)</th>
                                <th className="p-3 text-right">Gas Requerido</th>
                                <th className="p-3 text-right">Gas a Dispensar</th>
                                <th className="p-3 text-center">Acción</th>
                            </tr>
                        </thead>
                        {isLoading ? <TableSkeleton /> : (
                            <tbody>
                                {data.wallets.map(wallet => {
                                    const isProcessing = processingWallets.has(wallet.address);
                                    return (
                                    <tr key={wallet.address} className={`hover:bg-dark-tertiary ${isProcessing ? 'opacity-50' : ''}`}>
                                        <td className="p-3"><input type="checkbox" checked={selectedWallets.has(wallet.address)} onChange={() => handleWalletSelection(wallet.address)} /></td>
                                        <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                        <td className="p-3 text-right font-mono text-green-400">{wallet.usdtBalance.toFixed(4)}</td>
                                        <td className="p-3 text-right font-mono text-red-400">{wallet.gasBalance.toFixed(8)}</td>
                                        <td className="p-3 text-right font-mono text-yellow-400">{wallet.requiredGas.toFixed(8)}</td>
                                        <td className="p-3"><input type="text" className="w-32 bg-dark-primary text-right p-1 rounded border border-white/20" value={getAmountToDispense(wallet)} onChange={(e) => handleAmountChange(wallet.address, e.target.value)}/></td>
                                        <td className="p-3 text-center">{isProcessing ? <HiOutlineArrowPath className="w-5 h-5 text-gray-400 animate-spin mx-auto" /> : <button onClick={() => handleSingleDispatch(wallet)} className="px-3 py-1 text-xs font-bold bg-accent-start text-white rounded-md hover:bg-accent-end">Dispensar</button>}</td>
                                    </tr>
                                )})}
                            </tbody>
                        )}
                    </table>
                    {!isLoading && data.wallets.length === 0 && <p className="text-center p-6 text-text-secondary">¡Excelente! Ninguna wallet necesita gas en esta red.</p>}
                </div>
                {!isLoading && <Pagination currentPage={currentPage} totalPages={data.pagination?.totalPages} onPageChange={handlePageChange} />}
            </div>
        </div>
    );
};

export default GasDispenserPage;
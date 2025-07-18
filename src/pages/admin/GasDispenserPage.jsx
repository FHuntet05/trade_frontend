// RUTA: frontend/src/pages/admin/GasDispenserPage.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import Loader from '../../components/common/Loader';
import { HiOutlineFunnel, HiCheckCircle, HiXCircle } from 'react-icons/hi2';

const GasDispenserPage = () => {
    const [activeChain, setActiveChain] = useState('BSC');
    const [data, setData] = useState({ centralWalletBalance: 0, walletsNeedingGas: [] });
    const [selectedWallets, setSelectedWallets] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [dispatchAmount, setDispatchAmount] = useState({ BSC: '0.002', TRON: '30' });
    const [report, setReport] = useState(null);

    useEffect(() => {
        const analyzeGas = async () => {
            setIsLoading(true);
            setReport(null);
            setSelectedWallets({});
            try {
                const response = await api.post('/admin/gas-dispenser/analyze', { chain: activeChain });
                setData(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error al analizar las wallets.');
            } finally {
                setIsLoading(false);
            }
        };
        analyzeGas();
    }, [activeChain]);

    const handleSelectWallet = (address) => {
        setSelectedWallets(prev => ({
            ...prev,
            [address]: !prev[address]
        }));
    };

    const handleSelectAll = () => {
        const allSelected = data.walletsNeedingGas.every(w => selectedWallets[w.address]);
        const newSelection = {};
        data.walletsNeedingGas.forEach(w => {
            newSelection[w.address] = !allSelected;
        });
        setSelectedWallets(newSelection);
    };

    const selectedWalletsData = useMemo(() => {
        return data.walletsNeedingGas.filter(w => selectedWallets[w.address]);
    }, [selectedWallets, data.walletsNeedingGas]);

    const totalGasToDispatch = useMemo(() => {
        return selectedWalletsData.length * parseFloat(dispatchAmount[activeChain] || 0);
    }, [selectedWalletsData, dispatchAmount, activeChain]);

    const handleDispatch = async () => {
        if (selectedWalletsData.length === 0) {
            return toast.error("No hay wallets seleccionadas para dispensar gas.");
        }
        
        const isConfirmed = window.confirm(`¿Estás seguro de que quieres enviar ${totalGasToDispatch.toFixed(4)} ${activeChain === 'BSC' ? 'BNB' : 'TRX'} a ${selectedWalletsData.length} wallets?`);
        
        if (!isConfirmed) return;

        const targets = selectedWalletsData.map(w => ({
            address: w.address,
            amount: dispatchAmount[activeChain]
        }));
        
        const dispatchPromise = api.post('/admin/gas-dispenser/dispatch', { chain: activeChain, targets });
        
        toast.promise(dispatchPromise, {
            loading: `Dispensando gas a ${targets.length} wallets...`,
            success: (res) => {
                setReport(res.data);
                // Refrescar análisis
                const analyzeButton = document.getElementById('analyzeBtn');
                if(analyzeButton) analyzeButton.click();
                return `Operación completada: ${res.data.summary.success} éxitos, ${res.data.summary.failed} fallos.`;
            },
            error: (err) => err.response?.data?.message || 'Error crítico al dispensar gas.'
        });
    };

    const currency = activeChain === 'BSC' ? 'BNB' : 'TRX';

    return (
        <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3"><HiOutlineFunnel /> Dispensador de Gas</h1>
                <p className="text-text-secondary">Analiza y fondea con gas (BNB/TRX) las wallets de depósito que tienen USDT pero no suficiente combustible para el barrido.</p>
            </div>

            <div className="flex gap-2">
                <button id="analyzeBtn" onClick={() => setActiveChain('BSC')} className={`px-4 py-2 rounded-md font-bold ${activeChain === 'BSC' ? 'bg-yellow-500 text-black' : 'bg-dark-tertiary'}`}>BSC (BNB)</button>
                <button onClick={() => setActiveChain('TRON')} className={`px-4 py-2 rounded-md font-bold ${activeChain === 'TRON' ? 'bg-red-500 text-white' : 'bg-dark-tertiary'}`}>TRON (TRX)</button>
            </div>

            {isLoading ? <Loader text={`Analizando wallets en la red ${activeChain}...`} /> : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-dark-tertiary p-4 rounded-lg">
                            <p className="text-sm text-text-secondary">Balance Wallet Central</p>
                            <p className="text-2xl font-bold font-mono">{data.centralWalletBalance.toFixed(6)} {currency}</p>
                        </div>
                        <div className="bg-dark-tertiary p-4 rounded-lg">
                            <p className="text-sm text-text-secondary">Wallets Seleccionadas</p>
                            <p className="text-2xl font-bold font-mono">{selectedWalletsData.length} / {data.walletsNeedingGas.length}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${totalGasToDispatch > data.centralWalletBalance ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                            <p className="text-sm">Total Gas a Dispensar</p>
                            <p className="text-2xl font-bold font-mono">{totalGasToDispatch.toFixed(4)} {currency}</p>
                        </div>
                    </div>

                    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Wallets que Necesitan Gas ({activeChain})</h2>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    Monto por Wallet:
                                    <input type="text" value={dispatchAmount[activeChain]} onChange={e => setDispatchAmount(prev => ({...prev, [activeChain]: e.target.value}))} className="bg-dark-tertiary w-24 p-1 rounded-md text-center font-mono" />
                                </label>
                                <button onClick={handleDispatch} disabled={selectedWalletsData.length === 0} className="px-4 py-2 bg-accent-start text-white font-bold rounded-md disabled:bg-gray-600">
                                    Dispensar a {selectedWalletsData.length} Wallets
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                                    <tr>
                                        <th className="p-3"><input type="checkbox" onChange={handleSelectAll} checked={data.walletsNeedingGas.length > 0 && data.walletsNeedingGas.every(w => selectedWallets[w.address])} /></th>
                                        <th className="p-3">Dirección</th>
                                        <th className="p-3 text-right">Saldo USDT</th>
                                        <th className="p-3 text-right">Saldo Gas Actual ({currency})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.walletsNeedingGas.map(wallet => (
                                        <tr key={wallet.address} className="hover:bg-dark-tertiary">
                                            <td className="p-3"><input type="checkbox" checked={!!selectedWallets[wallet.address]} onChange={() => handleSelectWallet(wallet.address)} /></td>
                                            <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                            <td className="p-3 text-right font-mono text-green-400">{wallet.usdtBalance.toFixed(4)}</td>
                                            <td className="p-3 text-right font-mono text-red-400">{wallet.gasBalance.toFixed(6)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data.walletsNeedingGas.length === 0 && <p className="text-center p-6 text-text-secondary">¡Excelente! Ninguna wallet necesita gas en esta red.</p>}
                        </div>
                    </div>
                    {report && (
                         <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                            <h2 className="text-xl font-semibold mb-4">Reporte de Dispensación</h2>
                            {report.details.map(detail => (
                                <div key={detail.address} className={`flex items-center gap-2 p-2 rounded-md mb-1 ${detail.status === 'SUCCESS' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    {detail.status === 'SUCCESS' ? <HiCheckCircle className="text-green-400"/> : <HiXCircle className="text-red-400"/>}
                                    <span className="font-mono text-xs">{detail.address}</span>
                                    <span className="ml-auto text-xs">{detail.status}: {detail.status === 'SUCCESS' ? `Tx: ${detail.txHash.substring(0,15)}...` : detail.reason}</span>
                                </div>
                            ))}
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GasDispenserPage;
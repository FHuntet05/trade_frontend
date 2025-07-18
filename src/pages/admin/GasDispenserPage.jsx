// RUTA: frontend/src/pages/admin/GasDispenserPage.jsx (VERSIÓN QUIRÚRGICA v20.5)

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import Loader from '../../components/common/Loader';
import { HiOutlineFunnel, HiCheckCircle, HiXCircle, HiOutlineClock } from 'react-icons/hi2';

const GasDispenserPage = () => {
    const [activeChain, setActiveChain] = useState('BSC');
    const [data, setData] = useState({ centralWalletBalance: 0, walletsNeedingGas: [] });
    const [isLoading, setIsLoading] = useState(true);
    // --- NUEVO ESTADO: para rastrear el estado de dispensación de cada wallet individual ---
    const [dispensingStatus, setDispensingStatus] = useState({});
    const [report, setReport] = useState(null);

    const analyzeGas = useCallback(async () => {
        setIsLoading(true);
        setReport(null);
        setDispensingStatus({});
        try {
            const response = await api.post('/admin/gas-dispenser/analyze', { chain: activeChain });
            setData(response.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al analizar las wallets.');
            setData({ centralWalletBalance: 0, walletsNeedingGas: [] });
        } finally {
            setIsLoading(false);
        }
    }, [activeChain]);

    useEffect(() => {
        analyzeGas();
    }, [analyzeGas]);

    // --- NUEVA FUNCIÓN: Maneja la dispensación de una ÚNICA wallet ---
    const handleSingleDispatch = async (wallet) => {
        const { address, requiredGas } = wallet;
        
        setDispensingStatus(prev => ({ ...prev, [address]: 'loading' }));
        
        const dispatchPromise = api.post('/admin/gas-dispenser/dispatch', { 
            chain: activeChain, 
            targets: [{ address, amount: requiredGas }] 
        });
        
        toast.promise(dispatchPromise, {
            loading: `Dispensando ${requiredGas.toFixed(6)} ${currency} a ${address.substring(0, 8)}...`,
            success: (res) => {
                setDispensingStatus(prev => ({ ...prev, [address]: 'success' }));
                setReport(res.data);
                // Refrescamos todo el análisis para obtener los balances más recientes
                analyzeGas();
                return `Gas dispensado exitosamente.`;
            },
            error: (err) => {
                setDispensingStatus(prev => ({ ...prev, [address]: 'error' }));
                return err.response?.data?.message || 'Error crítico al dispensar gas.';
            }
        });
    };

    const currency = activeChain === 'BSC' ? 'BNB' : 'TRX';

    const renderActionButton = (wallet) => {
        const status = dispensingStatus[wallet.address];
        const canAfford = data.centralWalletBalance >= wallet.requiredGas;

        if (status === 'loading') {
            return <HiOutlineClock className="w-5 h-5 text-gray-400 animate-spin" />;
        }
        if (status === 'success') {
            return <HiCheckCircle className="w-6 h-6 text-green-500" />;
        }
        if (status === 'error') {
            return <HiXCircle className="w-6 h-6 text-red-500" />;
        }

        return (
            <button 
                onClick={() => handleSingleDispatch(wallet)}
                disabled={!canAfford}
                className="px-3 py-1 text-xs font-bold bg-accent-start text-white rounded-md enabled:hover:bg-accent-end transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                title={!canAfford ? 'Saldo insuficiente en la billetera central' : 'Dispensar gas a esta wallet'}
            >
                Dispensar
            </button>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3"><HiOutlineFunnel /> Dispensador de Gas</h1>
                <p className="text-text-secondary">Analiza y fondea con gas las wallets de depósito que tienen USDT pero no suficiente combustible para el barrido.</p>
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

            {isLoading ? <Loader text={`Analizando wallets en la red ${activeChain}...`} /> : (
                <div className="space-y-6">
                    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                        <h2 className="text-xl font-semibold mb-4">Wallets que Necesitan Gas ({activeChain})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                                    <tr>
                                        <th className="p-3">Dirección</th>
                                        <th className="p-3 text-right">Saldo USDT</th>
                                        <th className="p-3 text-right">Gas Actual ({currency})</th>
                                        <th className="p-3 text-right">Gas Requerido (Est.)</th>
                                        <th className="p-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.walletsNeedingGas.map(wallet => (
                                        <tr key={wallet.address} className="hover:bg-dark-tertiary">
                                            <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                            <td className="p-3 text-right font-mono text-green-400">{wallet.usdtBalance.toFixed(4)}</td>
                                            <td className="p-3 text-right font-mono text-red-400">{wallet.gasBalance.toFixed(6)}</td>
                                            <td className="p-3 text-right font-mono text-yellow-400">{wallet.requiredGas.toFixed(6)}</td>
                                            <td className="p-3 text-center">{renderActionButton(wallet)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {data.walletsNeedingGas.length === 0 && <p className="text-center p-6 text-text-secondary">¡Excelente! Ninguna wallet necesita gas en esta red.</p>}
                        </div>
                    </div>
                    {report && (
                         <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                            <h2 className="text-xl font-semibold mb-4">Último Reporte de Dispensación</h2>
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
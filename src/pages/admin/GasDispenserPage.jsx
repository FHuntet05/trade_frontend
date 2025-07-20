// RUTA: frontend/src/pages/admin/GasDispenserPage.jsx (VERSIÓN FINALIZADA v35.13 - DISPENSADOR INTELIGENTE)

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import Loader from '../../components/common/Loader';
import { HiOutlineFunnel, HiCheckCircle, HiXCircle, HiOutlineArrowPath } from 'react-icons/hi2';

const GasDispenserPage = () => {
    const [activeChain, setActiveChain] = useState('BSC');
    // data.walletsNeedingGas ahora contiene gasBalance y requiredGas como floats precisos
    const [data, setData] = useState({ centralWalletBalance: 0, walletsNeedingGas: [] });
    const [isLoading, setIsLoading] = useState(true);
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
        // Refrescar análisis cada 30 segundos para precios de gas actualizados
        const intervalId = setInterval(analyzeGas, 30000); 
        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
    }, [analyzeGas]);

    const handleSingleDispatch = async (wallet) => {
        const { address, requiredGas, gasBalance } = wallet;
        // Calcular la cantidad a dispensar: Si ya tiene algo de gas, envía solo la diferencia.
        // Si no tiene nada o la cantidad es muy pequeña, envía el total requerido.
        const amountToDispense = Math.max(0, requiredGas - gasBalance);
        
        // Pequeña tolerancia para números flotantes (si la diferencia es mínima y ya tiene suficiente)
        if (amountToDispense < 0.00000001 && gasBalance >= requiredGas) { 
            toast.success(`La wallet ${address.substring(0,8)}... ya tiene suficiente gas.`);
            setDispensingStatus(prev => ({ ...prev, [address]: 'success' }));
            return;
        }

        setDispensingStatus(prev => ({ ...prev, [address]: 'loading' }));
        const dispatchPromise = api.post('/admin/gas-dispenser/dispatch', { 
            chain: activeChain, 
            targets: [{ address, amount: amountToDispense }] // Envía solo la cantidad necesaria
        });
        toast.promise(dispatchPromise, {
            loading: `Dispensando ${amountToDispense.toFixed(6)} ${currency} a ${address.substring(0, 8)}...`,
            success: (res) => {
                setDispensingStatus(prev => ({ ...prev, [address]: 'success' }));
                setReport(res.data);
                analyzeGas(); // Re-analizar después de dispensar para actualizar saldos
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
        const amountToDispense = Math.max(0, wallet.requiredGas - wallet.gasBalance);
        // Deshabilitar si ya tiene suficiente gas o si la cantidad a dispensar es negativa/mínima
        const alreadyHasEnough = wallet.gasBalance >= wallet.requiredGas - 0.00000001; // Pequeña tolerancia
        const canAfford = data.centralWalletBalance >= amountToDispense;

        if (status === 'loading') {
            return <HiOutlineArrowPath className="w-5 h-5 text-gray-400 animate-spin" />;
        }
        if (status === 'success') {
            return <HiCheckCircle className="w-6 h-6 text-green-500" />;
        }
        if (status === 'error') {
            return <HiXCircle className="w-6 h-6 text-red-500" />;
        }

        // Si ya tiene suficiente, muestra el estado
        if (alreadyHasEnough) {
            return <span className="text-green-500 text-sm">✅ Suficiente</span>;
        }

        // Si no tiene suficiente, muestra el botón para dispensar
        return (
            <button 
                onClick={() => handleSingleDispatch(wallet)}
                disabled={!canAfford}
                className="px-3 py-1 text-xs font-bold bg-accent-start text-white rounded-md enabled:hover:bg-accent-end transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                title={!canAfford ? 'Saldo insuficiente en la billetera central' : `Dispensar ${amountToDispense.toFixed(8)} ${currency} a esta wallet`}
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
                                        <th className="p-3 text-right">Gas a Dispensar</th> {/* NUEVA COLUMNA */}
                                        <th className="p-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.walletsNeedingGas.map(wallet => (
                                        <tr key={wallet.address} className="hover:bg-dark-tertiary">
                                            <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                            <td className="p-3 text-right font-mono text-green-400">{wallet.usdtBalance.toFixed(4)}</td>
                                            <td className="p-3 text-right font-mono text-red-400">{wallet.gasBalance.toFixed(8)}</td> {/* Mostrar con más decimales para precisión */}
                                            <td className="p-3 text-right font-mono text-yellow-400">{wallet.requiredGas.toFixed(8)}</td> {/* Mostrar con más decimales para precisión */}
                                            <td className="p-3 text-right font-mono text-blue-400">
                                                {Math.max(0, wallet.requiredGas - wallet.gasBalance).toFixed(8)} {currency} {/* Cálculo de lo que falta */}
                                            </td>
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
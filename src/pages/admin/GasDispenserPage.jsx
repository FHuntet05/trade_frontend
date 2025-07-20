// RUTA: frontend/src/pages/admin/GasDispenserPage.jsx (CORRECCIÓN VISUAL MODAL v35.18)

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import Loader from '../../components/common/Loader';
import { HiOutlineFunnel, HiCheckCircle, HiXCircle, HiOutlineArrowPath } from 'react-icons/hi2';
import Modal from '../../components/common/Modal'; // Asume que tienes un componente Modal genérico

const GasDispenserPage = () => {
    const [activeChain, setActiveChain] = useState('BSC');
    const [data, setData] = useState({ centralWalletBalance: 0, walletsNeedingGas: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [dispensingStatus, setDispensingStatus] = useState({});
    const [report, setReport] = useState(null);

    // Estado para el modal de dispensación manual
    const [isManualDispenseModalOpen, setIsManualDispenseModalOpen] = useState(false);
    const [allWalletsForManualDispense, setAllWalletsForManualDispense] = useState([]);
    const [selectedWalletForManualDispense, setSelectedWalletForManualDispense] = useState(null);
    const [manualAmountToDispense, setManualAmountToDispense] = useState('');
    const [manualDispenseLoading, setManualDispenseLoading] = useState(false);


    const analyzeGas = useCallback(async () => {
        setIsLoading(true);
        setReport(null);
        setDispensingStatus({});
        try {
            const response = await api.post('/admin/gas-dispenser/analyze', { chain: activeChain });
            setData(response.data);

            // También carga todas las wallets para el modal manual aquí para eficiencia
            // El backend ya no filtra las wallets, por lo que obtendremos todas.
            const { data: allWalletsData } = await api.get('/admin/treasury/wallets-list');
            setAllWalletsForManualDispense(allWalletsData);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al analizar las wallets.');
            setData({ centralWalletBalance: 0, walletsNeedingGas: [] });
            setAllWalletsForManualDispense([]); // Resetear en caso de error
        } finally {
            setIsLoading(false);
        }
    }, [activeChain]);

    useEffect(() => {
        analyzeGas();
        const intervalId = setInterval(analyzeGas, 30000); 
        return () => clearInterval(intervalId);
    }, [analyzeGas]);

    const handleSingleDispatch = async (wallet) => {
        const { address, requiredGas, gasBalance } = wallet;
        const amountToDispense = Math.max(0, requiredGas - gasBalance);
        
        if (amountToDispense < 0.00000001 && gasBalance >= requiredGas) { 
            toast.success(`La wallet ${address.substring(0,8)}... ya tiene suficiente gas.`);
            setDispensingStatus(prev => ({ ...prev, [address]: 'success' }));
            return;
        }

        setDispensingStatus(prev => ({ ...prev, [address]: 'loading' }));
        const dispatchPromise = api.post('/admin/gas-dispenser/dispatch', { 
            chain: activeChain, 
            targets: [{ address, amount: amountToDispense }] 
        });
        toast.promise(dispatchPromise, {
            loading: `Dispensando ${amountToDispense.toFixed(6)} ${currency} a ${address.substring(0, 8)}...`,
            success: (res) => {
                setDispensingStatus(prev => ({ ...prev, [address]: 'success' }));
                setReport(res.data);
                analyzeGas(); 
                return `Gas dispensado exitosamente.`;
            },
            error: (err) => {
                setDispensingStatus(prev => ({ ...prev, [address]: 'error' }));
                return err.response?.data?.message || 'Error crítico al dispensar gas.';
            }
        });
    };

    // --- Lógica para la dispensación manual ---
    const handleManualDispenseConfirm = async () => {
        if (!selectedWalletForManualDispense || !manualAmountToDispense || parseFloat(manualAmountToDispense) < 0) { // Permite 0 para "recargar un poco"
            toast.error('Por favor, selecciona una wallet e ingresa una cantidad válida (igual o mayor a 0).');
            return;
        }
        const amount = parseFloat(manualAmountToDispense);
        const { address, chain } = selectedWalletForManualDispense;

        if (data.centralWalletBalance < amount) {
            toast.error(`Saldo insuficiente en la billetera central (${data.centralWalletBalance.toFixed(6)} ${currency}). Necesitas ${amount.toFixed(6)} ${currency}.`);
            return;
        }

        setManualDispenseLoading(true);
        try {
            const dispatchPromise = api.post('/admin/gas-dispenser/dispatch', {
                chain,
                targets: [{ address, amount }]
            });
            const res = await toast.promise(dispatchPromise, {
                loading: `Dispensando ${amount.toFixed(6)} ${chain === 'BSC' ? 'BNB' : 'TRX'} a ${address.substring(0, 8)}...`,
                success: `Gas dispensado manualmente exitosamente.`,
                error: (err) => err.response?.data?.message || 'Error crítico al dispensar gas manualmente.',
            });
            setReport(res.data);
            setIsManualDispenseModalOpen(false);
            setManualAmountToDispense('');
            setSelectedWalletForManualDispense(null);
            analyzeGas(); // Refrescar toda la página
        } catch (error) {
            // El toast.promise ya maneja el error, solo limpiamos el estado de carga
        } finally {
            setManualDispenseLoading(false);
        }
    };
    // --- Fin lógica para la dispensación manual ---


    const currency = activeChain === 'BSC' ? 'BNB' : 'TRX';

    const renderActionButton = (wallet) => {
        const status = dispensingStatus[wallet.address];
        const amountToDispense = Math.max(0, wallet.requiredGas - wallet.gasBalance);
        const alreadyHasEnough = wallet.gasBalance >= wallet.requiredGas - 0.00000001; 
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

        if (alreadyHasEnough) {
            return <span className="text-green-500 text-sm">✅ Suficiente</span>;
        }

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

            {/* Botón para abrir el modal de dispensación manual */}
            <button 
                onClick={() => setIsManualDispenseModalOpen(true)}
                className="px-4 py-2 text-sm font-bold bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
                Dispensar Gas Manualmente
            </button>

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
                                        <th className="p-3 text-right">Gas a Dispensar</th>
                                        <th className="p-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.walletsNeedingGas.map(wallet => (
                                        <tr key={wallet.address} className="hover:bg-dark-tertiary">
                                            <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                            <td className="p-3 text-right font-mono text-green-400">{wallet.usdtBalance.toFixed(4)}</td>
                                            <td className="p-3 text-right font-mono text-red-400">{wallet.gasBalance.toFixed(8)}</td>
                                            <td className="p-3 text-right font-mono text-yellow-400">{wallet.requiredGas.toFixed(8)}</td>
                                            <td className="p-3 text-right font-mono text-blue-400">
                                                {Math.max(0, wallet.requiredGas - wallet.gasBalance).toFixed(8)} {currency}
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

            {/* Modal de Dispensación Manual */}
            <Modal isOpen={isManualDispenseModalOpen} onClose={() => setIsManualDispenseModalOpen(false)} title="Dispensar Gas Manualmente">
                <div className="p-4 space-y-4">
                    <div className="bg-dark-tertiary p-3 rounded-lg text-right">
                        <p className="text-sm text-text-secondary">Balance Wallet Central</p>
                        <p className="text-xl font-bold font-mono">{data.centralWalletBalance.toFixed(6)} {currency}</p>
                    </div>

                    <div>
                        <label htmlFor="wallet-select" className="block text-sm font-medium text-text-secondary mb-2">Seleccionar Wallet de Destino:</label>
                        <select
                            id="wallet-select"
                            className="w-full p-2 rounded-md bg-gray-800 text-gray-100 border border-gray-600 focus:border-accent-start focus:ring focus:ring-accent-start focus:ring-opacity-50 appearance-none text-base"
                            value={selectedWalletForManualDispense ? selectedWalletForManualDispense.address : ''}
                            onChange={(e) => {
                                const wallet = allWalletsForManualDispense.find(w => w.address === e.target.value);
                                setSelectedWalletForManualDispense(wallet);
                                const gasMissing = wallet ? Math.max(0, wallet.estimatedRequiredGas - wallet.gasBalance) : 0;
                                setManualAmountToDispense(gasMissing.toFixed(8)); 
                            }}
                        >
                            <option value="" className="bg-gray-800 text-gray-100">-- Selecciona una wallet --</option>
                            {allWalletsForManualDispense
                                .filter(w => w.chain === activeChain)
                                .map(wallet => (
                                <option key={wallet.address} value={wallet.address} className="bg-gray-800 text-gray-100">
                                    {wallet.user?.username || 'Usuario Desconocido'} - {wallet.address.substring(0, 10)}... ({wallet.chain})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedWalletForManualDispense && (
                        <div className="bg-dark-tertiary p-3 rounded-lg space-y-2">
                            <p className="text-sm text-text-secondary">Wallet Seleccionada:</p>
                            <p className="font-mono text-sm text-white break-all">{selectedWalletForManualDispense.address}</p>
                            <p className="text-sm text-text-secondary">Saldo USDT: <span className="font-mono text-green-400">{selectedWalletForManualDispense.usdtBalance.toFixed(4)}</span></p>
                            <p className="text-sm text-text-secondary">Gas Actual: <span className="font-mono text-red-400">{selectedWalletForManualDispense.gasBalance.toFixed(8)} {currency}</span></p>
                            <p className="text-sm text-text-secondary">Gas Requerido (Est.): <span className="font-mono text-yellow-400">{selectedWalletForManualDispense.estimatedRequiredGas.toFixed(8)} {currency}</span></p>
                            <p className="text-sm text-text-secondary">Gas Faltante (Est.): <span className="font-mono text-blue-400">{Math.max(0, selectedWalletForManualDispense.estimatedRequiredGas - selectedWalletForManualDispense.gasBalance).toFixed(8)} {currency}</span></p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="manual-amount" className="block text-sm font-medium text-text-secondary mb-2">Cantidad de Gas a Dispensar ({currency}):</label>
                        <input
                            type="number"
                            id="manual-amount"
                            className="w-full p-2 rounded-md bg-gray-800 text-gray-100 border border-gray-600 focus:border-accent-start focus:ring focus:ring-accent-start focus:ring-opacity-50 placeholder-gray-400 text-base"
                            placeholder={`Ej: ${selectedWalletForManualDispense ? Math.max(0, selectedWalletForManualDispense.estimatedRequiredGas - selectedWalletForManualDispense.gasBalance).toFixed(8) : '0.00006'}`}
                            step="0.00000001" 
                            value={manualAmountToDispense}
                            onChange={(e) => setManualAmountToDispense(e.target.value)}
                            disabled={manualDispenseLoading || !selectedWalletForManualDispense}
                        />
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            onClick={() => setIsManualDispenseModalOpen(false)}
                            className="px-4 py-2 text-text-secondary rounded-md hover:bg-gray-700 transition-colors"
                            disabled={manualDispenseLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleManualDispenseConfirm}
                            className="px-4 py-2 bg-accent-start text-white rounded-md hover:bg-accent-end transition-colors disabled:opacity-50"
                            disabled={manualDispenseLoading || !selectedWalletForManualDispense || isNaN(parseFloat(manualAmountToDispense)) || parseFloat(manualAmountToDispense) < 0}
                        >
                            {manualDispenseLoading ? 'Dispensando...' : 'Dispensar Ahora'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GasDispenserPage;
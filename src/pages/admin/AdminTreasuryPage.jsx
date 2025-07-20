// RUTA: frontend/src/pages/admin/AdminTreasuryPage.jsx (ACTUALIZADO v35.12 - TESORERÍA DINÁMICA)

import React, { useState, useEffect, useRef } from 'react';
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
    // treasuryData.wallets ahora contendrá estimatedRequiredGas para cada wallet
    const [treasuryData, setTreasuryData] = useState({ summary: { usdt: 0, bnb: 0, trx: 0 }, wallets: [] });
    const [loadingState, setLoadingState] = useState({ list: true, scan: false });
    const [scanStatus, setScanStatus] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);
    
    const { token, isHydrated } = useAdminStore(state => ({
        token: state.token,
        isHydrated: state.isHydrated,
    }));
    
    const [isSweepModalOpen, setIsSweepModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [sweepContext, setSweepContext] = useState(null);
    const [sweepReport, setSweepReport] = useState(null);

    // Función de escaneo inicial (MODIFICADA para usar el nuevo endpoint y data)
    useEffect(() => {
        const startScan = async () => {
            if (!isHydrated) { setLoadingState({ list: true, scan: false }); setScanStatus('Sincronizando estado de la sesión...'); return; }
            if (!token) { setLoadingState({ list: false, scan: false }); setScanStatus('Token de administrador no encontrado.'); toast.error("Acceso denegado."); return; }
            setLoadingState({ list: true, scan: false }); setTreasuryData({ summary: { usdt: 0, bnb: 0, trx: 0 }, wallets: [] }); setElapsedTime(0); if (timerRef.current) clearInterval(timerRef.current);
            try {
                // Llama al nuevo endpoint que ya trae los balances y la estimación de gas
                const { data: walletsWithDetails } = await api.get('/admin/treasury/wallets-list'); 
                
                let tempSummary = { usdt: 0, bnb: 0, trx: 0 };
                // Filtrar y sumar solo las wallets que tienen algún saldo (USDT o GAS)
                const filteredWallets = walletsWithDetails.filter(w => w.usdtBalance > 0 || w.gasBalance > 0);

                filteredWallets.forEach(wallet => {
                    tempSummary.usdt += wallet.usdtBalance || 0;
                    tempSummary.bnb += wallet.gasBalance && wallet.chain === 'BSC' ? wallet.gasBalance : 0;
                    tempSummary.trx += wallet.gasBalance && wallet.chain === 'TRON' ? wallet.gasBalance : 0;
                });

                setTreasuryData({ summary: tempSummary, wallets: filteredWallets });
                setScanStatus(`Escaneo completado.`);

            } catch (error) { 
                toast.error(error.response?.data?.message || 'Error al obtener lista de wallets.'); 
            } finally { 
                if (timerRef.current) clearInterval(timerRef.current);
                setLoadingState({ list: false, scan: false }); 
            }
        };
        startScan();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isHydrated, token]);

    // Función modificada para usar el estimatedRequiredGas del backend
    const handleOpenSweepModal = (chain) => {
        const walletsCandidatas = treasuryData.wallets.filter(w =>
            w.chain === chain &&
            w.usdtBalance > 0.000001 &&
            // Usamos el estimatedRequiredGas devuelto por el backend
            w.gasBalance >= w.estimatedRequiredGas 
        );

        const totalUsdtToSweep = walletsCandidatas.reduce((sum, w) => sum + w.usdtBalance, 0);

        setSweepContext({
            chain,
            token: 'USDT',
            walletsCandidatas,
            totalUsdtToSweep,
        });
        setIsSweepModalOpen(true);
    };

    // Lógica de actualización de estado SIN RECARGA
    const updateStateAfterSweep = (report) => {
        const sweptAddresses = new Set(
            report.details.filter(d => d.status === 'SUCCESS').map(d => d.address)
        );

        if (sweptAddresses.size === 0) return;

        setTreasuryData(currentData => {
            const newWallets = currentData.wallets.map(wallet => {
                if (sweptAddresses.has(wallet.address)) {
                    return { ...wallet, usdtBalance: 0 }; // Reseteamos USDT a 0 para barridas
                }
                return wallet;
            });
            
            const newSummary = newWallets.reduce((acc, wallet) => {
                acc.usdt += wallet.usdtBalance || 0;
                acc.bnb += wallet.gasBalance && wallet.chain === 'BSC' ? wallet.gasBalance : 0;
                acc.trx += wallet.gasBalance && wallet.chain === 'TRON' ? wallet.gasBalance : 0;
                return acc;
            }, { usdt: 0, bnb: 0, trx: 0 });

            // Filtramos también las wallets que ya no tienen USDT ni GAS ni requieren gas (para mantener la tabla limpia)
            return { summary: newSummary, wallets: newWallets.filter(w => w.usdtBalance > 0 || w.gasBalance > 0) };
        });
    };

    const handleSweepConfirm = async (sweepDetails) => {
        setIsSweepModalOpen(false);
        const sweepPromise = api.post('/admin/sweep-funds', sweepDetails);

        toast.promise(sweepPromise, {
          loading: 'Ejecutando barrido masivo... Esta operación puede tardar.',
          success: (res) => {
            setSweepReport(res.data);
            setIsReportModalOpen(true);
            updateStateAfterSweep(res.data); 
            return 'Operación de barrido completada. Revisa el reporte.';
          },
          error: (err) => err.response?.data?.message || 'Error crítico durante el barrido.',
        });
    };
    
    const renderGasBalance = (wallet) => {
        const balance = wallet.chain === 'BSC' ? wallet.gasBalance : wallet.trx; // Usamos gasBalance directamente que ya es el número
        const currency = wallet.chain === 'BSC' ? 'BNB' : 'TRX';
        return `${parseFloat(balance || 0).toFixed(6)} ${currency}`;
    };

    // Función modificada para usar el estimatedRequiredGas del backend
    const hasFundsOnChain = (chain) => {
        if (!treasuryData || !treasuryData.wallets) return false;
        return treasuryData.wallets.some(w => 
            w.chain === chain && 
            w.usdtBalance > 0.000001 && 
            w.gasBalance >= w.estimatedRequiredGas // Comparación directa
        );
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                    <h1 className="text-2xl font-semibold mb-1">Tesorería de Depósitos</h1>
                    <p className="text-text-secondary">Visión general de los fondos en wallets de depósito, listos para ser barridos a la wallet central.</p>
                </div>

                {(loadingState.list || loadingState.scan) && (
                    <div className="flex justify-center items-center h-64 bg-dark-secondary p-6 rounded-lg border border-white/10">
                       <div className="text-center">
                            <Loader text={loadingState.list ? 'Sincronizando...' : 'Escaneando...'} />
                            <p className="mt-4 text-sm text-text-secondary font-mono">{scanStatus}</p>
                            {loadingState.scan && <p className="text-sm text-accent-start">Tiempo transcurrido: {elapsedTime}s</p>}
                       </div>
                    </div>
                )}
                
                {!loadingState.list && !loadingState.scan && (
                     <>
                        <div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                                        <tr>
                                            <th className="p-3">Usuario</th>
                                            <th className="p-3">Wallet Address</th>
                                            <th className="p-3">Chain</th>
                                            <th className="p-3 text-right">Saldo USDT</th>
                                            <th className="p-3 text-right">Saldo Gas</th>
                                            <th className="p-3 text-right">Gas Requerido (Est.)</th> {/* NUEVA COLUMNA */}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {treasuryData.wallets.length > 0 ? treasuryData.wallets.map((wallet) => (
                                            <tr key={wallet.address} className="hover:bg-dark-tertiary">
                                                <td className="p-3 font-medium">{wallet.user?.username || 'Usuario Desconocido'}</td>
                                                <td className="p-3 font-mono text-sm">{wallet.address}</td>
                                                <td className="p-3">
                                                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${wallet.chain === 'BSC' ? 'bg-yellow-400/20 text-yellow-300' : 'bg-red-400/20 text-red-300'}`}>
                                                    {wallet.chain}
                                                  </span>
                                                </td>
                                                <td className="p-3 text-right font-mono">{parseFloat(wallet.usdtBalance).toFixed(6)}</td>
                                                <td className="p-3 text-right font-mono">{renderGasBalance(wallet)}</td>
                                                <td className="p-3 text-right font-mono">{parseFloat(wallet.estimatedRequiredGas).toFixed(6)} {wallet.chain === 'BSC' ? 'BNB' : 'TRX'}</td> {/* Mostrar gas requerido */}
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="text-center p-6 text-text-secondary">{scanStatus || 'No se encontraron wallets con saldo.'}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
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
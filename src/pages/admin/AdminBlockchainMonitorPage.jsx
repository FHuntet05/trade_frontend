// RUTA: frontend/src/pages/admin/AdminBlockchainMonitorPage.jsx (VERSIÓN CORREGIDA Y SIMPLIFICADA)

import React, { useState, useEffect, useCallback } from 'react';
import adminApi from '@/pages/admin/api/adminApi';
import { toast } from 'react-hot-toast';
import { HiOutlineComputerDesktop } from 'react-icons/hi2';
import Loader from '@/components/common/Loader';

// Componente para mostrar el estado de la transacción
const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-bold rounded-full";
    const statusMap = {
        PENDING: "bg-yellow-500/20 text-yellow-300",
        CONFIRMED: "bg-green-500/20 text-green-300",
        FAILED: "bg-red-500/20 text-red-300",
    };
    return <span className={`${baseClasses} ${statusMap[status] || 'bg-gray-500/20 text-gray-300'}`}>{status}</span>;
};

const AdminBlockchainMonitorPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTxs = useCallback(async () => {
        // Para la primera carga, se muestra el loader. Para las siguientes, es una actualización silenciosa.
        if (!isLoading) {
            try {
                // --- INICIO DE LA CORRECCIÓN DE URL ---
                const { data } = await adminApi.get('/admin/blockchain/pending-txs');
                // --- FIN DE LA CORRECCIÓN DE URL ---
                setTransactions(data);
            } catch (error) {
                console.error("Fallo al actualizar transacciones pendientes:", error);
            }
        } else {
            try {
                const { data } = await adminApi.get('/admin/blockchain/pending-txs');
                setTransactions(data);
            } catch (error) {
                toast.error("No se pudieron cargar las transacciones pendientes.");
            } finally {
                setIsLoading(false);
            }
        }
    }, [isLoading]);

    useEffect(() => {
        fetchTxs(); // Carga inicial
        const intervalId = setInterval(fetchTxs, 20000); // Actualiza cada 20 segundos
        return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
    }, [fetchTxs]);

    return (
        <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3"><HiOutlineComputerDesktop /> Monitor de Blockchain</h1>
                <p className="text-text-secondary">Vista en tiempo real de las operaciones de sistema en la blockchain.</p>
            </div>

            <div className="bg-dark-secondary p-4 rounded-lg border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3">Cadena</th>
                                <th className="p-3">Tx Hash</th>
                                <th className="p-3 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center p-6"><Loader /></td></tr>
                            ) : transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <tr key={tx._id} className="hover:bg-dark-tertiary/50 border-b border-white/10">
                                        <td className="p-3 text-sm">{new Date(tx.createdAt).toLocaleString()}</td>
                                        <td className="p-3 text-sm">{tx.type}</td>
                                        <td className="p-3 text-sm">{tx.chain}</td>
                                        <td className="p-3 font-mono text-xs">
                                            <a 
                                                href={tx.chain === 'BSC' ? `https://bscscan.com/tx/${tx.txHash}` : '#'} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="hover:text-accent"
                                            >
                                                {tx.txHash ? `${tx.txHash.substring(0, 15)}...${tx.txHash.substring(tx.txHash.length - 15)}` : 'N/A'}
                                            </a>
                                        </td>
                                        <td className="p-3 text-center"><StatusBadge status={tx.status} /></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="text-center p-8 text-text-secondary">No hay transacciones de sistema pendientes.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBlockchainMonitorPage;
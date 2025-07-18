// RUTA: frontend/src/pages/admin/AdminBlockchainMonitorPage.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';
import { HiOutlineDesktopComputer } from 'react-icons/hi2';

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

    useEffect(() => {
        const fetchTxs = async () => {
            try {
                const { data } = await api.get('/admin/blockchain-monitor/pending');
                setTransactions(data);
            } catch (error) {
                toast.error("No se pudieron cargar las transacciones.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTxs();
        const intervalId = setInterval(fetchTxs, 10000); // Refrescar cada 10 segundos

        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h1 className="text-2xl font-semibold mb-1 flex items-center gap-3"><HiOutlineDesktopComputer /> Monitor de Blockchain</h1>
                <p className="text-text-secondary">Vista en tiempo real de las últimas operaciones en la blockchain (dispensación y barridos).</p>
            </div>

            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
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
                                <tr><td colSpan="5" className="text-center p-6">Cargando...</td></tr>
                            ) : transactions.map(tx => (
                                <tr key={tx._id} className="hover:bg-dark-tertiary border-b border-white/10">
                                    <td className="p-3 text-sm">{new Date(tx.createdAt).toLocaleString()}</td>
                                    <td className="p-3 text-sm">{tx.type}</td>
                                    <td className="p-3 text-sm">{tx.chain}</td>
                                    <td className="p-3 font-mono text-xs"><a href={tx.chain === 'BSC' ? `https://bscscan.com/tx/${tx.txHash}` : `https://tronscan.org/#/transaction/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent-start">{tx.txHash.substring(0, 20)}...</a></td>
                                    <td className="p-3 text-center"><StatusBadge status={tx.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBlockchainMonitorPage;
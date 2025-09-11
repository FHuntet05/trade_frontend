// RUTA: admin-frontend/src/pages/admin/components/WithdrawalsTable.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Componente nuevo, diseñado para mostrar los datos del pipeline de agregación de retiros.

import React from 'react';
import toast from 'react-hot-toast';
import { HiOutlineClipboardDocument } from 'react-icons/hi2';

// --- Formateador de Fecha Localizado ---
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// --- Componente de Copiado de Wallet ---
const WalletAddress = ({ address }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(address);
        toast.success('Dirección copiada al portapapeles.');
    };
    
    return (
        <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</span>
            <button onClick={handleCopy} className="p-1 rounded-md hover:bg-white/20 text-text-secondary hover:text-white" title="Copiar dirección">
                <HiOutlineClipboardDocument className="w-4 h-4" />
            </button>
        </div>
    );
};

const WithdrawalsTable = ({ withdrawals, onApprove, onReject }) => {
    if (!withdrawals || withdrawals.length === 0) {
        return (
            <div className="text-center p-10 text-text-secondary">
                <h3 className="text-lg font-semibold">¡Todo al día!</h3>
                <p>No hay retiros pendientes de revisión.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
                
                {/* --- Encabezado --- */}
                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                    <tr>
                        <th scope="col" className="px-6 py-3">Usuario</th>
                        <th scope="col" className="px-6 py-3">Fecha</th>
                        <th scope="col" className="px-6 py-3">Wallet Destino</th>
                        <th scope="col" className="px-6 py-3 text-right">Solicitado (Bruto)</th>
                        <th scope="col" className="px-6 py-3 text-right">Comisión</th>
                        <th scope="col" className="px-6 py-3 text-right">A Pagar (Neto)</th>
                        <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                </thead>

                {/* --- Cuerpo --- */}
                <tbody className="divide-y divide-white/10">
                    {withdrawals.map((w) => (
                        <tr key={w._id} className="hover:bg-dark-tertiary/50">
                            {/* Celda: Usuario */}
                            <td className="px-6 py-4 font-medium text-white">
                                <div className="flex items-center gap-3">
                                    <img 
                                        className="w-10 h-10 rounded-full object-cover" 
                                        src={w.user.photoUrl} 
                                        alt={`${w.user.username} avatar`} 
                                    />
                                    <div>
                                        <div className="font-semibold">{w.user.username}</div>
                                        <div className="text-xs text-text-secondary font-mono">{w.user.telegramId}</div>
                                    </div>
                                </div>
                            </td>
                            {/* Celda: Fecha */}
                            <td className="px-6 py-4 text-text-secondary font-mono whitespace-nowrap">{formatDate(w.createdAt)}</td>
                            
                            {/* Celda: Wallet */}
                            <td className="px-6 py-4"><WalletAddress address={w.walletAddress} /></td>

                            {/* Celda: Montos */}
                            <td className="px-6 py-4 text-right font-mono">{w.grossAmount.toFixed(2)} {w.currency}</td>
                            <td className="px-6 py-4 text-right font-mono text-yellow-400">{w.feeAmount.toFixed(2)} {w.currency}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-lg text-green-400">{w.netAmount.toFixed(2)} {w.currency}</td>

                            {/* Celda: Acciones */}
                            <td className="px-6 py-4 text-center">
                                <div className="flex justify-center gap-2">
                                    <button
                                        onClick={() => onApprove(w)}
                                        className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => onReject(w)}
                                        className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Rechazar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WithdrawalsTable;
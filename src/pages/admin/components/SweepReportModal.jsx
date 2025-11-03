// RUTA: admin-frontend/src/pages/admin/components/SweepReportModal.jsx (v50.0 - VERSIÓN "AiBrokTradePro" FINAL)
// ARQUITECTURA: Componente de UI para mostrar los resultados de una operación de barrido.

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiXMark, 
    HiCheckCircle, 
    HiExclamationCircle, 
    HiMinusCircle 
} from 'react-icons/hi2';

// --- Variantes de Animación ---
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 200 } },
  exit: { scale: 0.9, opacity: 0 },
};

// --- Componente de UI Interno ---
const ReportItem = ({ icon, label, value }) => (
    <div className="flex justify-between items-center text-sm p-3 bg-dark-tertiary rounded-md border border-white/5">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-text-secondary">{label}</span>
        </div>
        <span className="font-bold font-mono text-white">{value}</span>
    </div>
);

const SweepReportModal = ({ isOpen, onClose, report }) => {
    // No renderizar si no está abierto o no hay datos de reporte.
    if (!isOpen || !report) return null;

    // Se asignan valores por defecto para evitar errores si el backend no envía algún campo.
    const { summary, details = [] } = report;
    const { successfulSweeps = 0, failedSweeps = 0, walletsScanned = 0, failedTxs = 0 } = summary;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-dark-secondary rounded-lg border border-white/10 w-full max-w-2xl p-6 shadow-xl"
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* --- Encabezado --- */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Reporte de Operación de Barrido</h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-tertiary transition-colors"><HiXMark className="w-6 h-6" /></button>
                        </div>
                        
                        {/* --- Resumen Ejecutivo --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <ReportItem icon={<HiMinusCircle className="w-5 h-5 text-gray-400"/>} label="Wallets Escaneadas" value={walletsScanned} />
                            <ReportItem icon={<HiCheckCircle className="w-5 h-5 text-green-500"/>} label="Barridos Exitosos" value={successfulSweeps} />
                            <ReportItem icon={<HiExclamationCircle className="w-5 h-5 text-red-500"/>} label="Barridos Fallidos" value={failedSweeps || failedTxs} />
                        </div>
                        
                        {/* --- Tabla de Detalles --- */}
                        <h3 className="text-lg font-semibold mb-2">Detalles de la Operación</h3>
                        <div className="max-h-60 overflow-y-auto border border-white/10 rounded-md bg-dark-primary">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary sticky top-0">
                                    <tr>
                                        <th className="p-2">Dirección</th>
                                        <th className="p-2">Estado</th>
                                        <th className="p-2">Detalle / Hash de Transacción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {details.map((item, index) => (
                                        <tr key={index} className="hover:bg-dark-tertiary/50">
                                            <td className="p-2 font-mono text-xs">{item.address}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                    item.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' :
                                                    item.status.includes('SKIPPED') ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-2 font-mono text-xs break-all">{item.txHash ? item.txHash : (item.reason || 'N/A')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {details.length === 0 && (
                                <p className="text-center p-4 text-text-secondary">No hay detalles que mostrar.</p>
                             )}
                        </div>

                        {/* --- Botón de Cierre --- */}
                        <div className="mt-6">
                            <button onClick={onClose} className="w-full py-2.5 font-bold rounded-md bg-accent-start hover:opacity-90 transition-opacity">
                                Cerrar Reporte
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SweepReportModal;
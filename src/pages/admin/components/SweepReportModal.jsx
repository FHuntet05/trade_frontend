// frontend/src/pages/admin/components/SweepReportModal.jsx (NUEVO v18.1)
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiCheckCircle, HiExclamationCircle, HiMinusCircle, HiClock } from 'react-icons/hi2';

const ReportItem = ({ icon, label, value }) => (
    <div className="flex justify-between items-center text-sm p-2 bg-dark-tertiary rounded-md">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-text-secondary">{label}</span>
        </div>
        <span className="font-bold font-mono">{value}</span>
    </div>
);

const SweepReportModal = ({ isOpen, onClose, report }) => {
    if (!isOpen || !report) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-dark-secondary rounded-lg border border-white/10 w-full max-w-2xl p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Reporte de Operación de Barrido</h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-tertiary">
                                <HiXMark className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <ReportItem icon={<HiCheckCircle className="w-5 h-5 text-green-500"/>} label="Barridos Exitosos" value={report.summary.successfulSweeps} />
                            <ReportItem icon={<HiExclamationCircle className="w-5 h-5 text-red-500"/>} label="Transacciones Fallidas" value={report.summary.failedTxs} />
                            <ReportItem icon={<HiClock className="w-5 h-5 text-yellow-500"/>} label="Omitidas (sin gas)" value={report.summary.skippedForNoGas} />
                            <ReportItem icon={<HiMinusCircle className="w-5 h-5 text-gray-400"/>} label="Omitidas (sin token)" value={report.summary.skippedForNoToken} />
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">Detalles</h3>
                        <div className="max-h-60 overflow-y-auto border border-white/10 rounded-md">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary sticky top-0">
                                    <tr>
                                        <th className="p-2">Dirección</th>
                                        <th className="p-2">Estado</th>
                                        <th className="p-2">Detalle / Hash</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {report.details.map((item, index) => (
                                        <tr key={index} className="hover:bg-dark-tertiary">
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
                                            <td className="p-2 font-mono text-xs break-all">{item.txHash ? `${item.txHash.substring(0, 20)}...` : item.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6">
                            <button onClick={onClose} className="w-full py-2 font-bold rounded-md bg-accent-start hover:opacity-90 transition-opacity">
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
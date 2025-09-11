// RUTA: admin-frontend/src/pages/admin/components/ProcessWithdrawalModal.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Componente nuevo, diseñado para confirmar y procesar aprobaciones o rechazos.

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi2';

// --- Variantes de Animación ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 180 } },
  exit: { y: 20, opacity: 0 }
};

const ProcessWithdrawalModal = ({ isOpen, onClose, onConfirm, withdrawal, actionType }) => {
    const [adminNotes, setAdminNotes] = useState('');

    if (!isOpen || !withdrawal || !actionType) return null;

    const isRejection = actionType === 'rejected';
    
    const handleConfirm = () => {
        // Para rechazos, solo confirmar si se ha escrito un motivo.
        if (isRejection && !adminNotes.trim()) {
            return; // No hacer nada si no hay motivo.
        }
        onConfirm({
            status: actionType,
            adminNotes: adminNotes,
        });
    };

    // --- Determinación de Título, Icono y Color basado en la Acción ---
    const modalConfig = {
        completed: {
            title: 'Confirmar Aprobación',
            icon: <HiCheckCircle className="w-12 h-12 text-green-500" />,
            buttonClass: 'bg-green-600 hover:bg-green-700',
            buttonText: 'Sí, Aprobar Retiro'
        },
        rejected: {
            title: 'Confirmar Rechazo',
            icon: <HiExclamationCircle className="w-12 h-12 text-red-500" />,
            buttonClass: 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600',
            buttonText: 'Confirmar Rechazo'
        }
    };
    
    const { title, icon, buttonClass, buttonText } = modalConfig[actionType];
    const isConfirmDisabled = isRejection && !adminNotes.trim();

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
                onClick={onClose}
            >
                <motion.div
                    className="bg-dark-secondary rounded-lg border border-white/10 w-full max-w-lg shadow-xl"
                    variants={modalVariants} onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex justify-between items-center p-4 border-b border-white/10">
                        <h2 className="text-lg font-bold">{title}</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><HiXMark className="w-6 h-6" /></button>
                    </header>

                    <main className="p-6">
                        <div className="text-center mb-4">{icon}</div>
                        <p className="text-center text-text-secondary">
                            {isRejection ? `Estás a punto de RECHAZAR el siguiente retiro:` : `Por favor, confirma que deseas APROBAR el siguiente retiro:`}
                        </p>

                        <div className="bg-dark-tertiary border border-white/10 rounded-md p-4 my-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Usuario:</span> <strong className="text-white">{withdrawal.user.username}</strong></div>
                            <div className="flex justify-between"><span>Monto Neto:</span> <strong className="text-white font-mono">{withdrawal.netAmount.toFixed(2)} {withdrawal.currency}</strong></div>
                            <div className="flex justify-between"><span>Wallet Destino:</span> <strong className="text-white font-mono">{`${withdrawal.walletAddress.substring(0, 8)}...`}</strong></div>
                        </div>

                        {/* --- Campo de Motivo (solo para rechazos) --- */}
                        {isRejection && (
                            <div>
                                <label htmlFor="adminNotes" className="block text-sm font-medium text-text-secondary mb-1">
                                    Motivo del Rechazo (Obligatorio)
                                </label>
                                <textarea
                                    id="adminNotes"
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows="3"
                                    className="w-full p-2 bg-dark-primary rounded-md border border-white/20"
                                    placeholder="Ej: La dirección de la wallet no es válida, contacta a soporte..."
                                ></textarea>
                                <p className="text-xs text-text-secondary mt-1">Este motivo será visible para el usuario.</p>
                            </div>
                        )}
                    </main>

                    <footer className="p-4 flex gap-4">
                        <button onClick={onClose} className="w-full py-2.5 rounded-md bg-dark-tertiary hover:bg-white/10 transition-colors">Cancelar</button>
                        <button
                            onClick={handleConfirm}
                            disabled={isConfirmDisabled}
                            className={`w-full py-2.5 font-bold text-white rounded-md transition-colors ${buttonClass}`}
                        >
                            {buttonText}
                        </button>
                    </footer>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProcessWithdrawalModal;
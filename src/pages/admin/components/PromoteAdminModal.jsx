// RUTA: frontend/src/pages/admin/components/PromoteAdminModal.jsx (VERSIÓN "NEXUS VALIDATED")

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed, HiXMark } from 'react-icons/hi2';

// --- Variantes de Animación (Validadas) ---
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { y: 50, opacity: 0, transition: { duration: 0.2 } },
};

const PromoteAdminModal = ({ user, onPromote, onClose }) => {
    // --- Estado Interno para el Formulario (Validado) ---
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // --- [NEXUS VALIDATION] Las validaciones del lado del cliente son correctas y cruciales. ---
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        // [NEXUS VALIDATION] La llamada a la función onPromote del padre es correcta,
        // pasando los datos necesarios (userId, password) para la llamada a la API.
        onPromote(user._id, password);
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
                onClick={onClose}
            >
                <motion.div 
                    className="bg-dark-secondary rounded-lg border border-white/10 shadow-xl w-full max-w-md"
                    variants={modalVariants}
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold">Promover a Administrador</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><HiXMark className="w-6 h-6" /></button>
                    </header>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <p className="text-text-secondary">
                            Estás a punto de promover a <strong className="text-accent-start">{user.username}</strong> al rol de Administrador.
                        </p>
                        <p className="text-sm text-text-secondary">
                            Asigna una contraseña temporal segura. El usuario será forzado a cambiarla en su primer inicio de sesión.
                        </p>
                        
                        <div>
                            <label className="text-sm font-bold text-text-secondary">Contraseña Temporal</label>
                            <div className="relative mt-1">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-dark-primary rounded-lg border border-white/10"
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-text-secondary">Confirmar Contraseña</label>
                             <div className="relative mt-1">
                                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-dark-primary rounded-lg border border-white/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-dark-tertiary hover:bg-white/10 transition-colors">Cancelar</button>
                            <button type="submit" className="px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:opacity-90">Promover Usuario</button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PromoteAdminModal;
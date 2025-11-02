// RUTA: frontend/src/pages/admin/components/EditUserModal.jsx (NUEVA VERSIÓN FUSIONADA)

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

const EditUserModal = ({ user, onSave, onClose, isSuperAdmin }) => {
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        // Inicializa el formulario con los datos existentes del usuario
        if (user) {
            reset({
                username: user.username,
                status: user.status,
                role: user.role,
                wallet: user.wallet || '',
            });
        }
    }, [user, reset]);

    const onSubmit = (data) => {
        // La función onSave en la página principal se encargará de la lógica
        onSave(user._id, data);
    };

    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
                <motion.div className="relative bg-dark-secondary rounded-lg w-full max-w-lg border border-dark-tertiary" initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: 50 }} onClick={(e) => e.stopPropagation()}>
                    <header className="flex justify-between items-center p-4 border-b border-dark-tertiary">
                        <h2 className="text-xl font-bold">Editar Usuario: {user.username}</h2>
                        <button onClick={onClose}><HiXMark className="w-6 h-6" /></button>
                    </header>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <main className="p-6 grid grid-cols-2 gap-x-4 gap-y-3 max-h-[70vh] overflow-y-auto">
                            {/* --- Sección de Datos del Perfil --- */}
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-white">Username</label>
                                <input {...register('username', { required: true })} className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white">Estado</label>
                                <select {...register('status')} className="w-full mt-1 p-2 bg-white text-black rounded">
                                    <option value="active">Activo</option>
                                    <option value="banned">Baneado</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white">Rol</label>
                                <select {...register('role')} disabled={!isSuperAdmin} className="w-full mt-1 p-2 bg-white text-black rounded disabled:opacity-50">
                                    <option value="user">Usuario</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-white">Nueva Contraseña (Opcional)</label>
                                <input type="password" {...register('password')} placeholder="Dejar en blanco para no cambiar" className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>

                            {/* --- Sección de Seguridad de Retiros --- */}
                            <div className="col-span-2 pt-4 border-t border-dark-tertiary">
                                <h3 className="text-lg font-semibold text-accent">Configuración de Retiros</h3>
                                <p className="text-xs text-text-secondary">Gestiona la contraseña de retiro y dirección de billetera del usuario.</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-white">Nueva Contraseña de Retiro (Opcional)</label>
                                <input type="password" {...register('withdrawalPassword')} placeholder="Dejar en blanco para no cambiar" className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-white">Dirección de Billetera para Retiros</label>
                                <input type="text" {...register('wallet')} placeholder="Dirección de la billetera" className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>

                            {/* --- Sección de Ajuste de Saldos --- */}
                            <div className="col-span-2 pt-4 border-t border-dark-tertiary">
                                <h3 className="text-lg font-semibold text-accent">Ajustar Saldos (Crédito/Débito)</h3>
                                <p className="text-xs text-text-secondary">Usa valores positivos para añadir y negativos para restar.</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white">Ajustar USDT</label>
                                <input type="number" step="0.01" {...register('usdtAdjustment', { valueAsNumber: true })} defaultValue="0" className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>
                             <div>
                                <label className="text-sm font-medium text-white">Ajustar Giros (Spins)</label>
                                <input type="number" {...register('spinsAdjustment', { valueAsNumber: true })} defaultValue="0" className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-white">Razón del Ajuste (Obligatorio si se ajusta saldo)</label>
                                <input {...register('adjustmentReason')} placeholder="Ej: Bono por evento, corrección manual..." className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>
                        </main>
                        <footer className="p-4 border-t border-dark-tertiary text-right">
                            <button type="submit" className="px-6 py-2 bg-green-600 font-bold rounded-lg hover:bg-green-700 transition-colors">Guardar Cambios</button>
                        </footer>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditUserModal;
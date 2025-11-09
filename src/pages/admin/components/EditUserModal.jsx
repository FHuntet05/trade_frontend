// RUTA: frontend/src/pages/admin/components/EditUserModal.jsx
// VERSIÓN FINAL Y CORRECTA

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

const EditUserModal = ({ user, onSave, onClose, isSuperAdmin }) => {
    // --- INICIO DE LA CORRECCIÓN ---
    // Usamos 'defaultValues' para inicializar el formulario con los datos del usuario.
    // Esto es crucial para que los campos de saldo muestren el valor actual.
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            username: user?.username || '',
            status: user?.status || 'active',
            role: user?.role || 'user',
            wallet: user?.wallet || '',
            // Nombres correctos para los campos de "establecer saldo"
            newUsdtBalance: user?.balance?.usdt?.toFixed(2) || '0.00',
            newSpinsBalance: user?.balance?.spins || 0,
            adjustmentReason: '', // La razón siempre empieza vacía
        }
    });

    // useEffect para resetear el formulario si el objeto 'user' cambia.
    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                status: user.status,
                role: user.role,
                wallet: user.wallet || '',
                newUsdtBalance: user.balance?.usdt?.toFixed(2) || '0.00',
                newSpinsBalance: user.balance?.spins || 0,
                adjustmentReason: '',
            });
        }
    }, [user, reset]);
    // --- FIN DE LA CORRECCIÓN ---

    const onSubmit = (data) => {
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
                            {/* --- Sección de Datos del Perfil (sin cambios) --- */}
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

                            {/* --- INICIO DE LA CORRECCIÓN EN EL JSX --- */}
                            <div className="col-span-2 pt-4 border-t border-dark-tertiary">
                                <h3 className="text-lg font-semibold text-accent">Establecer Saldos</h3>
                                <p className="text-xs text-text-secondary">El valor que ingreses será el nuevo saldo final del usuario.</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-white">Nuevo Saldo USDT</label>
                                <input type="number" step="0.01" {...register('newUsdtBalance', { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>
                             <div>
                                <label className="text-sm font-medium text-white">Nuevo Saldo de Giros</label>
                                <input type="number" {...register('newSpinsBalance', { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-white">Razón del Cambio (Obligatorio si se modifica saldo)</label>
                                <input {...register('adjustmentReason')} placeholder="Ej: Corrección manual de saldo..." className="w-full mt-1 p-2 bg-white text-black rounded" />
                            </div>
                            {/* --- FIN DE LA CORRECCIÓN EN EL JSX --- */}
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
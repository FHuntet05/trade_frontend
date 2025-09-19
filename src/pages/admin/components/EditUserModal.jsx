// RUTA: admin-frontend/src/pages/admin/components/EditUserModal.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Modal del Modelo con lógica de permisos para Super Admin integrada.

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiXMark,
    HiOutlineUser,
    HiOutlineCurrencyDollar,
    HiOutlineLockClosed,
    HiOutlineShieldCheck
} from 'react-icons/hi2';

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 25 } },
    exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2 } },
};

// El modal recibe 'isSuperAdmin' como una prop para determinar si debe habilitar el selector de rol.
const EditUserModal = ({ user, onSave, onClose, isSuperAdmin }) => {

    const [formData, setFormData] = useState({
        username: '',
        balanceUsdt: 0,
        password: '',
        role: 'user', // Se añade el campo 'role' al estado por defecto.
        status: 'active', // Nuevo campo: estado del usuario
    });

    // useEffect se dispara cuando el prop 'user' cambia, llenando el formulario con los datos del usuario.
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                balanceUsdt: user.balance?.usdt || 0,
                password: '',
                role: user.role || 'user',
                status: user.status || 'active', // Inicializa el estado del usuario.
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            // Se convierte el balance a número para asegurar el tipo de dato correcto.
            [name]: name === 'balanceUsdt' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = {
            username: formData.username,
            balanceUsdt: formData.balanceUsdt,
            role: formData.role,
            status: formData.status, // Se añade el estado al objeto que se envía.
        };

        // Solo se incluye la contraseña en el objeto a enviar si el campo no está vacío.
        if (formData.password) {
            if (formData.password.length < 6) {
                alert('La nueva contraseña debe tener al menos 6 caracteres.');
                return;
            }
            dataToSend.password = formData.password;
        }

        // Se llama a la función onSave pasada desde UsersPage.jsx con los datos actualizados.
        onSave(user._id, dataToSend);
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
                onClick={onClose}
            >
                <motion.div
                    className="relative bg-dark-secondary rounded-2xl border border-white/10 w-full max-w-lg text-white shadow-xl"
                    variants={modalVariants} onClick={(e) => e.stopPropagation()}
                >
                    {/* --- Encabezado del Modal --- */}
                    <header className="flex justify-between items-center p-6 border-b border-white/10">
                        <h2 className="text-xl font-bold">Editar Usuario: <span className="text-accent-start">{user.username}</span></h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                            <HiXMark className="w-6 h-6" />
                        </button>
                    </header>

                    {/* --- Formulario de Edición --- */}
                    <form onSubmit={handleSubmit}>
                        <main className="p-6 space-y-4">
                            {/* Campo: Nombre de Usuario */}
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-text-secondary">Nombre de Usuario</label>
                                <div className="relative"><HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" /><input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-black/20 rounded-lg border border-white/10" /></div>
                            </div>

                            {/* Campo: Balance USDT */}
                            <div>
                                <label htmlFor="balanceUsdt" className="block mb-2 text-sm font-medium text-text-secondary">Balance (USDT)</label>
                                <div className="relative"><HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" /><input type="number" name="balanceUsdt" id="balanceUsdt" value={formData.balanceUsdt} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-black/20 rounded-lg border border-white/10" step="0.01" /></div>
                            </div>

                            {/* Campo: Estado del Usuario (Activo/Baneado) */}
                            <div>
                                <label htmlFor="status" className="block mb-2 text-sm font-medium text-text-secondary">Estado de la Cuenta</label>
                                <div className="relative"><HiOutlineShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                    <select name="status" id="status" value={formData.status} onChange={handleChange} className="w-full pl-10 pr-4 py-2 bg-black/20 rounded-lg border border-white/10">
                                        <option value="active">Activo</option>
                                        <option value="banned">Baneado</option>
                                    </select>
                                </div>
                            </div>

                            {/* Campo: Rol del Usuario (con lógica de permisos) */}
                            <div>
                                <label htmlFor="role" className="block mb-2 text-sm font-medium text-text-secondary">Rol del Usuario</label>
                                <div className="relative"><HiOutlineShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                                    <select name="role" id="role" value={formData.role} onChange={handleChange} className={`w-full pl-10 pr-4 py-2 bg-black/20 rounded-lg border border-white/10 ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={!isSuperAdmin}>
                                        <option value="user">Usuario</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                                {!isSuperAdmin && (<p className="mt-1 text-xs text-yellow-400/80">Solo un Super Administrador puede cambiar el rol.</p>)}
                            </div>

                            {/* Campo: Nueva Contraseña (Opcional) */}
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-text-secondary">Restablecer Contraseña (Opcional)</label>
                                <div className="relative"><HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" /><input type="password" name="password" id="password" value={formData.password} onChange={handleChange} placeholder="Dejar en blanco para no cambiar" className="w-full pl-10 pr-4 py-2 bg-black/20 rounded-lg border border-white/10" /></div>
                            </div>
                        </main>

                        {/* --- Pie del Modal --- */}
                        <footer className="p-6 border-t border-white/10 text-right">
                            <button type="submit" className="px-6 py-2 bg-gradient-to-r from-accent-start to-accent-end text-white font-bold rounded-lg hover:opacity-90 transition-opacity">Guardar Cambios</button>
                        </footer>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditUserModal;
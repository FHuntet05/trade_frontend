// RUTA: frontend/src/pages/admin/AdminToolsPage.jsx (VERSIÓN REFACTORIZADA PARA ITEMS CUANTITATIVOS)

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/pages/admin/api/adminApi';
import Loader from '@/components/common/Loader';
import { HiOutlineCalculator, HiPlus, HiPencil, HiTrash, HiXMark } from 'react-icons/hi2';

// --- SUB-COMPONENTE: Tabla de Items Cuantitativos ---
const QuantitativeItemsTable = ({ items, onEdit, onDelete }) => (
    <div className="overflow-x-auto bg-dark-secondary rounded-lg border border-white/10">
        <table className="min-w-full text-sm text-left">
            <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                <tr>
                    <th className="px-6 py-3">Nombre del Plan</th>
                    <th className="px-6 py-3 text-right">Precio</th>
                    <th className="px-6 py-3 text-center">% Diario</th>
                    <th className="px-6 py-3 text-center">Duración</th>
                    <th className="px-6 py-3 text-right">% Retorno Total</th>
                    <th className="px-6 py-3 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
                {items.map((item) => (
                    <tr key={item._id} className="hover:bg-dark-tertiary/50">
                        <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                        <td className="px-6 py-4 text-right font-mono">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center font-mono text-green-400">{item.dailyPercentage}%</td>
                        <td className="px-6 py-4 text-center font-mono">{item.durationDays} días</td>
                        <td className="px-6 py-4 text-right font-mono text-blue-400">{item.totalReturnPercentage}%</td>
                        <td className="px-6 py-4 text-center">
                            <div className="flex justify-center items-center gap-2">
                                <button onClick={() => onEdit(item)} className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-md"><HiPencil className="w-5 h-5" /></button>
                                <button onClick={() => onDelete(item._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-md"><HiTrash className="w-5 h-5" /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {items.length === 0 && <p className="text-center py-8 text-text-secondary">No hay items cuantitativos creados.</p>}
    </div>
);

// --- SUB-COMPONENTE: Modal de Formulario ---
const QuantitativeItemFormModal = ({ item, onSave, onClose }) => {
    const { register, handleSubmit, reset } = useForm();
    const isEditing = !!item;

    useEffect(() => {
        reset(isEditing ? item : { isActive: true, isOnSale: false });
    }, [item, isEditing, reset]);

    return (
        <motion.div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="relative bg-dark-secondary rounded-lg border border-dark-tertiary w-full max-w-2xl text-white" initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}>
                <header className="flex justify-between items-center p-4 border-b border-dark-tertiary">
                    <h2 className="text-lg font-bold">{isEditing ? 'Editar Item Cuantitativo' : 'Crear Nuevo Item Cuantitativo'}</h2>
                    <button onClick={onClose}><HiXMark className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit((data) => onSave(data, item?._id))}>
                    <main className="p-6 grid grid-cols-2 gap-x-4 gap-y-3 max-h-[70vh] overflow-y-auto">
                        <div className="col-span-2"><label className="text-sm font-medium text-white">Nombre del Plan</label><input {...register('name', { required: true })} className="w-full mt-1 p-2 bg-white text-black rounded" /></div>
                        <div><label className="text-sm font-medium text-white">Precio (USDT)</label><input type="number" step="0.01" {...register('price', { required: true, valueAsNumber: true })} className="w-full mt-1 p-2 bg-white text-black rounded" /></div>
                        <div><label className="text-sm font-medium text-white">% de Ganancia Diario</label><input type="number" step="0.01" {...register('dailyPercentage', { required: true, valueAsNumber: true })} className="w-full mt-1 p-2 bg-white text-black rounded" /></div>
                        <div><label className="text-sm font-medium text-white">Duración (Días)</label><input type="number" {...register('durationDays', { required: true, valueAsNumber: true })} className="w-full mt-1 p-2 bg-white text-black rounded" /></div>
                        <div><label className="text-sm font-medium text-white">% de Retorno Total</label><input type="number" step="0.01" {...register('totalReturnPercentage', { required: true, valueAsNumber: true })} className="w-full mt-1 p-2 bg-white text-black rounded" /></div>
                        <div><label className="text-sm font-medium text-white">Inversión Mínima</label><input type="number" step="0.01" {...register('minInvestment', { required: true, valueAsNumber: true })} className="w-full mt-1 p-2 bg-white text-black rounded" /></div>
                        <div><label className="text-sm font-medium text-white">Inversión Máxima</label><input type="number" step="0.01" {...register('maxInvestment', { required: true, valueAsNumber: true })} className="w-full mt-1 p-2 bg-white text-black rounded" /></div>
                        <div className="col-span-2 flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-2"><input type="checkbox" {...register('isActive')} id="isActive" /><label htmlFor="isActive">Activo</label></div>
                            <div className="flex items-center gap-2"><input type="checkbox" {...register('isOnSale')} id="isOnSale" /><label htmlFor="isOnSale">En Oferta</label></div>
                        </div>
                    </main>
                    <footer className="p-4 border-t border-dark-tertiary text-right"><button type="submit" className="px-5 py-2 bg-green-600 font-bold rounded-lg">{isEditing ? 'Guardar' : 'Crear'}</button></footer>
                </form>
            </motion.div>
        </motion.div>
    );
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
const AdminQuantitativePage = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/admin/quantitative-plans');
            setItems(data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al cargar los items cuantitativos.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (formData, itemId) => {
        const isEditing = !!itemId;
        const request = isEditing
            ? api.put(`/admin/quantitative-plans/${itemId}`, formData)
            : api.post('/admin/quantitative-plans', formData);

        toast.promise(request, {
            loading: 'Guardando item...',
            success: () => { setIsModalOpen(false); fetchItems(); return `Item ${isEditing ? 'actualizado' : 'creado'}.`; },
            error: (err) => err.response?.data?.message || 'Error al guardar.',
        });
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('¿Estás seguro? Esta acción es irreversible.')) {
            toast.promise(api.delete(`/admin/quantitative-plans/${itemId}`), {
                loading: 'Eliminando item...',
                success: () => { fetchItems(); return 'Item eliminado.'; },
                error: (err) => err.response?.data?.message || 'No se pudo eliminar.',
            });
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex-grow">
                        <h1 className="text-2xl font-semibold flex items-center gap-3"><HiOutlineCalculator /> Gestión Cuantitativa</h1>
                        <p className="text-text-secondary mt-1">Crea y edita los planes de inversión cuantitativa.</p>
                    </div>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 font-bold bg-green-600 text-white rounded-lg">
                        <HiPlus /> Crear Nuevo Plan
                    </button>
                </div>
                
                {isLoading
                    ? <div className="flex justify-center p-10"><Loader /></div>
                    : <QuantitativeItemsTable items={items} onEdit={handleOpenModal} onDelete={handleDeleteItem} />
                }
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <QuantitativeItemFormModal item={editingItem} onSave={handleSaveItem} onClose={() => setIsModalOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminQuantitativePage;
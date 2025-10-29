// RUTA: frontend/src/pages/admin/AdminInvestmentsPage.jsx (VERSIÓN CON CORRECCIONES VISUALES Y FUNCIONALES)

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/pages/admin/api/adminApi';
import Loader from '@/components/common/Loader';
import { HiChartBar, HiPlus, HiPencil, HiTrash, HiXMark, HiOutlineFire, HiOutlineSparkles, HiOutlineEyeOff, HiOutlineEye } from 'react-icons/hi2';

// --- SUB-COMPONENTE: Tarjeta de Previsualización (Sin cambios) ---
const InvestmentCard = ({ item, onEdit, onDelete, onToggleStatus }) => (
    <div className="bg-dark-secondary rounded-lg border border-white/10 flex flex-col justify-between">
        <div className="p-4 relative">
            {item.saleDiscountPercentage > 0 && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                    OFERTA -{item.saleDiscountPercentage}%
                </div>
            )}
             {item.purchaseCount > 10 && (
                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-br-lg rounded-tl-lg flex items-center gap-1">
                    <HiOutlineFire /> MÁS POPULAR
                </div>
            )}
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 mx-auto mb-3 rounded-full object-cover bg-dark-primary p-1" />
            <h3 className="text-center font-bold text-lg">{item.name}</h3>
            <p className="text-center text-sm text-text-secondary">{item.linkedCryptoSymbol}</p>
            <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">Duración:</span> <span className="font-mono">{item.durationDays} días</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">ROI Total:</span> <span className="font-mono font-bold text-green-400">{item.totalRoiPercentage}%</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Ganancia Diaria:</span> <span className="font-mono">{item.dailyProfitAmount} USDT</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Precio:</span> <span className="font-mono">{item.price} USDT</span></div>
            </div>
        </div>
        <div className="bg-dark-tertiary/50 p-2 flex justify-around items-center border-t border-white/10">
            <button onClick={() => onEdit(item)} className="p-2 text-indigo-400 hover:text-white" title="Editar"><HiPencil className="w-5 h-5" /></button>
            <button onClick={() => onToggleStatus(item)} className="p-2 text-yellow-400 hover:text-white" title={item.isActive ? 'Desactivar' : 'Activar'}>
                {item.isActive ? <HiOutlineEye className="w-5 h-5" /> : <HiOutlineEyeOff className="w-5 h-5" />}
            </button>
            <button onClick={() => onDelete(item._id)} className="p-2 text-red-400 hover:text-white" title="Eliminar"><HiTrash className="w-5 h-5" /></button>
        </div>
    </div>
);

// --- SUB-COMPONENTE: Modal de Formulario (CON CORRECCIONES) ---
const InvestmentFormModal = ({ item, onSave, onClose, cryptoList }) => {
    const { register, handleSubmit, reset } = useForm();
    const isEditing = !!item;

    useEffect(() => {
        reset(isEditing ? item : { isActive: true, saleDiscountPercentage: 0, linkedCryptoSymbol: 'BTC' });
    }, [item, isEditing, reset]);

    // --- CORRECCIÓN FUNCIONAL ---
    // Esta función "limpia" los datos del formulario antes de enviarlos.
    // Se asegura de que todos los campos numéricos sean realmente números.
    const handleDataSubmit = (data) => {
        const cleanedData = {
            ...data,
            price: parseFloat(data.price) || 0,
            durationDays: parseInt(data.durationDays, 10) || 0,
            dailyProfitAmount: parseFloat(data.dailyProfitAmount) || 0,
            totalRoiPercentage: parseInt(data.totalRoiPercentage, 10) || 0,
            saleDiscountPercentage: parseInt(data.saleDiscountPercentage, 10) || 0,
        };
        onSave(cleanedData, item?._id);
    };

    return (
        <motion.div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="relative bg-dark-secondary rounded-lg border border-dark-tertiary w-full max-w-2xl text-white" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                <header className="flex justify-between items-center p-4 border-b border-dark-tertiary">
                    <h2 className="text-lg font-bold">{isEditing ? 'Editar Item' : 'Crear Nuevo Item'}</h2>
                    <button onClick={onClose}><HiXMark className="w-6 h-6" /></button>
                </header>
                <form onSubmit={handleSubmit(handleDataSubmit)}>
                    <main className="p-6 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        {/* --- INICIO DE CORRECCIONES VISUALES --- */}
                        <div className="col-span-2">
                            <label className="text-sm text-text-secondary">Nombre del Plan</label>
                            <input {...register('name', { required: true })} className="w-full mt-1 p-2 bg-dark-primary text-white border border-dark-tertiary rounded" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm text-text-secondary">URL de la Imagen</label>
                            <input {...register('imageUrl', { required: true })} className="w-full mt-1 p-2 bg-dark-primary text-white border border-dark-tertiary rounded" />
                        </div>
                        <div>
                            <label className="text-sm text-text-secondary">Vincular a Cripto</label>
                            <select {...register('linkedCryptoSymbol')} className="w-full mt-1 p-2 bg-dark-primary text-white border border-dark-tertiary rounded">
                                {cryptoList.map(c => <option key={c.symbol} value={c.symbol}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-text-secondary">Precio (USDT)</label>
                            <input type="number" step="0.01" {...register('price', { required: true })} className="w-full mt-1 p-2 bg-dark-primary text-white border border-dark-tertiary rounded" />
                        </div>
                        <div>
                            <label className="text-sm text-text-secondary">Duración (Días)</label>
                            <input type="number" {...register('durationDays', { required: true })} className="w-full mt-1 p-2 bg-dark-primary text-white border border-dark-tertiary rounded" />
                        </div>
                        <div>
                            <label className="text-sm text-text-secondary">Ganancia Diaria (USDT)</label>
                            <input type="number" step="0.01" {...register('dailyProfitAmount', { required: true })} className="w-full mt-1 p-2 bg-dark-primary text-white border border-dark-tertiary rounded" />
                        </div>
                        <div>
                            <label className="text-sm text-text-secondary">ROI Total (%)</label>
                            <input type="number" {...register('totalRoiPercentage', { required: true })} className="w-full mt-1 p-2 bg-dark-primary text-white border border-dark-tertiary rounded" />
                        </div>
                        <div>
                            <label className="text-sm text-text-secondary">% Oferta (0 si no hay)</label>
                            <input type="number" {...register('saleDiscountPercentage')} className="w-full mt-1 p-2 bg-dark-primary text-white border border-dark-tertiary rounded" />
                        </div>
                        {/* --- FIN DE CORRECCIONES VISUALES --- */}
                    </main>
                    <footer className="p-4 border-t border-dark-tertiary text-right">
                        <button type="submit" className="px-5 py-2 bg-green-600 font-bold rounded-lg hover:bg-green-700 transition-colors">
                            {isEditing ? 'Guardar Cambios' : 'Crear Item'}
                        </button>
                    </footer>
                </form>
            </motion.div>
        </motion.div>
    );
};

// --- COMPONENTE PRINCIPAL (Sin cambios en su lógica) ---
const AdminInvestmentsPage = () => {
    // ... (toda la lógica de este componente se mantiene igual)
    const [items, setItems] = useState([]);
    const [cryptoList, setCryptoList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [itemsRes, cryptosRes] = await Promise.all([
                api.get('/admin/market-items'),
                api.get('/admin/available-cryptos')
            ]);
            setItems(itemsRes.data.data || []);
            setCryptoList(cryptosRes.data.data || []);
        } catch (error) {
            toast.error('No se pudieron cargar los datos del mercado.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (formData, itemId) => {
        const isEditing = !!itemId;
        const request = isEditing ? api.put(`/admin/market-items/${itemId}`, formData) : api.post('/admin/market-items', formData);
        toast.promise(request, {
            loading: 'Guardando...',
            success: () => { setIsModalOpen(false); fetchData(); return `Item ${isEditing ? 'actualizado' : 'creado'}.`; },
            error: (err) => err.response?.data?.message || 'Error al guardar.',
        });
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('¿Seguro?')) {
            toast.promise(api.delete(`/admin/market-items/${itemId}`), {
                loading: 'Eliminando...',
                success: () => { fetchData(); return 'Item eliminado.'; },
                error: (err) => err.response?.data?.message || 'Error al eliminar.',
            });
        }
    };
    
    const handleToggleStatus = async (item) => {
        const newStatus = !item.isActive;
        toast.promise(api.put(`/admin/market-items/${item._id}`, { ...item, isActive: newStatus }), {
            loading: 'Actualizando estado...',
            success: () => { fetchData(); return 'Estado actualizado.'; },
            error: 'Error al actualizar estado.',
        });
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader /></div>;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold flex items-center gap-3"><HiOutlineSparkles /> Constructor Visual del Mercado</h1>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <motion.div onClick={() => handleOpenModal()} className="cursor-pointer bg-dark-secondary rounded-lg border-2 border-dashed border-dark-tertiary hover:border-accent flex flex-col items-center justify-center min-h-[300px]">
                        <HiPlus className="w-12 h-12 text-dark-tertiary" />
                        <span className="mt-2 text-text-secondary">Crear Nuevo Item</span>
                    </motion.div>
                    {items.map((item) => <InvestmentCard key={item._id} item={item} onEdit={handleOpenModal} onDelete={handleDeleteItem} onToggleStatus={handleToggleStatus} />)}
                </div>
            </div>
            <AnimatePresence>
                {isModalOpen && <InvestmentFormModal item={editingItem} onSave={handleSaveItem} onClose={() => setIsModalOpen(false)} cryptoList={cryptoList} />}
            </AnimatePresence>
        </>
    );
};

export default AdminInvestmentsPage;
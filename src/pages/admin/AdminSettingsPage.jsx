// RUTA: frontend/src/pages/admin/AdminSettingsPage.jsx (VERSIÓN "NEXUS - RICH NOTIFICATIONS UI")

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import adminApi from '@/pages/admin/api/adminApi';
import { HiOutlineCog6Tooth, HiOutlineBellAlert } from 'react-icons/hi2';
import Loader from '@/components/common/Loader';

// --- SUB-COMPONENTS ---
const SettingsCard = ({ title, description, children }) => (
    <div className="bg-dark-secondary rounded-lg border border-white/10">
        <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
        <div className="p-6 space-y-4">{children}</div>
    </div>
);

const SettingsInput = ({ name, label, type, register, step, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input 
            type={type} 
            id={name}
            step={step}
            {...register(name, { valueAsNumber: type === 'number' })} 
            className="w-full bg-dark-primary p-2 rounded-md border border-white/20"
            {...props}
        />
    </div>
);

const SettingsToggle = ({ name, label, register }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium text-text-secondary">{label}</label>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={name} {...register(name)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-accent-start peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
    </div>
);

// [NEXUS NOTIFICATION FIX] - The notification form is now its own component for clarity.
const NotificationsCard = () => {
    const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm({
        defaultValues: { message: '', imageUrl: '', buttonUrl: '', buttonText: '' }
    });

    const onSendNotification = async (data) => {
        // Validation: if button text is provided, button URL is required, and vice versa.
        if ((data.buttonText && !data.buttonUrl) || (!data.buttonText && data.buttonUrl)) {
            toast.error('Para enviar un botón, tanto el Texto como la URL son requeridos.');
            return;
        }

        const promise = adminApi.post('/admin/notifications/broadcast', data);
        toast.promise(promise, {
            loading: 'Enviando notificación a todos los usuarios...',
            success: (res) => {
                reset(); // Clears the form fields
                return res.data.message;
            },
            error: (err) => err.response?.data?.message || 'Error al enviar la notificación.'
        });
    };

    return (
        <SettingsCard 
            title="Enviar Notificación Global" 
            description="Envía un mensaje a todos los usuarios activos. Soporta imágenes y botones."
        >
            <form onSubmit={handleSubmit(onSendNotification)} className="space-y-4">
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">Mensaje (Soporta HTML)</label>
                    <textarea 
                        id="message"
                        rows={4}
                        {...register('message', { required: true })}
                        className="w-full bg-dark-primary p-2 rounded-md border border-white/20"
                        placeholder="Escribe tu mensaje aquí..."
                    />
                </div>
                <SettingsInput name="imageUrl" label="URL de la Imagen (Opcional)" type="text" register={register} placeholder="https://ejemplo.com/imagen.jpg" />
                
                {/* [NEXUS NOTIFICATION FIX] - New fields for the button */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingsInput name="buttonText" label="Texto del Botón (Opcional)" type="text" register={register} placeholder="Abrir App" />
                    <SettingsInput name="buttonUrl" label="URL del Botón (Opcional)" type="text" register={register} placeholder="https://tu-app.com" />
                </div>
                
                <button 
                    type="submit" 
                    disabled={isSubmitting || !isDirty}
                    className="w-full mt-2 py-2 px-4 flex items-center justify-center gap-2 font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                >
                    <HiOutlineBellAlert className="w-5 h-5" />
                    {isSubmitting ? 'Enviando...' : 'Enviar Notificación'}
                </button>
            </form>
        </SettingsCard>
    );
};

// --- MAIN PAGE COMPONENT ---
const AdminSettingsPage = () => {
    const { register: registerSettings, handleSubmit: handleSettingsSubmit, reset: resetSettings, formState: { isSubmitting: isSettingsSubmitting, isDirty: isSettingsDirty } } = useForm();
    const [isLoading, setIsLoading] = useState(true);

    const loadSettings = useCallback(async () => {
        try {
            const { data } = await adminApi.get('/admin/settings');
            resetSettings(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudo cargar la configuración.');
        } finally {
            setIsLoading(false);
        }
    }, [resetSettings]);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const onSettingsSubmit = async (data) => {
        const promise = adminApi.put('/admin/settings', data);
        toast.promise(promise, {
            loading: 'Guardando configuración...',
            success: (res) => {
                resetSettings(res.data);
                return '¡Configuración guardada!';
            },
            error: (err) => err.response?.data?.message || 'Error al guardar.',
        });
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader text="Cargando ajustes..." /></div>;
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSettingsSubmit(onSettingsSubmit)}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex-grow">
                        <h1 className="text-2xl font-semibold flex items-center gap-3"><HiOutlineCog6Tooth /> Ajustes Generales</h1>
                        <p className="text-text-secondary mt-1">Modifica los parámetros globales del sistema.</p>
                    </div>
                    <button type="submit" disabled={isSettingsSubmitting || !isSettingsDirty} className="px-6 py-3 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-full md:w-auto">
                        {isSettingsSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <SettingsCard title="Controles Principales" description="Activa o desactiva funcionalidades críticas.">
                            <SettingsToggle name="maintenanceMode" label="Modo Mantenimiento" register={registerSettings} />
                            <SettingsToggle name="withdrawalsEnabled" label="Habilitar Retiros para Usuarios" register={registerSettings} />
                        </SettingsCard>
                        <SettingsCard title="Ajustes de Retiros" description="Configura las reglas para las solicitudes de retiro.">
                            <SettingsInput name="minimumWithdrawal" label="Monto Mínimo de Retiro (USDT)" type="number" step="0.01" register={registerSettings} />
                            <SettingsInput name="withdrawalFeePercent" label="Comisión por Retiro (%)" type="number" step="0.1" register={registerSettings} />
                        </SettingsCard>
                    </div>
                    <div className="space-y-6">
                        <SettingsCard title="Comisiones por Depósito (Primer Depósito)" description="Define el % de comisión por el primer depósito de un referido.">
                            <SettingsInput name="depositCommissionLevel1" label="Comisión Nivel 1 (%)" type="number" step="0.1" register={registerSettings} />
                            <SettingsInput name="depositCommissionLevel2" label="Comisión Nivel 2 (%)" type="number" step="0.1" register={registerSettings} />
                            <SettingsInput name="depositCommissionLevel3" label="Comisión Nivel 3 (%)" type="number" step="0.1" register={registerSettings} />
                        </SettingsCard>
                        <SettingsCard title="Comisiones por Compra de Herramientas" description="Define el % de comisión por compras de referidos.">
                            <SettingsInput name="commissionLevel1" label="Comisión Nivel 1 (%)" type="number" step="0.1" register={registerSettings} />
                            <SettingsInput name="commissionLevel2" label="Comisión Nivel 2 (%)" type="number" step="0.1" register={registerSettings} />
                            <SettingsInput name="commissionLevel3" label="Comisión Nivel 3 (%)" type="number" step="0.1" register={registerSettings} />
                        </SettingsCard>
                    </div>
                </div>
            </form>
            
            {/* The new, self-contained NotificationsCard is placed here */}
            <NotificationsCard />
        </div>
    );
};

export default AdminSettingsPage;
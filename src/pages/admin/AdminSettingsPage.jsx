// RUTA: frontend/src/pages/admin/AdminSettingsPage.jsx (VERSIÓN "NEXUS SYNC")

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import adminApi from '@/pages/admin/api/adminApi';
import { HiOutlineCog6Tooth } from 'react-icons/hi2';
import Loader from '@/components/common/Loader';

// --- COMPONENTES INTERNOS (sin cambios) ---
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

const AdminSettingsPage = () => {
    const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm();
    const [isLoading, setIsLoading] = useState(true);

    const loadSettings = useCallback(async () => {
        try {
            // [NEXUS SYNC - VALIDATED] Esta llamada ahora funciona gracias a la reparación del backend.
            const { data } = await adminApi.get('/admin/settings');
            reset(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudo cargar la configuración.');
        } finally {
            setIsLoading(false);
        }
    }, [reset]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const onSubmit = async (data) => {
        const promise = adminApi.put('/admin/settings', data);
        toast.promise(promise, {
            loading: 'Guardando configuración...',
            success: (res) => {
                reset(res.data);
                return '¡Configuración guardada!';
            },
            error: (err) => err.response?.data?.message || 'Error al guardar.',
        });
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader text="Cargando ajustes..." /></div>;
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex-grow">
                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                        <HiOutlineCog6Tooth /> Ajustes Generales
                    </h1>
                    <p className="text-text-secondary mt-1">Modifica los parámetros globales del sistema.</p>
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting || !isDirty}
                    className="px-6 py-3 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-full md:w-auto"
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <SettingsCard title="Controles Principales" description="Activa o desactiva funcionalidades críticas.">
                        <SettingsToggle name="maintenanceMode" label="Modo Mantenimiento" register={register} />
                        <SettingsToggle name="withdrawalsEnabled" label="Habilitar Retiros para Usuarios" register={register} />
                    </SettingsCard>
                    <SettingsCard title="Ajustes de Retiros" description="Configura las reglas para las solicitudes de retiro.">
                        <SettingsInput name="minimumWithdrawal" label="Monto Mínimo de Retiro (USDT)" type="number" step="0.01" register={register} />
                        <SettingsInput name="withdrawalFeePercent" label="Comisión por Retiro (%)" type="number" step="0.1" register={register} />
                    </SettingsCard>
                </div>

                <div className="space-y-6">
                    <SettingsCard title="Comisiones por Referidos" description="Define el porcentaje de comisión para cada nivel.">
                        <SettingsInput name="commissionLevel1" label="Comisión Nivel 1 (%)" type="number" step="0.1" register={register} />
                        <SettingsInput name="commissionLevel2" label="Comisión Nivel 2 (%)" type="number" step="0.1" register={register} />
                        <SettingsInput name="commissionLevel3" label="Comisión Nivel 3 (%)" type="number" step="0.1" register={register} />
                    </SettingsCard>
                     <SettingsCard title="Ajustes de Swap" description="Configura las reglas para los swaps de NTX a USDT.">
                        <SettingsInput name="minimumSwap" label="Monto Mínimo de Swap (NTX)" type="number" step="1" register={register} />
                        <SettingsInput name="swapFeePercent" label="Comisión por Swap (%)" type="number" step="0.1" register={register} />
                    </SettingsCard>
                </div>
            </div>
        </form>
    );
};

export default AdminSettingsPage;
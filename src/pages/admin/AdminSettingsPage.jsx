// RUTA: frontend/src/pages/admin/AdminSettingsPage.jsx (VERSIÓN CON GESTIÓN DE RANGOS)

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import adminApi from '@/pages/admin/api/adminApi';
import { HiOutlineCog6Tooth, HiPlus, HiTrash } from 'react-icons/hi2';
import Loader from '@/components/common/Loader';

const SettingsCard = ({ title, description, children }) => (
    <div className="bg-dark-secondary rounded-lg border border-white/10">
        <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
        <div className="p-6 space-y-4">{children}</div>
    </div>
);

const SettingsInput = ({ name, label, type, register, step }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <input 
            type={type} 
            id={name}
            step={step}
            {...register(name, { valueAsNumber: type === 'number' })} 
            // --- ESTILO CORREGIDO GLOBALMENTE ---
            className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary"
        />
    </div>
);

const SettingsToggle = ({ name, label, register }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium text-white">{label}</label>
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id={name} {...register(name)} className="sr-only peer" />
            <div className="w-11 h-6 bg-dark-tertiary rounded-full peer peer-focus:ring-2 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
    </div>
);

const AdminSettingsPage = () => {
    const { register, handleSubmit, reset, control, watch, formState: { isSubmitting, isDirty } } = useForm({
        defaultValues: {
            profitTiers: [],
            staticWallets: []
        }
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "profitTiers"
    });
    const [isLoading, setIsLoading] = useState(true);
    const staticWallets = watch('staticWallets') || [];

    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await adminApi.get('/admin/settings');
            reset(data.data); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudo cargar la configuración.');
        } finally {
            setIsLoading(false);
        }
    }, [reset]);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const onSubmit = async (data) => {
        toast.promise(adminApi.put('/admin/settings', data), {
            loading: 'Guardando configuración...',
            success: (res) => {
                reset(res.data.data);
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
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex-grow">
                        <h1 className="text-2xl font-semibold flex items-center gap-3"><HiOutlineCog6Tooth /> Ajustes Generales</h1>
                        <p className="text-text-secondary mt-1">Modifica los parámetros globales del sistema.</p>
                    </div>
                    <button type="submit" disabled={isSubmitting || !isDirty} className="px-6 py-3 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-full md:w-auto">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <SettingsCard title="Controles Principales" description="Activa o desactiva funcionalidades críticas.">
                            <SettingsToggle name="maintenanceMode" label="Modo Mantenimiento" register={register} />
                            <SettingsInput name="maintenanceMessage" label="Mensaje de Mantenimiento" type="text" register={register} />
                            <SettingsToggle name="withdrawalsEnabled" label="Habilitar Retiros para Usuarios" register={register} />
                        </SettingsCard>

                        <SettingsCard title="Parámetros Financieros" description="Configura las reglas para los retiros de los usuarios.">
                            <SettingsInput name="minimumWithdrawal" label="Monto Mínimo de Retiro (USDT)" type="number" step="0.01" register={register} />
                            <SettingsInput name="withdrawalFeePercent" label="Comisión por Retiro (%)" type="number" step="0.1" register={register} />
                        </SettingsCard>
                    </div>

                    <div className="space-y-6">
                        <SettingsCard title="Comisiones y Bonos" description="Define las ganancias por referidos y bonificaciones.">
                            <SettingsInput name="dailyBonusAmount" label="Monto del Bono Diario (USDT)" type="number" step="0.01" register={register} />
                            <SettingsInput name="depositCommissionLevel1" label="Comisión Nivel 1 (%)" type="number" step="0.1" register={register} />
                            <SettingsInput name="depositCommissionLevel2" label="Comisión Nivel 2 (%)" type="number" step="0.1" register={register} />
                            <SettingsInput name="depositCommissionLevel3" label="Comisión Nivel 3 (%)" type="number" step="0.1" register={register} />
                        </SettingsCard>
                        
                        <SettingsCard title="Ganancias Pasivas por Saldo" description="Activa ganancias automáticas sobre el saldo disponible (balance.usdt) de los usuarios.">
                            <SettingsToggle name="isPassiveProfitEnabled" label="Habilitar Ganancias Pasivas" register={register} />
                            <div className="bg-dark-tertiary/30 p-4 rounded-md border border-white/5">
                                <p className="text-xs text-text-secondary mb-2">
                                    <strong>Nota:</strong> Las ganancias se calculan sobre el saldo disponible (USDT) según los rangos configurados abajo. Los usuarios deben mantener el saldo durante 24h.
                                </p>
                            </div>
                        </SettingsCard>
                        
                        {/* --- LÓGICA DE SWAP ELIMINADA --- */}
                    </div>
                </div>

                <div className="mt-6">
                    <SettingsCard
                        title="Billeteras Estáticas"
                        description="Configura direcciones fijas para depósitos manuales en criptomonedas soportadas."
                    >
                        <div className="space-y-5">
                            {staticWallets.length === 0 ? (
                                <p className="text-sm text-text-secondary">
                                    No hay billeteras configuradas. Guarda la configuración para inicializar los valores por defecto.
                                </p>
                            ) : (
                                staticWallets.map((wallet, index) => {
                                    const statusBadgeClasses = wallet?.isActive
                                        ? 'bg-green-500/20 text-green-300 border border-green-400/40'
                                        : 'bg-dark-tertiary text-text-secondary border border-white/10';

                                    return (
                                        <div
                                            key={wallet?.key || index}
                                            className="bg-dark-tertiary/30 border border-white/10 rounded-lg p-4 space-y-4"
                                        >
                                            <input type="hidden" {...register(`staticWallets.${index}.key`)} />
                                            <input type="hidden" {...register(`staticWallets.${index}.currency`)} />
                                            <input type="hidden" {...register(`staticWallets.${index}.chain`)} />
                                            <input type="hidden" {...register(`staticWallets.${index}.icon`)} />

                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                                        {wallet?.currency || 'Crypto'}
                                                        <span className="text-xs text-text-secondary uppercase tracking-wide">
                                                            {wallet?.chain || 'Chain no definida'}
                                                        </span>
                                                    </h3>
                                                    <p className="text-xs text-text-secondary">Identificador: {wallet?.key}</p>
                                                </div>
                                                <label className="flex items-center gap-2 text-xs text-text-secondary">
                                                    <input
                                                        type="checkbox"
                                                        {...register(`staticWallets.${index}.isActive`)}
                                                        className="w-4 h-4 text-green-500 focus:ring-green-500 rounded"
                                                    />
                                                    Activar para usuarios
                                                    <span className={`ml-2 px-2 py-1 rounded-full text-[10px] font-semibold uppercase ${statusBadgeClasses}`}>
                                                        {wallet?.isActive ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </label>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary mb-1">
                                                    Dirección de depósito
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register(`staticWallets.${index}.address`)}
                                                    placeholder="Ingresa la dirección fija (ej. 0x... o bc1...)"
                                                    className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-text-secondary mb-1">
                                                    Instrucciones para el usuario
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    {...register(`staticWallets.${index}.instructions`)}
                                                    placeholder="Ejemplo: Envía únicamente BTC a esta dirección y comparte tu comprobante con soporte."
                                                    className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm resize-y"
                                                />
                                                <p className="text-[11px] text-text-secondary mt-2">
                                                    Esta información se mostrará en la pantalla del ticket. Mantén un tono claro y directo.
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </SettingsCard>
                </div>

                {/* --- NUEVA SECCIÓN: GESTIÓN DE RANGOS DE GANANCIA --- */}
                <div className="mt-6">
                    <SettingsCard 
                        title="Rangos de Ganancia Pasiva (Profit Tiers)" 
                        description="Define los porcentajes de ganancia según el saldo disponible del usuario. El cron job diario usa estos rangos para calcular las ganancias."
                    >
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="bg-dark-tertiary/20 p-4 rounded-lg border border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-white">Rango #{index + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500 hover:text-red-400 transition-colors"
                                            title="Eliminar rango"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Saldo Mínimo (USDT)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`profitTiers.${index}.minBalance`, { 
                                                    valueAsNumber: true,
                                                    required: true,
                                                    min: 0
                                                })}
                                                className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Saldo Máximo (USDT)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`profitTiers.${index}.maxBalance`, { 
                                                    valueAsNumber: true,
                                                    required: true,
                                                    min: 0
                                                })}
                                                className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                                placeholder="100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                                Ganancia Diaria (%)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register(`profitTiers.${index}.profitPercentage`, { 
                                                    valueAsNumber: true,
                                                    required: true,
                                                    min: 0,
                                                    max: 100
                                                })}
                                                className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                                placeholder="1.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => append({ minBalance: 0, maxBalance: 100, profitPercentage: 1 })}
                                className="w-full py-3 px-4 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <HiPlus className="w-5 h-5" />
                                Agregar Nuevo Rango
                            </button>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-xs text-blue-300">
                                    <strong>💡 Ejemplo:</strong> Si configuras un rango de 10-30 USDT con 10% de ganancia, 
                                    un usuario con 20 USDT recibirá 2 USDT cada 24h en su saldo retirable.
                                </p>
                            </div>
                        </div>
                    </SettingsCard>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;
// RUTA: frontend/src/pages/admin/AdminSettingsPage.jsx (Tabs + Wheel Config)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import adminApi from '@/pages/admin/api/adminApi';
import { HiOutlineCog6Tooth, HiPlus, HiTrash, HiArrowPath } from 'react-icons/hi2';
import Loader from '@/components/common/Loader';

const SETTINGS_TABS = [
    { id: 'general', label: 'General', description: 'Activa o desactiva funcionalidades clave del sistema.' },
    { id: 'financial', label: 'Finanzas', description: 'Ajusta parámetros de retiros, comisiones y bonos.' },
    { id: 'passive', label: 'Ganancias pasivas', description: 'Controla el programa de ganancias automáticas y sus rangos.' },
    { id: 'wallets', label: 'Billeteras', description: 'Gestiona las direcciones estáticas disponibles para los usuarios.' },
    { id: 'roulette', label: 'Ruleta', description: 'Configura los premios, probabilidades y sistema de piedad de la ruleta.' },
];

const WHEEL_TYPES = [
    { value: 'usdt', label: 'USDT' },
    { value: 'spins', label: 'Giros extra' },
    { value: 'none', label: 'Sin premio' },
];

const ensureEightSegments = (segments = []) => {
    const allowedTypes = new Set(['usdt', 'spins', 'none']);
    const sanitized = segments.map((segment) => ({
        _id: segment?._id?.toString?.() || segment?.segmentId?.toString?.() || '',
        segmentId: segment?.segmentId?.toString?.() || '',
        type: allowedTypes.has(segment?.type) ? segment.type : 'none',
    value: typeof segment?.value === 'number' ? segment.value : Number(segment?.value || 0),
        text: segment?.text || '',
        imageUrl: segment?.imageUrl || '',
        weight: typeof segment?.weight === 'number' ? segment.weight : Number(segment?.weight || 1),
        isRare: Boolean(segment?.isRare),
        isActive: segment?.isActive === undefined ? true : Boolean(segment.isActive),
    }));

    while (sanitized.length < 8) {
        sanitized.push({
            _id: '',
            segmentId: '',
            type: 'none',
            value: 0,
            text: 'Sin premio',
            imageUrl: '',
            weight: 1,
            isRare: false,
            isActive: false,
        });
    }

    return sanitized.slice(0, 8);
};

const normalizeWheelConfig = (config) => ({
    pitySystemThreshold: typeof config?.pitySystemThreshold === 'number' ? config.pitySystemThreshold : 100,
    pitySystemGuaranteedPrizeSegmentId: config?.pitySystemGuaranteedPrizeSegmentId?.toString?.() || '',
    segments: ensureEightSegments(config?.segments || []),
});

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
    const [activeTab, setActiveTab] = useState(SETTINGS_TABS[0].id);
    const [isLoading, setIsLoading] = useState(true);
    const [isWheelLoading, setIsWheelLoading] = useState(false);
    const [wheelLoadedOnce, setWheelLoadedOnce] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        formState: { isSubmitting, isDirty }
    } = useForm({
        defaultValues: {
            profitTiers: [],
            staticWallets: [],
        },
        shouldUnregister: false,
    });

    const { fields, append, remove } = useFieldArray({ control, name: 'profitTiers' });
    const staticWallets = watch('staticWallets') || [];

    const {
        register: registerWheel,
        handleSubmit: handleSubmitWheel,
        reset: resetWheel,
        watch: watchWheel,
        formState: { isSubmitting: isWheelSubmitting, isDirty: isWheelDirty }
    } = useForm({
        defaultValues: normalizeWheelConfig(),
        shouldUnregister: false,
    });

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

    const loadWheelConfig = useCallback(async () => {
        setIsWheelLoading(true);
        try {
            const { data } = await adminApi.get('/admin/wheel-config');
            const normalized = normalizeWheelConfig(data?.data);
            resetWheel(normalized);
            setWheelLoadedOnce(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudo cargar la ruleta.');
        } finally {
            setIsWheelLoading(false);
        }
    }, [resetWheel]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        if (activeTab === 'roulette' && !wheelLoadedOnce && !isWheelLoading) {
            loadWheelConfig();
        }
    }, [activeTab, wheelLoadedOnce, isWheelLoading, loadWheelConfig]);

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

    const onSubmitWheel = async (formValues) => {
        const sanitizedSegments = ensureEightSegments(formValues.segments).map((segment) => {
            const numericValue = Number.isFinite(segment.value) ? segment.value : 0;
            const payload = {
                type: segment.type,
                value: segment.type === 'none' ? 0 : numericValue,
                text: segment.text?.trim() || '',
                imageUrl: segment.imageUrl?.trim() || '',
                weight: Number.isFinite(segment.weight) ? segment.weight : 1,
                isRare: Boolean(segment.isRare),
                isActive: Boolean(segment.isActive),
            };

            if (segment._id) {
                payload._id = segment._id;
            }

            if (segment.segmentId) {
                payload.segmentId = segment.segmentId;
            }

            return payload;
        });

        const activeSegments = sanitizedSegments.filter((segment) => segment.isActive);
        if (activeSegments.length === 0) {
            toast.error('Activa al menos un segmento antes de guardar la ruleta.');
            return;
        }

        const hasInvalidActive = activeSegments.some((segment) => {
            const valueInvalid = segment.type === 'none' ? segment.value < 0 : segment.value <= 0;
            return !segment.text || valueInvalid || segment.weight <= 0;
        });
        if (hasInvalidActive) {
            toast.error('Revisa los segmentos activos: los premios deben tener texto, pesos positivos y, si entregan USDT o giros, un valor mayor a cero.');
            return;
        }

        const payload = {
            pitySystemThreshold: Number(formValues.pitySystemThreshold) || 1,
            pitySystemGuaranteedPrizeSegmentId: formValues.pitySystemGuaranteedPrizeSegmentId || null,
            segments: sanitizedSegments.slice(0, 8),
        };

        if (payload.pitySystemThreshold < 1) {
            toast.error('El umbral del sistema de piedad debe ser mayor o igual a 1.');
            return;
        }

        toast.promise(adminApi.put('/admin/wheel-config', payload), {
            loading: 'Guardando ruleta...',
            success: (res) => {
                const normalized = normalizeWheelConfig(res?.data?.data);
                resetWheel(normalized);
                return 'Ruleta actualizada correctamente.';
            },
            error: (err) => err.response?.data?.message || 'Error al guardar la ruleta.',
        });
    };

    const wheelSegments = watchWheel('segments') || [];

    const guaranteedPrizeOptions = useMemo(() => {
        return wheelSegments
            .filter((segment) => Boolean(segment._id) && Boolean(segment.isActive))
            .map((segment, index) => ({
                value: segment._id,
                label: `${index + 1}. ${segment.text || 'Premio sin título'}`,
            }));
    }, [wheelSegments]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader text="Cargando ajustes..." /></div>;
    }

    const activeTabMeta = SETTINGS_TABS.find((tab) => tab.id === activeTab) || SETTINGS_TABS[0];
    const isWheelTab = activeTab === 'roulette';

    return (
        <div className="space-y-6">
            <header className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex-1">
                        <h1 className="text-2xl font-semibold flex items-center gap-3">
                            <HiOutlineCog6Tooth /> Ajustes de la plataforma
                        </h1>
                        <p className="text-text-secondary mt-1">{activeTabMeta.description}</p>
                    </div>
                    {isWheelTab ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={loadWheelConfig}
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-white/10 bg-dark-secondary text-sm font-semibold hover:bg-dark-secondary/80 transition-colors"
                                disabled={isWheelLoading}
                            >
                                <HiArrowPath className="w-4 h-4" />
                                {isWheelLoading ? 'Actualizando...' : 'Recargar datos'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitWheel(onSubmitWheel)}
                                disabled={isWheelSubmitting || (!isWheelDirty && !wheelLoadedOnce)}
                                className="px-6 py-3 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                {isWheelSubmitting ? 'Guardando...' : 'Guardar ruleta'}
                            </button>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            form="generalSettingsForm"
                            disabled={isSubmitting || !isDirty}
                            className="px-6 py-3 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors w-full md:w-auto"
                        >
                            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    )}
                </div>

                <nav className="flex flex-wrap items-center gap-2">
                    {SETTINGS_TABS.map((tab) => {
                        const isActive = tab.id === activeTab;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors border ${
                                    isActive
                                        ? 'bg-white text-black border-white'
                                        : 'bg-dark-secondary border-white/10 text-text-secondary hover:border-white/40'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </header>

            {!isWheelTab && (
                <form id="generalSettingsForm" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SettingsCard title="Controles principales" description="Activa o desactiva funcionalidades críticas.">
                                <SettingsToggle name="maintenanceMode" label="Modo mantenimiento" register={register} />
                                <SettingsInput name="maintenanceMessage" label="Mensaje de mantenimiento" type="text" register={register} />
                                <SettingsToggle name="withdrawalsEnabled" label="Habilitar retiros para usuarios" register={register} />
                            </SettingsCard>
                            <SettingsCard title="Estado de plataforma" description="Mensajes informativos que verán los usuarios cuando el servicio esté limitado.">
                                <div className="bg-dark-tertiary/30 p-4 rounded-md border border-white/5 text-xs text-text-secondary space-y-2">
                                    <p>
                                        Usa el modo mantenimiento cuando necesites bloquear el acceso temporal. El mensaje se mostrará en el login y en el bot.
                                    </p>
                                    <p>
                                        Los retiros pueden pausarse sin afectar otras funcionalidades.
                                    </p>
                                </div>
                            </SettingsCard>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SettingsCard title="Parámetros de retiro" description="Define los límites y comisiones aplicados a cada retiro.">
                                <SettingsInput name="minimumWithdrawal" label="Monto mínimo de retiro (USDT)" type="number" step="0.01" register={register} />
                                <SettingsInput name="withdrawalFeePercent" label="Comisión por retiro (%)" type="number" step="0.1" register={register} />
                            </SettingsCard>
                            <SettingsCard title="Comisiones y bonos" description="Define los porcentajes de comisión para referidos y el bono diario.">
                                <SettingsInput name="dailyBonusAmount" label="Bono diario (USDT)" type="number" step="0.01" register={register} />
                                <SettingsInput name="depositCommissionLevel1" label="Comisión nivel 1 (%)" type="number" step="0.1" register={register} />
                                <SettingsInput name="depositCommissionLevel2" label="Comisión nivel 2 (%)" type="number" step="0.1" register={register} />
                                <SettingsInput name="depositCommissionLevel3" label="Comisión nivel 3 (%)" type="number" step="0.1" register={register} />
                            </SettingsCard>
                        </div>
                    )}

                    {activeTab === 'passive' && (
                        <div className="space-y-6">
                            <SettingsCard title="Ganancias pasivas" description="Controla el programa de recompensas automáticas sobre el saldo disponible.">
                                <SettingsToggle name="isPassiveProfitEnabled" label="Habilitar ganancias pasivas" register={register} />
                                <div className="bg-dark-tertiary/30 p-4 rounded-md border border-white/5 text-xs text-text-secondary space-y-2">
                                    <p>
                                        El proceso diario leerá estos valores para acreditar ganancias en el saldo retirable de cada usuario.
                                    </p>
                                    <p>
                                        Usa los rangos para escalar el porcentaje según el balance disponible.
                                    </p>
                                </div>
                            </SettingsCard>

                            <SettingsCard
                                title="Rangos de ganancia pasiva"
                                description="Define los porcentajes de ganancia según el saldo disponible del usuario."
                            >
                                <div className="space-y-4">
                                    {fields.length === 0 && (
                                        <p className="text-sm text-text-secondary">No hay rangos cargados. Agrega al menos un rango para activar el programa.</p>
                                    )}
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="bg-dark-tertiary/20 p-4 rounded-lg border border-white/10 space-y-4">
                                            <div className="flex items-center justify-between">
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
                                                    <label className="block text-xs font-medium text-text-secondary mb-1">Saldo mínimo (USDT)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        {...register(`profitTiers.${index}.minBalance`, {
                                                            valueAsNumber: true,
                                                            required: true,
                                                            min: 0,
                                                        })}
                                                        className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-text-secondary mb-1">Saldo máximo (USDT)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        {...register(`profitTiers.${index}.maxBalance`, {
                                                            valueAsNumber: true,
                                                            required: true,
                                                            min: 0,
                                                        })}
                                                        className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                                        placeholder="100"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-text-secondary mb-1">Ganancia diaria (%)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        {...register(`profitTiers.${index}.profitPercentage`, {
                                                            valueAsNumber: true,
                                                            required: true,
                                                            min: 0,
                                                            max: 100,
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
                                        Agregar nuevo rango
                                    </button>

                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                        <p className="text-xs text-blue-300">
                                            Un saldo de 20 USDT con un rango configurado al 10% recibirá 2 USDT diarios.
                                        </p>
                                    </div>
                                </div>
                            </SettingsCard>
                        </div>
                    )}

                    {activeTab === 'wallets' && (
                        <SettingsCard
                            title="Billeteras estáticas"
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
                                                                {wallet?.chain || 'Cadena no definida'}
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
                                                        Esta información se mostrará en la pantalla del ticket. Mantén un mensaje claro y directo.
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </SettingsCard>
                    )}
                </form>
            )}

            {isWheelTab && (
                <section className="space-y-6">
                    {isWheelLoading && (
                        <div className="flex justify-center items-center"><Loader text="Sincronizando configuración de ruleta..." /></div>
                    )}

                    <SettingsCard
                        title="Parámetros generales"
                        description="Controla el sistema de piedad y documenta cómo funciona el peso de cada premio."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Umbral sistema de piedad</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    {...registerWheel('pitySystemThreshold', { valueAsNumber: true })}
                                    className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                />
                                <p className="text-[11px] text-text-secondary mt-2">Número de giros sin premio raro antes de forzar el premio seleccionado abajo.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Premio garantizado</label>
                                <select
                                    {...registerWheel('pitySystemGuaranteedPrizeSegmentId')}
                                    className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                >
                                    <option value="">Sin premio garantizado</option>
                                    {guaranteedPrizeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-text-secondary mt-2">
                                    Solo aparecen segmentos activos guardados previamente. Guarda la ruleta para que nuevos premios estén disponibles aquí.
                                </p>
                            </div>
                            <div className="bg-dark-tertiary/40 border border-white/10 rounded-lg p-3 text-xs text-text-secondary space-y-2">
                                <p className="font-semibold text-white">¿Qué es el peso?</p>
                                <p>
                                    El peso es la probabilidad relativa de cada premio. Si tienes dos premios con peso 1 y otro con peso 3, el último será tres veces más probable.
                                </p>
                                <p className="text-[11px]">
                                    Usa valores mayores para premios comunes y valores pequeños para premios raros.
                                </p>
                            </div>
                        </div>
                    </SettingsCard>

                    <SettingsCard
                        title="Segmentos de la ruleta"
                        description="Debes mantener 8 segmentos configurados. Los pesos determinan la probabilidad relativa de cada premio."
                    >
                        <div className="grid gap-4">
                            {wheelSegments.map((segment, index) => (
                                <div key={segment._id || segment.segmentId || index} className="rounded-lg border border-white/10 bg-dark-tertiary/30 p-4 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-sm font-semibold text-white">Segmento #{index + 1}</h3>
                                            <p className="text-xs text-text-secondary">Identificador: {segment._id || 'nuevo'}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" {...registerWheel(`segments.${index}.isActive`)} className="w-4 h-4" />
                                                Segmento activo
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" {...registerWheel(`segments.${index}.isRare`)} className="w-4 h-4" />
                                                Premio raro
                                            </label>
                                        </div>
                                    </div>

                                    <input type="hidden" {...registerWheel(`segments.${index}._id`)} />
                                    <input type="hidden" {...registerWheel(`segments.${index}.segmentId`)} />

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Tipo de premio</label>
                                            <select
                                                {...registerWheel(`segments.${index}.type`)}
                                                className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                            >
                                                {WHEEL_TYPES.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Valor</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                {...registerWheel(`segments.${index}.value`, { valueAsNumber: true })}
                                                className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Peso</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                {...registerWheel(`segments.${index}.weight`, { valueAsNumber: true })}
                                                className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Imagen (URL)</label>
                                            <input
                                                type="text"
                                                {...registerWheel(`segments.${index}.imageUrl`)}
                                                placeholder="https://..."
                                                className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1">Texto visible en la ruleta</label>
                                        <input
                                            type="text"
                                            {...registerWheel(`segments.${index}.text`)}
                                            placeholder="Ej. $5.00 o +1 Giro"
                                            className="w-full bg-white text-black p-2 rounded-md border border-dark-tertiary text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SettingsCard>
                </section>
            )}
        </div>
    );
};

export default AdminSettingsPage;
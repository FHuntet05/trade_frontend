// RUTA: frontend/src/pages/HomePage.jsx (VERSIÓN "NEXUS - DEFENSIVE FIX FINAL")

import React from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next';

// --- IMPORTS COMPLETOS DE COMPONENTES DE UI ---
import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import NotificationFeed from '../components/home/NotificationFeed';
import { useMiningLogic } from '../hooks/useMiningLogic';
import Loader from '../components/common/Loader'; // Importamos el Loader

const HomePage = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useUserStore();

    // [NEXUS DEFENSIVE FIX] - Guardia principal. Si el objeto 'user' aún no está cargado,
    // mostramos un loader para prevenir cualquier error de lectura de propiedades.
    if (!user) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader text="Cargando datos de usuario..." />
            </div>
        );
    }
    
    // [NEXUS DEFENSIVE FIX] - CORRECCIÓN CRÍTICA
    // Proporcionamos valores por defecto seguros para TODAS las propiedades que usa el hook.
    // Si `user.lastMiningClaim` es undefined, usamos `new Date()` como un fallback seguro.
    const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(
        user.lastMiningClaim || new Date(),
        user.effectiveMiningRate ?? 0,
        user.miningStatus ?? 'IDLE'
    );

    const handleStartMining = async () => {
        const toastId = 'mining_control';
        toast.loading(t('homePage.toasts.startingCycle', 'Iniciando ciclo...'), { id: toastId });
        try {
            const response = await api.post('/wallet/start-mining');
            // La actualización del estado ahora debe ser más robusta, fusionando los nuevos datos.
            updateUser({ ...user, ...response.data.user });
            toast.success(t('homePage.toasts.cycleStarted', '¡Ciclo de minado iniciado!'), { id: toastId });
        } catch (error) { 
            toast.error(error.response?.data?.message || t('common.error', 'Error'), { id: toastId }); 
        }
    };

    const handleClaim = async () => {
        const toastId = 'mining_control';
        toast.loading(t('homePage.toasts.claiming', 'Reclamando...'), { id: toastId });
        try {
            const response = await api.post('/wallet/claim');
            updateUser({ ...user, ...response.data.user });
            toast.success(response.data.message, { id: toastId });
        } catch (error) { 
            toast.error(error.response?.data?.message || t('common.error', 'Error'), { id: toastId }); 
        }
    };

    const renderControlButton = () => {
        switch (buttonState) {
            case 'SHOW_START': return <button onClick={handleStartMining} className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">{t('homePage.buttons.start', 'INICIAR')}</button>;
            case 'SHOW_CLAIM': return <button onClick={handleClaim} className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">{t('homePage.buttons.claim', 'RECLAMAR')}</button>;
            default: return null; 
        }
    };
    
    return (
        <div className="flex flex-col h-full animate-fade-in gap-4 overflow-y-auto pb-24">
            <div className="px-4 pt-4 space-y-4">
                <UserInfoHeader />
                <RealTimeClock />
            </div>
            <div className="flex flex-col items-center justify-center text-center px-4">
                <video src="/assets/mining-animation.webm" autoPlay loop muted playsInline className="w-48 h-48 mx-auto" />
                <AnimatedCounter value={parseFloat(accumulatedNtx.toFixed(2))} />
                <div className="w-full max-w-xs mx-auto mt-4 space-y-3">
                    <div className="w-full bg-dark-secondary rounded-full h-6 shadow-inner overflow-hidden">
                        <div className="bg-gradient-to-r from-accent-start to-accent-end h-6 rounded-full transition-all duration-1000" style={{width: `${progress}%`}} />
                    </div>
                    <p className="text-text-secondary text-base font-mono">{countdown}</p>
                </div>
            </div>
            <div className="flex-grow flex flex-col px-4 space-y-4">
                <div className="w-full h-16 flex items-center justify-center">{renderControlButton()}</div>
                <TaskCenter />
                <NotificationFeed />
            </div>
        </div>
    );
};

export default HomePage;
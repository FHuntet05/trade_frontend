// frontend/pages/HomePage.jsx (VERSIÓN RESTAURACIÓN TOTAL v33.1 - i18n)

import React from 'react';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import api from '../api/axiosConfig';
import { useTranslation } from 'react-i18next'; // i18n

// --- IMPORTS COMPLETOS DE COMPONENTES DE UI ---
import UserInfoHeader from '../components/home/UserInfoHeader';
import RealTimeClock from '../components/home/RealTimeClock';
import AnimatedCounter from '../components/home/AnimatedCounter';
import TaskCenter from '../components/home/TaskCenter';
import NotificationFeed from '../components/home/NotificationFeed';
import { useMiningLogic } from '../hooks/useMiningLogic';
import AuthErrorScreen from '../components/AuthErrorScreen';

const HomePage = () => {
    const { t } = useTranslation(); // i18n
    const { user, updateUser } = useUserStore();

    if (!user) {
        return <AuthErrorScreen message={t('homePage.errors.noUser')} />; // i18n
    }
    
    const { accumulatedNtx, countdown, progress, buttonState } = useMiningLogic(
        user.lastMiningClaim,
        user.effectiveMiningRate ?? 0,
        user.miningStatus ?? 'IDLE'
    );

    const handleStartMining = async () => {
        toast.loading(t('homePage.toasts.startingCycle'), { id: 'mining_control' }); // i18n
        try {
            const response = await api.post('/wallet/start-mining');
            updateUser(response.data.user);
            toast.success(t('homePage.toasts.cycleStarted'), { id: 'mining_control' }); // i18n
        } catch (error) { toast.error(error.response?.data?.message || t('common.error'), { id: 'mining_control' }); } // i18n
    };
    const handleClaim = async () => {
        toast.loading(t('homePage.toasts.claiming'), { id: 'mining_control' }); // i18n
        try {
            const response = await api.post('/wallet/claim');
            updateUser(response.data.user);
            toast.success(response.data.message, { id: 'mining_control' });
        } catch (error) { toast.error(error.response?.data?.message || t('common.error'), { id: 'mining_control' }); } // i18n
    };
    const renderControlButton = () => {
        switch (buttonState) {
            case 'SHOW_START': return <button onClick={handleStartMining} className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">{t('homePage.buttons.start')}</button>; // i18n
            case 'SHOW_CLAIM': return <button onClick={handleClaim} className="w-full py-4 bg-gradient-to-r from-accent-start to-accent-end text-white text-lg font-bold rounded-full shadow-glow transform active:scale-95 transition-all">{t('homePage.buttons.claim')}</button>; // i18n
            default: return null; 
        }
    };
    const shouldShowButton = buttonState === 'SHOW_START' || buttonState === 'SHOW_CLAIM';
    
    return (
        <div className="flex flex-col h-full animate-fade-in gap-4 overflow-y-auto pb-4">
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
                <div className={!shouldShowButton ? 'flex-grow' : ''}><TaskCenter /></div>
                <NotificationFeed />
            </div>
        </div>
    );
};

export default HomePage;
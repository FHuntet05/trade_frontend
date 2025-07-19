// frontend/pages/HomePage.jsx (VERSIÓN TRASPLANTE DEFINITIVA v25.0)
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useUserStore from '../store/userStore';

// Componentes de nuestra aplicación
import UserInfoHeader from '../components/home/UserInfoHeader';
import MiningStats from '../components/home/MiningStats';
import MainActions from '../components/home/MainActions';
import ClaimButton from '../components/home/ClaimButton';
import Loader from '../components/common/Loader';
import AuthErrorScreen from '../components/AuthErrorScreen';
import MaintenanceScreen from '../components/MaintenanceScreen';

const HomePage = () => {
    // Obtenemos los estados y acciones de nuestro userStore
    const { 
        user, 
        isAuthenticated, 
        isLoadingAuth, 
        settings,
        syncUserWithBackend, 
        logout 
    } = useUserStore();

    const location = useLocation();
    // Usamos una referencia para asegurarnos de que la lógica de sincronización se ejecute solo una vez.
    const hasSynced = useRef(false);

    // ======================= INICIO DEL TRASPLANTE DE LÓGICA DE AUTENTICACIÓN =======================
    useEffect(() => {
        // Si ya hemos sincronizado o estamos en proceso, no hacemos nada.
        if (hasSynced.current || isLoadingAuth) {
            return;
        }
        hasSynced.current = true; // Marcamos que el intento de sincronización ha comenzado.

        const tg = window.Telegram?.WebApp;

        if (tg && tg.initData) {
            tg.ready();
            tg.expand();

            const searchParams = new URLSearchParams(location.search);
            const refCode = searchParams.get('refCode'); // Leemos el refCode que nos pasó el RootRedirector

            console.log(`[HomePage] Iniciando sincronización. RefCode de URL: ${refCode}`);
            
            // Llamamos a la acción del store que se encarga de la comunicación con el backend.
            syncUserWithBackend(tg.initDataUnsafe.user, refCode);
        } else {
            console.error("Entorno de Telegram no detectado en HomePage.");
            logout(); // Si no estamos en Telegram, deslogueamos.
        }
    }, [location.search, syncUserWithBackend, logout, isLoadingAuth]); // Dependencias del efecto.
    // ======================== FIN DEL TRASPLANTE DE LÓGICA DE AUTENTICACIÓN =========================

    // --- RENDERIZADO CONDICIONAL BASADO EN EL ESTADO DE AUTENTICACIÓN ---

    // 1. Estado de Carga: Mientras el store está autenticando.
    if (isLoadingAuth) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader text="Conectando..." />
            </div>
        );
    }

    // 2. Estado de Error de Autenticación: Si el store falló y no estamos autenticados.
    if (!isAuthenticated) {
        return <AuthErrorScreen message="No se pudo conectar. Por favor, reinicia la Mini App." />;
    }

    // 3. Estado de Mantenimiento (Verificado después de la autenticación).
    if (settings?.maintenanceMode) {
        return <MaintenanceScreen message={settings.maintenanceMessage} />;
    }

    // 4. Estado de Éxito: Si todo ha ido bien, mostramos el contenido principal de la página.
    return (
        <div className="flex flex-col h-full overflow-y-auto pb-24 p-4 space-y-6">
            <UserInfoHeader />
            <MiningStats />
            <MainActions />
            <ClaimButton />
        </div>
    );
};

export default HomePage;
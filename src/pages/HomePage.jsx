// frontend/pages/HomePage.jsx (VERSIÓN DE DIAGNÓSTICO "CORTOCIRCUITO" v25.3)
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import useUserStore from '../store/userStore';
import Loader from '../components/common/Loader';
import UserInfoHeader from '../components/home/UserInfoHeader'; // Lo usamos para ver el resultado

const HomePage = () => {
    // Obtenemos los estados y acciones de nuestro userStore
    const { 
        user, 
        isAuthenticated, 
        isLoadingAuth, 
        syncUserWithBackend, 
        logout 
    } = useUserStore();

    const location = useLocation();
    const hasSynced = useRef(false);

    useEffect(() => {
        if (hasSynced.current) return;
        hasSynced.current = true;

        const tg = window.Telegram?.WebApp;

        if (tg && tg.initData) {
            tg.ready();
            const searchParams = new URLSearchParams(location.search);
            const refCode = searchParams.get('refCode');
            
            console.log(`[Cortocircuito] Iniciando sincronización. RefCode: ${refCode}`);
            syncUserWithBackend(tg.initDataUnsafe.user, refCode);
        } else {
            console.error("[Cortocircuito] Entorno de Telegram no detectado.");
            logout();
        }
    }, [location.search, syncUserWithBackend, logout]);

    // --- RENDERIZADO DE DIAGNÓSTICO ---

    if (isLoadingAuth) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <Loader text="Conectando (Prueba de Cortocircuito)..." />
                <p className="text-sm text-text-secondary mt-4">Aislado el flujo de autenticación.</p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <h1 className="text-2xl font-bold text-red-500">FALLO EN LA AUTENTICACIÓN</h1>
                <p className="text-text-secondary mt-2">El flujo de autenticación falló. Revise los logs del backend.</p>
            </div>
        );
    }

    // Si llegamos aquí, la autenticación y el flujo de referidos han funcionado.
    return (
        <div className="flex flex-col h-full p-4 space-y-4">
            <h1 className="text-2xl font-bold text-green-400 text-center">¡ÉXITO!</h1>
            <p className="text-center text-text-secondary">La autenticación y el flujo de referidos se completaron correctamente.</p>
            <p className="text-center text-text-secondary">El error está en los componentes de la página de inicio (ej. useMiningLogic).</p>
            
            <UserInfoHeader />

            <div className="bg-dark-secondary p-4 rounded-lg">
                <h3 className="font-bold mb-2">Datos del Usuario (Desde el Store):</h3>
                <pre className="text-xs bg-black p-2 rounded overflow-auto">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default HomePage;
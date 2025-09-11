// RUTA: admin-frontend/src/layout/AdminLayout.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Layout responsive del Modelo, integrando Sidebar, Header y Drawer móvil.

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminHeaderMobile from '../components/AdminHeaderMobile';
import MobileDrawer from '../components/MobileDrawer';
import useAdminStore from '../store/adminStore'; // Asumiendo que el store se comparte/copia.

// --- Helper para obtener el título de la página actual ---
const getPageTitle = (pathname) => {
    const routeName = pathname.split('/').pop();
    if (!routeName || routeName === 'admin') return 'Dashboard';
    // Capitaliza la primera letra y reemplaza guiones
    return routeName.charAt(0).toUpperCase() + routeName.slice(1).replace('-', ' ');
};


const AdminLayout = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { admin, logout } = useAdminStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    // Obtenemos el título de la página actual para mostrarlo en el header móvil
    const currentPageTitle = getPageTitle(location.pathname);

    return (
        // Contenedor principal que ocupa toda la pantalla.
        <div className="flex min-h-screen bg-dark-primary text-white font-sans">
            
            {/* --- DRAWER PARA VISTA MÓVIL --- */}
            {/* Este componente solo se renderiza en el DOM, no es visible hasta que isOpen es true. */}
            <MobileDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />

            {/* --- SIDEBAR PARA VISTA DE ESCRITORIO --- */}
            {/* Oculto en pantallas pequeñas (hidden), visible a partir de 'md' (md:flex). */}
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar />
            </div>

            {/* --- CONTENEDOR PRINCIPAL DERECHO (HEADER Y CONTENIDO) --- */}
            <div className="flex-grow flex flex-col w-full md:w-0">

                {/* --- HEADER SUPERIOR (SOLO ESCRITORIO) --- */}
                {/* Oculto en pantallas pequeñas, visible a partir de 'md'. */}
                <header className="hidden md:flex bg-dark-secondary p-4 justify-end items-center border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <span className="text-text-secondary">
                            Bienvenido, <strong className="text-white">{admin?.username || 'Admin'}</strong>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-bold text-red-400 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                {/* --- HEADER MÓVIL (SOLO MÓVIL) --- */}
                {/* Visible solo en pantallas pequeñas (bloque), oculto a partir de 'md'. */}
                <AdminHeaderMobile 
                    title={currentPageTitle}
                    onMenuClick={() => setIsDrawerOpen(true)} 
                />
                
                {/* --- CONTENIDO PRINCIPAL DE LA PÁGINA --- */}
                {/* El Outlet de react-router-dom renderizará aquí el componente de la ruta activa. */}
                <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
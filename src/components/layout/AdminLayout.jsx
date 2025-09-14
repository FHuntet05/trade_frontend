// RUTA: frontend/src/components/layout/AdminLayout.jsx (VERSIÓN FINAL CON RUTAS DEFINITIVAS)

import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// [SOLUCIÓN DEFINITIVA] - Rutas absolutas con alias, basadas en la estructura de archivos real.
import Sidebar from '@/pages/admin/components/Sidebar';
import AdminHeaderMobile from '@/pages/admin/components/AdminHeaderMobile';
import MobileDrawer from '@/pages/admin/components/MobileDrawer';
import useAdminStore from '@/store/adminStore';

const getPageTitle = (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    const routeName = segments[segments.length - 1];
    
    if (!routeName || routeName === 'admin' || routeName === 'dashboard') return 'Dashboard';
    
    return routeName.charAt(0).toUpperCase() + routeName.slice(1).replace(/-/g, ' ');
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

    const currentPageTitle = getPageTitle(location.pathname);

    return (
        <div className="flex min-h-screen bg-dark-primary text-white font-sans">
            
            <MobileDrawer isOpen={isDrawerOpen} setIsOpen={setIsOpen} />

            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar />
            </div>

            <div className="flex-grow flex flex-col w-full md:w-0">

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

                <AdminHeaderMobile 
                    title={currentPageTitle}
                    onMenuClick={() => setIsDrawerOpen(true)} 
                />
                
                <main className="flex-grow p-4 md:p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
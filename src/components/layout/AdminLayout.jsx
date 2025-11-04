// RUTA: frontend/src/components/layout/AdminLayout.jsx
// --- VERSIÓN COMPLETA Y CORREGIDA ---
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
        // --- CORRECCIÓN DE ESTILO ---
        // Se asegura que el contenedor principal tenga el fondo oscuro primario
        <div className="flex min-h-screen bg-dark-primary text-white font-sans admin-container">
            <MobileDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
            
            {/* El sidebar ahora heredará el fondo del div padre si el suyo es transparente,
                pero ya lo forzamos a ser sólido en su propio componente. Esta es una doble seguridad. */}
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar onLinkClick={() => {}} />
            </div>
            
            <div className="flex-grow flex flex-col w-full md:w-0">
                <header className="hidden md:flex bg-dark-secondary p-4 justify-end items-center border-b border-dark-tertiary">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">
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
            <style jsx global>{`
                /* Estilos globales para inputs en el panel de administración */
                .admin-container input[type="text"],
                .admin-container input[type="number"],
                .admin-container input[type="email"],
                .admin-container input[type="password"],
                .admin-container input[type="search"],
                .admin-container input[type="url"],
                .admin-container textarea,
                .admin-container select {
                    background-color: white !important;
                    color: #1f2937 !important;
                }
                
                .admin-container input[type="text"]::placeholder,
                .admin-container input[type="number"]::placeholder,
                .admin-container input[type="email"]::placeholder,
                .admin-container input[type="password"]::placeholder,
                .admin-container input[type="search"]::placeholder,
                .admin-container input[type="url"]::placeholder,
                .admin-container textarea::placeholder {
                    color: #9ca3af !important;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
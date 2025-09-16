// RUTA: frontend/src/components/layout/AdminLayout.jsx (VERSIÓN "NEXUS - DIAGNOSTIC")
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/pages/admin/components/Sidebar';
import AdminHeaderMobile from '@/pages/admin/components/AdminHeaderMobile';
import MobileDrawer from '@/pages/admin/components/MobileDrawer';
import useAdminStore from '@/store/adminStore';

// [NEXUS DIAGNOSTIC] - NUEVO COMPONENTE DE DEPURACIÓN
const AdminDebugPanel = () => {
  const { admin, _hasHydrated } = useAdminStore();
  const superAdminId = import.meta.env.VITE_SUPER_ADMIN_TELEGRAM_ID;

  if (!_hasHydrated) {
    return null; // No mostrar nada hasta que el estado esté cargado
  }

  const isAdminObjectValid = admin && typeof admin === 'object';
  const telegramIdFromStore = isAdminObjectValid ? String(admin.telegramId).trim() : 'N/A';
  const superAdminIdFromEnv = String(superAdminId).trim();
  const isSuperAdminCheck = telegramIdFromStore === superAdminIdFromEnv;

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      left: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #444',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: 'calc(100% - 20px)'
    }}>
      <h4 style={{ margin: 0, paddingBottom: '10px', borderBottom: '1px solid #555', color: '#00FF00' }}>[PANEL DE DIAGNÓSTICO DE SESIÓN]</h4>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: '10px 0 0 0' }}>
        <strong>Objeto 'admin' en Store:</strong><br/>
        {JSON.stringify(admin, null, 2)}
      </pre>
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #555' }}>
        <p><strong>- ID de Telegram (Store):</strong> <span style={{ color: '#FFD700' }}>{telegramIdFromStore}</span> (Tipo: {typeof admin?.telegramId})</p>
        <p><strong>- ID Super Admin (.env):</strong> <span style={{ color: '#FFD700' }}>{superAdminIdFromEnv}</span> (Tipo: {typeof superAdminId})</p>
        <p><strong>- ¿Coinciden?:</strong> <span style={{ color: isSuperAdminCheck ? '#00FF00' : '#FF4136', fontWeight: 'bold' }}>{isSuperAdminCheck ? 'SÍ' : 'NO'}</span></p>
      </div>
    </div>
  );
};


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
    const closeDrawer = () => setIsDrawerOpen(false);

    return (
        <div className="flex min-h-screen bg-dark-primary text-white font-sans">
            <MobileDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
            <div className="hidden md:flex md:flex-shrink-0">
                <Sidebar onLinkClick={() => {}} />
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
            
            {/* [NEXUS DIAGNOSTIC] Se renderiza el panel de depuración. */}
            <AdminDebugPanel />
        </div>
    );
};

export default AdminLayout;
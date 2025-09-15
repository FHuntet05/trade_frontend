// RUTA: frontend/src/components/layout/AdminProtectedRoute.jsx (VERSIÓN "NEXUS - HYDRATION AWARE")
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import Loader from '../common/Loader';

const AdminProtectedRoute = () => {
  // [NEXUS HYDRATION AWARE - CORRECCIÓN CRÍTICA]
  // Ahora nos suscribimos al estado usando el hook `useAdminStore`, no `getState()`.
  // Esto asegura que el componente se re-renderice cuando cambie el estado (ej. al terminar la hidratación).
  const { isAuthenticated, _hasHydrated } = useAdminStore();
  const location = useLocation();

  // [NEXUS HYDRATION AWARE]
  // Primer caso: Aún no hemos terminado de leer desde localStorage.
  // Mostramos un loader a pantalla completa para evitar cualquier renderizado prematuro.
  // Esto bloquea la decisión hasta que tengamos toda la información.
  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-primary">
        <Loader text="Verificando sesión..." />
      </div>
    );
  }

  // [NEXUS HYDRATION AWARE]
  // Segundo caso: La hidratación ha terminado y el usuario NO está autenticado.
  // Lo redirigimos a la página de login.
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // [NEXUS HYDRATION AWARE]
  // Tercer caso: La hidratación ha terminado y el usuario SÍ está autenticado.
  // Le permitimos el acceso a la ruta solicitada.
  return <Outlet />;
};

export default AdminProtectedRoute;
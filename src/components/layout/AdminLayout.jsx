import React, { useEffect } from 'react'; // Importar useEffect
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import useAdminStore from '../store/adminStore';
import Loader from '../components/common/Loader';

// Componentes y Páginas
import AdminLayout from '../components/layout/AdminLayout';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
// ...etc

function AdminApp() {
  const { isAuthenticated, _hasHydrated } = useAdminStore();

  // --- INICIO DE LA CORRECCIÓN CLAVE ---
  // Este efecto gestionará la clase del body para aplicar el tema oscuro.
  useEffect(() => {
    // Añade la clase .admin-body cuando el componente se monta
    document.body.classList.add('admin-body');

    // Función de limpieza: se ejecuta cuando el componente se desmonta
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, []); // El array vacío asegura que esto se ejecute solo una vez (al montar/desmontar)
  // --- FIN DE LA CORRECCIÓN CLAVE ---


  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-primary">
        <Loader text="Cargando aplicación..." />
      </div>
    );
  }

  return (
    // Ya no es necesario el div con la clase "dark" aquí, porque el efecto lo maneja globalmente.
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {isAuthenticated ? (
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboardPage />} />
            {/* ... (el resto de las rutas sin cambios) ... */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        ) : (
          <Route path="/admin/login" element={<AdminLoginPage />} />
        )}
        
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default AdminApp;
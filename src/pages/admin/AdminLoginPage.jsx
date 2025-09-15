// RUTA: frontend/src/pages/admin/AdminLoginPage.jsx (VERSIÓN "NEXUS - AUTH FIX")
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '@/pages/admin/api/adminApi'; 
import useAdminStore from '@/store/adminStore';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi2'; // Se elimina HiOutlineKey por ahora

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // [NEXUS AUTH FIX] - Obtenemos las acciones y el estado del store refactorizado.
  const { loginSuccess, loginFail, setLoading, isLoading, isAuthenticated } = useAdminStore();
  const navigate = useNavigate();

  // [NEXUS AUTH FIX] - Efecto para redirigir si el usuario ya está logueado.
  // Esto previene ver la página de login si ya hay una sesión válida en localStorage.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Por favor, ingresa usuario y contraseña.');
    
    setLoading(true); // Informamos al store que estamos iniciando una operación de carga.
    
    try {
      // [NEXUS AUTH FIX] - La llamada a la API ahora se realiza directamente desde la página.
      const { data } = await adminApi.post('/auth/login/admin', { username, password });
      
      // Si el login es exitoso, llamamos a la acción del store para guardar los datos.
      loginSuccess(data.token, data.admin);

      toast.success('¡Bienvenido, Administrador!');
      navigate('/admin/dashboard');

    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión.';
      toast.error(message);
      loginFail(); // Informamos al store que el login falló.
    } finally {
      // Nos aseguramos de que el estado de carga se desactive, aunque no es estrictamente necesario
      // ya que loginSuccess y loginFail ya lo hacen.
      setLoading(false);
    }
  };

  // Se simplifica la lógica para no manejar 2FA en esta corrección.
  // La lógica de 2FA puede ser reintroducida una vez que la autenticación base sea estable.
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-primary text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-dark-secondary rounded-2xl shadow-lg border border-white/10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-accent-start">BLOCKSPHERE</h1>
          <p className="text-lg text-text-secondary">Panel de Administración</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-text-secondary" />
                <input 
                    type="text" 
                    placeholder="Nombre de Usuario" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 bg-black/20 rounded-lg"
                    autoComplete="username"
                />
            </div>
            <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-text-secondary" />
                <input 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 bg-black/20 rounded-lg"
                    autoComplete="current-password"
                />
            </div>
            <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-3 font-bold text-white bg-gradient-to-r from-accent-start to-accent-end rounded-lg disabled:opacity-50 transition-transform active:scale-[0.98]"
            >
                {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
// RUTA: frontend/src/pages/admin/AdminLoginPage.jsx
// --- VERSIÓN DE DEBUGGING FINAL Y DEFINITIVA ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '@/pages/admin/api/adminApi'; 
import useAdminStore from '@/store/adminStore';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi2';

const AdminLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const { loginSuccess, loginFail, setLoading, isLoading, isAuthenticated } = useAdminStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error('Por favor, ingresa usuario y contraseña.');
    
    setLoading(true);
    
    // --- LÍNEA DE DEBUGGING CRÍTICA ---
    // Este log nos mostrará exactamente qué se está enviando.
    console.log('--- [FRONTEND DEBUG] ---');
    console.log(`Enviando Username: "${username}" (Longitud: ${username.length})`);
    console.log(`Enviando Password: "${password}" (Longitud: ${password.length})`);
    console.log('--- FIN DEBUG ---');

    try {
      const { data } = await adminApi.post('/auth/login/admin', { username, password });
      
      loginSuccess(data.token, data.admin);
      toast.success('¡Bienvenido, Administrador!');
      navigate('/admin/dashboard');

    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión.';
      toast.error(message);
      loginFail();
    } finally {
      setLoading(false);
    }
  };

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
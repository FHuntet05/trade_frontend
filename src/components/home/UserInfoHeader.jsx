// src/components/home/UserInfoHeader.jsx (VERSIÓN FINAL CON ESTILO UNIFICADO Y DATOS REALES)
import React from 'react';
import useUserStore from '../../store/userStore';
import { HiUserCircle } from 'react-icons/hi2';

const UserInfoHeader = () => {
  const { user } = useUserStore();

  // Es una buena práctica retornar un esqueleto o un loader si el usuario no está,
  // pero como App.jsx ya previene esto, un 'null' es seguro.
  if (!user) return null;

  // Extraemos la tasa de minería real y le damos un formato legible
  const miningRate = user.effectiveMiningRate || 0;

  return (
    <div className="flex justify-between items-center w-full">
      {/* Sección Izquierda: Usuario (Estilo actualizado) */}
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg p-2 px-4 rounded-full border border-white/10">
        {/* Cambiamos el icono por el avatar del usuario si existe, si no, usamos un placeholder */}
        <img 
            src={user.avatarUrl || '/assets/images/user-avatar-placeholder.png'} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full object-cover"
        />
        <span className="font-bold text-white">{user.username || 'Usuario'}</span>
      </div>
      
      {/* Sección Derecha: Tasa de Minería (Estilo actualizado y datos dinámicos) */}
      <div className="text-right bg-white/10 backdrop-blur-lg p-2 px-4 rounded-full border border-white/10">
        <span className="text-lg font-bold text-accent-end">
          {miningRate.toFixed(2)} NTX/H
        </span>
        <p className="text-xs text-text-secondary">Mining Rate</p>
      </div>
    </div>
  );
};

export default UserInfoHeader;
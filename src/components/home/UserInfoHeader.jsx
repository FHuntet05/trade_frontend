// src/components/home/UserInfoHeader.jsx (VERSIÓN CORREGIDA CON CAMPO DE IMAGEN CORRECTO)
import React from 'react';
import useUserStore from '../../store/userStore';

const UserInfoHeader = () => {
  const { user } = useUserStore();

  if (!user) return null;

  const miningRate = user.effectiveMiningRate || 0;

  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg p-2 px-4 rounded-full border border-white/10">
        {/* <<< INICIO DE LA CORRECCIÓN: Se usa 'photoUrl' en lugar de 'avatarUrl' >>> */}
        <img 
            src={user.photoUrl || '/assets/images/user-avatar-placeholder.png'} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full object-cover"
        />
        {/* <<< FIN DE LA CORRECCIÓN >>> */}
        <span className="font-bold text-white">{user.username || 'Usuario'}</span>
      </div>
      
      <div className="text-right bg-white/10 backdrop-blur-lg p-2 px-4 rounded-full border border-white/10">
        <span className="text-lg font-bold text-accent-end">
          {miningRate.toFixed(2)} NTX/Día
        </span>
        <p className="text-xs text-text-secondary">Tasa de Minado</p>
      </div>
    </div>
  );
};

export default UserInfoHeader;
// --- START OF FILE src/components/home/UserInfoHeader.jsx (REDiseñado y Corregido) ---

import React from 'react';
import useUserStore from '../../store/userStore';
import { HiOutlineCog6Tooth } from "react-icons/hi2";

const UserInfoHeader = () => {
  const { user } = useUserStore();

  if (!user) return null;

  // Combinamos nombre y apellido. Si no existen, usamos el username como fallback.
  const displayName = (user.firstName || user.lastName) 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.username;

  return (
    <div className="bg-dark-secondary p-4 rounded-xl border border-white/10 w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
              src={user.photoUrl || '/assets/images/user-avatar-placeholder.png'} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            {/* --- CORRECCIÓN CLAVE: Se muestra el nombre y el ID --- */}
            <h2 className="font-bold text-white text-lg">{displayName}</h2>
            <p className="text-xs text-text-secondary">ID: {user.telegramId}</p>
          </div>
        </div>
        {/* Este es el botón de "rueda dentada" de la captura */}
        <button className="p-2 text-text-secondary hover:text-white transition-colors">
          <HiOutlineCog6Tooth size={24} />
        </button>
      </div>
      <div className="mt-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block">
        Miner
      </div>
      <p className="text-sm text-text-secondary mt-2">
        Invitador: {user.referrerId ? `${user.referrerId.toString().slice(0, 4)}*****` : 'N/A'}
      </p>
    </div>
  );
};

export default UserInfoHeader;
// --- END OF FILE src/components/home/UserInfoHeader.jsx ---
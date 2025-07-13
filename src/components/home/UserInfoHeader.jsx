// --- START OF FILE src/components/home/UserInfoHeader.jsx (VERSIÓN FINAL Y CORREGIDA) ---

import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para la navegación
import useUserStore from '../../store/userStore';
import { HiLanguage } from "react-icons/hi2"; // Importamos el icono de idioma

const UserInfoHeader = () => {
  const { user } = useUserStore();

  if (!user) return null;

  const displayName = (user.firstName || user.lastName) 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.username;

  return (
    // Se ha quitado w-full para que el componente respete el padding de su contenedor padre
    <div className="bg-dark-secondary p-4 rounded-xl border border-white/10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
              src={user.photoUrl || '/assets/images/user-avatar-placeholder.png'} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
          />
          <div>
            <h2 className="font-bold text-white text-lg">{displayName}</h2>
            <p className="text-xs text-text-secondary">ID: {user.telegramId}</p>
          </div>
        </div>
        
        {/* --- CAMBIO: Botón de Idioma con Link a la página de selección --- */}
        <Link to="/language" className="p-2 text-text-secondary hover:text-white transition-colors">
          <HiLanguage size={24} />
        </Link>
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
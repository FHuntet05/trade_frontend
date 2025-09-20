// RUTA: frontend/src/components/home/UserInfoHeader.jsx (VERSIÓN VALIDADA - SIN CAMBIOS)
import React from 'react';
import { Link } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import GeneratedAvatar from '../common/GeneratedAvatar';
import { HiLanguage } from "react-icons/hi2";

const truncateText = (text, maxLength = 15) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

const UserInfoHeader = () => {
  const { user } = useUserStore();

  // Guarda de seguridad por si el componente se renderiza antes de que el usuario cargue.
  if (!user) return null;

  const displayName = (user.fullName && user.fullName.trim() !== '') 
    ? user.fullName
    : user.username;

  return (
    <div className="bg-dark-secondary p-3 rounded-xl border border-white/10 flex justify-between items-start">
      
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-12 h-12 flex-shrink-0">
            {user.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
                <GeneratedAvatar name={displayName} size="w-full h-full" />
            )}
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white text-base truncate" title={displayName}>
              {truncateText(displayName)}
            </h2>
            <div className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
              Miner
            </div>
          </div>
          
          <p className="text-xs text-text-secondary">ID: {user.telegramId}</p>

          {/* La lógica para mostrar el invitador ya es correcta y maneja el caso nulo. */}
          <p className="text-xs text-text-secondary truncate" title={user.referredBy?.username}>
            Invitador: {user.referredBy ? truncateText(user.referredBy.username) : 'N/A'}
          </p>
        </div>
      </div>

      <Link to="/language" className="p-1 text-text-secondary hover:text-white transition-colors flex-shrink-0">
        <HiLanguage size={20} />
      </Link>
    </div>
  );
};

export default UserInfoHeader;
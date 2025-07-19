// frontend/src/components/home/UserInfoHeader.jsx (VERSIÓN FINAL BLINDADA v24.0)
import React from 'react';
import { Link } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import GeneratedAvatar from '../common/GeneratedAvatar';
import { HiLanguage } from "react-icons/hi2";

// Función de utilidad para truncar texto. Se puede mover a un archivo utils/ si se usa en más sitios.
const truncateText = (text, maxLength = 12) => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

const UserInfoHeader = () => {
  const { user } = useUserStore();

  if (!user) return null;

  const displayName = (user.fullName && user.fullName.trim() !== '') 
    ? user.fullName
    : user.username;

  return (
    <div className="bg-dark-secondary p-3 rounded-xl border border-white/10 flex justify-between items-start">
      
      <div className="flex items-center gap-3 overflow-hidden"> {/* Añadido overflow-hidden al contenedor */}
        <div className="w-12 h-12 flex-shrink-0">
            {user.photoUrl ? (
                <img src={user.photoUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
                <GeneratedAvatar name={displayName} size="w-full h-full" />
            )}
        </div>
        
        <div className="flex flex-col min-w-0"> {/* Añadido min-w-0 para que el truncado funcione */}
          <div className="flex items-center gap-2">
            {/* ======================= INICIO CORRECCIÓN UI 1 ======================= */}
            <h2 className="font-bold text-white text-base truncate" title={displayName}>
              {truncateText(displayName, 15)}
            </h2>
            {/* ======================== FIN CORRECCIÓN UI 1 ========================= */}
            <div className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
              Miner
            </div>
          </div>
          
          <p className="text-xs text-text-secondary">ID: {user.telegramId}</p>

          {/* ======================= INICIO CORRECCIÓN REFERIDOS ======================= */}
          {/* Leemos de `user.referredBy.username` y lo truncamos. */}
          <p className="text-xs text-text-secondary truncate" title={user.referredBy?.username}>
            Invitador: {user.referredBy ? truncateText(user.referredBy.username, 15) : 'N/A'}
          </p>
          {/* ======================== FIN CORRECCIÓN REFERIDOS ========================= */}
        </div>
      </div>

      <Link to="/language" className="p-1 text-text-secondary hover:text-white transition-colors flex-shrink-0">
        <HiLanguage size={20} />
      </Link>
    </div>
  );
};

export default UserInfoHeader;
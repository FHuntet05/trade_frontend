// --- START OF FILE src/components/home/UserInfoHeader.jsx (VERSIÓN FINAL Y DEFINITIVA) ---

import React from 'react';
import { Link } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import GeneratedAvatar from '../common/GeneratedAvatar';
import { HiLanguage } from "react-icons/hi2";

const UserInfoHeader = () => {
  const { user } = useUserStore();

  if (!user) return null;

  // Lógica del nombre: Prioriza nombre/apellido. Si no existen, usa el username.
  const displayName = (user.firstName || user.lastName) 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.username;

  return (
    // Contenedor principal con flexbox para alinear los elementos principales
    <div className="bg-dark-secondary p-3 rounded-xl border border-white/10 flex justify-between items-start">
      
      {/* Sección Izquierda: Avatar y Texto */}
      <div className="flex items-center gap-3">
        {/* --- SISTEMA DE FOTO DEFINITIVO --- */}
        {/* Intento 1: Usar la foto real. Intento 2 (Fallback): Usar el Avatar Generado. */}
        <div className="w-12 h-12 flex-shrink-0">
            {user.photoUrl ? (
                <img 
                    src={user.photoUrl} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <GeneratedAvatar name={displayName} size="w-full h-full" />
            )}
        </div>
        
        {/* --- LAYOUT COMPACTO CON FLEXBOX ANIDADO --- */}
        <div className="flex flex-col">
          {/* Línea 1: Nombre + Badge */}
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white text-base">{displayName}</h2>
            <div className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Miner
            </div>
          </div>
          
          {/* Línea 2: ID */}
          <p className="text-xs text-text-secondary">ID: {user.telegramId}</p>

          {/* Línea 3: Invitador */}
          <p className="text-xs text-text-secondary">
            Invitador: {user.referrerId ? `${user.referrerId.toString().slice(0, 4)}*****` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Sección Derecha: Botón de Idioma (Restaurado) */}
      <Link to="/language" className="p-1 text-text-secondary hover:text-white transition-colors">
        <HiLanguage size={20} />
      </Link>
    </div>
  );
};

export default UserInfoHeader;
// --- END OF FILE src/components/home/UserInfoHeader.jsx ---
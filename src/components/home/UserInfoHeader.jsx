// --- START OF FILE src/components/home/UserInfoHeader.jsx (RECONSTRUCCIÓN FINAL) ---

import React from 'react';
import useUserStore from '../../store/userStore';
import GeneratedAvatar from '../common/GeneratedAvatar'; // <<< 1. Importamos el nuevo componente

const UserInfoHeader = () => {
  const { user } = useUserStore();

  if (!user) return null;

  // --- LÓGICA DEL NOMBRE (CLARIFICACIÓN FINAL) ---
  // El código INTENTA usar el nombre real (firstName + lastName).
  // Si no existen, y solo en ese caso, usa el 'username' como fallback.
  // Lo que ves como 'feft05' es este fallback funcionando correctamente.
  const displayName = (user.firstName || user.lastName) 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.username;

  return (
    <div className="bg-dark-secondary p-4 rounded-xl border border-white/10 flex items-center gap-4">
      
      {/* --- 2. SOLUCIÓN DEFINITIVA PARA LA FOTO --- */}
      {/* Si existe photoUrl, usa la imagen. Si no, usa el Avatar Generado. */}
      {user.photoUrl ? (
        <img 
            src={user.photoUrl} 
            alt="Avatar" 
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <GeneratedAvatar name={displayName} size="w-12 h-12" />
      )}
      
      {/* --- 3. LAYOUT COMPACTO CON FLEXBOX --- */}
      <div className="flex flex-col">
        {/* Línea 1: Nombre + Badge */}
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-white text-lg">{displayName}</h2>
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
  );
};

export default UserInfoHeader;
// --- END OF FILE src/components/home/UserInfoHeader.jsx ---
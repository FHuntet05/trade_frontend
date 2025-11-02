// RUTA: admin-frontend/src/pages/admin/components/UsersTable.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Componente de UI pura, basado en el Modelo.

import React from 'react';
import { Link } from 'react-router-dom';
import { 
    HiCheckBadge, 
    HiPencil, 
    HiOutlineShieldExclamation, 
    HiOutlineShieldCheck, 
    HiOutlineCurrencyDollar,
    HiArrowUpOnSquare
} from 'react-icons/hi2';
import { getTelegramPhotoUrl } from '@/utils/telegram';

const UsersTable = ({ users, onEdit, onStatusChange, onAdjustBalance, onPromote }) => {
  return (
    <div className="overflow-x-auto bg-dark-secondary rounded-lg border border-white/10 shadow-md">
      <table className="min-w-full text-sm text-left text-gray-300">
        
        {/* --- Encabezado de la Tabla --- */}
        <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
          <tr>
            <th scope="col" className="px-6 py-3">Usuario</th>
            <th scope="col" className="px-6 py-3">Balance USDT</th>
            <th scope="col" className="px-6 py-3">Estado</th>
            <th scope="col" className="px-6 py-3">Rol</th>
            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
          </tr>
        </thead>

        {/* --- Cuerpo de la Tabla --- */}
        <tbody className="divide-y divide-white/10">
          {users.map((user) => (
            <tr key={user._id} className={`hover:bg-dark-tertiary/50 transition-colors duration-200 ${user.status === 'banned' ? 'bg-red-900/20' : ''}`}>
              
              {/* Celda: Información del Usuario */}
              <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                <Link to={`/admin/users/${user._id}/details`} className="flex items-center gap-3 group">
                  <img 
                    className={`w-10 h-10 rounded-full object-cover border-2 ${user.status === 'banned' ? 'border-red-500/50 grayscale' : 'border-dark-primary'}`} 
                    src={
                      user.photoUrl ||
                      getTelegramPhotoUrl(user.telegramId) ||
                      'https://i.postimg.cc/mD21B6r7/user-avatar-placeholder.png'
                    } 
                    alt={`${user.username} avatar`} 
                  />
                  <div>
                    <div className="font-semibold group-hover:text-accent-start transition-colors">{user.username || 'N/A'}</div>
                    <div className="text-xs text-text-secondary font-mono">ID: {user.telegramId}</div>
                  </div>
                </Link>
              </th>
              
              {/* Celda: Balance */}
              <td className="px-6 py-4 font-mono text-lg">${(user.balance?.usdt || 0).toFixed(2)}</td>

              {/* Celda: Estado */}
              <td className="px-6 py-4">
                {user.status === 'active' ? 
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-green-300 bg-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>Activo
                  </span> : 
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-red-300 bg-red-500/20 rounded-full">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>Baneado
                  </span>
                }
              </td>

              {/* Celda: Rol */}
              <td className="px-6 py-4">
                {user.role === 'admin' ? 
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-accent-start bg-accent-start/20 rounded-full"><HiCheckBadge className="w-4 h-4" /> Administrador</span> : 
                  <span className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-500/20 rounded-full">Usuario</span>
                }
              </td>
              
              {/* Celda: Acciones */}
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center items-center gap-1">
                  <button onClick={() => onAdjustBalance(user)} className="p-2 rounded-md hover:bg-yellow-500/20 text-yellow-400" title="Ajustar Saldo"><HiOutlineCurrencyDollar className="w-5 h-5" /></button>
                  <button onClick={() => onEdit(user)} className="p-2 rounded-md hover:bg-indigo-500/20 text-indigo-400" title="Editar Usuario"><HiPencil className="w-5 h-5" /></button>
                  {user.status === 'active' ? 
                    <button onClick={() => onStatusChange(user._id, 'banned')} className="p-2 rounded-md hover:bg-red-500/20 text-red-400" title="Banear"><HiOutlineShieldExclamation className="w-5 h-5" /></button> : 
                    <button onClick={() => onStatusChange(user._id, 'active')} className="p-2 rounded-md hover:bg-green-500/20 text-green-400" title="Reactivar"><HiOutlineShieldCheck className="w-5 h-5" /></button>
                  }
                  {/* El botón de promover solo se renderiza si la función onPromote existe. */}
                  {onPromote && user.role !== 'admin' && (
                     <button onClick={() => onPromote(user)} className="p-2 rounded-md hover:bg-purple-500/20 text-purple-400" title="Promover a Administrador"><HiArrowUpOnSquare className="w-5 h-5" /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
          <div className="text-center p-6 text-text-secondary">
              No se encontraron usuarios que coincidan con la búsqueda.
          </div>
      )}
    </div>
  );
};
export default UsersTable;
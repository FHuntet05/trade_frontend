// frontend/src/pages/admin/components/UsersTable.jsx (COMPLETO CON BOTÓN DE AJUSTE)

import React from 'react';
import { HiBadgeCheck, HiPencil, HiOutlineShieldExclamation, HiOutlineShieldCheck, HiOutlineCurrencyDollar } from 'react-icons/hi'; // Nuevo Icono

const UsersTable = ({ users, onEdit, onStatusChange, onAdjustBalance }) => { // <-- Recibimos onAdjustBalance
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  return (
    <div className="overflow-x-auto bg-dark-secondary rounded-lg border border-white/10">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-text-secondary uppercase bg-black/20">
          <tr>
            <th scope="col" className="px-6 py-3">Usuario</th><th scope="col" className="px-6 py-3">Balance</th><th scope="col" className="px-6 py-3">Estado</th><th scope="col" className="px-6 py-3">Rol</th><th scope="col" className="px-6 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className={`border-b border-dark-primary hover:bg-white/5 ${user.status === 'banned' ? 'bg-red-900/20' : ''}`}>
              <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <img className={`w-8 h-8 rounded-full object-cover ${user.status === 'banned' ? 'grayscale' : ''}`} src={user.photoUrl || '/assets/images/user-avatar-placeholder.png'} alt={`${user.username} avatar`} />
                  <div><div>{user.username}</div><div className="text-xs text-text-secondary">ID: {user.telegramId}</div></div>
                </div>
              </th>
              <td className="px-6 py-4"><div>{Number(user.balance.usdt).toFixed(2)} <span className="text-text-secondary">USDT</span></div><div>{Number(user.balance.ntx).toLocaleString('en-US')} <span className="text-text-secondary">NTX</span></div></td>
              <td className="px-6 py-4">{user.status === 'active' ? <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-green-400 bg-green-500/20 rounded-full"><div className="w-2 h-2 bg-green-400 rounded-full"></div>Activo</span> : <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-red-400 bg-red-500/20 rounded-full"><div className="w-2 h-2 bg-red-400 rounded-full"></div>Baneado</span>}</td>
              <td className="px-6 py-4">{user.role === 'admin' ? <span className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-accent-start bg-accent-start/20 rounded-full"><HiBadgeCheck className="w-4 h-4" /> Admin</span> : <span className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-500/20 rounded-full">User</span>}</td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center items-center gap-1">
                  <button onClick={() => onAdjustBalance(user)} className="p-2 rounded-md hover:bg-yellow-500/20 text-yellow-400 transition-colors" title="Ajustar Saldo"><HiOutlineCurrencyDollar className="w-5 h-5" /></button>
                  <button onClick={() => onEdit(user)} className="p-2 rounded-md hover:bg-accent-start/20 text-accent-start transition-colors" title="Editar Usuario"><HiPencil className="w-5 h-5" /></button>
                  {user.status === 'active' ? <button onClick={() => onStatusChange(user._id, 'banned')} className="p-2 rounded-md hover:bg-red-500/20 text-red-400 transition-colors" title="Banear Usuario"><HiOutlineShieldExclamation className="w-5 h-5" /></button> : <button onClick={() => onStatusChange(user._id, 'active')} className="p-2 rounded-md hover:bg-green-500/20 text-green-400 transition-colors" title="Reactivar Usuario"><HiOutlineShieldCheck className="w-5 h-5" /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
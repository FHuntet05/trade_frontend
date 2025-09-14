// frontend/src/pages/admin/components/RecentUsersTable.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const RecentUsersTable = ({ users }) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <p>No hay usuarios registrados recientemente.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-xs text-text-secondary uppercase">
          <tr>
            <th className="p-3">Usuario</th>
            <th className="p-3">Registrado</th>
            <th className="p-3 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-dark-tertiary">
              <td className="p-3 font-medium">
                <div className="flex flex-col">
                  <span className="text-white">{user.username}</span>
                  <span className="text-xs text-text-secondary font-mono">{user.telegramId}</span>
                </div>
              </td>
              <td className="p-3 text-sm text-text-secondary">
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: es })}
              </td>
              <td className="p-3 text-right">
                <Link 
                  to={`/admin/users/${user._id}/details`} // Asume una ruta de detalle de usuario
                  className="px-3 py-1 text-xs font-bold text-accent-start bg-accent-start/10 rounded-full hover:bg-accent-start/20"
                >
                  Ver Detalles
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentUsersTable;
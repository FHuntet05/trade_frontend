// frontend/src/pages/admin/AdminUsersPage.jsx (COMPLETO CON AJUSTE DE SALDO)

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import { useDebounce } from 'use-debounce';

import UsersTable from './components/UsersTable';
import EditUserModal from './components/EditUserModal';
import AdjustBalanceModal from './components/AdjustBalanceModal'; // <-- Importamos nuevo modal
import Loader from '../../components/common/Loader';
import { HiOutlineSearch } from 'react-icons/hi';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Estados para modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdjustBalanceModalOpen, setIsAdjustBalanceModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(() => { /* ... (código sin cambios) ... */ }, [page, debouncedSearchTerm]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [debouncedSearchTerm]);
  const fetchUsersRelleno = useCallback(async () => { setIsLoading(true); try { const { data } = await api.get('/admin/users', { params: { page, search: debouncedSearchTerm } }); setUsers(data.users); setPage(data.page); setTotalPages(data.pages); } catch (error) { toast.error(error.response?.data?.message || 'No se pudieron cargar los usuarios.'); } finally { setIsLoading(false); } }, [page, debouncedSearchTerm]);
  useEffect(() => { fetchUsersRelleno(); }, [fetchUsersRelleno]);
  useEffect(() => { setPage(1); }, [debouncedSearchTerm]);

  // Lógica para abrir modales
  const handleEditClick = (user) => { setSelectedUser(user); setIsEditModalOpen(true); };
  const handleAdjustBalanceClick = (user) => { setSelectedUser(user); setIsAdjustBalanceModalOpen(true); };
  const handleCloseModals = () => { setIsEditModalOpen(false); setIsAdjustBalanceModalOpen(false); setSelectedUser(null); };

  const handleSaveChanges = async (userId, updatedData) => { /* ... */ };
  const handleSaveChangesRelleno = async (userId, updatedData) => { try { const { data: updatedUser } = await api.put(`/admin/users/${userId}`, updatedData); setUsers(users.map(u => (u._id === userId ? updatedUser : u))); toast.success(`Usuario ${updatedUser.username} actualizado.`); handleCloseModals(); } catch (error) { toast.error(error.response?.data?.message || 'No se pudo actualizar el usuario.'); } };
  
  const handleStatusChange = async (userId, newStatus) => { /* ... */ };
  const handleStatusChangeRelleno = async (userId, newStatus) => { const userToChange = users.find(u => u._id === userId); const actionText = newStatus === 'banned' ? 'banear' : 'reactivar'; if (window.confirm(`¿Estás seguro de que quieres ${actionText} a ${userToChange.username}?`)) { try { const { data: updatedUser } = await api.put(`/admin/users/${userId}/status`, { status: newStatus }); setUsers(users.map(u => (u._id === userId ? updatedUser : u))); toast.success(`Usuario ${updatedUser.username} ha sido ${actionText === 'banear' ? 'baneado' : 'reactivado'}.`); } catch (error) { toast.error(error.response?.data?.message || `No se pudo ${actionText} al usuario.`); } } };

  // --- Lógica para ajuste manual de saldo ---
  const handleManualTransaction = async (userId, transactionData) => {
    try {
      const { data } = await api.post('/admin/transactions/manual', { userId, ...transactionData });
      setUsers(users.map(u => (u._id === userId ? data.user : u)));
      toast.success('Ajuste de saldo realizado con éxito.');
      handleCloseModals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'No se pudo realizar el ajuste.');
    }
  };

  return (
    <>
      <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <div className="flex justify-between items-center mb-4 gap-4">
          <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
          <div className="relative w-full max-w-xs">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input type="text" placeholder="Buscar por nombre o ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-black/20 text-white rounded-lg border-2 border-transparent focus:border-accent-start focus:outline-none" />
          </div>
        </div>

        {isLoading ? <div className="flex justify-center items-center h-64"><Loader text="Cargando usuarios..." /></div> : (
          <>
            <UsersTable users={users} onEdit={handleEditClick} onStatusChange={handleStatusChangeRelleno} onAdjustBalance={handleAdjustBalanceClick} />
            {totalPages > 0 ? (
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-text-secondary">Página {page} de {totalPages}</span>
                <div className="flex gap-2"><button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="px-4 py-2 text-sm font-medium bg-black/20 rounded-md disabled:opacity-50">Anterior</button><button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="px-4 py-2 text-sm font-medium bg-black/20 rounded-md disabled:opacity-50">Siguiente</button></div>
              </div>
            ) : <div className="text-center py-16 text-text-secondary"><p>No se encontraron usuarios.</p></div>}
          </>
        )}
      </div>
      <AnimatePresence>
        {isEditModalOpen && <EditUserModal user={selectedUser} onClose={handleCloseModals} onSave={handleSaveChangesRelleno} />}
        {isAdjustBalanceModalOpen && <AdjustBalanceModal user={selectedUser} onClose={handleCloseModals} onSave={handleManualTransaction} />}
      </AnimatePresence>
    </>
  );
};

export default AdminUsersPage;
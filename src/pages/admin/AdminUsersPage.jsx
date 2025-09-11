// RUTA: admin-frontend/src/pages/admin/UsersPage.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Página contenedora para la gestión completa de usuarios.

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import useAdminStore from '../../store/adminStore'; // Necesario para la lógica del Super Admin.

// Importación de Componentes
import Loader from '../../components/common/Loader';
import UsersTable from './components/UsersTable';
import Pagination from '../../components/common/Pagination';
import EditUserModal from './components/EditUserModal';
import AdjustBalanceModal from './components/AdjustBalanceModal';
import PromoteAdminModal from './components/PromoteAdminModal';
import { HiOutlineUserGroup, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

const UsersPage = () => {
    // --- Estado del Componente ---
    const [usersData, setUsersData] = useState({ users: [], pages: 1, totalUsers: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    // Estado para controlar la visibilidad de cada modal.
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);

    // --- Hooks y Lógica de Datos ---
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const currentSearch = searchParams.get('search') || '';

    const { admin } = useAdminStore();
    // Verificamos si el admin logueado es el Super Admin.
    const isSuperAdmin = admin?.telegramId?.toString() === process.env.VITE_SUPER_ADMIN_TELEGRAM_ID;

    // --- Función de Carga de Datos ---
    const fetchUsers = useCallback(async (page, search) => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/admin/users', { params: { page, search } });
            setUsersData(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "No se pudieron cargar los usuarios.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect para cargar los usuarios cuando cambia la página o la búsqueda.
    useEffect(() => {
        fetchUsers(currentPage, currentSearch);
    }, [currentPage, currentSearch, fetchUsers]);
    
    // --- Handlers de Acciones del Usuario ---
    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = e.target.elements.search.value;
        setSearchParams({ search: searchTerm, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ search: currentSearch, page: newPage });
    };
    
    // --- Handlers de Modales ---
    const openModal = (user, modalSetter) => {
        setSelectedUser(user);
        modalSetter(true);
    };

    const closeModal = (modalSetter) => {
        setSelectedUser(null);
        modalSetter(false);
    };
    
    // --- Lógica de Llamadas a la API ---
    const handleSaveChanges = async (userId, data) => {
        const promise = api.put(`/admin/users/${userId}`, data);
        toast.promise(promise, {
            loading: 'Guardando cambios...',
            success: () => {
                closeModal(setIsEditModalOpen);
                fetchUsers(currentPage, currentSearch); // Recargar datos.
                return 'Usuario actualizado con éxito.';
            },
            error: (err) => err.response?.data?.message || 'Error al actualizar el usuario.',
        });
    };

    const handleStatusChange = async (userId, newStatus) => {
        const promise = api.put(`/admin/users/${userId}/status`, { status: newStatus });
        toast.promise(promise, {
            loading: `Cambiando estado...`,
            success: 'Estado del usuario actualizado.',
            error: 'No se pudo cambiar el estado.',
        });
        // Optimistic UI update:
        setUsersData(prev => ({ ...prev, users: prev.users.map(u => u._id === userId ? { ...u, status: newStatus } : u) }));
    };

    const handleAdjustBalance = async (userId, data) => {
        const promise = api.post(`/admin/users/${userId}/adjust-balance`, data);
        toast.promise(promise, {
            loading: 'Ajustando saldo...',
            success: () => {
                closeModal(setIsBalanceModalOpen);
                fetchUsers(currentPage, currentSearch); // Recargar datos.
                return 'Saldo ajustado con éxito.';
            },
            error: (err) => err.response?.data?.message || 'Error al ajustar el saldo.',
        });
    };
    
    const handlePromote = async (userId, password) => {
        const promise = api.post('/admin/users/promote', { userId, password });
        toast.promise(promise, {
            loading: `Promoviendo a ${selectedUser.username}...`,
            success: () => {
                closeModal(setIsPromoteModalOpen);
                fetchUsers(currentPage, currentSearch); // Recargar datos.
                return `${selectedUser.username} es ahora administrador.`;
            },
            error: (err) => err.response?.data?.message || 'No se pudo promover al usuario.',
        });
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                    <h1 className="text-2xl font-semibold flex items-center gap-3">
                        <HiOutlineUserGroup /> Gestión de Usuarios
                    </h1>
                    <p className="text-text-secondary mt-1">Busca, edita y gestiona los permisos de los usuarios.</p>
                </div>

                <div className="bg-dark-secondary p-4 rounded-lg border border-white/10">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <input
                            type="text"
                            name="search"
                            defaultValue={currentSearch}
                            placeholder="Buscar por username o Telegram ID..."
                            className="w-full bg-dark-primary p-2 rounded-md border border-white/20 focus:ring-accent-start focus:border-accent-start"
                        />
                        <button type="submit" className="p-2 bg-accent-start rounded-md text-white">
                            <HiOutlineMagnifyingGlass className="w-6 h-6" />
                        </button>
                    </form>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center"><Loader /></div>
                ) : (
                    <>
                        <UsersTable
                            users={usersData.users}
                            onEdit={(user) => openModal(user, setIsEditModalOpen)}
                            onStatusChange={handleStatusChange}
                            onAdjustBalance={(user) => openModal(user, setIsBalanceModalOpen)}
                            // Solo mostramos el botón de promover si el admin logueado es Super Admin
                            onPromote={isSuperAdmin ? (user) => openModal(user, setIsPromoteModalOpen) : undefined}
                        />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={usersData.pages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* --- Renderizado Condicional de Modales --- */}
            {isEditModalOpen && (
                <EditUserModal 
                    user={selectedUser}
                    onClose={() => closeModal(setIsEditModalOpen)}
                    onSave={handleSaveChanges}
                    isSuperAdmin={isSuperAdmin}
                />
            )}
            {isBalanceModalOpen && (
                <AdjustBalanceModal
                    user={selectedUser}
                    onClose={() => closeModal(setIsBalanceModalOpen)}
                    onSave={handleAdjustBalance}
                />
            )}
            {isPromoteModalOpen && (
                 <PromoteAdminModal
                    user={selectedUser}
                    onClose={() => closeModal(setIsPromoteModalOpen)}
                    onPromote={handlePromote}
                />
            )}
        </>
    );
};

export default UsersPage;
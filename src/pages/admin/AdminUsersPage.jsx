// frontend/src/pages/admin/AdminUsersPage.jsx (FASE "REMEDIATIO" - RUTAS CON ALIAS CORREGIDAS)
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
// [REMEDIATIO - SOLUCIÓN ESTRUCTURAL] Se aplican los alias de ruta a todas las importaciones.
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import useAdminStore from '@/store/adminStore';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import PromoteAdminModal from '@/pages/admin/components/PromoteAdminModal';
import ResetPasswordModal from '@/pages/admin/components/ResetPasswordModal';
// La importación de UsersTable se elimina porque la tabla está ahora definida dentro de este mismo archivo.
import { HiOutlineUserGroup, HiOutlineMagnifyingGlass, HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineNoSymbol, HiOutlineCheckCircle } from 'react-icons/hi2';

const SUPER_ADMIN_TELEGRAM_ID = import.meta.env.VITE_SUPER_ADMIN_TELEGRAM_ID;

const AdminUsersPage = () => {
    const [usersData, setUsersData] = useState({ users: [], pages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const currentSearch = searchParams.get('search') || '';

    const { admin } = useAdminStore();
    const isSuperAdmin = admin?.telegramId?.toString() === SUPER_ADMIN_TELEGRAM_ID;

    const fetchUsersAndAdmins = useCallback(async (page, search) => {
        setIsLoading(true);
        try {
            const { data } = await adminApi.get('/admin/users', { params: { page, search } });
            setUsersData(data);
        } catch (error) { toast.error(error.response?.data?.message || "No se pudieron cargar los usuarios."); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchUsersAndAdmins(currentPage, currentSearch); }, [currentPage, currentSearch, fetchUsersAndAdmins]);
    
    const handleSearch = (e) => { e.preventDefault(); setSearchParams({ search: e.target.elements.search.value, page: 1 }); };
    const handlePageChange = (newPage) => { setSearchParams({ search: currentSearch, page: newPage }); };

    const handlePromote = async (userId, password) => {
        const promise = adminApi.post('/admin/admins/promote', { userId, password }); // Corregido el endpoint
        toast.promise(promise, {
            loading: `Promoviendo usuario...`,
            success: () => { setIsPromoteModalOpen(false); fetchUsersAndAdmins(currentPage, currentSearch); return `Usuario promovido a administrador.`; },
            error: (err) => err.response?.data?.message || 'No se pudo promover al usuario.',
        });
    };

    const handleToggleAdminBan = (adminId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        const promise = adminApi.put(`/admin/admins/${adminId}/status`, { status: newStatus });
        toast.promise(promise, {
            loading: `${newStatus === 'banned' ? 'Baneando' : 'Desbaneando'} administrador...`,
            success: () => { fetchUsersAndAdmins(currentPage, currentSearch); return 'Estado del administrador actualizado.'; },
            error: (err) => err.response?.data?.message || 'Error al cambiar el estado del admin.',
        });
    };
    
    const handleResetPassword = async (adminId) => {
        const promise = adminApi.post(`/admin/admins/${adminId}/reset-password`);
        toast.promise(promise, {
            loading: 'Reseteando contraseña...',
            success: (res) => { setIsResetPasswordModalOpen(false); alert(`Contraseña reseteada. La nueva contraseña temporal es: ${res.data.newPassword}`); return 'Contraseña actualizada.'; },
            error: (err) => err.response?.data?.message || 'Error al resetear la contraseña.',
        });
    };

    const ActionsCell = ({ user }) => {
        if (!isSuperAdmin) return null;
        if (user.role !== 'admin') {
            return (
                <button onClick={() => { setSelectedUser(user); setIsPromoteModalOpen(true); }} title="Promover a Administrador" className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full">
                    <HiOutlineShieldCheck className="w-5 h-5" />
                </button>
            );
        }
        if (user.role === 'admin') {
            return (
                <div className="flex justify-center items-center gap-2">
                    <button onClick={() => { setSelectedUser(user); setIsResetPasswordModalOpen(true); }} title="Resetear Contraseña" className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full">
                        <HiOutlineLockClosed className="w-5 h-5" />
                    </button>
                    {user.status === 'active' ? (
                        <button onClick={() => handleToggleAdminBan(user._id, user.status)} title="Banear Administrador" className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
                            <HiOutlineNoSymbol className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={() => handleToggleAdminBan(user._id, user.status)} title="Desbanear Administrador" className="p-2 text-green-400 hover:bg-green-500/20 rounded-full">
                            <HiOutlineCheckCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                    <h1 className="text-2xl font-semibold flex items-center gap-3"><HiOutlineUserGroup /> Gestión de Usuarios</h1>
                    <p className="text-text-secondary mt-1">Busca, edita y gestiona los permisos de los usuarios.</p>
                </div>
                <div className="bg-dark-secondary p-4 rounded-lg border border-white/10">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <input type="text" name="search" defaultValue={currentSearch} placeholder="Buscar por username o Telegram ID..." className="w-full bg-dark-primary p-2 rounded-md" />
                        <button type="submit" className="p-2 bg-accent-start rounded-md text-white"><HiOutlineMagnifyingGlass className="w-6 h-6" /></button>
                    </form>
                </div>
                {isLoading ? <div className="flex justify-center"><Loader /></div> : (
                    <div className="bg-dark-secondary rounded-lg border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                                    <tr>
                                        <th className="p-3">Usuario</th>
                                        <th className="p-3">Rol</th>
                                        <th className="p-3">Estado</th>
                                        <th className="p-3 text-center">Acciones Super Admin</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {usersData.users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="p-3 font-medium">{user.username} ({user.telegramId})</td>
                                            <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>{user.role}</span></td>
                                            <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{user.status}</span></td>
                                            <td className="p-3 text-center"><ActionsCell user={user} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         <Pagination currentPage={currentPage} totalPages={usersData.pages} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>
            {isPromoteModalOpen && <PromoteAdminModal user={selectedUser} onClose={() => setIsPromoteModalOpen(false)} onPromote={handlePromote} />}
            {isResetPasswordModalOpen && <ResetPasswordModal user={selectedUser} onClose={() => setIsResetPasswordModalOpen(false)} onConfirm={handleResetPassword} />}
        </>
    );
};

export default AdminUsersPage;
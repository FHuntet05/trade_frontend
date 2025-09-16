// RUTA: frontend/src/pages/admin/AdminUsersPage.jsx (VERSIÓN "NEXUS - DIRECT READ FIX")
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import useAdminStore from '@/store/adminStore';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import PromoteAdminModal from '@/pages/admin/components/PromoteAdminModal';
import ResetPasswordModal from '@/pages/admin/components/ResetPasswordModal';
import { HiOutlineUserGroup, HiOutlineMagnifyingGlass, HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineNoSymbol, HiOutlineCheckCircle } from 'react-icons/hi2';

// [NEXUS DIRECT READ] El componente ActionsCell ahora es autónomo.
const ActionsCell = ({ user, onAction }) => {
    const stopPropagation = (e) => e.stopPropagation();
    
    // Lee el estado MÁS RECIENTE directamente desde el hook.
    const isSuperAdmin = useAdminStore(state => state.isSuperAdmin());

    const superAdminIdFromEnv = import.meta.env.VITE_SUPER_ADMIN_TELEGRAM_ID;
    
    // Si el usuario de la fila es el Super Admin, no se muestra nada.
    if (user.telegramId?.toString() === superAdminIdFromEnv?.trim()) {
        return <td className="p-3 text-center"></td>;
    }
    
    return (
        <td className="p-3 text-center" onClick={stopPropagation}>
            <div className="flex justify-center items-center gap-2">
                {/* Lógica de permisos simplificada */}
                {isSuperAdmin && user.role !== 'admin' && (
                    <button onClick={() => onAction('promote', user)} title="Promover a Administrador" className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full">
                        <HiOutlineShieldCheck className="w-5 h-5" />
                    </button>
                )}
                {isSuperAdmin && user.role === 'admin' && (
                    <>
                        <button onClick={() => onAction('resetPassword', user)} title="Resetear Contraseña" className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full">
                            <HiOutlineLockClosed className="w-5 h-5" />
                        </button>
                        {user.status === 'active' ? (
                            <button onClick={() => onAction('toggleBan', user)} title="Banear Administrador" className="p-2 text-red-400 hover:bg-red-500/20 rounded-full">
                                <HiOutlineNoSymbol className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={() => onAction('toggleBan', user)} title="Desbanear Administrador" className="p-2 text-green-400 hover:bg-green-500/20 rounded-full">
                                <HiOutlineCheckCircle className="w-5 h-5" />
                            </button>
                        )}
                    </>
                )}
            </div>
        </td>
    );
};

const AdminUsersPage = () => {
    const [usersData, setUsersData] = useState({ users: [], pages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(null); // 'promote' o 'resetPassword'

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get('page')) || 1;
    const currentSearch = searchParams.get('search') || '';
    const navigate = useNavigate();
    
    const { _hasHydrated } = useAdminStore();

    const fetchUsersAndAdmins = useCallback(async (page, search) => {
        setIsLoading(true);
        try {
            const { data } = await adminApi.get('/admin/users', { params: { page, search } });
            setUsersData(data);
        } catch (error) { toast.error(error.response?.data?.message || "No se pudieron cargar los usuarios."); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        if (_hasHydrated) {
            fetchUsersAndAdmins(currentPage, currentSearch);
        }
    }, [currentPage, currentSearch, fetchUsersAndAdmins, _hasHydrated]);
    
    const handleSearch = (e) => { e.preventDefault(); setSearchParams({ search: e.target.elements.search.value, page: 1 }); };
    const handlePageChange = (newPage) => { setSearchParams({ search: currentSearch, page: newPage }); };

    const handlePromoteSubmit = async (userId, password) => {
        const promise = adminApi.post('/admin/admins/promote', { userId, password });
        toast.promise(promise, {
            loading: `Promoviendo usuario...`,
            success: () => { setModalType(null); fetchUsersAndAdmins(currentPage, currentSearch); return `Usuario promovido.`; },
            error: (err) => err.response?.data?.message || 'No se pudo promover al usuario.',
        });
    };

    const handleToggleBan = (user) => {
        const { _id, status } = user;
        const newStatus = status === 'active' ? 'banned' : 'active';
        const actionText = newStatus === 'banned' ? 'banear' : 'desbanear';
        if (window.confirm(`¿Seguro que quieres ${actionText} a este administrador?`)) {
            const promise = adminApi.put(`/admin/users/${_id}`, { status: newStatus });
            toast.promise(promise, {
                loading: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ndo...`,
                success: () => { fetchUsersAndAdmins(currentPage, currentSearch); return 'Estado actualizado.'; },
                error: (err) => err.response?.data?.message || 'Error al cambiar el estado.',
            });
        }
    };
    
    const handleResetPasswordSubmit = async (adminId) => {
        const promise = adminApi.post('/admin/admins/reset-password', { adminId });
        toast.promise(promise, {
            loading: 'Reseteando contraseña...',
            success: (res) => {
                setModalType(null);
                window.prompt(`Contraseña reseteada. Cópiala y envíala al administrador:`, res.data.temporaryPassword);
                return 'Contraseña actualizada.';
            },
            error: (err) => err.response?.data?.message || 'Error al resetear.',
        });
    };
    
    const handleActionClick = (action, user) => {
        setSelectedUser(user);
        if (action === 'toggleBan') {
            handleToggleBan(user);
        } else {
            setModalType(action);
        }
    };

    if (!_hasHydrated) {
        return <div className="flex justify-center p-10"><Loader text="Verificando permisos..." /></div>;
    }

    return (
        <>
           <div className="space-y-6">
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10"> <h1 className="text-2xl font-semibold flex items-center gap-3"><HiOutlineUserGroup /> Gestión de Usuarios</h1> <p className="text-text-secondary mt-1">Busca, edita y gestiona los permisos de los usuarios.</p> </div>
                <div className="bg-dark-secondary p-4 rounded-lg border border-white/10"> <form onSubmit={handleSearch} className="flex items-center gap-2"> <input type="text" name="search" defaultValue={currentSearch} placeholder="Buscar por username o Telegram ID..." className="w-full bg-dark-primary p-2 rounded-md" /> <button type="submit" className="p-2 bg-accent-start rounded-md text-white"><HiOutlineMagnifyingGlass className="w-6 h-6" /></button> </form> </div>
                {isLoading ? <div className="flex justify-center"><Loader /></div> : (
                    <div className="bg-dark-secondary rounded-lg border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary"> <tr> <th className="p-3">Usuario</th> <th className="p-3">Rol</th> <th className="p-3">Estado</th> <th className="p-3 text-center">Acciones</th> </tr> </thead>
                                <tbody className="divide-y divide-white/10">
                                    {usersData.users.map((user) => (
                                        <tr key={user._id} onClick={() => navigate(`/admin/users/${user._id}`)} className="cursor-pointer hover:bg-dark-tertiary/50 transition-colors">
                                            <td className="p-3 font-medium flex items-center gap-3"> <img src={user.photoUrl} alt="avatar" className="w-8 h-8 rounded-full bg-dark-primary" /> {user.username} ({user.telegramId}) </td>
                                            <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>{user.role}</span></td>
                                            <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{user.status}</span></td>
                                            <ActionsCell user={user} onAction={handleActionClick} />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={currentPage} totalPages={usersData.pages} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>
            {modalType === 'promote' && <PromoteAdminModal user={selectedUser} onClose={() => setModalType(null)} onPromote={handlePromoteSubmit} />}
            {modalType === 'resetPassword' && <ResetPasswordModal user={selectedUser} onClose={() => setModalType(null)} onConfirm={handleResetPasswordSubmit} />}
        </>
    );
};

export default AdminUsersPage;
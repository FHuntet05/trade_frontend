// RUTA: frontend/src/pages/admin/AdminUsersPage.jsx (VERSIÓN "NEXUS - API SYNC FIX")
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import useAdminStore from '@/store/adminStore';
import Loader from '@/components/common/Loader';
import Pagination from '@/components/common/Pagination';
import PromoteAdminModal from '@/pages/admin/components/PromoteAdminModal';
import ResetPasswordModal from '@/pages/admin/components/ResetPasswordModal';
import TelegramAvatar from '@/components/common/TelegramAvatar';
import {
    HiOutlineUserGroup,
    HiOutlineMagnifyingGlass,
    HiOutlineShieldCheck,
    HiOutlineLockClosed,
    HiOutlineNoSymbol,
    HiOutlineCheckCircle,
} from 'react-icons/hi2';

const ActionsCell = ({ user, onAction }) => {
    const stopPropagation = (e) => e.stopPropagation();
    const isSuperAdmin = useAdminStore((state) => state.isSuperAdmin());
    const superAdminIdFromEnv = import.meta.env.VITE_SUPER_ADMIN_TELEGRAM_ID;

    if (user.telegramId?.toString() === superAdminIdFromEnv?.trim()) {
        return ( <td className="p-3 text-center"><span className="text-gray-500 text-sm italic">Protegido</span></td> );
    }

    if (!isSuperAdmin && user.role === 'admin') {
        return ( <td className="p-3 text-center"><span className="text-gray-500 text-sm italic">Restringido</span></td> );
    }

    return (
        <td className="p-3 text-center" onClick={stopPropagation}>
            <div className="flex justify-center items-center gap-2">
                {isSuperAdmin && user.role !== 'admin' && (
                    <button onClick={() => onAction('promote', user)} title="Promover a Administrador" className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-full transition-colors">
                        <HiOutlineShieldCheck className="w-5 h-5" />
                    </button>
                )}

                {(isSuperAdmin || user.role !== 'admin') && (
                    <>
                        {/* [NEXUS API SYNC FIX] - La lógica de reseteo de contraseña de admin se movió a su propia página,
                            pero dejamos el botón aquí por si se reimplementa. La lógica actual apunta a un endpoint obsoleto.
                            Para evitar errores, la corregiremos también. */}
                        <button onClick={() => onAction('resetPassword', user)} title="Resetear Contraseña" className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-full transition-colors">
                            <HiOutlineLockClosed className="w-5 h-5" />
                        </button>

                        {user.status === 'active' ? (
                            <button onClick={() => onAction('toggleBan', user)} title="Banear Usuario" className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors">
                                <HiOutlineNoSymbol className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={() => onAction('toggleBan', user)} title="Desbanear Usuario" className="p-2 text-green-400 hover:bg-green-500/20 rounded-full transition-colors">
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
    const [data, setData] = useState({ users: [], pages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const { _hasHydrated } = useAdminStore();

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const page = searchParams.get('page') || 1;
            const search = searchParams.get('search') || '';
            const params = { page, ...(search && { search }) };
            const { data: responseData } = await adminApi.get('/admin/users', { params });
            setData(responseData);
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudieron cargar los usuarios.');
        } finally {
            setIsLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        if (_hasHydrated) {
            fetchUsers();
        }
    }, [fetchUsers, _hasHydrated]);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = e.target.elements.search.value;
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', '1');
            newParams.set('search', searchTerm);
            return newParams;
        });
    };

    const handlePageChange = (newPage) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', newPage.toString());
            return newParams;
        });
    };

    // [NEXUS API SYNC FIX] - INICIO DE LA CORRECCIÓN CRÍTICA
    const handlePromoteSubmit = async (userId, password) => {
        // La nueva lógica utiliza el endpoint PUT /admin/users/:id
        // y envía el rol y la contraseña en el cuerpo.
        const promise = adminApi.put(`/admin/users/${userId}`, { 
            role: 'admin', 
            password: password 
        });

        toast.promise(promise, {
            loading: 'Promoviendo usuario...',
            success: () => {
                setModalType(null);
                fetchUsers(); // Recargamos la lista para ver el cambio de rol.
                return 'Usuario promovido a administrador.';
            },
            error: (err) => err.response?.data?.message || 'Error al promover usuario.',
        });
    };
    // [NEXUS API SYNC FIX] - FIN DE LA CORRECCIÓN CRÍTICA

    const handleToggleBan = (user) => {
        const newStatus = user.status === 'active' ? 'banned' : 'active';
        const actionText = newStatus === 'banned' ? 'banear' : 'desbanear';
        if (window.confirm(`¿Seguro que quieres ${actionText} a ${user.username}?`)) {
            const promise = adminApi.put(`/admin/users/${user._id}`, { status: newStatus });
            toast.promise(promise, {
                loading: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ndo usuario...`,
                success: () => {
                    fetchUsers();
                    return `Usuario ${actionText === 'banear' ? 'baneado' : 'reactivado'}.`;
                },
                error: (err) => err.response?.data?.message || 'No se pudo actualizar el estado.',
            });
        }
    };

    // [NEXUS API SYNC FIX] - Corregimos también este endpoint para que sea consistente.
    const handleResetPasswordSubmit = async (adminId) => {
        // La nueva ruta es /users/:id/reset-password y es un POST.
        const promise = adminApi.post(`/admin/users/${adminId}/reset-password`);
        toast.promise(promise, {
            loading: 'Reseteando contraseña...',
            success: (res) => {
                setModalType(null);
                window.prompt('Copia la nueva contraseña temporal:', res.data.temporaryPassword);
                return 'Contraseña reseteada.';
            },
            error: (err) => err.response?.data?.message || 'Error al resetear la contraseña.',
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
        return ( <div className="flex justify-center p-10"><Loader text="Verificando permisos..." /></div> );
    }

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
                        <input type="text" name="search" defaultValue={searchParams.get('search') || ''} placeholder="Buscar por username o Telegram ID..." className="w-full bg-dark-primary p-2 rounded-md border border-white/10" />
                        <button type="submit" className="p-2 bg-accent-start rounded-md text-white"><HiOutlineMagnifyingGlass className="w-6 h-6" /></button>
                    </form>
                </div>
                {isLoading ? ( <div className="flex justify-center h-96 items-center"><Loader /></div> ) : (
                    <div className="bg-dark-secondary rounded-lg border border-white/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary">
                                    <tr>
                                        <th className="p-3">Usuario</th>
                                        <th className="p-3">Rol</th>
                                        <th className="p-3">Estado</th>
                                        <th className="p-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {data.users.map((user) => (
                                        <tr key={user._id} className="hover:bg-dark-tertiary/50 transition-colors">
                                            <td className="p-3 font-medium">
                                                <Link to={`/admin/users/${user._id}`} className="flex items-center gap-3 hover:text-accent-start">
                                                    <TelegramAvatar
                                                        telegramId={user.telegramId}
                                                        photoUrl={user.photoUrl}
                                                        alt={`${user.username} avatar`}
                                                        className="w-8 h-8 rounded-full bg-dark-primary object-cover"
                                                    />
                                                    <div>
                                                        <p>{user.username}</p>
                                                        <p className="text-xs text-text-secondary font-mono">{user.telegramId}</p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ user.role === 'admin' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300' }`}>{user.role}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400' }`}>{user.status}</span>
                                            </td>
                                            <ActionsCell user={user} onAction={handleActionClick} />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={data.pagination.currentPage} totalPages={data.pagination.totalPages} onPageChange={handlePageChange} />
                    </div>
                )}
            </div>
            {modalType === 'promote' && (
                <PromoteAdminModal user={selectedUser} onClose={() => setModalType(null)} onPromote={handlePromoteSubmit} />
            )}
            {modalType === 'resetPassword' && (
                <ResetPasswordModal user={selectedUser} onClose={() => setModalType(null)} onConfirm={handleResetPasswordSubmit} />
            )}
        </>
    );
};

export default AdminUsersPage;
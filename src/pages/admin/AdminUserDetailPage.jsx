// frontend/src/pages/admin/AdminUserDetailPage.jsx (COMPLETO)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';

import Loader from '../../components/common/Loader';
import TransactionsTable from './components/TransactionsTable'; // Reutilizamos el componente
import { HiArrowLeft } from 'react-icons/hi2';

const UserDetailCard = ({ user }) => (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 flex items-center gap-6">
        <img className={`w-24 h-24 rounded-full object-cover ${user.status === 'banned' ? 'grayscale' : ''}`} src={user.photoUrl || '/assets/images/user-avatar-placeholder.png'} alt="avatar" />
        <div className="space-y-1">
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-sm text-text-secondary">ID de Telegram: {user.telegramId}</p>
            <p className="text-sm">Rol: <span className="font-semibold">{user.role}</span> | Estado: <span className={`font-semibold ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{user.status}</span></p>
            <div className="flex gap-4 pt-2">
                <div><span className="font-bold text-lg">{Number(user.balance.usdt).toFixed(2)}</span> <span className="text-sm text-text-secondary">USDT</span></div>
                <div><span className="font-bold text-lg">{Number(user.balance.ntx).toLocaleString('en-US')}</span> <span className="text-sm text-text-secondary">NTX</span></div>
            </div>
        </div>
    </div>
);


const AdminUserDetailPage = () => {
    const { id } = useParams(); // Obtenemos el ID del usuario de la URL
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchUserDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get(`/admin/users/${id}/details`, { params: { page } });
            setUserData(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudieron cargar los detalles del usuario.');
        } finally {
            setIsLoading(false);
        }
    }, [id, page]);

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    if (isLoading && !userData) {
        return <div className="flex justify-center items-center h-full"><Loader text="Cargando detalles..." /></div>;
    }

    if (!userData) {
        return <div className="text-center text-text-secondary">No se encontró al usuario.</div>;
    }

    return (
        <div className="space-y-6">
            <Link to="/admin/users" className="flex items-center gap-2 text-sm text-accent-start hover:underline">
                <HiArrowLeft />
                Volver a la lista de usuarios
            </Link>
            <UserDetailCard user={userData.user} />
            <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
                <h3 className="text-xl font-semibold mb-4">Historial de Transacciones</h3>
                {isLoading && <div className="text-center py-4"><Loader /></div>}
                <TransactionsTable transactions={userData.transactions.items} />
                {/* Paginación */}
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-text-secondary">Página {userData.transactions.page} de {userData.transactions.pages}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => p - 1)} disabled={userData.transactions.page <= 1} className="px-4 py-2 text-sm bg-black/20 rounded-md disabled:opacity-50">Anterior</button>
                        <button onClick={() => setPage(p => p + 1)} disabled={userData.transactions.page >= userData.transactions.pages} className="px-4 py-2 text-sm bg-black/20 rounded-md disabled:opacity-50">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;
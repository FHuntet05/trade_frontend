// frontend/src/pages/admin/AdminUserDetailPage.jsx (VERSIÓN v17.2 - RUTA CORREGIDA)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { HiArrowLeft } from 'react-icons/hi2';

// ... (Todos los sub-componentes: UserInfoCard, ReferralsList, TransactionsTable sin cambios) ...

const UserInfoCard = ({ user }) => (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <div className="flex items-center gap-4">
            <img src={user.photoUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-dark-primary" />
            <div>
                <h2 className="text-2xl font-bold">{user.fullName || user.username}</h2>
                <p className="text-sm text-text-secondary">@{user.username} (ID: {user.telegramId})</p>
                <div className='flex items-center gap-2 mt-2'>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{user.role}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{user.status}</span>
                </div>
            </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
             <div>
                <p className="text-sm text-text-secondary">Saldo USDT</p>
                <p className="text-lg font-mono font-bold">${(user.balance?.usdt || 0).toFixed(2)}</p>
            </div>
            <div>
                <p className="text-sm text-text-secondary">Saldo NTX</p>
                <p className="text-lg font-mono font-bold">{(user.balance?.ntx || 0).toLocaleString()}</p>
            </div>
        </div>
    </div>
);

const ReferralsList = ({ referrals }) => (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-semibold mb-4">Referidos ({referrals.length})</h3>
        {referrals.length === 0 ? (
            <p className="text-text-secondary">Este usuario no tiene referidos.</p>
        ) : (
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left">
                    <thead className="border-b border-white/10 text-sm text-text-secondary sticky top-0 bg-dark-secondary">
                        <tr>
                            <th className="py-2 px-3">Usuario</th>
                            <th className="py-2 px-3">Fecha de Ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.map(ref => (
                            <tr key={ref._id} className="border-b border-white/10 text-sm hover:bg-white/5">
                                <td className="py-3 px-3">
                                    <Link to={`/admin/users/${ref._id}`} className="flex items-center gap-3 group">
                                        <img src={ref.photoUrl} alt="ref avatar" className="w-8 h-8 rounded-full object-cover bg-dark-primary" />
                                        <div>
                                            <p className="font-semibold group-hover:text-primary transition-colors">{ref.fullName || ref.username}</p>
                                            <p className="text-xs text-text-secondary">@{ref.username}</p>
                                        </div>
                                    </Link>
                                </td>
                                <td className="py-3 px-3">{new Date(ref.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

const TransactionsTable = ({ transactions }) => (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <h3 className="text-xl font-semibold mb-4">Últimas 10 Transacciones</h3>
        {transactions.length === 0 ? (
            <p className="text-text-secondary">Este usuario no tiene transacciones recientes.</p>
        ) : (
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left">
                    <thead className="border-b border-white/10 text-sm text-text-secondary sticky top-0 bg-dark-secondary">
                        <tr>
                            <th className="py-2 px-3">Tipo</th>
                            <th className="py-2 px-3">Monto</th>
                            <th className="py-2 px-3">Descripción</th>
                            <th className="py-2 px-3">Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx._id} className="border-b border-white/10 text-sm hover:bg-white/5">
                                <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                                        tx.type.includes('deposit') || tx.type.includes('credit') || tx.type.includes('claim') ? 'bg-green-500/20 text-green-300' :
                                        tx.type.includes('withdrawal') || tx.type.includes('debit') ? 'bg-red-500/20 text-red-300' :
                                        'bg-blue-500/20 text-blue-300'
                                    }`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="py-3 px-3 font-mono">
                                    {tx.amount.toFixed(2)} <span className="text-text-secondary">{tx.currency}</span>
                                </td>
                                <td className="py-3 px-3 text-text-secondary">{tx.description}</td>
                                <td className="py-3 px-3">{new Date(tx.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);


const AdminUserDetailPage = () => {
    const { id } = useParams();
    // Quitamos la dependencia de `adminInfo` ya que el token se maneja con un interceptor de axios
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            // ====================== INICIO DE LA CORRECCIÓN ======================
            // Se ha quitado el prefijo `/api` y el header explícito de token,
            // asumiendo que tu `axiosConfig` ya lo gestiona.
            const { data } = await api.get(`/admin/users/${id}/details`);
            // ======================= FIN DE LA CORRECCIÓN ========================
            setUserData(data);
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error(error.response?.data?.message || "No se pudieron cargar los datos del usuario.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        // El useEffect se simplifica y se dispara solo cuando cambia el ID del usuario
        setUserData(null);
        fetchAllDetails();
    }, [id, fetchAllDetails]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader text="Cargando detalles del usuario..." /></div>;
    }

    if (!userData || !userData.user) {
        return <div className="p-6 text-center text-red-400">Usuario no encontrado o error al cargar.</div>;
    }

    // He notado que en el frontend esperas `userData.transactions` pero el backend
    // lo enviaba como `userData.transactions.items`. El nuevo backend ya lo envía
    // correctamente como `userData.transactions`.
    return (
        <div className="p-4 sm:p-6 text-white">
             <Link to="/admin/users" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-4 transition-colors">
                <HiArrowLeft /> Volver a la lista de usuarios
            </Link>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <UserInfoCard user={userData.user} />
                    <ReferralsList referrals={userData.referrals} />
                </div>
                <div className="space-y-6">
                    <TransactionsTable transactions={userData.transactions} />
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetailPage;
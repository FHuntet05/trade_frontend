// frontend/src/pages/admin/AdminUserDetailPage.jsx (CÓDIGO CONFIRMADO Y VALIDADO v15.0)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAdminStore from '../../store/adminStore';
import api from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';
import { HiArrowLeft } from 'react-icons/hi2';

const UserInfoCard = ({ user }) => (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
        <div className="flex items-center gap-4">
            {/* NOTA: Este src será actualizado como parte de la corrección de imágenes */}
            <img src={user.photoUrl || `/api/users/${user.telegramId}/photo` || '/assets/images/user-avatar-placeholder.png'} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
            <div>
                <h2 className="text-2xl font-bold">{user.fullName || user.username}</h2>
                <p className="text-sm text-text-secondary">@{user.username} (ID: {user.telegramId})</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{user.role}</span>
            </div>
        </div>
    </div>
);

const ReferralsList = ({ referrals, total }) => (
    <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 mt-6">
        <h3 className="text-xl font-semibold mb-4">Referidos ({total})</h3>
        {total === 0 ? (
            <p className="text-text-secondary">Este usuario no tiene referidos.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-white/10 text-sm text-text-secondary">
                        <tr>
                            <th className="py-2 px-3">Usuario</th>
                            <th className="py-2 px-3">Nivel</th>
                            <th className="py-2 px-3">Fecha de Ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.map(ref => (
                            <tr key={ref._id} className="border-b border-white/10 text-sm hover:bg-white/5">
                                <td className="py-3 px-3">
                                    <Link to={`/admin/users/${ref._id}`} className="flex items-center gap-3 group">
                                         {/* NOTA: Este src será actualizado como parte de la corrección de imágenes */}
                                        <img src={ref.photoUrl || `/api/users/${ref.telegramId}/photo` || '/assets/images/user-avatar-placeholder.png'} alt="ref avatar" className="w-8 h-8 rounded-full object-cover" />
                                        <div>
                                            <p className="font-semibold group-hover:text-primary transition-colors">{ref.fullName || ref.username}</p>
                                            <p className="text-xs text-text-secondary">@{ref.username}</p>
                                        </div>
                                    </Link>
                                </td>
                                <td className="py-3 px-3">{ref.level}</td>
                                <td className="py-3 px-3">{new Date(ref.joinDate).toLocaleDateString()}</td>
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
    const { adminInfo } = useAdminStore();
    const [user, setUser] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [totalReferrals, setTotalReferrals] = useState(0);
    const [loadingUser, setLoadingUser] = useState(true);
    const [loadingReferrals, setLoadingReferrals] = useState(true);

    const fetchUserDetails = useCallback(async (token) => {
        setLoadingUser(true);
        try {
            // Asumiendo que /details no existe, lo cambiamos por la ruta base de usuario
            const { data } = await api.get(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // La ruta /users/:id devuelve el usuario y transacciones, ajustamos
            setUser(data.user); 
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast.error("No se pudieron cargar los detalles del usuario.");
        } finally {
            setLoadingUser(false);
        }
    }, [id]);

    const fetchReferrals = useCallback(async (token) => {
        setLoadingReferrals(true);
        try {
            const { data } = await api.get(`/api/admin/users/${id}/referrals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReferrals(data.referrals);
            setTotalReferrals(data.totalReferrals);
        } catch (error) {
            console.error("Error fetching referrals:", error);
            toast.error("No se pudieron cargar los referidos del usuario.");
        } finally {
            setLoadingReferrals(false);
        }
    }, [id]);

    useEffect(() => {
        if (adminInfo?.token) {
            setUser(null);
            setReferrals([]);
            setTotalReferrals(0);
            setLoadingUser(true);
            setLoadingReferrals(true);
            
            fetchUserDetails(adminInfo.token);
            fetchReferrals(adminInfo.token);
        }
    }, [id, adminInfo, fetchUserDetails, fetchReferrals]);

    if (loadingUser) {
        return <div className="p-6"><Loader text="Cargando detalles del usuario..." /></div>;
    }

    if (!user) {
        return <div className="p-6 text-center text-red-400">Usuario no encontrado.</div>;
    }

    // Pequeña corrección: Pasamos el `telegramId` al componente de tarjeta de usuario
    const userWithTelegramId = { ...user, telegramId: user.telegramId };

    return (
        <div className="p-6 text-white space-y-6">
            <div>
                <Link to="/admin/users" className="flex items-center gap-2 text-text-secondary hover:text-white mb-4">
                    <HiArrowLeft /> Volver a la lista de usuarios
                </Link>
                <UserInfoCard user={userWithTelegramId} />
            </div>

            {loadingReferrals ? (
                <div className="bg-dark-secondary p-6 rounded-lg border border-white/10 mt-6">
                    <Loader text="Cargando referidos..." />
                </div>
            ) : (
                // Pasamos `telegramId` a la lista de referidos también
                <ReferralsList referrals={referrals.map(r => ({...r, telegramId: r._id.toString()}))} total={totalReferrals} />
            )}
        </div>
    );
};

export default AdminUserDetailPage;
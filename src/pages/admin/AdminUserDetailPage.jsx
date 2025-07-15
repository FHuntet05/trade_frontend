// frontend/src/pages/admin/AdminUserDetailPage.jsx (COMPLETO Y REFORZADO)
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
            <img src={user.photoUrl || '/assets/images/user-avatar-placeholder.png'} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
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
                            <th className="py-2">Usuario</th>
                            <th className="py-2">Nivel</th>
                            <th className="py-2">Fecha de Ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referrals.map(ref => (
                            <tr key={ref._id} className="border-b border-white/10 text-sm">
                                <td className="py-3 flex items-center gap-3">
                                    <img src={ref.photoUrl || '/assets/images/user-avatar-placeholder.png'} alt="ref avatar" className="w-8 h-8 rounded-full object-cover" />
                                    <div>
                                        <p className="font-semibold">{ref.fullName || ref.username}</p>
                                        <p className="text-xs text-text-secondary">@{ref.username}</p>
                                    </div>
                                </td>
                                <td className="py-3">{ref.level}</td>
                                <td className="py-3">{new Date(ref.joinDate).toLocaleDateString()}</td>
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
            const { data } = await api.get(`/api/admin/users/${id}/details`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(data.user);
        } catch (error) {
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
            toast.error("No se pudieron cargar los referidos del usuario.");
        } finally {
            setLoadingReferrals(false);
        }
    }, [id]);

    useEffect(() => {
        if (adminInfo?.token) {
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

    return (
        <div className="p-6 text-white space-y-6">
            <div>
                <Link to="/admin/users" className="flex items-center gap-2 text-text-secondary hover:text-white mb-4">
                    <HiArrowLeft /> Volver a la lista de usuarios
                </Link>
                <UserInfoCard user={user} />
            </div>

            {loadingReferrals ? (
                <Loader text="Cargando referidos..." />
            ) : (
                <ReferralsList referrals={referrals} total={totalReferrals} />
            )}
        </div>
    );
};

export default AdminUserDetailPage;
// RUTA: frontend/src/pages/admin/AdminUserDetailPage.jsx (VERSIÓN FINAL CON MODALES INTEGRADOS)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import useAdminStore from '@/store/adminStore';
import Loader from '@/components/common/Loader';
import { 
    HiArrowLeft, HiOutlinePencil, HiOutlineKey, HiOutlineCurrencyDollar,
    HiOutlineShoppingCart, HiOutlineGift, HiOutlineUsers, HiOutlineReceiptRefund 
} from 'react-icons/hi2';
import EditUserModal from './components/EditUserModal';
import ResetPasswordModal from './components/ResetPasswordModal';

const PLACEHOLDER_AVATAR = 'https://i.postimg.cc/mD21B6r7/user-avatar-placeholder.png';

const UserSummaryCard = ({ user, onEdit, onResetPassword }) => {
    const totalStock = user.activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);

    return (
        <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <img src={user.photoUrl || PLACEHOLDER_AVATAR} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-dark-primary" />
                    <div>
                        <h2 className="text-2xl font-bold">{user.fullName || user.username}</h2>
                        <p className="text-sm text-text-secondary">@{user.username} (ID: {user.telegramId})</p>
                        <div className='flex items-center gap-2 mt-2'>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{user.role}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{user.status}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {user.role === 'admin' && <button onClick={onResetPassword} className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/40" title="Resetear Contraseña"><HiOutlineKey className="w-5 h-5 text-yellow-300" /></button>}
                    <button onClick={onEdit} className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40" title="Editar Usuario y Saldos"><HiOutlinePencil className="w-5 h-5 text-blue-300" /></button>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-4">
                <div><p className="text-sm text-text-secondary">Saldo Stock</p><p className="text-lg font-mono font-bold">${totalStock.toFixed(2)}</p></div>
                <div><p className="text-sm text-text-secondary">Saldo Retirable</p><p className="text-lg font-mono font-bold">${(user.withdrawableBalance ?? 0).toFixed(2)}</p></div>
                <div><p className="text-sm text-text-secondary">Balance (USDT)</p><p className="text-lg font-mono font-bold">${(user.balance?.usdt ?? 0).toFixed(2)}</p></div>
                <div><p className="text-sm text-text-secondary">Giros Ruleta</p><p className="text-lg font-mono font-bold">{user.balance?.spins ?? 0}</p></div>
            </div>
        </div>
    );
};

const TransactionHistoryTable = ({ transactions, title }) => (
    <div className="bg-dark-secondary p-4 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-3 px-2">{title}</h3>
        <div className="overflow-y-auto max-h-96">
            <table className="w-full text-left text-sm">
                <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary sticky top-0">
                    <tr>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Descripción</th>
                        <th className="p-3 text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {transactions.length === 0 ? (
                        <tr><td colSpan="3" className="p-4 text-center text-text-secondary">No hay registros.</td></tr>
                    ) : (
                        transactions.map(tx => (
                            <tr key={tx._id} className="hover:bg-dark-tertiary/50">
                                <td className="p-3 whitespace-nowrap">{new Date(tx.createdAt).toLocaleString()}</td>
                                <td className="p-3">{tx.description}</td>
                                <td className={`p-3 text-right font-mono ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.amount.toFixed(2)} {tx.currency}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const InvestmentsTab = ({ user }) => {
    const marketPurchases = user.transactions.filter(tx => tx.type === 'market_purchase');
    const quantitativePurchases = user.transactions.filter(tx => tx.type === 'purchase');
    const profitTransactions = user.transactions.filter(tx => tx.type.includes('profit'));
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TransactionHistoryTable transactions={marketPurchases} title="Historial de Compras (Mercado)" />
            <TransactionHistoryTable transactions={quantitativePurchases} title="Historial de Compras (Cuantitativo)" />
            <div className="md:col-span-2">
                <TransactionHistoryTable transactions={profitTransactions} title="Historial de Ganancias por Inversión" />
            </div>
        </div>
    );
};

const WheelTab = ({ user }) => {
    const wheelSpins = user.transactions.filter(tx => tx.type === 'wheel_spin_win');
    const totalWheelGains = wheelSpins.reduce((sum, spin) => spin.currency === 'USDT' ? sum + spin.amount : sum, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-dark-secondary p-4 rounded-lg"><p className="text-sm text-text-secondary">Giros Disponibles</p><p className="text-2xl font-bold">{user.balance?.spins ?? 0}</p></div>
                <div className="bg-dark-secondary p-4 rounded-lg"><p className="text-sm text-text-secondary">Total Giros Realizados</p><p className="text-2xl font-bold">{wheelSpins.length}</p></div>
                <div className="bg-dark-secondary p-4 rounded-lg"><p className="text-sm text-text-secondary">Ganancia Total (USDT)</p><p className="text-2xl font-bold">${totalWheelGains.toFixed(2)}</p></div>
            </div>
            <TransactionHistoryTable transactions={wheelSpins} title="Historial de Premios de la Ruleta" />
        </div>
    );
};

const TeamTab = ({ user, referrals }) => (
    <div className="bg-dark-secondary p-4 rounded-lg border border-white/10">
        <h3 className="text-lg font-semibold mb-3 px-2">Equipo y Referidos</h3>
        <p className="px-2 mb-4 text-text-secondary">Referido por: {user.referredBy?.username || 'Nadie'}</p>
        <div className="overflow-y-auto max-h-96">
            <table className="w-full text-left text-sm">
                 <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary sticky top-0">
                    <tr><th className="p-3">Username</th><th className="p-3">Nombre Completo</th><th className="p-3">Nivel</th></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {referrals.length === 0 ? (
                        <tr><td colSpan="3" className="p-4 text-center text-text-secondary">No tiene referidos.</td></tr>
                    ) : (
                        referrals.map(ref => (
                            <tr key={ref._id} className="hover:bg-dark-tertiary/50">
                                <td className="p-3">@{ref.username}</td>
                                <td className="p-3">{ref.fullName}</td>
                                <td className="p-3 text-center">{ref.level}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const AdminUserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);

    const isSuperAdmin = useAdminStore((state) => state.isSuperAdmin());

    const fetchAllDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await adminApi.get(`/admin/users/${id}`);
            setUserData(data);
        } catch (error) { 
            toast.error(error.response?.data?.message || "No se pudieron cargar los datos del usuario."); 
            navigate('/admin/users');
        } finally { setIsLoading(false); }
    }, [id, navigate]);

    useEffect(() => {
        fetchAllDetails();
    }, [fetchAllDetails]);

    const handleSaveUser = async (userId, formData) => {
        setIsEditModalOpen(false);
        const { usdtAdjustment, spinsAdjustment, adjustmentReason, ...profileData } = formData;

        // 1. Actualizar el perfil del usuario
        await toast.promise(adminApi.put(`/admin/users/${userId}`, profileData), {
            loading: 'Actualizando perfil...',
            success: 'Perfil actualizado correctamente.',
            error: (err) => err.response?.data?.message || 'Error al actualizar el perfil.',
        });

        // 2. Si hay ajustes de saldo, hacer la segunda llamada a la API
        const hasAdjustment = usdtAdjustment !== 0 || spinsAdjustment !== 0;
        if (hasAdjustment) {
            if (!adjustmentReason) {
                toast.error("Se requiere una razón para realizar un ajuste de saldo.");
                fetchAllDetails(); // Recargar para deshacer cambios visuales no guardados
                return;
            }
            
            await toast.promise(adminApi.post(`/admin/users/${userId}/adjust-balance`, {
                usdt: usdtAdjustment,
                spins: spinsAdjustment,
                reason: adjustmentReason
            }), {
                loading: 'Aplicando ajuste de saldo...',
                success: 'Ajuste de saldo aplicado con éxito.',
                error: (err) => err.response?.data?.message || 'Error al ajustar el saldo.',
            });
        }
        
        fetchAllDetails(); // Recargar todos los datos al final
    };
    
    const handleResetPassword = async (adminId) => {
        const promise = adminApi.post(`/admin/users/${adminId}/reset-password`);

        toast.promise(promise, {
            loading: 'Reseteando contraseña...',
            success: (res) => {
                setIsResetPasswordModalOpen(false);
                window.prompt('Copia la nueva contraseña temporal. No se mostrará de nuevo:', res.data.temporaryPassword);
                fetchAllDetails();
                return 'Contraseña reseteada con éxito.';
            },
            error: (err) => err.response?.data?.message || 'Error al resetear la contraseña.',
        });
    };

    const filteredTransactions = useMemo(() => {
        if (!userData?.user?.transactions) return {};
        return {
            deposits: userData.user.transactions.filter(tx => tx.type === 'deposit'),
            withdrawals: userData.user.transactions.filter(tx => tx.type === 'withdrawal'),
        };
    }, [userData]);

    if (isLoading || !userData) return <div className="flex justify-center items-center h-screen"><Loader text="Cargando perfil..." /></div>;
    
    const { user, referrals } = userData;

    const tabs = [
        { name: 'Inversiones', icon: HiOutlineShoppingCart },
        { name: 'Ruleta', icon: HiOutlineGift },
        { name: 'Depósitos/Retiros', icon: HiOutlineCurrencyDollar },
        { name: 'Equipo', icon: HiOutlineUsers },
        { name: 'Actividad General', icon: HiOutlineReceiptRefund }
    ];

    return (
        <div className="space-y-6">
            <Link to="/admin/users" className="inline-flex items-center gap-2 text-text-secondary hover:text-white"><HiArrowLeft /> Volver a usuarios</Link>
            
            <UserSummaryCard 
                user={user}
                onEdit={() => setIsEditModalOpen(true)}
                onResetPassword={() => setIsResetPasswordModalOpen(true)}
            />

            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                <Tab.List className="flex space-x-1 rounded-xl bg-dark-secondary p-1">
                    {tabs.map((tab) => (
                        <Tab key={tab.name} className={({ selected }) => `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${selected ? 'bg-accent text-white shadow' : 'text-text-secondary hover:bg-white/[0.12] hover:text-white'}`}>
                            <tab.icon className="w-5 h-5 inline-block mr-2" />
                            {tab.name}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    <Tab.Panel><InvestmentsTab user={user} /></Tab.Panel>
                    <Tab.Panel><WheelTab user={user} /></Tab.Panel>
                    <Tab.Panel className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TransactionHistoryTable transactions={filteredTransactions.deposits} title="Historial de Depósitos" />
                        <TransactionHistoryTable transactions={filteredTransactions.withdrawals} title="Historial de Retiros" />
                    </Tab.Panel>
                    <Tab.Panel><TeamTab user={user} referrals={referrals || []} /></Tab.Panel>
                    <Tab.Panel>
                        <TransactionHistoryTable transactions={user.transactions} title="Todas las Transacciones" />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
            
            {isEditModalOpen && <EditUserModal user={user} onSave={handleSaveUser} onClose={() => setIsEditModalOpen(false)} isSuperAdmin={isSuperAdmin} />}
            {isResetPasswordModalOpen && <ResetPasswordModal user={user} onClose={() => setIsResetPasswordModalOpen(false)} onConfirm={handleResetPassword} />}
        </div>
    );
};

export default AdminUserDetailPage;
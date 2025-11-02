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
    HiOutlineShoppingCart, HiOutlineGift, HiOutlineUsers, HiOutlineReceiptRefund,
    HiOutlineTicket, HiOutlineChartBar, HiOutlineXCircle
} from 'react-icons/hi2';
import EditUserModal from './components/EditUserModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import TelegramAvatar from '@/components/common/TelegramAvatar';

const PLACEHOLDER_AVATAR = 'https://i.postimg.cc/mD21B6r7/user-avatar-placeholder.png';
const ADMIN_OPEN_TICKET_STATUSES = ['pending', 'awaiting_manual_review', 'processing'];
const TICKET_STATUS_LABELS = {
    pending: 'Pendiente',
    awaiting_manual_review: 'En revisión manual',
    processing: 'En proceso',
    completed: 'Completado',
    expired: 'Expirado',
    cancelled: 'Cancelado',
    rejected: 'Rechazado'
};
const TICKET_STATUS_STYLES = {
    pending: 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/30',
    awaiting_manual_review: 'bg-blue-500/10 text-blue-200 border border-blue-500/30',
    processing: 'bg-blue-500/10 text-blue-200 border border-blue-500/30',
    completed: 'bg-green-500/10 text-green-200 border border-green-500/30',
    expired: 'bg-red-500/10 text-red-200 border border-red-500/30',
    cancelled: 'bg-red-500/10 text-red-200 border border-red-500/30',
    rejected: 'bg-red-500/10 text-red-200 border border-red-500/30'
};

const computeTicketStatsClient = (tickets = []) => {
    return tickets.reduce((stats, ticket) => {
        const amount = Number(ticket.amount || 0);
        stats.total += 1;
        stats.totalAmount += amount;

        if (ADMIN_OPEN_TICKET_STATUSES.includes(ticket.status)) {
            stats.open += 1;
        }

        if (ticket.status === 'completed') {
            stats.completed += 1;
            stats.completedAmount += amount;
        }

        if (['cancelled', 'expired', 'rejected'].includes(ticket.status)) {
            stats.closed += 1;
        }

        return stats;
    }, {
        total: 0,
        totalAmount: 0,
        open: 0,
        closed: 0,
        completed: 0,
        completedAmount: 0
    });
};

const UserSummaryCard = ({ user, onEdit, onResetPassword, ticketStats, passiveIncome, investmentSummary }) => {
    const totalStock = (user.activeInvestments || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const openTickets = ticketStats?.open ?? 0;
    const completedTickets = ticketStats?.completed ?? 0;
    const closedTickets = ticketStats?.closed ?? 0;
    const passiveDaily = passiveIncome?.isEnabled ? passiveIncome.dailyAmount || 0 : 0;
    const passivePercentage = passiveIncome?.isEnabled ? passiveIncome.percentage || 0 : 0;
    const investmentDaily = investmentSummary?.totals?.dailyProfit?.total || 0;
    const marketDaily = investmentSummary?.totals?.dailyProfit?.market || 0;
    const quantitativeDaily = investmentSummary?.totals?.dailyProfit?.quantitative || 0;

    return (
        <div className="bg-dark-secondary p-6 rounded-lg border border-white/10">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <TelegramAvatar
                        telegramId={user.telegramId}
                        photoUrl={user.photoUrl}
                        alt={user.fullName || user.username || 'Avatar'}
                        className="w-20 h-20 rounded-full object-cover bg-dark-primary"
                        fallbackSrc={PLACEHOLDER_AVATAR}
                    />
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
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 border-t border-white/10 pt-4">
                <div>
                    <p className="text-sm text-text-secondary">Saldo Stock</p>
                    <p className="text-lg font-mono font-bold">${totalStock.toFixed(2)}</p>
                    <p className="text-xs text-text-tertiary">Capital invertido actualmente</p>
                </div>
                <div>
                    <p className="text-sm text-text-secondary">Saldo Retirable</p>
                    <p className="text-lg font-mono font-bold">${(user.withdrawableBalance ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-text-tertiary">Disponible para retiro inmediato</p>
                </div>
                <div>
                    <p className="text-sm text-text-secondary">Balance (USDT)</p>
                    <p className="text-lg font-mono font-bold">${(user.balance?.usdt ?? 0).toFixed(2)}</p>
                    <p className="text-xs text-text-tertiary">Saldo base que genera pasivo</p>
                </div>
                <div>
                    <p className="text-sm text-text-secondary">Giros Ruleta</p>
                    <p className="text-lg font-mono font-bold">{user.balance?.spins ?? 0}</p>
                    <p className="text-xs text-text-tertiary">Balance de giros disponibles</p>
                </div>
                <div>
                    <p className="text-sm text-text-secondary">Tickets abiertos</p>
                    <p className="text-lg font-mono font-bold flex items-center gap-2">
                        <HiOutlineTicket className="w-5 h-5 text-yellow-300" /> {openTickets}
                    </p>
                    <p className="text-xs text-text-tertiary">Completados: {completedTickets} · Cerrados: {closedTickets}</p>
                </div>
                <div>
                    <p className="text-sm text-text-secondary">Ingresos diarios</p>
                    <p className="text-lg font-mono font-bold flex items-center gap-2">
                        <HiOutlineChartBar className="w-5 h-5 text-emerald-300" /> {(passiveDaily + investmentDaily).toFixed(2)} USDT
                    </p>
                    {passiveIncome?.isEnabled ? (
                        <p className="text-xs text-text-tertiary">Pasivo: {passiveDaily.toFixed(2)} USDT ({passivePercentage.toFixed(2)}%)</p>
                    ) : (
                        <p className="text-xs text-text-tertiary">Pasivo desactivado</p>
                    )}
                    <p className="text-xs text-text-tertiary">Inversiones · Mercado: {marketDaily.toFixed(2)} • Cuant: {quantitativeDaily.toFixed(2)}</p>
                </div>
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

const DepositTicketsCard = ({ tickets = [], stats, onCancel, cancellingTicketId }) => {
    return (
        <div className="bg-dark-secondary p-5 rounded-lg border border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Tickets de depósito</h3>
                    <p className="text-xs text-text-tertiary">Abiertos: {stats?.open ?? 0} · Completados: {stats?.completed ?? 0} · Cerrados: {stats?.closed ?? 0}</p>
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className="bg-dark-tertiary/60 border border-white/5 rounded-md p-4 text-sm text-text-secondary text-center">
                    Este usuario no tiene tickets registrados.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="text-xs uppercase text-text-secondary bg-dark-tertiary">
                            <tr>
                                <th className="p-3 text-left">Ticket</th>
                                <th className="p-3 text-left">Método</th>
                                <th className="p-3 text-left">Monto</th>
                                <th className="p-3 text-left">Estado</th>
                                <th className="p-3 text-left">Creado</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {tickets.map((ticket) => {
                                const statusStyle = TICKET_STATUS_STYLES[ticket.status] || 'bg-white/5 text-white';
                                const statusLabel = TICKET_STATUS_LABELS[ticket.status] || ticket.status;
                                const cancellable = ADMIN_OPEN_TICKET_STATUSES.includes(ticket.status);

                                return (
                                    <tr key={ticket.ticketId} className="hover:bg-dark-tertiary/40">
                                        <td className="p-3 font-mono text-xs">{ticket.ticketId.slice(-8)}</td>
                                        <td className="p-3">
                                            <p className="text-white font-medium">{ticket.methodName || ticket.methodKey || 'Sin nombre'}</p>
                                            <p className="text-xs text-text-tertiary">{ticket.methodType === 'manual' ? 'Manual' : 'Automático'}{ticket.chain ? ` · ${ticket.chain}` : ''}</p>
                                        </td>
                                        <td className="p-3">
                                            <p className="text-white font-semibold">{Number(ticket.amount || 0).toFixed(2)} {ticket.currency}</p>
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusStyle}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td className="p-3 text-white text-xs">{new Date(ticket.createdAt).toLocaleString()}</td>
                                        <td className="p-3 text-right">
                                            {cancellable ? (
                                                <button
                                                    onClick={() => onCancel(ticket.ticketId)}
                                                    disabled={cancellingTicketId === ticket.ticketId}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-300 hover:text-red-100 transition disabled:opacity-60"
                                                >
                                                    <HiOutlineXCircle className="w-4 h-4" />
                                                    {cancellingTicketId === ticket.ticketId ? 'Cancelando...' : 'Cancelar'}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-text-tertiary">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const InvestmentsTab = ({ summary }) => {
    const marketPurchases = summary?.marketPurchases ?? [];
    const quantitativePurchases = summary?.quantitativePurchases ?? [];
    const profitTransactions = summary?.profitTransactions ?? [];
    const passiveProfitTransactions = summary?.passiveProfitTransactions ?? [];
    const totals = summary?.totals ?? {};

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-dark-secondary rounded-lg border border-white/10 p-4">
                    <p className="text-xs uppercase text-text-secondary">Capital activo (Mercado)</p>
                    <p className="text-2xl font-mono font-bold text-white">{(totals.activeCapital?.market ?? 0).toFixed(2)} USDT</p>
                    <p className="text-xs text-text-tertiary">Rendimiento diario: {(totals.dailyProfit?.market ?? 0).toFixed(2)} USDT</p>
                </div>
                <div className="bg-dark-secondary rounded-lg border border-white/10 p-4">
                    <p className="text-xs uppercase text-text-secondary">Capital activo (Cuant)</p>
                    <p className="text-2xl font-mono font-bold text-white">{(totals.activeCapital?.quantitative ?? 0).toFixed(2)} USDT</p>
                    <p className="text-xs text-text-tertiary">Rendimiento diario: {(totals.dailyProfit?.quantitative ?? 0).toFixed(2)} USDT</p>
                </div>
                <div className="bg-dark-secondary rounded-lg border border-white/10 p-4">
                    <p className="text-xs uppercase text-text-secondary">Total inversiones activas</p>
                    <p className="text-2xl font-mono font-bold text-white">{(totals.activeCapital?.total ?? 0).toFixed(2)} USDT</p>
                    <p className="text-xs text-text-tertiary">Rendimiento diario combinado: {(totals.dailyProfit?.total ?? 0).toFixed(2)} USDT</p>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Compras de mercado</h3>
                {marketPurchases.length === 0 ? (
                    <p className="text-xs text-text-secondary bg-dark-tertiary/60 border border-white/5 rounded-lg px-3 py-3">
                        No se registran compras de mercado.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {marketPurchases.map((item) => (
                            <div key={item.id} className="p-4 rounded-lg bg-dark-secondary border border-white/10 text-sm space-y-1">
                                <div className="flex justify-between text-white font-medium">
                                    <span>{item.name}</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-text-secondary">Monto invertido: {item.invested.toFixed(2)} USDT</p>
                                <p className="text-xs text-text-secondary">Ganancia diaria estimada: {item.dailyProfit.toFixed(2)} USDT</p>
                                <p className="text-xs text-text-secondary">Retorno estimado en {item.durationDays} días: {(item.invested + item.expectedReturn).toFixed(2)} USDT</p>
                                <p className="text-[11px] text-text-tertiary">Estado: {item.isActive ? 'Activo' : item.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Planes cuantitativos</h3>
                {quantitativePurchases.length === 0 ? (
                    <p className="text-xs text-text-secondary bg-dark-tertiary/60 border border-white/5 rounded-lg px-3 py-3">
                        Aún no hay registros de planes cuantitativos.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {quantitativePurchases.map((item) => (
                            <div key={item.id} className="p-4 rounded-lg bg-dark-secondary border border-white/10 text-sm space-y-1">
                                <div className="flex justify-between text-white font-medium">
                                    <span>{item.name}</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-text-secondary">Monto invertido: {item.invested.toFixed(2)} USDT</p>
                                {item.dailyProfit !== null ? (
                                    <p className="text-xs text-text-secondary">Distribución diaria actual: {item.dailyProfit.toFixed(2)} USDT</p>
                                ) : (
                                    <p className="text-xs text-text-tertiary">Plan finalizado o sin distribución activa.</p>
                                )}
                                {item.endDate && (
                                    <p className="text-xs text-text-tertiary">Finaliza: {new Date(item.endDate).toLocaleDateString()}</p>
                                )}
                                <p className="text-[11px] text-text-tertiary">Estado: {item.isActive ? 'Activo' : item.status}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TransactionHistoryTable transactions={profitTransactions} title="Historial de ganancias y retornos" />

            {passiveProfitTransactions.length > 0 && (
                <TransactionHistoryTable transactions={passiveProfitTransactions} title="Ganancias pasivas por saldo" />
            )}
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
    const [cancellingTicketId, setCancellingTicketId] = useState(null);

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

    const handleCancelTicket = async (ticketId) => {
        if (!userData?.user?._id) {
            return;
        }

        setCancellingTicketId(ticketId);

        try {
            const { data } = await adminApi.put(`/admin/users/${userData.user._id}/deposit-tickets/${ticketId}/cancel`);
            toast.success(data?.message || 'Ticket cancelado.');

            const updatedTicket = data?.data;
            setUserData((prev) => {
                if (!prev) {
                    return prev;
                }
                const updatedTickets = (prev.depositTickets || []).map((ticket) =>
                    ticket.ticketId === ticketId ? updatedTicket : ticket
                );
                return {
                    ...prev,
                    depositTickets: updatedTickets,
                    ticketStats: computeTicketStatsClient(updatedTickets)
                };
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'No se pudo cancelar el ticket.');
        } finally {
            setCancellingTicketId(null);
        }
    };

    const filteredTransactions = useMemo(() => {
        const source = userData?.transactions?.items || userData?.user?.transactions || [];
        return {
            deposits: source.filter((tx) => tx.type === 'deposit'),
            withdrawals: source.filter((tx) => tx.type === 'withdrawal'),
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
                ticketStats={userData.ticketStats}
                passiveIncome={userData.passiveIncome}
                investmentSummary={userData.investmentSummary}
            />

            <DepositTicketsCard 
                tickets={userData.depositTickets}
                stats={userData.ticketStats}
                onCancel={handleCancelTicket}
                cancellingTicketId={cancellingTicketId}
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
                    <Tab.Panel><InvestmentsTab summary={userData.investmentSummary} /></Tab.Panel>
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
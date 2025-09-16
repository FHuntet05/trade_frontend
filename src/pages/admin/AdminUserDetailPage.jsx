// RUTA: frontend/src/pages/admin/AdminUserDetailPage.jsx (VERSIÓN "NEXUS - PROPS FIX")
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminApi from '@/pages/admin/api/adminApi';
import toast from 'react-hot-toast';
import useAdminStore from '@/store/adminStore'; // <-- 1. Importar el store
import Loader from '@/components/common/Loader';
import { HiArrowLeft, HiOutlinePencil, HiOutlinePlusCircle } from 'react-icons/hi2';
import EditUserModal from './components/EditUserModal';
import AdjustBalanceModal from './components/AdjustBalanceModal';

// --- (Componentes internos UserInfoCard, UserWalletsCard, TransactionsTable no cambian) ---
const UserInfoCard = ({ user, onEdit, onAdjustBalance }) => ( <div className="bg-dark-secondary p-6 rounded-lg border border-white/10"> <div className="flex justify-between items-start"> <div className="flex items-center gap-4"> <img src={user.photoUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-dark-primary" /> <div> <h2 className="text-2xl font-bold">{user.fullName || user.username}</h2> <p className="text-sm text-text-secondary">@{user.username} (ID: {user.telegramId})</p> <div className='flex items-center gap-2 mt-2'> <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>{user.role}</span> <span className={`px-2 py-0.5 text-xs rounded-full ${user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{user.status}</span> </div> </div> </div> <div className="flex gap-2"> <button onClick={onAdjustBalance} className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/40" title="Ajustar Saldo"><HiOutlinePlusCircle className="w-5 h-5 text-green-300" /></button> <button onClick={onEdit} className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40" title="Editar Usuario"><HiOutlinePencil className="w-5 h-5 text-blue-300" /></button> </div> </div> <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/10 pt-4"> <div><p className="text-sm text-text-secondary">Saldo USDT</p><p className="text-lg font-mono font-bold">${(user.balance?.usdt || 0).toFixed(2)}</p></div> <div><p className="text-sm text-text-secondary">Saldo NTX</p><p className="text-lg font-mono font-bold">{(user.balance?.ntx || 0).toLocaleString()}</p></div> </div> </div> );
const UserWalletsCard = ({ wallets }) => ( <div className="bg-dark-secondary p-6 rounded-lg border border-white/10"> <h3 className="text-xl font-semibold mb-4">Wallets de Depósito</h3> {wallets.length === 0 ? <p className="text-text-secondary">El usuario aún no tiene wallets generadas.</p> : ( <div className="space-y-2"> {wallets.map(w => ( <div key={w._id} className="font-mono text-sm p-2 bg-dark-primary rounded-md"> <span className={`font-bold ${w.chain === 'BSC' ? 'text-yellow-400' : 'text-red-400'}`}>{w.chain}:</span> {w.address} </div> ))} </div> )} </div> );
const TransactionsTable = ({ userId, initialTransactions }) => { const [transactions, setTransactions] = useState(initialTransactions || { items: [], page: 1, totalPages: 1 }); const [isLoading, setIsLoading] = useState(false); const fetchTransactionsPage = useCallback(async (page = 1) => { setIsLoading(true); try { const { data } = await adminApi.get(`/admin/users/${userId}`, { params: { page } }); setTransactions(data.transactions); } catch (error) { toast.error("No se pudieron cargar las transacciones."); } finally { setIsLoading(false); } }, [userId]); return ( <div className="bg-dark-secondary p-6 rounded-lg border border-white/10"> <h3 className="text-xl font-semibold mb-4">Historial de Transacciones</h3> {isLoading && <div className="flex justify-center p-4"><Loader /></div>} {!isLoading && transactions.items.length === 0 ? <p className="text-text-secondary text-center py-4">No hay transacciones.</p> : ( <> <div className="overflow-x-auto"> <table className="w-full text-left"> <thead className="text-xs text-text-secondary uppercase bg-dark-tertiary"> <tr> <th className="p-3">Fecha</th> <th className="p-3">Tipo</th> <th className="p-3">Monto</th> <th className="p-3">Descripción</th> </tr> </thead> <tbody> {transactions.items.map(tx => ( <tr key={tx._id} className="hover:bg-dark-tertiary border-b border-white/10"> <td className="p-3 text-sm">{new Date(tx.createdAt).toLocaleString()}</td> <td className="p-3 text-sm">{tx.type}</td> <td className={`p-3 text-sm font-mono ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{tx.amount.toFixed(2)} {tx.currency}</td> <td className="p-3 text-sm text-text-secondary">{tx.description}</td> </tr> ))} </tbody> </table> </div> <div className="flex justify-between items-center mt-4 text-sm"> <button onClick={() => fetchTransactionsPage(transactions.page - 1)} disabled={transactions.page <= 1} className="px-3 py-1 rounded bg-dark-tertiary disabled:opacity-50">Anterior</button> <span>Página {transactions.page} de {transactions.totalPages}</span> <button onClick={() => fetchTransactionsPage(transactions.page + 1)} disabled={transactions.page >= transactions.totalPages} className="px-3 py-1 rounded bg-dark-tertiary disabled:opacity-50">Siguiente</button> </div> </> )} </div> ); };

const AdminUserDetailPage = () => {
    const { id } = useParams();
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

    // [NEXUS PROPS FIX] - 2. Obtenemos la función de verificación del store.
    const isSuperAdmin = useAdminStore((state) => state.isSuperAdmin());

    const fetchAllDetails = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await adminApi.get(`/admin/users/${id}`);
            setUserData(data);
        } catch (error) { 
            toast.error(error.response?.data?.message || "No se pudieron cargar los datos del usuario."); 
        }
        finally { setIsLoading(false); }
    }, [id]);

    useEffect(() => {
        fetchAllDetails();
    }, [fetchAllDetails]);

    const handleSaveUser = async (userId, formData) => {
        const promise = adminApi.put(`/admin/users/${userId}`, formData);
        toast.promise(promise, {
            loading: 'Guardando...',
            success: () => { setIsEditModalOpen(false); fetchAllDetails(); return 'Usuario actualizado.'; },
            error: 'No se pudo actualizar.'
        });
    };

    const handleAdjustBalance = async (userId, formData) => {
        const promise = adminApi.post(`/admin/users/adjust-balance/${userId}`, formData);
        toast.promise(promise, {
            loading: 'Procesando ajuste...',
            success: () => { setIsAdjustModalOpen(false); fetchAllDetails(); return 'Saldo ajustado.'; },
            error: (err) => err.response?.data?.message || 'No se pudo ajustar el saldo.'
        });
    };

    if (isLoading) return <div className="flex justify-center items-center h-full"><Loader text="Cargando perfil..." /></div>;
    if (!userData) return <div className="p-6 text-center text-red-400">Usuario no encontrado.</div>;
    
    return (
        <div className="p-4 sm:p-6 text-white">
            <Link to="/admin/users" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-4"><HiArrowLeft /> Volver a usuarios</Link>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <UserInfoCard user={userData.user} onEdit={() => setIsEditModalOpen(true)} onAdjustBalance={() => setIsAdjustModalOpen(true)} />
                    <UserWalletsCard wallets={userData.cryptoWallets} />
                </div>
                <TransactionsTable userId={id} initialTransactions={userData.transactions} />
            </div>
            
            {isEditModalOpen && 
                <EditUserModal 
                    user={userData.user} 
                    onSave={handleSaveUser} 
                    onClose={() => setIsEditModalOpen(false)} 
                    // [NEXUS PROPS FIX] - 3. Pasamos el resultado de la verificación como prop al modal.
                    isSuperAdmin={isSuperAdmin}
                />
            }
            {isAdjustModalOpen && <AdjustBalanceModal user={userData.user} onSave={handleAdjustBalance} onClose={() => setIsAdjustModalOpen(false)} />}
        </div>
    );
};

export default AdminUserDetailPage;
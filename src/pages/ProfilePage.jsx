// RUTA: frontend/src/pages/ProfilePage.jsx (VERSIÓN "NEXUS - DIRECT DEPOSIT FLOW")

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/userStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
    HiOutlineArrowDownOnSquare, HiOutlineArrowUpOnSquare, HiOutlineRectangleStack, 
    HiOutlineWallet, HiOutlineUserGroup, HiOutlineQuestionMarkCircle, HiOutlineInformationCircle, 
    HiOutlineChatBubbleLeftRight, HiOutlineLanguage, HiOutlineArrowRightOnRectangle,
    HiChevronRight, HiOutlineKey
} from 'react-icons/hi2';

import Loader from '../components/common/Loader';
// [NEXUS DIRECT DEPOSIT] - Se eliminan imports de modales que ya no se usan en este flujo.
// import WithdrawalModal from '../components/modals/WithdrawalModal';
// import SetWithdrawalPasswordModal from '../components/modals/SetWithdrawalPasswordModal';
// import SaveWalletModal from '../components/modals/SaveWalletModal'; 

const StatCard = ({ label, value }) => ( <div className="flex-1 text-center"> <p className="text-2xl font-bold text-text-primary">{value.toFixed(2)}</p> <p className="text-xs text-text-secondary uppercase tracking-wider mt-1">{label}</p> </div> );
const ActionCard = ({ icon: Icon, label, onClick }) => ( <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-dark-secondary/70 backdrop-blur-md rounded-2xl border border-white/10 text-center hover:border-accent-start/50 transition-colors duration-200 active:bg-accent-start/10 aspect-square"> <Icon className="w-12 h-12 mb-2 text-accent-start" /> <span className="text-sm font-semibold text-text-primary">{label}</span> </button> );
const ActionRow = ({ icon: Icon, label, onClick }) => ( <button onClick={onClick} className="w-full flex items-center p-4 bg-dark-secondary/70 backdrop-blur-md rounded-2xl border border-white/10 text-left hover:border-accent-start/50 transition-colors duration-200 active:bg-accent-start/10"> <Icon className="w-6 h-6 mr-4 text-text-secondary" /> <span className="flex-grow text-base font-semibold text-text-primary">{label}</span> <HiChevronRight className="w-5 h-5 text-gray-500" /> </button> );

const ProfilePage = () => {
    const { user, logout } = useUserStore();
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    // [NEXUS DIRECT DEPOSIT] - Se simplifica la gestión de modales, ya que el de depósito se elimina.
    // const [modalState, setModalState] = React.useState({ ... });
    // const openModal = (modalName) => ...;
    // const closeModal = (modalName) => ...;
    
    const handleWithdrawClick = () => {
        // La lógica de retiro (que sí usa modales) se mantiene.
        toast.error('La función de retiro no está disponible en esta versión.');
    };
    
    if (!user) { return <div className="h-full w-full flex items-center justify-center pt-16"><Loader /></div>; }

    const mainActions = [
        // [NEXUS DIRECT DEPOSIT] - CORRECCIÓN CRÍTICA
        // El onClick ahora navega directamente a la página de selección de criptomonedas.
        // No se pasa ningún 'amountNeeded', por lo que la página sabrá que es un depósito general.
        { label: t('profile.recharge'), icon: HiOutlineArrowDownOnSquare, onClick: () => navigate('/crypto-selection') },
        { label: t('profile.withdraw'), icon: HiOutlineArrowUpOnSquare, onClick: handleWithdrawClick },
        { label: t('profile.records'), icon: HiOutlineRectangleStack, onClick: () => navigate('/history') },
        { label: t('profile.invite'), icon: HiOutlineUserGroup, onClick: () => navigate('/team') },
    ];
    
    const secondaryActions = [
        { label: t('profile.password'), icon: HiOutlineKey, onClick: () => toast.error('Función no disponible.') },
        { label: t('profile.language'), icon: HiOutlineLanguage, onClick: () => navigate('/language') },
        { label: t('profile.support'), icon: HiOutlineChatBubbleLeftRight, onClick: () => navigate('/support') },
        { label: t('profile.faq'), icon: HiOutlineQuestionMarkCircle, onClick: () => navigate('/faq') },
        { label: t('profile.about'), icon: HiOutlineInformationCircle, onClick: () => navigate('/about') },
    ];

    return (
        <motion.div 
            className="flex flex-col h-full overflow-y-auto no-scrollbar p-4 gap-6" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col items-center text-center pt-4">
                <img src={user?.photoUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-dark-secondary" />
                <h1 className="text-2xl font-bold mt-4">{user?.username}</h1>
                <p className="text-sm text-text-secondary mt-1 font-mono">ID: {user?.telegramId}</p>
            </div>
            
            <div className="flex items-center justify-around p-4 bg-dark-secondary/70 backdrop-blur-md rounded-2xl border border-white/10">
                <StatCard label={t('profilePage.balanceUsdtLabel')} value={user?.balance?.usdt || 0} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {mainActions.map(action => <ActionCard key={action.label} {...action} />)}
            </div>
            
            <div className="space-y-3">
                {secondaryActions.map(action => <ActionRow key={action.label} {...action} />)}
            </div>
            
            <div className="pt-4">
                <button onClick={logout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors">
                    <HiOutlineArrowRightOnRectangle className="w-6 h-6" />
                    <span className="text-base font-bold">{t('profile.logout')}</span>
                </button>
            </div>
        </motion.div>
    );
};
export default ProfilePage;
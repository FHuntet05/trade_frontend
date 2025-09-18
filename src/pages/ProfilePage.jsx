// RUTA: frontend/src/pages/ProfilePage.jsx (VERSIÓN NEXUS - RECONSTRUCCIÓN VISUAL COMPLETA)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/userStore';
import { AnimatePresence } from 'framer-motion';
import GeneratedAvatar from '../components/common/GeneratedAvatar';
import Loader from '../components/common/Loader';
import WithdrawalModal from '../components/modals/WithdrawalModal';
import SwapModal from '../components/modals/SwapModal'; // Asumo este nombre de archivo

import {
    HiOutlineArrowDownOnSquare, HiOutlineArrowUpOnSquare, HiOutlineRectangleStack, HiOutlineArrowsRightLeft,
    HiOutlineUserGroup, HiOutlineLanguage, HiOutlineQuestionMarkCircle, HiOutlineInformationCircle,
    HiOutlineChatBubbleLeftRight, HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';

// --- SUB-COMPONENTES DE UI PARA MANTENER EL CÓDIGO LIMPIO ---

const HeaderInfo = ({ user }) => (
    <div className="flex items-center gap-3">
        {user.photoUrl ? (
            <img src={user.photoUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
        ) : (
            <GeneratedAvatar name={user.username} size="w-12 h-12" />
        )}
        <div>
            <h1 className="text-xl font-bold text-white">{user.username}</h1>
        </div>
    </div>
);

const NtxBalanceCard = ({ value }) => (
    <div className="bg-dark-secondary/70 p-2 rounded-full text-center">
        <p className="font-bold text-white leading-tight">{value.toFixed(2)} NTX</p>
        <p className="text-xs text-text-secondary leading-tight">Valor Almacenado</p>
    </div>
);

const WalletCard = ({ title, value, currency }) => (
    <div className="bg-dark-secondary/70 p-4 rounded-2xl border border-white/10">
        <p className="text-2xl font-bold text-white">{value.toFixed(2)}</p>
        <p className="text-sm text-text-secondary">{title} ({currency})</p>
    </div>
);

const ActionButton = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-2 text-center space-y-2 hover:bg-white/5 rounded-lg transition-colors">
        <div className="w-12 h-12 flex items-center justify-center bg-dark-secondary rounded-full">
            <Icon className="w-6 h-6 text-accent-start" />
        </div>
        <span className="text-xs font-semibold text-text-primary">{label}</span>
    </button>
);

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---

const ProfilePage = () => {
    const { user, logout } = useUserStore();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeModal, setActiveModal] = useState(null); // 'withdraw', 'swap', o null

    if (!user) {
        return <div className="h-full w-full flex items-center justify-center"><Loader /></div>;
    }
    
    // --- Definición de Acciones ---
    const primaryActions = [
        { label: 'Recargar', icon: HiOutlineArrowDownOnSquare, onClick: () => navigate('/crypto-selection') },
        { label: 'Retirar', icon: HiOutlineArrowUpOnSquare, onClick: () => setActiveModal('withdraw') },
        { label: 'Registros', icon: HiOutlineRectangleStack, onClick: () => navigate('/history') },
        { label: 'NTX/USDT', icon: HiOutlineArrowsRightLeft, onClick: () => setActiveModal('swap') },
    ];

    const secondaryActions = [
        { label: 'Invitar', icon: HiOutlineUserGroup, onClick: () => navigate('/team') },
        { label: 'Idioma', icon: HiOutlineLanguage, onClick: () => navigate('/language') },
        { label: 'FAQ', icon: HiOutlineQuestionMarkCircle, onClick: () => navigate('/faq') },
        { label: 'Sobre nosotros', icon: HiOutlineInformationCircle, onClick: () => navigate('/about') },
        { label: 'Atención al Cliente', icon: HiOutlineChatBubbleLeftRight, onClick: () => navigate('/support') },
    ];

    return (
        <>
            <div className="p-4 space-y-6 pb-8">
                {/* --- SECCIÓN DE HEADER --- */}
                <header className="flex justify-between items-center">
                    <HeaderInfo user={user} />
                    <NtxBalanceCard value={user.balance?.ntx || 0} />
                </header>

                {/* --- SECCIÓN DE BILLETERAS --- */}
                <div className="grid grid-cols-2 gap-4">
                    <WalletCard title="Cartera de Corretaje" value={user.balance?.usdt || 0} currency="USDT" />
                    <WalletCard title="Cartera de Valor" value={user.balance?.ntx || 0} currency="NTX" />
                </div>

                {/* --- SECCIÓN DE ACCIONES PRIMARIAS --- */}
                <div className="bg-dark-secondary/70 p-4 rounded-2xl border border-white/10">
                    <div className="grid grid-cols-4 gap-2">
                        {primaryActions.map(action => <ActionButton key={action.label} {...action} />)}
                    </div>
                </div>

                {/* --- SECCIÓN DE ACCIONES SECUNDARIAS --- */}
                <div className="bg-dark-secondary/70 p-4 rounded-2xl border border-white/10">
                    <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                        {secondaryActions.map(action => <ActionButton key={action.label} {...action} />)}
                    </div>
                </div>
                
                {/* --- BOTÓN DE CIERRE DE SESIÓN --- */}
                <div className="pt-4">
                    <button onClick={logout} className="w-full flex items-center justify-center gap-3 p-3 bg-red-900/40 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-900/60 transition-colors">
                        <span className="text-base font-bold">Cerrar Sesión</span>
                    </button>
                </div>
            </div>
            
            {/* --- RENDERIZADO DE MODALES --- */}
            <AnimatePresence>
                {activeModal === 'withdraw' && <WithdrawalModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'swap' && <SwapModal onClose={() => setActiveModal(null)} />}
            </AnimatePresence>
        </>
    );
};

export default ProfilePage;
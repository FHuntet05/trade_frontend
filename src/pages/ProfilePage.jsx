// frontend/src/pages/ProfilePage.jsx (VERSIÓN FINAL CON SWAP Y RETIRO INTEGRADOS)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    HiOutlineArrowDownOnSquare, HiOutlineArrowUpOnSquare, HiOutlineRectangleStack, HiOutlineArrowsRightLeft,
    HiOutlineUserGroup, HiOutlineQuestionMarkCircle, HiOutlineInformationCircle, 
    HiOutlineChatBubbleLeftRight, HiOutlineLanguage
} from 'react-icons/hi2';

// Importamos ambos modales
import WithdrawalModal from '../components/modals/WithdrawalModal';
import SwapModal from '../components/modals/SwapModal'; // <-- IMPORTANTE

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const ProfileHeader = ({ user }) => (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg p-2 px-4 rounded-full border border-white/10">
        <img src={user.photoUrl || '/assets/images/user-avatar-placeholder.png'} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
        <span className="font-bold text-white">{user.username || 'Usuario'}</span>
      </div>
      <div className="text-right bg-white/10 backdrop-blur-lg p-2 px-4 rounded-full border border-white/10">
        <span className="text-lg font-bold text-accent-end">{Number(user.balance.ntx).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} NTX</span>
        <p className="text-xs text-text-secondary">Valor Almacenado</p>
      </div>
    </div>
);

const ActionButton = ({ icon: Icon, label, onClick, color = 'text-accent-start' }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 group w-full">
        <div className="w-14 h-14 flex items-center justify-center bg-black/20 rounded-2xl group-hover:bg-black/40 transition-colors">
            <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <span className="text-xs font-semibold text-text-secondary text-center w-full">{label}</span>
    </button>
);

const ProfilePage = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Estados para controlar la visibilidad de cada modal
  const [isWithdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false); // <-- NUEVO ESTADO

  if (!user) return null;

  // --- LÓGICA PARA ABRIR MODALES ---
  const handleWithdrawClick = () => {
    const MINIMUM_WITHDRAWAL = 1.0;
    if (user.balance.usdt < MINIMUM_WITHDRAWAL) {
      toast.error(`Saldo insuficiente. El mínimo para retirar es ${MINIMUM_WITHDRAWAL} USDT.`);
    } else {
      setWithdrawalModalOpen(true);
    }
  };

  const handleSwapClick = () => {
    const MINIMUM_NTX_SWAP = 10000;
    if (user.balance.ntx < MINIMUM_NTX_SWAP) {
      toast.error(`Saldo NTX insuficiente. El mínimo para intercambiar es ${MINIMUM_NTX_SWAP.toLocaleString()} NTX.`);
    } else {
      setIsSwapModalOpen(true);
    }
  };
  // --- FIN LÓGICA PARA ABRIR MODALES ---

  const mainActions = [
    { label: t('profile.recharge'), icon: HiOutlineArrowDownOnSquare, onClick: () => navigate('/recharge') },
    { label: t('profile.withdraw'), icon: HiOutlineArrowUpOnSquare, onClick: handleWithdrawClick },
    { label: t('profile.records'), icon: HiOutlineRectangleStack, onClick: () => navigate('/history') },
    // El botón de intercambio ahora abre el modal
    { label: t('profile.exchange'), icon: HiOutlineArrowsRightLeft, onClick: handleSwapClick }, // <-- ACCIÓN ACTUALIZADA
  ];

  const secondaryActions = [
    { label: t('profile.invite'), icon: HiOutlineUserGroup, onClick: () => navigate('/team') },
    { label: t('profile.language'), icon: HiOutlineLanguage, onClick: () => navigate('/language') },
    { label: t('profile.faq'), icon: HiOutlineQuestionMarkCircle, onClick: () => navigate('/faq') },
    { label: t('profile.about'), icon: HiOutlineInformationCircle, onClick: () => navigate('/about') },
    { label: t('profile.support'), icon: HiOutlineChatBubbleLeftRight, onClick: () => navigate('/support') },
  ];

 return (
    <> {/* Fragment para contener la página y los modales */}
      <motion.div 
        className="flex flex-col h-full space-y-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <ProfileHeader user={user} />
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 space-y-5">
          <div className="flex justify-around items-center">
              <div className="text-center">
                  <p className="text-2xl font-bold text-white">{user.balance.usdt.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-text-secondary">Cartera de Corretaje (USDT)</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center">
                  <p className="text-2xl font-bold text-white">{user.balance.ntx.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-text-secondary">Cartera de Valor (NTX)</p>
              </div>
          </div>
          
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
              {mainActions.map(action => <ActionButton key={action.label} {...action} />)}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))' }}>
            {secondaryActions.map(action => <ActionButton key={action.label} {...action} color="text-text-secondary" />)}
          </div>
        </div>
        
        <div className="flex-grow"></div>

        <div className="pb-4">
          <button 
            onClick={logout}
            className="w-full py-3 font-bold text-red-400 bg-red-500/20 rounded-xl border border-red-500/30 hover:bg-red-500/40 transition-colors"
          >
            {t('profile.logout')}
          </button>
        </div>
      </motion.div>

      {/* Renderizado condicional de AMBOS modales */}
      <AnimatePresence>
        {isWithdrawalModalOpen && (
          <WithdrawalModal onClose={() => setWithdrawalModalOpen(false)} />
        )}
        {isSwapModalOpen && (
          <SwapModal onClose={() => setIsSwapModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfilePage;
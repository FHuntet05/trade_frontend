// frontend/src/pages/ProfilePage.jsx (VERSIÓN CON MODAL DE RETIRO INTEGRADO)
import React, { useState } from 'react'; // <-- 1. IMPORTAR useState
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useUserStore from '../store/userStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // <-- 1. IMPORTAR AnimatePresence
import { 
    HiOutlineArrowDownOnSquare, HiOutlineArrowUpOnSquare, HiOutlineRectangleStack, HiOutlineArrowsRightLeft,
    HiOutlineUserGroup, HiOutlineKey, HiOutlineQuestionMarkCircle, HiOutlineInformationCircle, 
    HiOutlineChatBubbleLeftRight, HiOutlineLanguage
} from 'react-icons/hi2';

// --- 1. IMPORTAR EL NUEVO MODAL ---
import WithdrawalModal from '../components/modals/WithdrawalModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120 } },
};
const ProfileHeader = ({ user }) => (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg p-2 px-4 rounded-full border border-white/10">
        <img src={user.avatarUrl || '/assets/images/user-avatar-placeholder.png'} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
        <span className="font-bold text-white">{user.username || 'Usuario'}</span>
      </div>
      <div className="text-right bg-white/10 backdrop-blur-lg p-2 px-4 rounded-full border border-white/10">
        <span className="text-lg font-bold text-accent-end">{user.balance.ntx.toFixed(2)} NTX</span>
        <p className="text-xs text-text-secondary">Valor Almacenado</p>
      </div>
    </div>
);

const ActionButton = ({ icon: Icon, label, onClick, color = 'text-accent-start' }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 group">
        {/* ESTILO CORREGIDO DEL BOTÓN */}
        <div className="w-14 h-14 flex items-center justify-center bg-black/20 rounded-2xl group-hover:bg-black/40 transition-colors">
            <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <span className="text-xs font-semibold text-text-secondary text-center">{label}</span>
    </button>
);

const ProfilePage = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isWithdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  if (!user) return null;

    const handleWithdrawClick = () => {
    const MINIMUM_WITHDRAWAL = 1.0;
    if (user.balance.usdt < MINIMUM_WITHDRAWAL) {
      toast.error(`Saldo insuficiente. El mínimo para retirar es ${MINIMUM_WITHDRAWAL} USDT.`);
    } else {
      setWithdrawalModalOpen(true);
    }
  };
  const mainActions = [
    { label: t('profile.recharge'), icon: HiOutlineArrowDownOnSquare, onClick: () => navigate('/recharge') },
    { label: t('profile.withdraw'), icon: HiOutlineArrowUpOnSquare, onClick: handleWithdrawClick },
    { label: t('profile.records'), icon: HiOutlineRectangleStack, onClick: () => navigate('/history') },
    { label: t('profile.exchange'), icon: HiOutlineArrowsRightLeft, onClick: () => toast.error(t('profile.comingSoon.exchange')) },
  ];
  const secondaryActions = [
    { label: t('profile.invite'), icon: HiOutlineUserGroup, onClick: () => navigate('/team') },
    { label: t('profile.language'), icon: HiOutlineLanguage, onClick: () => navigate('/language') },
    { label: t('profile.faq'), icon: HiOutlineQuestionMarkCircle, onClick: () => navigate('/faq') },
    { label: t('profile.about'), icon: HiOutlineInformationCircle, onClick: () => navigate('/about') },
    { label: t('profile.support'), icon: HiOutlineChatBubbleLeftRight, onClick: () => navigate('/support') },
  ];

 return (
    <> {/* Usamos un Fragment para poder tener el div principal y el modal como hermanos */}
      <motion.div 
        className="flex flex-col h-full space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}><ProfileHeader user={user} /></motion.div>
        
        <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10 space-y-5">
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
          <div className="grid grid-cols-4 gap-3">
              {mainActions.map(action => <ActionButton key={action.label} {...action} />)}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
          <div className="grid grid-cols-4 gap-4">
            {secondaryActions.map(action => <ActionButton key={action.label} {...action} color="text-text-secondary" />)}
          </div>
        </motion.div>
        
        <div className="flex-grow"></div>

        <motion.div variants={itemVariants} className="pb-4">
          <button 
            onClick={logout}
            className="w-full py-3 font-bold text-red-400 bg-red-500/20 rounded-xl border border-red-500/30 hover:bg-red-500/40 transition-colors"
          >
            {t('profile.logout')}
          </button>
        </motion.div>
      </motion.div>

      {/* --- 5. RENDERIZAR EL MODAL CONDICIONALMENTE --- */}
      <AnimatePresence>
        {isWithdrawalModalOpen && (
          <WithdrawalModal onClose={() => setWithdrawalModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfilePage;
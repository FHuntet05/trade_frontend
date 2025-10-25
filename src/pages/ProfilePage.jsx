import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import {
  ProfileHeader,
  SecuritySection,
  WalletSection,
  LanguageSection,
  AboutSection,
  LogoutButton
} from '../components/profile/ProfileComponents';
// --- INICIO DE LA MODIFICACIÓN ---
// 1. Se eliminan las importaciones de los modales antiguos y se importa el nuevo componente.
import { IOSLayout, IOSBackButton, IOSButton } from '../components/ui/IOSComponents';
import WithdrawalComponent from '../components/profile/WithdrawalComponent';
// --- FIN DE LA MODIFICACIÓN ---
import api from '../api/axiosConfig';

// Estados locales
const ProfileState = () => {
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  // --- INICIO DE LA MODIFICACIÓN ---
  // 2. Se simplifica el estado del modal a un booleano para el nuevo componente.
  const [isWithdrawalModalVisible, setIsWithdrawalModalVisible] = useState(false);
  // --- FIN DE LA MODIFICACIÓN ---
  
  return {
    withdrawalPassword,
    setWithdrawalPassword,
    wallet,
    setWallet,
    loading,
    setLoading,
    // --- INICIO DE LA MODIFICACIÓN ---
    isWithdrawalModalVisible,
    setIsWithdrawalModalVisible
    // --- FIN DE LA MODIFICACIÓN ---
  };
};

const ProfilePage = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    withdrawalPassword,
    setWithdrawalPassword,
    wallet,
    setWallet,
    loading,
    setLoading,
    // --- INICIO DE LA MODIFICACIÓN ---
    isWithdrawalModalVisible,
    setIsWithdrawalModalVisible
    // --- FIN DE LA MODIFICACIÓN ---
  } = ProfileState();

  useEffect(() => {
    if (user?.wallet) {
      setWallet(user.wallet);
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const response = await api.post('/user/avatar', formData);
      useUserStore.setState(state => ({
        user: { ...state.user, avatar: response.data.avatarUrl }
      }));
    } catch (error) {
      console.error('Error al cambiar avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    try {
      setLoading(true);
      await api.post('/user/withdrawal-password', {
        password: withdrawalPassword
      });
      setWithdrawalPassword('');
    } catch (error) {
      console.error('Error al guardar contraseña:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSave = async () => {
    try {
      setLoading(true);
      await api.post('/user/wallet', {
        address: wallet
      });
      useUserStore.setState(state => ({
        user: { ...state.user, wallet }
      }));
    } catch (error) {
      console.error('Error al guardar billetera:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <IOSLayout>
        <div className="flex flex-col min-h-screen bg-system-background">
          <div className="flex items-center p-4 bg-internal-card border-b border-gray-200">
            <IOSBackButton onClick={() => navigate(-1)} />
            <h1 className="flex-1 text-center font-ios text-lg font-semibold">
              {t('profile.title')}
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 p-4 space-y-6 pb-24" // Añadido padding bottom
          >
            <ProfileHeader
              user={user}
              onAvatarChange={handleAvatarChange}
            />

            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            {/* 3. Se añade un botón prominente para abrir el modal de retiro. */}
            <IOSButton 
              variant="primary" 
              className="w-full"
              onClick={() => setIsWithdrawalModalVisible(true)}
            >
              Retirar Saldo
            </IOSButton>
            {/* --- FIN DE LA MODIFICACIÓN --- */}

            <SecuritySection
              withdrawalPassword={withdrawalPassword}
              onPasswordChange={(e) => setWithdrawalPassword(e.target.value)}
              onPasswordSave={handlePasswordSave}
            />

            <WalletSection
              wallet={wallet}
              onWalletChange={(e) => setWallet(e.target.value)}
              onWalletSave={handleWalletSave}
            />

            <LanguageSection
              language={i18n.language}
              onLanguageChange={handleLanguageChange}
            />

            <AboutSection
              onAboutPress={() => navigate('/about')}
            />

            <LogoutButton onLogout={handleLogout} />
          </motion.div>
        </div>
      </IOSLayout>
      
      {/* --- INICIO DE LA MODIFICACIÓN --- */}
      {/* 4. Se renderiza el nuevo componente modal, pasando el estado y la función de cierre. */}
      <WithdrawalComponent 
        isVisible={isWithdrawalModalVisible}
        onClose={() => setIsWithdrawalModalVisible(false)}
      />
      {/* --- FIN DE LA MODIFICACIÓN --- */}
    </>
  );
};

export default ProfilePage;
// RUTA: frontend/src/pages/ProfilePage.jsx
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
import { IOSLayout, IOSBackButton, IOSButton } from '../components/ui/IOSComponents';
import WithdrawalComponent from '../components/profile/WithdrawalComponent';
import api from '../api/axiosConfig';

// El estado local se mantiene sin cambios.
const ProfileState = () => {
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWithdrawalModalVisible, setIsWithdrawalModalVisible] = useState(false);
  
  return {
    withdrawalPassword,
    setWithdrawalPassword,
    wallet,
    setWallet,
    loading,
    setLoading,
    isWithdrawalModalVisible,
    setIsWithdrawalModalVisible
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
    isWithdrawalModalVisible,
    setIsWithdrawalModalVisible
  } = ProfileState();

  useEffect(() => {
    if (user?.wallet) {
      setWallet(user.wallet);
    }
  }, [user]);

  // Las funciones de manejo de eventos (handleAvatarChange, handlePasswordSave, etc.) se mantienen sin cambios.
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
      await api.post('/user/withdrawal-password', { password: withdrawalPassword });
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
      await api.post('/user/wallet', { address: wallet });
      useUserStore.setState(state => ({ user: { ...state.user, wallet } }));
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
            className="flex-1 p-4 space-y-6 pb-24"
          >
            <ProfileHeader
              user={user}
              onAvatarChange={handleAvatarChange}
            />

            {/* --- INICIO DE LA MODIFICACIÓN CRÍTICA (Bloque de Acciones Financieras) --- */}
            {/*
              - Se crea un contenedor grid con dos columnas para alinear los botones.
              - El botón "Depositar" es nuevo y su 'onClick' navega a la página de depósito.
              - El botón "Retirar" se mantiene, y su 'onClick' abre el modal de retiro.
              - Se ajusta el texto de los botones para ser más conciso y encajar mejor.
            */}
            <div className="grid grid-cols-2 gap-4">
              <IOSButton 
                variant="primary" 
                onClick={() => navigate('/deposit')}
              >
                Depositar
              </IOSButton>
              <IOSButton 
                variant="secondary" // Usamos un variant secundario para diferenciar la acción.
                onClick={() => setIsWithdrawalModalVisible(true)}
              >
                Retirar
              </IOSButton>
            </div>
            {/* --- FIN DE LA MODIFICACIÓN CRÍTICA --- */}

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
      
      {/* El componente de retiro se mantiene, su visibilidad es controlada por el estado. */}
      <WithdrawalComponent 
        isVisible={isWithdrawalModalVisible}
        onClose={() => setIsWithdrawalModalVisible(false)}
      />
    </>
  );
};

export default ProfilePage;
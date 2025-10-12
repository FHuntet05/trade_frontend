import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { IOSLayout, IOSBackButton } from '../components/ui/IOSComponents';
import WithdrawalModal from '../components/modals/WithdrawalModal';
import SwapModal from '../components/modals/SwapModal';
import api from '../api/axiosConfig';

// Estados locales
const ProfileState = () => {
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  
  return {
    withdrawalPassword,
    setWithdrawalPassword,
    wallet,
    setWallet,
    loading,
    setLoading,
    activeModal,
    setActiveModal
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
    activeModal,
    setActiveModal
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
    <IOSLayout>
      <div className="flex flex-col min-h-screen bg-system-background">
        <div className="flex items-center p-4 bg-system-primary">
          <IOSBackButton onClick={() => navigate(-1)} />
          <h1 className="flex-1 text-center font-ios text-lg">
            {t('profile.title')}
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-4 space-y-6"
        >
          <ProfileHeader
            user={user}
            onAvatarChange={handleAvatarChange}
          />

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

      <AnimatePresence>
        {activeModal === 'withdraw' && (
          <WithdrawalModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'swap' && (
          <SwapModal onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </IOSLayout>
  );
};

export default ProfilePage;
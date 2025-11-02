// RUTA: frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUserStore from '../store/userStore';
import {
  ProfileHeader,
  WalletSummary,
  SecuritySection,
  WalletSection,
  LanguageSection,
  AboutSection,
  LogoutButton,
} from '../components/profile/ProfileComponents';
import { IOSButton, IOSCard } from '../components/ui/IOSComponents';
import WithdrawalComponent from '../components/profile/WithdrawalComponent';
import api from '../api/axiosConfig';
import { formatters } from '@/utils/formatters';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useUserStore((state) => ({ user: state.user, logout: state.logout }));

  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [wallet, setWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawalModalVisible, setIsWithdrawalModalVisible] = useState(false);

  useEffect(() => {
    if (user?.wallet) {
      setWallet(user.wallet);
    }
  }, [user?.wallet]);

  const handlePasswordSave = async () => {
    if (!withdrawalPassword || isLoading) return;
    try {
      setIsLoading(true);
      const response = await api.post('/user/withdrawal-password', { password: withdrawalPassword });
      toast.success(response.data.message || 'Contraseña de retiro guardada correctamente');
      setWithdrawalPassword('');
    } catch (error) {
      console.error('Error al guardar contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la contraseña de retiro');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletSave = async () => {
    if (!wallet || isLoading) return;
    try {
      setIsLoading(true);
      const response = await api.post('/user/wallet', { address: wallet });
      useUserStore.setState((state) => ({ user: { ...state.user, wallet } }));
      toast.success(response.data.message || 'Dirección de billetera guardada correctamente');
    } catch (error) {
      console.error('Error al guardar billetera:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la dirección de billetera');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const balanceSummary = useMemo(() => {
    const available = user?.balance?.usdt ?? 0;
    const withdrawable = user?.withdrawableBalance ?? 0;
    const spins = user?.balance?.spins ?? 0;

    return [
      {
        label: t('profilePage.summary.available'),
        value: formatters.formatCurrency(available),
        helper: t('profilePage.summary.availableHelper'),
      },
      {
        label: t('profilePage.summary.withdrawable'),
        value: formatters.formatCurrency(withdrawable),
        helper: t('profilePage.summary.withdrawableHelper'),
      },
      {
        label: t('profilePage.summary.spins'),
        value: spins,
        helper: t('profilePage.summary.spinsHelper'),
      },
    ];
  }, [t, user?.balance?.spins, user?.balance?.usdt, user?.withdrawableBalance]);

  const languageOptions = useMemo(
    () => [
      { code: 'es', name: 'Español' },
      { code: 'en', name: 'English' },
      { code: 'ar', name: 'العربية' },
    ],
    []
  );

  return (
    <>
      <div className="min-h-screen bg-[#f5f7fb] px-4 pb-28 pt-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          <ProfileHeader user={user} idLabel={t('profilePage.idLabel')} />

          <WalletSummary amounts={balanceSummary} />

          <IOSCard className="grid gap-4 rounded-3xl bg-white p-6 shadow-lg sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">{t('profilePage.actions.title')}</p>
              <p className="text-xs text-slate-500">{t('profilePage.actions.subtitle')}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <IOSButton variant="primary" onClick={() => navigate('/deposit/create')} className="flex-1">
                {t('profilePage.actions.deposit')}
              </IOSButton>
              <IOSButton
                variant="secondary"
                onClick={() => setIsWithdrawalModalVisible(true)}
                className="flex-1"
              >
                {t('profilePage.actions.withdraw')}
              </IOSButton>
            </div>
          </IOSCard>

          <SecuritySection
            title={t('profilePage.security.title')}
            placeholder={t('profilePage.security.description')}
            buttonLabel={t('profilePage.security.button')}
            withdrawalPassword={withdrawalPassword}
            onPasswordChange={(e) => setWithdrawalPassword(e.target.value)}
            onPasswordSave={handlePasswordSave}
            buttonDisabled={isLoading || !withdrawalPassword}
          />

          <WalletSection
            title={t('profilePage.wallet.title')}
            helper={t('profilePage.wallet.description')}
            wallet={wallet}
            onWalletChange={(e) => setWallet(e.target.value)}
            onWalletSave={handleWalletSave}
            buttonLabel={t('profilePage.wallet.button')}
            buttonDisabled={isLoading || !wallet}
          />

          <LanguageSection
            title={t('profilePage.language.title')}
            language={i18n.language}
            options={languageOptions}
            onLanguageChange={handleLanguageChange}
          />

          <AboutSection
            title={t('profilePage.about.title')}
            description={t('profilePage.about.description')}
            buttonLabel={t('profilePage.about.button')}
            onAboutPress={() => navigate('/about')}
          />

          <LogoutButton label={t('profilePage.logout')} onLogout={handleLogout} />
        </div>
      </div>

      <WithdrawalComponent
        isVisible={isWithdrawalModalVisible}
        onClose={() => setIsWithdrawalModalVisible(false)}
      />
    </>
  );
};

export default ProfilePage;
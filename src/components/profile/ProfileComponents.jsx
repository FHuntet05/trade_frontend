import React from 'react';
import { motion } from 'framer-motion';
import { IOSCard, IOSButton, IOSInput } from '../ui/IOSComponents';
import useStore from '../../store/store';
import { PressableScale } from '../animations/AnimationComponents';

export const ProfileHeader = ({ user, onAvatarChange }) => {
  const fileInputRef = React.useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <PressableScale onPress={handleAvatarClick}>
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-system-secondary overflow-hidden border-2 border-ios-green">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                👤
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-ios-green rounded-full flex items-center justify-center text-white shadow-ios-button">
            📷
          </div>
        </div>
      </PressableScale>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onAvatarChange}
      />
      
      <h2 className="mt-4 font-ios-display font-semibold text-lg">
        {user.username}
      </h2>
      
      <p className="text-text-secondary">
        ID: {user.telegramId}
      </p>
    </div>
  );
};

export const SecuritySection = ({ 
  withdrawalPassword, 
  onPasswordChange,
  onPasswordSave 
}) => {
  return (
    <IOSCard className="mb-6">
      <h3 className="font-ios text-text-primary mb-3">
        Seguridad
      </h3>
      
      <IOSInput
        type="password"
        value={withdrawalPassword}
        onChange={onPasswordChange}
        placeholder="Establecer contraseña de retiro"
        className="mb-4"
      />
      
      <IOSButton
        variant="primary"
        onClick={onPasswordSave}
        className="w-full"
      >
        Guardar Contraseña
      </IOSButton>
    </IOSCard>
  );
};

export const WalletSection = ({
  wallet,
  onWalletChange,
  onWalletSave
}) => {
  return (
    <IOSCard className="mb-6">
      <h3 className="font-ios text-text-primary mb-3">
        Billetera de Retiro
      </h3>
      
      <IOSInput
        value={wallet}
        onChange={onWalletChange}
        placeholder="Dirección de billetera USDT"
        className="mb-4"
      />
      
      <IOSButton
        variant="primary"
        onClick={onWalletSave}
        className="w-full"
      >
        Guardar Billetera
      </IOSButton>
    </IOSCard>
  );
};

export const LanguageSection = ({ language, onLanguageChange }) => {
  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' }
  ];

  return (
    <IOSCard className="mb-6">
      <h3 className="font-ios text-text-primary mb-3">
        Idioma
      </h3>
      
      <div className="space-y-2">
        {languages.map(lang => (
          <PressableScale
            key={lang.code}
            onPress={() => onLanguageChange(lang.code)}
          >
            <div className={`
              p-3 rounded-ios flex items-center justify-between
              ${language === lang.code
                ? 'bg-ios-green text-white'
                : 'bg-system-secondary text-text-primary'
              }
            `}>
              <span>{lang.name}</span>
              {language === lang.code && (
                <span>✓</span>
              )}
            </div>
          </PressableScale>
        ))}
      </div>
    </IOSCard>
  );
};

export const AboutSection = ({ onAboutPress }) => {
  return (
    <IOSCard className="mb-6">
      <h3 className="font-ios text-text-primary mb-3">
        Sobre Nosotros
      </h3>
      
      <PressableScale onPress={onAboutPress}>
        <div className="p-3 bg-system-secondary rounded-ios flex items-center justify-between">
          <span>Ver información</span>
          <span>→</span>
        </div>
      </PressableScale>
    </IOSCard>
  );
};

export const LogoutButton = ({ onLogout }) => {
  return (
    <PressableScale onPress={onLogout}>
      <button className="w-full p-4 bg-red-500 text-white rounded-ios font-ios">
        Cerrar Sesión
      </button>
    </PressableScale>
  );
};
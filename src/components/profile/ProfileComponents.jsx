import React from 'react';
import { IOSCard, IOSButton, IOSInput } from '../ui/IOSComponents';
import { PressableScale } from '../animations/AnimationComponents';

export const ProfileHeader = ({ user, idLabel }) => {
  const displayName = user?.fullName || user?.username || 'Usuario';
  const telegramId = user?.telegramId || '---';
  const fallbackInitial = displayName.charAt(0)?.toUpperCase?.() || 'U';
  const photoUrl = user?.photoUrl || '';
  const PLACEHOLDER_AVATAR = 'https://i.postimg.cc/mD21B6r7/user-avatar-placeholder.png';

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-lg">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-md">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`flex h-full w-full items-center justify-center bg-slate-200 text-3xl font-semibold text-slate-500 ${photoUrl ? 'hidden' : ''}`}
        >
          {fallbackInitial}
        </div>
      </div>

      <div className="text-center">
        <p className="text-xl font-semibold text-slate-900">{displayName}</p>
        <p className="text-sm text-slate-500">{idLabel}: {telegramId}</p>
      </div>
    </div>
  );
};

export const WalletSummary = ({ amounts }) => {
  return (
    <div className="grid gap-4 rounded-3xl bg-white p-6 shadow-lg sm:grid-cols-3">
      {amounts.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
          <p className="text-2xl font-bold text-slate-900">{item.value}</p>
          {item.helper && <p className="mt-1 text-xs text-slate-500">{item.helper}</p>}
        </div>
      ))}
    </div>
  );
};

export const SecuritySection = ({
  title,
  placeholder,
  buttonLabel,
  withdrawalPassword,
  onPasswordChange,
  onPasswordSave,
  buttonDisabled = false,
}) => {
  return (
    <IOSCard className="rounded-3xl bg-white p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{placeholder}</p>
      <IOSInput
        type="password"
        value={withdrawalPassword}
        onChange={onPasswordChange}
        placeholder="••••••••"
        className="mb-4"
      />
      <IOSButton variant="primary" onClick={onPasswordSave} disabled={buttonDisabled} className="w-full">
        {buttonLabel}
      </IOSButton>
    </IOSCard>
  );
};

export const WalletSection = ({
  title,
  helper,
  wallet,
  onWalletChange,
  onWalletSave,
  buttonLabel,
  buttonDisabled = false,
}) => {
  return (
    <IOSCard className="rounded-3xl bg-white p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mb-4 text-sm text-slate-500">{helper}</p>
      <IOSInput
        value={wallet}
        onChange={onWalletChange}
        placeholder="0x..."
        className="mb-4"
      />
      <IOSButton variant="primary" onClick={onWalletSave} disabled={buttonDisabled} className="w-full">
        {buttonLabel}
      </IOSButton>
    </IOSCard>
  );
};

export const LanguageSection = ({ title, language, options, onLanguageChange }) => {
  return (
    <IOSCard className="rounded-3xl bg-white p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 space-y-2">
        {options.map((lang) => {
          const isActive = language === lang.code;
          return (
            <PressableScale key={lang.code} onPress={() => onLanguageChange(lang.code)}>
              <div
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{lang.name}</span>
                {isActive && <span>✓</span>}
              </div>
            </PressableScale>
          );
        })}
      </div>
    </IOSCard>
  );
};

export const AboutSection = ({ title, description, buttonLabel, onAboutPress }) => {
  return (
    <IOSCard className="rounded-3xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <PressableScale onPress={onAboutPress}>
          <div className="rounded-full bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white">
            {buttonLabel}
          </div>
        </PressableScale>
      </div>
    </IOSCard>
  );
};

export const LogoutButton = ({ label, onLogout }) => {
  return (
    <PressableScale onPress={onLogout}>
      <button className="w-full rounded-2xl bg-red-500 py-3 text-base font-semibold text-white shadow-lg">
        {label}
      </button>
    </PressableScale>
  );
};
// frontend/src/pages/LanguagePage.jsx (VERSIÓN LIMPIA)
import React from 'react';
import { useTranslation } from 'react-i18next';
import StaticPageLayout from '../components/layout/StaticPageLayout'; // <-- AÑADIMOS LA IMPORTACIÓN
import { CheckmarkIcon } from '@/components/icons/AppIcons';

const languages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
];

const LanguagePage = () => {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    // Ahora usamos nuestro layout, pasándole el título.
    <StaticPageLayout title={t('profile.language')}>
      <div className="flex flex-col gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            // Estilo consistente con el resto de la app
            className="w-full flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-lg text-left text-white transition-colors"
          >
            <span>{lang.name}</span>
            {currentLanguage.startsWith(lang.code) && (
              <HiCheck className="w-6 h-6 text-accent-start" />
            )}
          </button>
        ))}
      </div>
    </StaticPageLayout>
  );
};

export default LanguagePage;
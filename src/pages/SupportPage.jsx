// frontend/pages/SupportPage.jsx (v1.1 - i18n)
import React from 'react';
import { useTranslation } from 'react-i18next';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const SupportPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <StaticPageLayout title={t('supportPage.title')}>
        <div className="space-y-4">
          <p>{t('supportPage.p1')}</p>
          <div>
            <h3 className="font-semibold text-text-primary mb-1">{t('supportPage.supportLink')}</h3>
            <a href="https://t.me/AiBrokTradeProsvi" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              https://t.me/AiBrokTradeProsvi
            </a>
          </div>
        </div>
      </StaticPageLayout>
    </div>
  );
};
export default SupportPage;
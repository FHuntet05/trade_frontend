// frontend/pages/AboutPage.jsx (v1.1 - i18n)
import React from 'react';
import { useTranslation } from 'react-i18next';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <StaticPageLayout title={t('aboutPage.title')}>
        <div className="space-y-4">
          <p>{t('aboutPage.p1')}</p>
          <p>{t('aboutPage.p2')}</p>
        </div>
      </StaticPageLayout>
    </div>
  );
};
export default AboutPage;
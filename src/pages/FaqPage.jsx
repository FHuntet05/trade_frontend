// src/pages/FaqPage.jsx (v1.1 - i18n)
import React from 'react';
import { useTranslation } from 'react-i18next';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const FaqItem = ({ question, answer }) => (
  <div className="bg-dark-secondary/50 p-4 rounded-lg">
    <h3 className="font-semibold text-text-primary mb-2">{question}</h3>
    <p className="text-sm">{answer}</p>
  </div>
);

const FaqPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <StaticPageLayout title={t('faqPage.title')}>
        <FaqItem question={t('faqPage.q1')} answer={t('faqPage.a1')} />
        <FaqItem question={t('faqPage.q2')} answer={t('faqPage.a2')} />
        <FaqItem question={t('faqPage.q3')} answer={t('faqPage.a3')} />
        <FaqItem question={t('faqPage.q4')} answer={t('faqPage.a4')} />
      </StaticPageLayout>
    </div>
  );
};
export default FaqPage;
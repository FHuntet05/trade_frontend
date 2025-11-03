// frontend/pages/SupportPage.jsx (v1.1 - i18n)
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiLifeBuoy, FiMessageCircle, FiExternalLink } from 'react-icons/fi';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const SupportPage = () => {
 // const { t } = useTranslation();
  // Enlaces hardcodeados solicitados por el usuario
  const assistantUrl = 'https://t.me/HonyAsistent';
  const supportUrl = 'https://t.me/AlBrokTradePro';

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <StaticPageLayout title={t('supportPage.title')}>
        <div className="space-y-6">
          <p className="text-slate-700">{t('supportPage.p1')}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Support Card */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <FiLifeBuoy className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{t('supportPage.supportLink')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('supportPage.p1')}</p>
                  <a
                    href={supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600"
                  >
                    {t('supportPage.supportLink')} <FiExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Assistant Card */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FiMessageCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{t('supportPage.assistantTitle')}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t('supportPage.assistantP1')}</p>
                  <a
                    href={assistantUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600"
                  >
                    {t('supportPage.assistantLink')} <FiExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StaticPageLayout>
    </div>
  );
};
export default SupportPage;
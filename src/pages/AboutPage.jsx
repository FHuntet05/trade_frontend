// frontend/pages/AboutPage.jsx (v2.1 - i18n blog-style)
import React from 'react';
import { useTranslation } from 'react-i18next';
import StaticPageLayout from '../components/layout/StaticPageLayout';

const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <StaticPageLayout title={t('aboutPage.title')}>
        <article className="space-y-10">
          {/* Hero */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-pink-500/15 text-pink-600 border border-pink-400/30">
                {t('aboutDetailed.badge')}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                {t('aboutDetailed.heroTitle')}
              </h2>
              <p className="text-gray-700">{t('aboutDetailed.heroP1')}</p>
              <p className="text-gray-700">{t('aboutDetailed.heroP2')}</p>
            </div>
            <div>
              <img
                src="/assets/images/img1personas.jpg"
                alt={t('aboutDetailed.alt1')}
                className="w-full h-56 md:h-72 rounded-2xl object-cover shadow-xl shadow-black/20 border border-gray-200"
                loading="lazy"
              />
            </div>
          </section>

          {/* Cómo funciona */}
          <section className="space-y-5">
            <h3 className="text-xl font-bold text-white">{t('aboutDetailed.how.title')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{
                n: '1',
                title: t('aboutDetailed.how.steps.1.title'),
                body: t('aboutDetailed.how.steps.1.body')
              },{
                n: '2',
                title: t('aboutDetailed.how.steps.2.title'),
                body: t('aboutDetailed.how.steps.2.body')
              },{
                n: '3',
                title: t('aboutDetailed.how.steps.3.title'),
                body: t('aboutDetailed.how.steps.3.body')
              },{
                n: '4',
                title: t('aboutDetailed.how.steps.4.title'),
                body: t('aboutDetailed.how.steps.4.body')
              }].map((step) => (
                <div key={step.n} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-5 shadow-sm">
                  <div className="absolute -top-3 -left-3 w-14 h-14 rounded-full bg-pink-500 border border-pink-400 flex items-center justify-center shadow-md">
                    <span className="text-white font-extrabold text-lg">{step.n}</span>
                  </div>
                  <div className="pl-10">
                    <h4 className="text-gray-900 font-semibold mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-700">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Por qué invertir */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{t('aboutDetailed.why.title')}</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[ 
                t('aboutDetailed.why.items.0'),
                t('aboutDetailed.why.items.1'),
                t('aboutDetailed.why.items.2'),
                t('aboutDetailed.why.items.3'),
                t('aboutDetailed.why.items.4'),
                t('aboutDetailed.why.items.5')
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 shadow-sm">
                  <span aria-hidden className="mt-0.5">✅</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Cómo se generan las ganancias */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">{t('aboutDetailed.earnings.title')}</h3>
            <p className="text-gray-700">{t('aboutDetailed.earnings.p')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 border border-pink-300 p-5 shadow-sm">
                <p className="text-gray-900 font-semibold">{t('aboutDetailed.earnings.example1.title')}</p>
                <p className="text-gray-700 text-sm">{t('aboutDetailed.earnings.example1.subtitle')}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-300 p-5 shadow-sm">
                <p className="text-gray-900 font-semibold">{t('aboutDetailed.earnings.example2.title')}</p>
                <p className="text-gray-700 text-sm">{t('aboutDetailed.earnings.example2.subtitle')}</p>
              </div>
            </div>
          </section>

          {/* Misión */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="order-2 md:order-1 space-y-3">
              <h3 className="text-xl font-bold text-gray-900">{t('aboutDetailed.mission.title')}</h3>
              <p className="text-gray-700">{t('aboutDetailed.mission.body')}</p>
            </div>
            <div className="order-1 md:order-2">
              <img
                src="/assets/images/img2cunno.jpg"
                alt={t('aboutDetailed.alt2')}
                className="w-full rounded-2xl object-contain shadow-xl shadow-black/20 border border-gray-200"
                loading="lazy"
              />
            </div>
          </section>
        </article>
      </StaticPageLayout>
    </div>
  );
};
export default AboutPage;
// frontend/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white text-center p-6 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Card */}
      <div className="relative max-w-lg w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
          <span className="text-4xl font-black text-pink-400 select-none">404</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{t('notFound.title')}</h1>
        <p className="text-text-secondary mb-6">{t('notFound.description')}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg font-semibold bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-purple-500/30 hover:opacity-95 transition"
          >
            {t('notFound.actions.home')}
          </Link>
          <Link
            to="/support"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg font-semibold border border-white/20 text-white/90 hover:bg-white/10 transition"
          >
            {t('notFound.actions.support')}
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg font-semibold border border-white/20 text-white/90 hover:bg-white/10 transition"
          >
            {t('notFound.actions.about')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
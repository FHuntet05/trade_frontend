// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import esTranslation from './locales/es/translation.json';
import enTranslation from './locales/en/translation.json';
import arTranslation from './locales/ar/translation.json';

i18n
  // Detecta el idioma del usuario
  .use(LanguageDetector)
  // Pasa la instancia de i18n a react-i18next.
  .use(initReactI18next)
  // Inicializa i18next
  .init({
    // Activa el modo debug en desarrollo para ver logs en la consola
    debug: true, 
    // Idioma por defecto si el idioma del detector no está disponible
    fallbackLng: 'en', 
    interpolation: {
      // React ya se encarga de escapar valores para prevenir XSS
      escapeValue: false, 
    },
    resources: {
      es: {
        translation: esTranslation,
      },
      en: {
        translation: enTranslation,
      },
      ar: {
        translation: arTranslation,
      },
    },
  });

export default i18n;
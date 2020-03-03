import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './translation/en.json';
import cs from './translation/cs.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    resources: { cs, en },

    detection: {
      order: ['htmlTag', 'querystring', 'cookie', 'localStorage', 'navigator', 'path', 'subdomain'],
    },

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;

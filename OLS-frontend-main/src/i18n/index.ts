import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';

const savedLanguage = localStorage.getItem('language-storage');
const parsedLanguage = savedLanguage ? JSON.parse(savedLanguage)?.state?.language : 'fr';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: parsedLanguage || 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

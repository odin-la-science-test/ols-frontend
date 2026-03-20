import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/i18n';

export interface Language {
  code: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'fr', flag: '🇫🇷' },
  { code: 'en', flag: '🇬🇧' },
];

interface LanguageState {
  language: string;
  changeLanguage: (langCode: string) => void;
  initLanguage: () => void;
  getCurrentLanguage: () => Language;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'fr',

      changeLanguage: (langCode) => {
        set({ language: langCode });
        i18n.changeLanguage(langCode);
      },

      initLanguage: () => {
        const lang = get().language;
        i18n.changeLanguage(lang);
      },

      getCurrentLanguage: () => {
        const code = get().language;
        return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

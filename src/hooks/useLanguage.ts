import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, translations } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      t: translations['en'],
      setLanguage: (lang: Language) => set({ 
        language: lang,
        t: translations[lang]
      }),
    }),
    {
      name: 'cloudapper-language',
    }
  )
);

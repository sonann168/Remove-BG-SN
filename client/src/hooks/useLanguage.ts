import { useEffect, useState } from 'react';
import { Language, getLanguage, getTranslation } from '@/lib/i18n';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const lang = getLanguage();
    setLanguageState(lang);
    document.documentElement.lang = lang;
  }, []);

  const t = (key: keyof typeof getTranslation.arguments[1]) => {
    return getTranslation(language, key as any);
  };

  return {
    language,
    t,
    setLanguage: setLanguageState,
  };
}

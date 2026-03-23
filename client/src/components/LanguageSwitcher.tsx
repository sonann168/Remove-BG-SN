import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Language } from '@/lib/i18n';
import { useLanguageContext, getAnimationClass } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  onLanguageChange?: (lang: Language) => void;
}

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language: currentLang, setLanguage, isTransitioning, animationType } = useLanguageContext();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const handleLanguageChange = (lang: Language) => {
    if (lang === currentLang) {
      setIsOpen(false);
      return;
    }
    setLanguage(lang);
    setIsOpen(false);
    onLanguageChange?.(lang);
  };

  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-arcade-cyan flex items-center gap-2 text-xs md:text-sm transition-all duration-200 ${
          isTransitioning ? `opacity-70 ${getAnimationClass(animationType)}` : 'opacity-100'
        }`}
        title="Change language"
        disabled={isTransitioning}
      >
        <Globe size={16} />
        <span>{currentLanguage?.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-card border-4 border-primary rounded-none z-50 min-w-max animate-in fade-in duration-150">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isTransitioning}
              className={`w-full px-4 py-2 text-left text-sm transition-all duration-200 ${
                currentLang === lang.code
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              } ${
                isTransitioning ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, setLanguage as persistLanguage, getLanguage } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isTransitioning: boolean;
  animationType: 'slide' | 'glow' | 'rotate' | 'wave';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const animationTypes: Array<'slide' | 'glow' | 'rotate' | 'wave'> = ['slide', 'glow', 'rotate', 'wave'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animationType, setAnimationType] = useState<'slide' | 'glow' | 'rotate' | 'wave'>('slide');

  // Initialize language from localStorage on mount
  useEffect(() => {
    const savedLanguage = getLanguage();
    setLanguageState(savedLanguage);
    document.documentElement.lang = savedLanguage;
  }, []);

  const setLanguage = (newLanguage: Language) => {
    if (newLanguage === language) return;

    // Randomly select animation type for variety
    const randomAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    setAnimationType(randomAnimation);

    // Start transition
    setIsTransitioning(true);

    // Change language after a short delay for smooth transition
    setTimeout(() => {
      setLanguageState(newLanguage);
      persistLanguage(newLanguage);
      document.documentElement.lang = newLanguage;
      
      // End transition
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isTransitioning, animationType }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within LanguageProvider');
  }
  return context;
}

export function getAnimationClass(animationType: 'slide' | 'glow' | 'rotate' | 'wave'): string {
  switch (animationType) {
    case 'slide':
      return 'animate-slide-up';
    case 'glow':
      return 'animate-glow-pulse';
    case 'rotate':
      return 'animate-rotate-spin';
    case 'wave':
      return 'animate-text-wave';
    default:
      return 'animate-slide-up';
  }
}

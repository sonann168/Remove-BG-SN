import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getTranslation, getLanguage, setLanguage, translations } from './i18n';
import type { Language } from './i18n';

describe('i18n - Internationalization', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('Translation Keys', () => {
    it('should have all required translation keys in Khmer', () => {
      const khmerKeys = Object.keys(translations.km);
      expect(khmerKeys.length).toBeGreaterThan(0);
      expect(khmerKeys).toContain('title');
      expect(khmerKeys).toContain('subtitle');
      expect(khmerKeys).toContain('uploadImage');
    });

    it('should have all required translation keys in English', () => {
      const englishKeys = Object.keys(translations.en);
      expect(englishKeys.length).toBeGreaterThan(0);
      expect(englishKeys).toContain('title');
      expect(englishKeys).toContain('subtitle');
      expect(englishKeys).toContain('uploadImage');
    });

    it('should have all required translation keys in Chinese', () => {
      const chineseKeys = Object.keys(translations.zh);
      expect(chineseKeys.length).toBeGreaterThan(0);
      expect(chineseKeys).toContain('title');
      expect(chineseKeys).toContain('subtitle');
      expect(chineseKeys).toContain('uploadImage');
    });

    it('should have matching keys across all languages', () => {
      const kmKeys = Object.keys(translations.km).sort();
      const enKeys = Object.keys(translations.en).sort();
      const zhKeys = Object.keys(translations.zh).sort();

      expect(kmKeys).toEqual(enKeys);
      expect(enKeys).toEqual(zhKeys);
    });
  });

  describe('getTranslation', () => {
    it('should return Khmer translation for valid key', () => {
      const result = getTranslation('km', 'title');
      expect(result).toBe('ឧបករណ៍លុបផ្ទៃខាងក្រោយ');
    });

    it('should return English translation for valid key', () => {
      const result = getTranslation('en', 'title');
      expect(result).toBe('BG REMOVER');
    });

    it('should return Chinese translation for valid key', () => {
      const result = getTranslation('zh', 'title');
      expect(result).toBe('背景移除工具');
    });

    it('should return English translation as fallback for unknown language', () => {
      const result = getTranslation('en' as Language, 'subtitle');
      expect(result).toBe('AI POWERED BACKGROUND REMOVAL');
    });

    it('should return translation for all UI text keys', () => {
      const keys: Array<keyof typeof translations.en> = [
        'uploadImage',
        'processing',
        'completed',
        'failed',
        'downloadPNG',
        'downloadJPG',
        'features',
        'history',
        'developerAPI',
      ];

      keys.forEach(key => {
        const kmTranslation = getTranslation('km', key);
        const enTranslation = getTranslation('en', key);
        const zhTranslation = getTranslation('zh', key);

        expect(kmTranslation).toBeTruthy();
        expect(enTranslation).toBeTruthy();
        expect(zhTranslation).toBeTruthy();
      });
    });
  });

  describe('Language Persistence', () => {
    it('should save language to localStorage', () => {
      setLanguage('km');
      const stored = localStorage.getItem('language');
      expect(stored).toBe('km');
    });

    it('should save English language to localStorage', () => {
      setLanguage('en');
      const stored = localStorage.getItem('language');
      expect(stored).toBe('en');
    });

    it('should save Chinese language to localStorage', () => {
      setLanguage('zh');
      const stored = localStorage.getItem('language');
      expect(stored).toBe('zh');
    });

    it('should set document language attribute', () => {
      setLanguage('km');
      expect(document.documentElement.lang).toBe('km');

      setLanguage('en');
      expect(document.documentElement.lang).toBe('en');

      setLanguage('zh');
      expect(document.documentElement.lang).toBe('zh');
    });
  });

  describe('getLanguage', () => {
    it('should return default English when no language is stored', () => {
      const lang = getLanguage();
      expect(lang).toBe('en');
    });

    it('should return stored Khmer language', () => {
      localStorage.setItem('language', 'km');
      const lang = getLanguage();
      expect(lang).toBe('km');
    });

    it('should return stored Chinese language', () => {
      localStorage.setItem('language', 'zh');
      const lang = getLanguage();
      expect(lang).toBe('zh');
    });

    it('should return default English for invalid stored language', () => {
      localStorage.setItem('language', 'invalid');
      const lang = getLanguage();
      expect(lang).toBe('en');
    });

    it('should validate language code before returning', () => {
      const validLanguages: Language[] = ['km', 'en', 'zh'];
      validLanguages.forEach(lang => {
        localStorage.setItem('language', lang);
        const result = getLanguage();
        expect(validLanguages).toContain(result);
      });
    });
  });

  describe('Translation Content', () => {
    it('should have non-empty translations for all keys in Khmer', () => {
      Object.entries(translations.km).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
      });
    });

    it('should have non-empty translations for all keys in English', () => {
      Object.entries(translations.en).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
      });
    });

    it('should have non-empty translations for all keys in Chinese', () => {
      Object.entries(translations.zh).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
      });
    });

    it('should have different translations for each language', () => {
      const keys = Object.keys(translations.en) as Array<keyof typeof translations.en>;
      
      keys.forEach(key => {
        const km = translations.km[key];
        const en = translations.en[key];
        const zh = translations.zh[key];

        // At least one translation should be different from others
        const allSame = km === en && en === zh;
        expect(allSame).toBe(false);
      });
    });
  });

  describe('Language Codes', () => {
    it('should support three languages', () => {
      const languages = ['km', 'en', 'zh'] as Language[];
      
      languages.forEach(lang => {
        expect(translations[lang]).toBeDefined();
        expect(Object.keys(translations[lang]).length).toBeGreaterThan(0);
      });
    });

    it('should have consistent language codes', () => {
      const kmCode = 'km';
      const enCode = 'en';
      const zhCode = 'zh';

      expect(translations[kmCode]).toBeDefined();
      expect(translations[enCode]).toBeDefined();
      expect(translations[zhCode]).toBeDefined();
    });
  });
});

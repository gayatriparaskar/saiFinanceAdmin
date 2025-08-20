import { useTranslation } from 'react-i18next';
import { getTranslation } from '../utils/translations';
import { useEffect, useState } from 'react';

export const useLocalTranslation = () => {
  const { t: i18nT, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // Listen to language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const t = (key, fallback = key) => {
    // First try to get from i18next (this ensures reactivity to language changes)
    try {
      const i18nextTranslation = i18nT(key);
      if (i18nextTranslation !== key) {
        return i18nextTranslation;
      }
    } catch (error) {
      // If i18next fails, continue to local translations
    }

    // Then try to get from our local translations
    const localTranslation = getTranslation(key, currentLanguage);
    if (localTranslation !== key) {
      return localTranslation;
    }

    // Finally use fallback
    return fallback;
  };

  return { t, currentLanguage };
};

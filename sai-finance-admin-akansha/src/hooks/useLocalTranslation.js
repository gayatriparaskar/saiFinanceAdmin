import { useTranslation } from 'react-i18next';
import { getTranslation } from '../utils/translations';

export const useLocalTranslation = () => {
  const { i18n } = useTranslation();
  
  const t = (key, fallback = key) => {
    const currentLanguage = i18n.language || 'en';
    // First try to get from our local translations
    const localTranslation = getTranslation(key, currentLanguage);
    if (localTranslation !== key) {
      return localTranslation;
    }
    
    // If not found in local, use i18next with fallback
    return fallback;
  };
  
  return { t, currentLanguage: i18n.language || 'en' };
};

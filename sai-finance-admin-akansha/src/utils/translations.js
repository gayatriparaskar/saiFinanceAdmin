// Translation mappings for common UI elements
export const translations = {
  en: {
    // Common actions
    'Search': 'Search',
    'Edit': 'Edit',
    'Delete': 'Delete',
    'Save': 'Save',
    'Cancel': 'Cancel',
    'Actions': 'Actions',
    'Previous': 'Previous',
    'Next': 'Next',
    'Close': 'Close',
    
    // Officer page
    'Total Officers': 'Total Officers',
    'Active Officers': 'Active Officers',
    'Search officers...': 'Search officers...',
    'Add New Officer': 'Add New Officer',
    'Officer Name': 'Officer Name',
    'Employee ID': 'Employee ID',
    'Department': 'Department',
    'Position': 'Position',
    'Phone Number': 'Phone Number',
    'Email': 'Email',
    'Join Date': 'Join Date',
    'Status': 'Status',
    'Action': 'Action',
    'View Officer': 'View Officer',
    'Officer Statistics': 'Officer Statistics',
    'Delete Officer': 'Delete Officer',
    'Edit Officer': 'Edit Officer',
    'Are you sure you want to delete this officer? This action cannot be undone.': 'Are you sure you want to delete this officer? This action cannot be undone.',
    
    // Savings page
    'Total Savings': 'Total Savings',
    'Total Accounts': 'Total Accounts',
    'Search accounts...': 'Search accounts...',
    'Add New Account': 'Add New Account',
    'Account Holder': 'Account Holder',
    'Account Number': 'Account Number',
    'Balance': 'Balance',
    'Account Type': 'Account Type',
    'Date Created': 'Date Created',
    'Phone': 'Phone',
    
    // Loan page
    'Total Collection': 'Total Collection',
    'Total Active User': 'Total Active User',
    'Search...': 'Search...',
    'Add New User': 'Add New User',
    
    // Common
    'Sr No.': 'Sr No.',
    'Sort By': 'Sort By',
    'Financial Dashboard': 'Financial Dashboard',
    'Real-time analytics and insights for your finance management': 'Real-time analytics and insights for your finance management',
    'Daily Collection': 'Daily Collection',
    'Total Loan Customers': 'Total Loan Customers',
    'Total Outgoing': 'Total Outgoing',
    'Sign out of your account': 'Sign out of your account',

    // Navbar
    'Home': 'Home',
    'Loan Account': 'Loan Account',
    'Saving Account': 'Saving Account',
    'Officer Controls': 'Officer Controls',
    'Payment Controls': 'Payment Controls',
    'Payment': 'Payment',
    'Payment Request': 'Payment Request',
    'Language': 'Language',
  },
  hi: {
    // Common actions
    'Search': 'खोजें',
    'Edit': 'संपादित करें',
    'Delete': 'हटाएं',
    'Save': 'सेव करें',
    'Cancel': 'रद्द करें',
    'Actions': 'कार्य',
    'Previous': 'पिछला',
    'Next': 'अगला',
    'Close': 'बंद करें',
    
    // Officer page
    'Total Officers': 'कुल अधिकारी',
    'Active Officers': 'सक्रिय अधिकारी',
    'Search officers...': 'अधिकारी खोजें...',
    'Add New Officer': 'नया अधिकारी जोड़ें',
    'Officer Name': 'अधिकारी का नाम',
    'Employee ID': 'कर्मचारी आईडी',
    'Department': 'विभाग',
    'Position': 'पद',
    'Phone Number': 'फोन नंबर',
    'Email': 'ईमेल',
    'Join Date': 'ज्वाइन की तारीख',
    'Status': 'स्थिति',
    'Action': 'कार्य',
    'View Officer': 'अधिकारी देखें',
    'Officer Statistics': 'अधिकारी आंकड़े',
    'Delete Officer': 'अधिकारी हटाएं',
    'Edit Officer': 'अधिकारी संपादित करें',
    'Are you sure you want to delete this officer? This action cannot be undone.': 'क्या आप वाकई इस अधिकारी को हटाना चाहते हैं? यह कार्य पूर्ववत नहीं किया जा सकता।',
    
    // Savings page
    'Total Savings': 'कुल बचत',
    'Total Accounts': 'कुल खाते',
    'Search accounts...': 'खाते खोजें...',
    'Add New Account': 'नया खाता जोड़ें',
    'Account Holder': 'खाता धारक',
    'Account Number': 'खाता संख्या',
    'Balance': 'शेष राशि',
    'Account Type': 'खाता प्रकार',
    'Date Created': 'बनाने की तारीख',
    'Phone': 'फोन',
    
    // Loan page
    'Total Collection': 'कुल संग्रह',
    'Total Active User': 'कुल सक्रिय उपयोगकर्ता',
    'Search...': 'खोजें...',
    'Add New User': 'नया उपयोगकर्ता जोड़ें',
    
    // Common
    'Sr No.': 'क्रम संख्या',
    'Sort By': 'इसके अनुसार क्रमबद्ध करें',
    'Financial Dashboard': 'वि��्तीय डैशबोर्ड',
    'Real-time analytics and insights for your finance management': 'आपके वित्त प्रबंधन के लिए रीयल-टाइम एनालिटिक्स और अंतर्दृष्टि',
    'Daily Collection': 'दैनिक संग्रह',
    'Total Loan Customers': 'कुल ऋण ग्राहक',
    'Total Outgoing': 'कुल निवर्तमान',
    'Sign out of your account': 'अपने खाते से साइन आउट करें',

    // Navbar
    'Home': 'होम',
    'Loan Account': 'ऋण खाता',
    'Saving Account': 'बचत खाता',
    'Officer Controls': 'अधिकारी नियंत्रण',
    'Payment Controls': 'भुगतान नियंत्रण',
    'Payment': 'भुगतान',
    'Payment Request': 'भुगतान अनुरोध',
    'Language': 'भाषा',
  }
};

// Helper function to get translation
export const getTranslation = (key, currentLanguage = 'en') => {
  return translations[currentLanguage]?.[key] || translations.en[key] || key;
};

export type Language = 'km' | 'en' | 'zh';

export const translations = {
  km: {
    // Header
    title: 'ឧបករណ៍លុបផ្ទៃខាងក្រោយ',
    subtitle: 'ឧបករណ៍លុបផ្ទៃខាងក្រោយដោយប្រើបច្ចេកវិទ្យា AI',
    description: 'លុបផ្ទៃខាងក្រោយរូបភាពបានលឿនដោយប្រើបច្ចេកវិទ្យា AI ឈានលើគេ',

    // Upload Section
    uploadImage: 'ផ្ទុករូបភាព',
    dropHere: 'ទម្លាក់រូបភាពនៅទីនេះ',
    orClick: 'ឬចុចដើម្បីរើស',
    supportedFormats: 'PNG, JPG, JPEG, WebP • ដែនកំណត់ 10MB',

    // Processing
    processingQueue: 'ជួរដេកដំណើរការ',
    processing: 'កំពុងដំណើរការ...',
    completed: 'បានបញ្ចប់',
    failed: 'បរាជ័យ',
    pending: 'រង់ចាំ',

    // Comparison
    original: 'ដើម',
    processed: 'បានដំណើរការ',
    slider: 'រអិល',
    sideBySide: 'ម្ខាងក្នុងម្ខាង',

    // Download
    downloadPNG: 'ទាញយក PNG',
    downloadJPG: 'ទាញយក JPG',
    download: 'ទាញយក',

    // Features
    features: 'លក្ខណៈពិសេស',
    instant: 'ភ្លាមៗ',
    fastAI: 'ដំណើរការ AI លឿន',
    export: 'នាំចេញ',
    pngJpgFormats: 'ទម្រង់ PNG និង JPG',
    history: 'ប្រវត្តិ',
    trackEdits: 'តាមដានការកែសម្រួល',

    // History
    recentEdits: 'ការកែសម្រួលថ្មីៗ',
    show: 'បង្ហាញ',
    hide: 'លាក់',

    // API
    developerAPI: 'API សម្រាប់អ្នកអភិវឌ្ឍ',
    integrateBackground: 'ដាក់បញ្ចូលលុបផ្ទៃខាងក្រោយទៅក្នុងកម្មវិធីរបស់អ្នក',
    getAPIAccess: 'ទទួលបានលទ្ធិប្រើប្រាស់ API',

    // Footer
    footer: '© 2026 ឧបករណ៍លុបផ្ទៃខាងក្រោយ AI • ដំណើរការដោយបច្ចេកវិទ្យាដំណើរការរូបភាពឈានលើគេ',

    // Language
    language: 'ភាសា',
    khmer: 'ខ្មែរ',
    english: 'English',
    chinese: '中文',
  },
  en: {
    // Header
    title: 'BG REMOVER',
    subtitle: 'AI POWERED BACKGROUND REMOVAL',
    description: 'Remove backgrounds instantly with advanced AI technology',

    // Upload Section
    uploadImage: 'UPLOAD IMAGE',
    dropHere: 'DROP YOUR IMAGE HERE',
    orClick: 'or click to browse',
    supportedFormats: 'PNG, JPG, JPEG, WebP • Max 10MB',

    // Processing
    processingQueue: 'PROCESSING QUEUE',
    processing: 'Processing...',
    completed: 'Completed',
    failed: 'Failed',
    pending: 'Pending',

    // Comparison
    original: 'ORIGINAL',
    processed: 'PROCESSED',
    slider: 'SLIDER',
    sideBySide: 'SIDE-BY-SIDE',

    // Download
    downloadPNG: 'PNG',
    downloadJPG: 'JPG',
    download: 'DOWNLOAD',

    // Features
    features: 'FEATURES',
    instant: 'INSTANT',
    fastAI: 'Fast AI processing',
    export: 'EXPORT',
    pngJpgFormats: 'PNG & JPG formats',
    history: 'HISTORY',
    trackEdits: 'Track all edits',

    // History
    recentEdits: 'RECENT EDITS',
    show: 'SHOW',
    hide: 'HIDE',

    // API
    developerAPI: 'DEVELOPER API',
    integrateBackground: 'Integrate background removal into your applications',
    getAPIAccess: 'GET API ACCESS',

    // Footer
    footer: '© 2026 BG Remover AI • Powered by Advanced Image Processing',

    // Language
    language: 'LANGUAGE',
    khmer: 'ខ្មែរ',
    english: 'English',
    chinese: '中文',
  },
  zh: {
    // Header
    title: '背景移除工具',
    subtitle: '人工智能驱动的背景移除',
    description: '使用先进的人工智能技术快速移除背景',

    // Upload Section
    uploadImage: '上传图像',
    dropHere: '将图像拖放到此处',
    orClick: '或点击浏览',
    supportedFormats: 'PNG、JPG、JPEG、WebP • 最大 10MB',

    // Processing
    processingQueue: '处理队列',
    processing: '处理中...',
    completed: '已完成',
    failed: '失败',
    pending: '待处理',

    // Comparison
    original: '原始',
    processed: '已处理',
    slider: '滑块',
    sideBySide: '并排',

    // Download
    downloadPNG: 'PNG',
    downloadJPG: 'JPG',
    download: '下载',

    // Features
    features: '功能',
    instant: '即时',
    fastAI: '快速 AI 处理',
    export: '导出',
    pngJpgFormats: 'PNG 和 JPG 格式',
    history: '历史记录',
    trackEdits: '跟踪所有编辑',

    // History
    recentEdits: '最近编辑',
    show: '显示',
    hide: '隐藏',

    // API
    developerAPI: '开发者 API',
    integrateBackground: '将背景移除集成到您的应用程序中',
    getAPIAccess: '获取 API 访问权限',

    // Footer
    footer: '© 2026 背景移除工具 AI • 由先进的图像处理技术提供支持',

    // Language
    language: '语言',
    khmer: 'ខ្មែរ',
    english: 'English',
    chinese: '中文',
  },
};

export function getTranslation(lang: Language, key: keyof typeof translations.en): string {
  return translations[lang][key as keyof typeof translations[typeof lang]] || translations.en[key];
}

export function setLanguage(lang: Language): void {
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
}

export function getLanguage(): Language {
  const stored = localStorage.getItem('language') as Language | null;
  if (stored && ['km', 'en', 'zh'].includes(stored)) {
    return stored;
  }
  return 'en';
}

/**
 * Viksit Bengal Dashboard - Test Fixtures & Authoritative Domain Data
 */

export const DISTRICTS_23 = [
  { code: 'APD', nameEn: 'Alipurduar', nameBn: 'আলিপুরদুয়ার' },
  { code: 'BNK', nameEn: 'Bankura', nameBn: 'বাঁকুড়া' },
  { code: 'BIR', nameEn: 'Birbhum', nameBn: 'বীরভূম' },
  { code: 'COB', nameEn: 'Cooch Behar', nameBn: 'কোচবিহার' },
  { code: 'DDN', nameEn: 'Dakshin Dinajpur', nameBn: 'দক্ষিণ দিনাজপুর' },
  { code: 'DAR', nameEn: 'Darjeeling', nameBn: 'দার্জিলিং' },
  { code: 'HOG', nameEn: 'Hooghly', nameBn: 'হুগলি' },
  { code: 'HOW', nameEn: 'Howrah', nameBn: 'হাওড়া' },
  { code: 'JAL', nameEn: 'Jalpaiguri', nameBn: 'জলপাইগুড়ি' },
  { code: 'JHR', nameEn: 'Jhargram', nameBn: 'ঝাড়গ্রাম' },
  { code: 'KAL', nameEn: 'Kalimpong', nameBn: 'কালিম্পং' },
  { code: 'KOL', nameEn: 'Kolkata', nameBn: 'কলকাতা' },
  { code: 'MLD', nameEn: 'Malda', nameBn: 'মালদা' },
  { code: 'MSD', nameEn: 'Murshidabad', nameBn: 'মুর্শিদাবাদ' },
  { code: 'NAD', nameEn: 'Nadia', nameBn: 'নদিয়া' },
  { code: 'N24', nameEn: 'North 24 Parganas', nameBn: 'উত্তর ২৪ পরগনা' },
  { code: 'PBD', nameEn: 'Paschim Bardhaman', nameBn: 'পশ্চিম বর্ধমান' },
  { code: 'PMD', nameEn: 'Paschim Medinipur', nameBn: 'পশ্চিম মেদিনীপুর' },
  { code: 'EBD', nameEn: 'Purba Bardhaman', nameBn: 'পূর্ব বর্ধমান' },
  { code: 'EMD', nameEn: 'Purba Medinipur', nameBn: 'পূর্ব মেদিনীপুর' },
  { code: 'PUR', nameEn: 'Purulia', nameBn: 'পুরুলিয়া' },
  { code: 'S24', nameEn: 'South 24 Parganas', nameBn: 'দক্ষিণ ২৪ পরগনা' },
  { code: 'UDN', nameEn: 'Uttar Dinajpur', nameBn: 'উত্তর দিনাজপুর' }
];

export const USERS = {
  admin: {
    email: 'admin@viksitbengal.gov.in',
    password: 'Admin@123',
    role: 'ADMIN',
    name: 'State Administrator'
  },
  researcher: {
    email: 'researcher@viksitbengal.gov.in',
    password: 'Researcher@123',
    role: 'RESEARCHER',
    name: 'Policy Researcher'
  },
  public: {
    email: 'citizen@viksitbengal.gov.in',
    password: 'Citizen@123',
    role: 'PUBLIC',
    name: 'Citizen Observer'
  }
};

export const ENUMS = {
  Role: ['ADMIN', 'RESEARCHER', 'PUBLIC'],
  PromiseStatus: [
    'NOT_STARTED', 'ANNOUNCED', 'LEGALLY_INITIATED', 'FUNDED',
    'UNDER_IMPLEMENTATION', 'PARTIALLY_DELIVERED', 'DELIVERED',
    'DELAYED', 'REVERSED', 'DISPUTED', 'NOT_VERIFIABLE'
  ],
  Confidence: ['A', 'B', 'C', 'D'],
  SourceType: [
    'GAZETTE', 'GOVERNMENT_ORDER', 'BUDGET', 'AUDIT',
    'STATISTICAL_RELEASE', 'NEWSPAPER', 'INSTITUTIONAL_REPORT',
    'POLITICAL_STATEMENT', 'USER_SUBMITTED'
  ],
  SourceTier: ['TIER_1', 'TIER_2', 'TIER_3'],
  ReviewStatus: ['PENDING', 'APPROVED', 'REJECTED'],
  Scenario: ['CONSERVATIVE', 'BASE_CASE', 'AMBITIOUS']
};

export const SAMPLE_PROMISE = {
  code: 'INFRA-01',
  categoryId: 'cat-infra-001',
  titleEn: 'Kolkata-Siliguri High-Speed Logistics Corridor',
  titleBn: 'কলকাতা-শিলিগুড়ি দ্রুতগতির লজিস্টিক করিডোর',
  descriptionEn: 'Construction of 6-lane express economic highway connecting southern and northern Bengal.',
  descriptionBn: 'উত্তর ও দক্ষিণ বাংলাকে সংযোগকারী ৬ লেনের দ্রুত অর্থনৈতিক করিডোর নির্মাণ।',
  status: 'UNDER_IMPLEMENTATION',
  confidence: 'A',
  isKeyPromise: true,
  keyPromiseNumber: 1
};

export const SAMPLE_EVIDENCE = {
  title: 'West Bengal State Gazette Notification No. WB/4092/2026',
  url: 'https://wb.gov.in/gazette/2026/notice-4092.pdf',
  sourceType: 'GAZETTE',
  sourceTier: 'TIER_1',
  excerpt: 'Land acquisition finalized and capital expenditure approved under Schedule 4.'
};

export const ADVERSARIAL_PAYLOADS = {
  sqli: ["' OR '1'='1", "1; DROP TABLE users; --", "admin' --", "' UNION SELECT * FROM users --"],
  xss: ["<script>alert('xss')</script>", "<img src=x onerror=alert(1)>", "javascript:void(0)"],
  prototypePollution: { "__proto__": { "isAdmin": true }, "constructor": { "prototype": { "role": "ADMIN" } } },
  bufferOverflow: 'A'.repeat(50000),
  nullByte: "malicious\0payload.txt",
  unicodeSurrogate: "\uD800\uDFFF\uFEFF"
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

// Relative Luminance & WCAG Contrast Formula
function hexToRgb(hex) {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function channelToLinear(channelValue) {
  const sRGB = channelValue / 255;
  return sRGB <= 0.04045
    ? sRGB / 12.92
    : Math.pow((sRGB + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  const r = channelToLinear(rgb.r);
  const g = channelToLinear(rgb.g);
  const b = channelToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(c1, c2) {
  const l1 = getRelativeLuminance(c1);
  const l2 = getRelativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
    throw new Error(message);
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

console.log('=== Viksit Bengal - Milestone 5: WCAG 2.2 AA & Accessibility Test Suite ===\n');

// 1. Contrast Test: Header #FFFFFF text on #0A5C36 primary background
const headerContrast = calculateContrastRatio('#FFFFFF', '#0A5C36');
assert(
  headerContrast >= 4.5,
  `Header text contrast (${headerContrast}:1) must exceed WCAG 2.2 AA normal text requirement of 4.5:1`
);
assert(
  headerContrast >= 7.0,
  `Header text contrast (${headerContrast}:1) achieves WCAG AAA level (>= 7.0:1)`
);

// 2. Contrast Test: Regression Guard - Legacy Gold on Primary Green
const legacyGoldContrast = calculateContrastRatio('#C5961A', '#0A5C36');
assert(
  legacyGoldContrast < 4.5,
  `Regression guard confirms legacy #C5961A on #0A5C36 has ${legacyGoldContrast}:1 contrast and fails AA (4.5:1)`
);

// 3. Header file source inspection
const headerContent = fs.readFileSync(path.join(webRoot, 'components/layout/Header.tsx'), 'utf-8');
assert(
  headerContent.includes('role="banner"'),
  'Header component renders standard ARIA landmark role="banner"'
);
assert(
  headerContent.includes('text-white') && headerContent.includes('bg-primary'),
  'Header component explicitly applies text-white on bg-primary'
);
assert(
  headerContent.includes('role="banner"') && headerContent.includes('aria-label="Main Navigation"'),
  'Header includes nav landmark with descriptive aria-label'
);
assert(
  headerContent.includes('min-h-[44px]'),
  'Header navigation links provide >= 44x44px touch targets'
);
assert(
  headerContent.includes('focus-visible:ring-2') && headerContent.includes('focus-visible:ring-white'),
  'Header links configure high-visibility focus indicators for keyboard navigation'
);

// 4. Footer file source inspection
const footerContent = fs.readFileSync(path.join(webRoot, 'components/layout/Footer.tsx'), 'utf-8');
assert(
  footerContent.includes('role="contentinfo"'),
  'Footer component renders standard ARIA landmark role="contentinfo"'
);
assert(
  footerContent.includes('focus-visible:ring-2'),
  'Footer links configure visible keyboard focus indicators'
);

// 5. Layout file source inspection
const layoutContent = fs.readFileSync(path.join(webRoot, 'app/[locale]/layout.tsx'), 'utf-8');
assert(
  layoutContent.includes('<html lang={locale}>') || layoutContent.includes('<html lang='),
  'Locale layout dynamically injects valid html lang attribute'
);
assert(
  layoutContent.includes('href="#main-content"'),
  'Locale layout includes a Skip to content navigation link targeting #main-content'
);
assert(
  layoutContent.includes('sr-only') && layoutContent.includes('focus:not-sr-only'),
  'Skip link is accessible to screen readers and becomes visible on keyboard focus'
);
assert(
  layoutContent.includes('id="main-content"') && layoutContent.includes('role="main"'),
  'Main landmark contains id="main-content" and role="main"'
);
assert(
  layoutContent.includes('notFound()'),
  'Locale layout validates locale against supported list and triggers notFound() for invalid locales'
);

// 6. Button component source inspection
const buttonContent = fs.readFileSync(path.join(webRoot, 'components/ui/button.tsx'), 'utf-8');
assert(
  buttonContent.includes('@radix-ui/react-slot'),
  'Button implements polymorphic Slot via @radix-ui/react-slot'
);
assert(
  buttonContent.includes('min-h-[44px]') && buttonContent.includes('min-w-[44px]'),
  'Button enforces WCAG 2.2 AA / mobile touch target minimum of 44x44px'
);
assert(
  buttonContent.includes('focus-visible:ring-2') && buttonContent.includes('focus-visible:outline-none'),
  'Button enforces visible focus outline and ring states'
);

// 7. Progress component source inspection
const progressContent = fs.readFileSync(path.join(webRoot, 'components/ui/progress.tsx'), 'utf-8');
assert(
  progressContent.includes('@radix-ui/react-progress'),
  'Progress component builds on Radix UI Progress primitive'
);
assert(
  progressContent.includes('ProgressPrimitive.Root') && progressContent.includes('ProgressPrimitive.Indicator'),
  'Progress component renders compound Root and Indicator primitives'
);

// 8. Badge component source inspection
const badgeContent = fs.readFileSync(path.join(webRoot, 'components/ui/badge.tsx'), 'utf-8');
assert(
  badgeContent.includes('bg-primary text-white'),
  'Badge default variant uses high contrast bg-primary with text-white'
);

// 9. Card component source inspection
const cardContent = fs.readFileSync(path.join(webRoot, 'components/ui/card.tsx'), 'utf-8');
assert(
  cardContent.includes('CardTitle') && cardContent.includes('CardHeader') && cardContent.includes('CardContent'),
  'Card exposes accessible compound components'
);
assert(
  cardContent.includes('role="region"') || cardContent.includes('role={role}'),
  'Card provides accessible landmark role="region"'
);

// 10. i18n and next.config inspection
const nextConfigContent = fs.readFileSync(path.join(webRoot, 'next.config.mjs'), 'utf-8');
assert(
  nextConfigContent.includes('createNextIntlPlugin'),
  'next.config.mjs wraps configuration with createNextIntlPlugin'
);

const i18nContent = fs.readFileSync(path.join(webRoot, 'i18n.ts'), 'utf-8');
assert(
  i18nContent.includes('getRequestConfig') && i18nContent.includes('notFound()'),
  'i18n.ts configures getRequestConfig and validates locales'
);

const middlewareContent = fs.readFileSync(path.join(webRoot, 'middleware.ts'), 'utf-8');
assert(
  middlewareContent.includes('createMiddleware') && middlewareContent.includes("'en'") && middlewareContent.includes("'bn'"),
  'middleware.ts configures locale routing for English and Bengali'
);

// 11. Translation Bundles Parity Check
const enJson = JSON.parse(fs.readFileSync(path.join(webRoot, 'i18n/messages/en.json'), 'utf-8'));
const bnJson = JSON.parse(fs.readFileSync(path.join(webRoot, 'i18n/messages/bn.json'), 'utf-8'));

const enNamespaces = Object.keys(enJson);
const bnNamespaces = Object.keys(bnJson);

assert(
  enNamespaces.length >= 8,
  `en.json has comprehensive namespaces (${enNamespaces.length} namespaces found)`
);
assert(
  bnNamespaces.length >= 8,
  `bn.json has comprehensive namespaces (${bnNamespaces.length} namespaces found)`
);

for (const ns of enNamespaces) {
  assert(
    bnJson[ns] !== undefined,
    `Namespace "${ns}" must exist in bn.json for localization parity`
  );
  const enKeys = Object.keys(enJson[ns]);
  const bnKeys = Object.keys(bnJson[ns]);
  for (const key of enKeys) {
    assert(
      bnJson[ns][key] !== undefined,
      `Key "${ns}.${key}" must exist in bn.json`
    );
  }
}

console.log(`\n========================================`);
console.log(`All WCAG 2.2 AA & Accessibility Tests Passed! Passed: ${passed}, Failed: ${failed}`);
console.log(`========================================\n`);

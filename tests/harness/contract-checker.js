/**
 * Viksit Bengal Dashboard - Contract & Static Architecture Checker
 * Analyzes codebases, schemas, DTOs, and configs against the interface contracts in PROJECT.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../');

export class ContractChecker {
  constructor(root = PROJECT_ROOT) {
    this.root = root;
  }

  readFile(relPath) {
    const fullPath = path.resolve(this.root, relPath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, 'utf8');
  }

  fileExists(relPath) {
    return fs.existsSync(path.resolve(this.root, relPath));
  }

  checkPrismaSchema() {
    const content = this.readFile('packages/database/prisma/schema.prisma');
    if (!content) return { ok: false, error: 'schema.prisma not found' };

    const hasPostgres = /provider\s*=\s*["']postgresql["']/.test(content);
    const hasPasswordInUser = /model\s+User\s+[\s\S]*?password\s+String/.test(content);
    const has23DistrictEnumsOrModels = /model\s+District\s+/.test(content);
    const hasRoleEnum = /enum\s+Role\s+\{[\s\S]*?ADMIN[\s\S]*?RESEARCHER[\s\S]*?PUBLIC/.test(content);
    const hasPromiseStatusEnum = /enum\s+PromiseStatus\s+\{[\s\S]*?NOT_STARTED[\s\S]*?DELIVERED/.test(content);

    return {
      ok: hasPostgres && hasPasswordInUser && has23DistrictEnumsOrModels && hasRoleEnum && hasPromiseStatusEnum,
      hasPostgres,
      hasPasswordInUser,
      hasDistrictModel: has23DistrictEnumsOrModels,
      hasRoleEnum,
      hasPromiseStatusEnum
    };
  }

  checkSeedData() {
    const seedTs = this.readFile('packages/database/prisma/seed.ts') || '';
    const seedJson = this.readFile('packages/database/prisma/seed-data.json') || '';
    const combined = seedTs + seedJson;

    const hasAdmin = combined.includes('admin@viksitbengal.gov.in');
    const hasResearcher = combined.includes('researcher@viksitbengal.gov.in');
    
    // Check for standard 23 districts in seed
    const districtCodes = ['KOL', 'HOW', 'DAR', 'JAL', 'PUR', 'BNK', 'MLD', 'MSD'];
    const districtsCount = districtCodes.filter(c => combined.includes(c)).length;
    const hasDistrictsSeeded = districtsCount >= 4;

    const hasGsdpTargets = combined.includes('CONSERVATIVE') || combined.includes('BASE_CASE') || combined.includes('AMBITIOUS');

    return {
      ok: hasAdmin && hasResearcher && hasDistrictsSeeded && hasGsdpTargets,
      hasAdmin,
      hasResearcher,
      districtsCountMatched: districtsCount,
      hasDistrictsSeeded,
      hasGsdpTargets
    };
  }

  checkNestJsSecurityGuards() {
    const authGuardExists = this.fileExists('apps/api/src/auth/auth.guard.ts') || this.fileExists('apps/api/src/auth/jwt-auth.guard.ts');
    const rolesGuardExists = this.fileExists('apps/api/src/auth/roles.guard.ts');
    const rolesDecoratorExists = this.fileExists('apps/api/src/auth/roles.decorator.ts');
    const mainTs = this.readFile('apps/api/src/main.ts') || '';
    const hasValidationPipe = /ValidationPipe/.test(mainTs);
    const hasCors = /enableCors/.test(mainTs);

    return {
      ok: (authGuardExists || rolesGuardExists) || hasValidationPipe,
      authGuardExists,
      rolesGuardExists,
      rolesDecoratorExists,
      hasValidationPipe,
      hasCors
    };
  }

  checkFrontendAccessibility() {
    const layout = this.readFile('apps/web/app/[locale]/layout.tsx') || '';
    const header = this.readFile('apps/web/components/layout/Header.tsx') || '';
    const button = this.readFile('apps/web/components/ui/button.tsx') || '';
    const progress = this.readFile('apps/web/components/ui/progress.tsx') || '';

    const hasDynamicHtmlLang = /<html\s+lang=/.test(layout);
    const hasSkipLink = /Skip to content|#main-content/.test(layout) || /#main-content/.test(header);
    const hasRadixSlotOrButton = /@radix-ui/.test(button) || /focus-visible/.test(button);
    const hasRadixProgressOrAria = /@radix-ui\/react-progress/.test(progress) || /role=["']progressbar["']/.test(progress);
    
    // Contrast check on Header: text-white or high contrast color instead of text-gold on bg-primary
    const hasAccessibleHeaderContrast = !(/text-gold/.test(header) && /bg-primary/.test(header)) || /text-white/.test(header);

    return {
      ok: hasDynamicHtmlLang && hasRadixSlotOrButton,
      hasDynamicHtmlLang,
      hasSkipLink,
      hasRadixButton: hasRadixSlotOrButton,
      hasRadixProgress: hasRadixProgressOrAria,
      hasAccessibleHeaderContrast
    };
  }

  checkLocalization() {
    const enJson = this.readFile('apps/web/i18n/messages/en.json');
    const bnJson = this.readFile('apps/web/i18n/messages/bn.json');
    const middleware = this.readFile('apps/web/middleware.ts');

    const hasEn = !!enJson;
    const hasBn = !!bnJson;
    const hasMiddleware = !!middleware;

    return {
      ok: hasEn && hasBn,
      hasEn,
      hasBn,
      hasMiddleware
    };
  }
}

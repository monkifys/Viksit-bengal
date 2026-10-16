#!/usr/bin/env node
/**
 * Viksit Bengal Dashboard - Master E2E Test Suite Runner
 * Executes Tier 1 (Feature Coverage), Tier 2 (Boundaries), Tier 3 (Interactions), and Tier 4 (Scenarios)
 */

import { TestContext } from './harness/test-context.js';
import * as authTier1 from './tier1-feature-coverage/auth.tier1.test.js';
import * as districtsTier1 from './tier1-feature-coverage/districts.tier1.test.js';
import * as promisesTier1 from './tier1-feature-coverage/promises.tier1.test.js';
import * as evidenceTier1 from './tier1-feature-coverage/evidence.tier1.test.js';
import * as indicatorsTier1 from './tier1-feature-coverage/indicators.tier1.test.js';
import * as securityGuardsTier1 from './tier1-feature-coverage/security-guards.tier1.test.js';
import * as frontendViewsTier1 from './tier1-feature-coverage/frontend-views.tier1.test.js';
import * as leafletMapTier1 from './tier1-feature-coverage/leaflet-map.tier1.test.js';
import * as accessibilityTier1 from './tier1-feature-coverage/accessibility.tier1.test.js';
import * as localizationTier1 from './tier1-feature-coverage/localization.tier1.test.js';

import * as authTier2 from './tier2-boundaries/auth-boundaries.tier2.test.js';
import * as districtsTier2 from './tier2-boundaries/districts-boundaries.tier2.test.js';
import * as promisesTier2 from './tier2-boundaries/promises-boundaries.tier2.test.js';
import * as evidenceTier2 from './tier2-boundaries/evidence-boundaries.tier2.test.js';
import * as indicatorsTier2 from './tier2-boundaries/indicators-boundaries.tier2.test.js';
import * as securityDtoTier2 from './tier2-boundaries/security-dto-boundaries.tier2.test.js';
import * as frontendTier2 from './tier2-boundaries/frontend-boundaries.tier2.test.js';

import * as adminLifecycleTier3 from './tier3-interactions/admin-promise-lifecycle.tier3.test.js';
import * as researcherEvidenceTier3 from './tier3-interactions/researcher-evidence-flow.tier3.test.js';
import * as districtIndicatorTier3 from './tier3-interactions/district-indicator-aggregation.tier3.test.js';
import * as localeToggleTier3 from './tier3-interactions/locale-toggle-interaction.tier3.test.js';
import * as cmsSecurityTier3 from './tier3-interactions/cms-security-interaction.tier3.test.js';

import * as adminScenarioTier4 from './tier4-scenarios/admin-full-lifecycle.tier4.test.js';
import * as researcherScenarioTier4 from './tier4-scenarios/researcher-audit.tier4.test.js';
import * as citizenScenarioTier4 from './tier4-scenarios/citizen-economic-explorer.tier4.test.js';
import * as adversarialScenarioTier4 from './tier4-scenarios/adversarial-threat-model.tier4.test.js';

// Parse arguments
const args = process.argv.slice(2);
let selectedMode = 'auto';
let selectedTier = 'all';

for (const arg of args) {
  if (arg.startsWith('--mode=')) selectedMode = arg.split('=')[1];
  if (arg.startsWith('--tier=')) selectedTier = arg.split('=')[1];
}

const SUITES = [
  // Tier 1
  { tier: '1', name: 'Tier 1: Auth & JWT (POST /auth/login, GET /auth/me)', runner: authTier1.run },
  { tier: '1', name: 'Tier 1: Districts (GET /districts, 23 WB Districts)', runner: districtsTier1.run },
  { tier: '1', name: 'Tier 1: Promises (GET /promises, POST /promises, Timeline)', runner: promisesTier1.run },
  { tier: '1', name: 'Tier 1: Evidence (GET /evidence, POST, Review Status)', runner: evidenceTier1.run },
  { tier: '1', name: 'Tier 1: Indicators ($1T GSDP Scenarios, Time-series)', runner: indicatorsTier1.run },
  { tier: '1', name: 'Tier 1: Security Guards (AuthGuard & RolesGuard - 007)', runner: securityGuardsTier1.run },
  { tier: '1', name: 'Tier 1: Frontend Views (App Router, API Client, Layouts)', runner: frontendViewsTier1.run },
  { tier: '1', name: 'Tier 1: Interactive Leaflet Map (23 Districts & Popups)', runner: leafletMapTier1.run },
  { tier: '1', name: 'Tier 1: Accessibility (WCAG 2.2 AA Contrast, Skip Link, ARIA)', runner: accessibilityTier1.run },
  { tier: '1', name: 'Tier 1: Dynamic Locale & next-intl (Bilingual EN/BN & Numerals)', runner: localizationTier1.run },

  // Tier 2
  { tier: '2', name: 'Tier 2: Auth Boundaries (Empty DTOs, Tampered & Expired Tokens)', runner: authTier2.run },
  { tier: '2', name: 'Tier 2: Districts Boundaries (SQLi, Case-insensitivity, 404s)', runner: districtsTier2.run },
  { tier: '2', name: 'Tier 2: Promises Boundaries (Invalid Enums, Bengali Unicode, Long Strings)', runner: promisesTier2.run },
  { tier: '2', name: 'Tier 2: Evidence Boundaries (Invalid URLs, Unknown Tiers, XSS Containment)', runner: evidenceTier2.run },
  { tier: '2', name: 'Tier 2: Indicators Boundaries (Non-numeric Types, Precision, Out-of-bounds)', runner: indicatorsTier2.run },
  { tier: '2', name: 'Tier 2: Security & DTO Boundaries (Prototype Pollution, Injection, Whitelist)', runner: securityDtoTier2.run },
  { tier: '2', name: 'Tier 2: Frontend Boundaries (Unsupported Locales, Empty Search, 44px Touch Targets)', runner: frontendTier2.run },

  // Tier 3
  { tier: '3', name: 'Tier 3: Admin Promise Lifecycle (Create -> Advance -> Timeline History)', runner: adminLifecycleTier3.run },
  { tier: '3', name: 'Tier 3: Researcher Evidence Flow (Submit -> Pending -> Admin Approve -> Audit)', runner: researcherEvidenceTier3.run },
  { tier: '3', name: 'Tier 3: District & Indicator Aggregation (Metrics -> Regional Context)', runner: districtIndicatorTier3.run },
  { tier: '3', name: 'Tier 3: Locale Toggle Interaction (English <-> Bengali & Numeral Transformation)', runner: localeToggleTier3.run },
  { tier: '3', name: 'Tier 3: CMS Security Boundaries (Anonymous -> Public -> Researcher -> Admin)', runner: cmsSecurityTier3.run },

  // Tier 4
  { tier: '4', name: 'Tier 4: Scenario 1 - State Administrator Full Governance Lifecycle', runner: adminScenarioTier4.run },
  { tier: '4', name: 'Tier 4: Scenario 2 - Policy Researcher Evidence Audit & RBAC Controls', runner: researcherScenarioTier4.run },
  { tier: '4', name: 'Tier 4: Scenario 3 - Citizen Exploring $1T GSDP Targets & District Transformation', runner: citizenScenarioTier4.run },
  { tier: '4', name: 'Tier 4: Scenario 4 - Adversarial Security & Injection Threat Defense', runner: adversarialScenarioTier4.run }
];

async function main() {
  console.log('\n======================================================================');
  console.log('   VIKSIT BENGAL DASHBOARD — E2E TEST SUITE RUNNER (TIERS 1-4)');
  console.log('======================================================================\n');

  const ctx = new TestContext({ mode: selectedMode });
  await ctx.init();

  console.log(`Execution Mode : ${selectedMode.toUpperCase()} (Active Transport: ${ctx.isLive ? 'LIVE NETWORK (http://localhost:3001)' : 'CONTRACT & SPECIFICATION ENGINE'})`);
  console.log(`Selected Tiers : ${selectedTier.toUpperCase()}`);
  console.log('----------------------------------------------------------------------\n');

  let totalPassed = 0;
  let totalFailed = 0;
  const startTime = Date.now();

  for (const suite of SUITES) {
    if (selectedTier !== 'all' && suite.tier !== selectedTier) continue;

    console.log(`▶ Running: ${suite.name}`);
    try {
      const tests = await suite.runner(ctx);
      for (const t of tests) {
        if (t.status === 'PASS') {
          totalPassed++;
          console.log(`  ✓ [PASS] ${t.name}`);
        } else {
          totalFailed++;
          console.log(`  ✗ [FAIL] ${t.name} -> Error: ${t.error}`);
        }
      }
    } catch (suiteErr) {
      totalFailed++;
      console.log(`  ✗ [SUITE CRASH] ${suite.name}: ${suiteErr.message}`);
    }
    console.log('');
  }

  const durationMs = Date.now() - startTime;
  const totalTests = totalPassed + totalFailed;
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

  console.log('======================================================================');
  console.log('                        TEST RUN SUMMARY');
  console.log('======================================================================');
  console.log(`Total Test Cases Executed : ${totalTests}`);
  console.log(`Passed                    : ${totalPassed}`);
  console.log(`Failed                    : ${totalFailed}`);
  console.log(`Pass Rate                 : ${passRate}%`);
  console.log(`Total Duration            : ${durationMs} ms`);
  console.log('======================================================================\n');

  if (totalFailed > 0) {
    console.error(`💥 Execution completed with ${totalFailed} failure(s).\n`);
    process.exit(1);
  } else {
    console.log('🎉 ALL TIERS 1-4 TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});

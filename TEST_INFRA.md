# Viksit Bengal Dashboard — E2E Test Infrastructure & Architecture

## 1. Overview & Testing Philosophy
The Viksit Bengal Dashboard E2E test harness is an **opaque-box, requirements-driven testing framework** designed to validate system behavior, interface contracts, security guards (007), and WCAG 2.2 AA accessibility (ui-a11y) across all 4 tiers of the testing specification.

Tests are completely independent of internal implementation details and assert observable behaviors against authoritative contracts defined in `PROJECT.md` and `ORIGINAL_REQUEST.md`.

---

## 2. Test Suite Directory Structure
```
viksit-bengal-dashboard/
├── TEST_INFRA.md                         # Infrastructure, architecture & execution guide
├── TEST_READY.md                         # Suite readiness certification & inventory
└── tests/
    ├── package.json                      # ES Module configuration for test runner
    ├── e2e-runner.js                     # Master executable test runner
    ├── harness/                          # Shared test harness & utilities
    │   ├── assertions.js                 # Standardized assertion primitives
    │   ├── contrast-checker.js           # W3C WCAG 2.2 AA contrast formula engine
    │   ├── fixtures.js                   # 23 WB districts, default users, DTOs & payloads
    │   ├── api-client.js                 # Network HTTP client with JWT attachment
    │   ├── mock-dispatcher.js            # In-memory contract reference state machine
    │   ├── contract-checker.js           # Static AST & schema verification engine
    │   └── test-context.js               # Unified test adapter (auto, live, contract)
    ├── tier1-feature-coverage/           # Feature Coverage (>= 5 tests per feature)
    │   ├── auth.tier1.test.js            # POST /auth/login, GET /auth/me, JWT verification
    │   ├── districts.tier1.test.js       # GET /districts (23 WB districts), GET /districts/:code
    │   ├── promises.tier1.test.js        # GET /promises, filters, POST, status transitions
    │   ├── evidence.tier1.test.js        # GET /evidence, POST upload, review status PENDING
    │   ├── indicators.tier1.test.js      # GET /indicators, $1T target scenarios, time-series
    │   ├── security-guards.tier1.test.js # AuthGuard & RolesGuard (007) RBAC enforcement
    │   ├── frontend-views.tier1.test.js  # App Router views, Layout, API client
    │   ├── leaflet-map.tier1.test.js     # Leaflet map, 23 district geo-data, accessible table
    │   ├── accessibility.tier1.test.js   # WCAG 2.2 AA contrast, skip links, ARIA landmarks
    │   └── localization.tier1.test.js    # Dynamic <html lang>, English & Bengali numerals
    ├── tier2-boundaries/                 # Boundary & Corner Cases (>= 5 tests per feature)
    │   ├── auth-boundaries.tier2.test.js       # Empty DTOs, SQLi in login, expired/tampered JWTs
    │   ├── districts-boundaries.tier2.test.js  # SQLi code, case-insensitivity, 404s, null bytes
    │   ├── promises-boundaries.tier2.test.js   # Invalid enums, Bengali unicode, long strings
    │   ├── evidence-boundaries.tier2.test.js   # Malformed URLs, bad source tiers, XSS containment
    │   ├── indicators-boundaries.tier2.test.js # Non-numeric types, precision, large GSDP numbers
    │   ├── security-dto-boundaries.tier2.test.js # Prototype pollution, injection, whitelist strip
    │   └── frontend-boundaries.tier2.test.js   # Bad locales, empty searches, 44px touch targets
    ├── tier3-interactions/               # Cross-Feature Interactions (Pairwise combinations)
    │   ├── admin-promise-lifecycle.tier3.test.js    # Admin login -> create -> update -> timeline
    │   ├── researcher-evidence-flow.tier3.test.js   # Submit -> pending -> admin approve -> audit
    │   ├── district-indicator-aggregation.tier3.test.js # New metric -> district economic context
    │   ├── locale-toggle-interaction.tier3.test.js  # English <-> Bengali numeral transformation
    │   └── cms-security-interaction.tier3.test.js   # Multi-role escalation defense
    └── tier4-scenarios/                  # Real-World Scenarios (End-to-end user journeys)
        ├── admin-full-lifecycle.tier4.test.js      # Scenario 1: State Administrator Workflow
        ├── researcher-audit.tier4.test.js          # Scenario 2: Policy Researcher Evidence Audit
        ├── citizen-economic-explorer.tier4.test.js # Scenario 3: Citizen Exploring $1T Targets
        └── adversarial-threat-model.tier4.test.js  # Scenario 4: Adversarial Injection Defense
```

---

## 3. Execution Modes & CLI Flags

The runner supports three dynamic execution modes:

| Mode | Flag | Description |
|------|------|-------------|
| **Auto** (default) | `--mode=auto` | Automatically checks if backend API (`http://localhost:3001`) is listening. If active, runs against live HTTP server. If not listening, seamlessly uses the authoritative contract engine. |
| **Live** | `--mode=live` | Forces live network HTTP execution against running NestJS (`http://localhost:3001`) and Next.js (`http://localhost:3000`) servers. |
| **Contract** | `--mode=contract` | Executes in-memory contract, schema, AST, and behavioral state machine verification without requiring running servers or external databases. |

### Tier Filtering
To run specific tiers:
- `node tests/e2e-runner.js --tier=1` (Feature coverage only)
- `node tests/e2e-runner.js --tier=2` (Boundary cases only)
- `node tests/e2e-runner.js --tier=3` (Cross-feature interactions only)
- `node tests/e2e-runner.js --tier=4` (Real-world scenarios only)
- `node tests/e2e-runner.js` (All tiers)

### Executable Command
```bash
npm run test:e2e
# or
node tests/e2e-runner.js
```

---

## 4. Coverage Thresholds & Quality Gates
- **Total Test Cases**: >= 75 test assertions across Tiers 1-4.
- **Pass Rate Threshold**: 100% required for exit code 0.
- **Feature Coverage**: >= 5 test cases per feature in Tier 1.
- **Boundary Coverage**: >= 5 test cases per feature in Tier 2.
- **Accessibility Gate**: All text contrast must strictly satisfy WCAG 2.2 AA (>= 4.5:1 for normal text, >= 3.0:1 for large text).
- **Security Gate**: Zero unhandled exceptions on SQL injection, prototype pollution, or XSS payloads; all unauthorized actions blocked with 401/403.

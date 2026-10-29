# Viksit Bengal Dashboard (বিকশিত বাংলা ড্যাশবোর্ড) — Implementation Plan

**Date:** 2026-10-29  
**Version:** 1.0  
**Target:** Production-Ready Civic Development Platform  

---

## 1. Architectural Strategy

We will preserve and enhance the existing high-performance architecture:
- **Backend**: Node.js HTTP server with native SQLite (`node:sqlite`) in WAL mode, ensuring sub-millisecond query responses, ACID transactions, and zero heavyweight external dependencies.
- **Data Engine**: Relational schema covering Users, Roles, Districts, Indicators, Observations, Projects, Milestones, Promises, Updates, Evidence Submissions, Status Transitions, and Audit Logs.
- **Frontend**: Lightweight, accessible, responsive vanilla HTML/CSS/JS with Chart.js / SVG for charts, bilingual support (English and Bengali), and full backward compatibility with the existing 140 promises and 1,000+ updates.
- **Testing**: Native Node.js test runner (`node:test` & `node:assert`) executing automated unit, integration, and E2E verification tests.

---

## 2. Detailed Phase Breakdown

### Phase 1 — Repository Audit & Baseline Verification (Completed)
- [x] Inspect directory tree, files, server startup, and database tables.
- [x] Verify that 140 promises and 150 candidate queue items exist in `database.sqlite`.
- [x] Create `PROJECT_AUDIT.md` with 20 key requirement benchmarks.

### Phase 2 — Database Schema Expansion & Baseline Seeding
**Target Files:** `db.js`, `data/districts.json`, `data/indicators.json`, `data/projects.json`
- [ ] Define relational tables in `db.js`:
  1. `users` (id, username, password_hash, salt, role, full_name, email, created_at)
  2. `districts` (id, name_en, name_bn, division, hq, area_sqkm, population, literacy_rate, gsdp_rank)
  3. `indicators` (id, code, name_en, name_bn, category, pillar, unit, frequency, baseline_value, baseline_year, target_value, target_year, source_name, source_url)
  4. `indicator_observations` (id, indicator_id, district_id, period_year, value, status, confidence_grade, source_name, source_url, notes)
  5. `projects` (id, name_en, name_bn, sector, district_id, authority, cost_cr, stage, target_date, actual_date, source_url, description_en, description_bn)
  6. `project_milestones` (id, project_id, title_en, title_bn, target_date, status)
  7. `evidence_submissions` (id, target_type, target_id, source_url, title, event_date, district_id, submitter_name, submitter_email, explanation, status, confidence_grade, reviewer_notes, created_at)
  8. `status_history` (id, entity_type, entity_id, previous_status, new_status, reason, reviewer_name, evidence_url, created_at)
  9. `audit_logs` (id, user_id, action, entity_type, entity_id, details_json, created_at)
- [ ] Seed official baseline data:
  - 23 West Bengal districts (Kolkata, Howrah, Hooghly, North/South 24 Parganas, Murshidabad, Nadia, Darjeeling, etc.).
  - Key economic indicators (Nominal GSDP, Real GSDP growth, Per-capita income, Unemployment rate, Industrial investment, Capex, Port traffic).
  - Key social indicators (Literacy rate, Infant Mortality Rate, Maternal Mortality Ratio, Drinking Water tap connections, Health centers).
  - Major infrastructure projects (Kolkata Metro East-West & Orange lines, Tajpur Deep Sea Port, Deocha Pachami, Dankuni Logistics Hub, Kalyani Expressway).
  - Default administrative and researcher users with secure password hashing.

### Phase 3 — Backend API Gateway & Role-Based Authorization
**Target Files:** `server.js`, `auth.js`
- [ ] Implement password hashing and token authentication (`auth.js`) supporting roles: `admin`, `reviewer`, `researcher`.
- [ ] Build REST API endpoints:
  - `GET /api/health`: Health diagnostics, database connectivity, table counts, uptime.
  - `GET /api/districts`, `GET /api/districts/:id`: 23 districts with metrics and local projects.
  - `GET /api/indicators`, `GET /api/indicators/:id`: Time series observations and comparisons.
  - `POST /api/indicators/observations`: Add indicator observation (Researcher+).
  - `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/:id`: Projects registry CRUD.
  - `POST /api/evidence/submit`: Public evidence submission endpoint with validation.
  - `GET /api/evidence/submissions`: List submissions (Researcher+).
  - `POST /api/evidence/review`: Approve/reject submission with status update (Reviewer+).
  - `GET /api/status-history`: Entity status transition records.
  - `GET /api/audit-logs`: Administrative audit trail.
  - `GET /api/export/csv`: Export promises, indicators, observations, and projects to CSV.
  - `POST /api/import/csv`: Validated CSV import with rollback and row-level errors.

### Phase 4 — Public Bilingual Frontend Implementation
**Target Files:** 
- English: `index.html`, `economy.html`, `society.html`, `districts.html`, `projects.html`, `methodology.html`, `submit.html`
- Bengali: `bn/index.html`, `bn/economy.html`, `bn/society.html`, `bn/districts.html`, `bn/projects.html`, `bn/methodology.html`, `bn/submit.html`
- Styles & Scripts: `css/style.css`, `js/app.js`, `js/charts.js`, `js/calculator.js`
- [ ] Update main masthead, titles, navigation, and SEO tags to **Viksit Bengal Dashboard — বিকশিত বাংলা ড্যাশবোর্ড** across all pages.
- [ ] Integrate unified 7-item navigation:
  `Economy` | `Society` | `Promises` | `Districts` | `Projects` | `Updates` | `Methodology` + `Submit Evidence` button.
- [ ] Create **Economic Dashboard (`economy.html` & `bn/economy.html`)**:
  - GSDP time-series charts (nominal vs real), growth rate, per-capita income, sector GVA breakdown.
  - Interactive **$1T Economic Target Calculator** (2026–2033 trajectory, base/conservative/ambitious scenarios, required CAGR formula).
- [ ] Create **Social Development Dashboard (`society.html` & `bn/society.html`)**:
  - Education, health, water, sanitation, and safety metrics with source citations.
- [ ] Create **Districts Progress Explorer (`districts.html` & `bn/districts.html`)**:
  - Interactive 23-district selector, district cards, indicator comparison matrix, and local project lists.
- [ ] Create **Development Project Registry (`projects.html` & `bn/projects.html`)**:
  - Infrastructure projects with sector filters, cost, completion dates, stage badges, and search.
- [ ] Create **Methodology & Evidence Standards (`methodology.html` & `bn/methodology.html`)**:
  - Transparent documentation of the 11 statuses, confidence grades (A-D), source hierarchy, and governance policies.
- [ ] Create **Public Evidence Submission Form (`submit.html` & `bn/submit.html`)**:
  - Citizen submission form validating source URL, promise/project linkage, and date.

### Phase 5 — Admin Command Center Expansion
**Target File:** `admin.html`
- [ ] Add role indicator and user profile display.
- [ ] Add tab: **Public Evidence Submissions** (Approve/Reject with confidence rating and automated updates).
- [ ] Add tab: **Economic & Social Indicators Manager** (View and record new observations).
- [ ] Add tab: **Projects Registry Manager** (Create and update infrastructure projects and milestones).
- [ ] Add tab: **CSV Data Tools** (1-click export and validated upload for promises, indicators, projects).
- [ ] Add tab: **Audit Logs & Status History** (Full immutable historical ledger).

### Phase 6 — News Scraper & Ingestion Pipeline Upgrade
**Target File:** `scraper.js`
- [ ] Enrich scraper with event classification (announcement, tender, foundation stone, completion, setback).
- [ ] Add automatic initial confidence rating suggestion (Grade A for official gazettes/gov portals, Grade B for PTI/ANI/national press).
- [ ] Add duplicate link and headline hashing to guarantee zero duplicate candidate generation.

### Phase 7 — Automated Testing Suite & Verification
**Target Files:** `tests/unit.test.js`, `tests/integration.test.js`, `tests/e2e.test.js`
- [ ] Unit tests:
  - Economic CAGR calculation: `(Target / Baseline) ^ (1/n) - 1`.
  - Scenario projections (Conservative 9%, Base 12.5%, Ambitious 16%).
  - Status transition validation (cannot mark delivered without Grade A/B evidence).
  - Localization fallback logic.
- [ ] Integration tests:
  - Database schema integrity, district/indicator foreign keys.
  - Promise, project, and indicator CRUD operations.
  - Evidence submission, approval, and rejected status flow.
  - Role-based authorization denial for unauthorized requests.
  - CSV export and import validation.
- [ ] E2E workflow verification:
  - Start server, execute end-to-end API lifecycle, and verify public persistence.

### Phase 8 — Documentation & Production Readiness
**Target Files:** `README.md`, `.env.example`, `IMPLEMENTATION_REPORT.md`
- [ ] Comprehensive README with architecture, setup instructions, testing guide, and screenshots/endpoints.
- [ ] Final `IMPLEMENTATION_REPORT.md` with complete verification logs.

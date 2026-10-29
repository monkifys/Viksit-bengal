# Viksit Bengal Dashboard — বিকশিত বাংলা ড্যাশবোর্ড

> **"Tracking Bengal's journey from commitments to outcomes."**  
> **"প্রতিশ্রুতি থেকে ফলাফলে পৌঁছানোর পথে বাংলার যাত্রা নিরীক্ষণ।"**

An evidence-based, bilingual civic-data platform tracking public commitments, macroeconomic growth, social development, district-level progress, and major infrastructure undertakings across West Bengal.

---

## 🏛️ Platform Overview

The **Viksit Bengal Dashboard** operates as a nonpartisan, evidence-driven public data resource that distinguishes political promises from government orders, administrative sanctions, actual civil works, and measurable developmental outcomes.

### Core Modules

1. **Manifesto & Commitment Tracker (`index.html` & `bn/index.html`)**
   - 140 public commitments preserved verbatim in English and Bengali.
   - Categorized across Governance, Economy, Industry & MSMEs, Health, Education, Infrastructure, Women & Safety, Farmers, Fishery & Blue Economy, and National Security.
   - Instant search with `Fuse.js`, category breakdown, and status filters.

2. **Economic Development Dashboard & $1T Target Calculator (`economy.html` & `bn/economy.html`)**
   - Official macroeconomic indicators: Nominal GSDP, Real GSDP Growth Rate, Sector-wise Gross Value Added, Per-Capita Income, Unemployment Rate, and Port Cargo volumes.
   - **Interactive US$ 1 Trillion Economy Target Calculator**:
     - Baseline ~$207 Billion in 2024 to $1,000 Billion in 2033 (9 compounding years).
     - Required compound annual growth rate: **19.12% CAGR** using formula:
       $$\text{CAGR} = \left(\frac{\text{Target}}{\text{Baseline}}\right)^{\frac{1}{n}} - 1$$
     - 3 comparative scenarios: Conservative (9.0% CAGR), Base/Industrial (12.5% CAGR), and Ambitious/Required (19.12% CAGR).

3. **Social Development Dashboard (`society.html` & `bn/society.html`)**
   - Social indicators: Literacy Rate, Maternal Mortality Ratio (MMR), Infant Mortality Rate (IMR), Rural Tap Water Connections (Jal Jeevan Mission), and Primary Healthcare Facility Coverage.
   - Historical time-series observations sourced from Census of India, Sample Registration System (SRS), and National Health Mission, accompanied by dynamic responsive pure-SVG trendline sparklines.

4. **23 Districts Explorer & Interactive SVG Map (`districts.html` & `bn/districts.html`)**
   - Detailed administrative profiles for all 23 West Bengal districts.
   - Interactive vector SVG map color-coded by the 5 administrative divisions (Presidency, Medinipur, Burdwan, Malda, Jalpaiguri) with click-to-preview panel, card scrolling, and modal deep links.
   - Compares population, literacy rates, land area, headquarters, and GSDP rankings.

5. **Infrastructure & Development Projects Registry (`projects.html` & `bn/projects.html`)**
   - Registry of major state infrastructure projects: Kolkata Metro Green Line (East-West), Kolkata Metro Orange Line, Tajpur Deep Sea Port, Deocha Pachami Coal Block, Dankuni Eastern Dedicated Freight Corridor, and Kalyani Expressway.
   - Real-time tracking of sectors, implementing authorities, sanctioned costs in ₹ Crore, civil construction stages, and completion targets.

6. **Standardized 11-Stage Civic Status Engine**
   - Strict status hierarchy across UI, API, and DB: `not_started`, `announced`, `legally_initiated`, `funded`, `under_implementation`, `partially_delivered`, `delivered`, `delayed`, `reversed`, `disputed`, `not_verifiable`.
   - Immutable status transition log recording previous status, new status, reviewer, and rationale.

7. **Evidence Confidence Grading (Grades A–D)**
   - **Grade A**: Official Gazette, State Budget, Government Order, CAG Audit.
   - **Grade B**: Credible Institutional Research, Reputable Investigative Press.
   - **Grade C**: Public Claim, Political Announcement, Press Conference.
   - **Grade D**: Unverified, Insufficiently Documented, Preliminary Material.

8. **Public Citizen Evidence Submission (`submit.html` & `bn/submit.html`)**
   - Open portal allowing citizens, researchers, and journalists to submit primary source URLs, gazette orders, and contextual explanations.
   - Anti-abuse sliding-window rate limiting (5 submissions per 15 minutes per IP) with automatic cache cleanup and `Retry-After: 900` headers.
   - Validated submissions are queued directly in the researcher verification console.

9. **Protected Administrative Command Center (`admin.html`)**
   - 10 tabbed administrative views:
     - 📥 Influx News Review Queue
     - 👥 Citizen Evidence Review Queue
     - 📋 Promises Ledger
     - 📊 Indicators & Observations Manager
     - 🏗️ Infrastructure Projects Registry
     - 📰 Published Updates Feed
     - 📁 CSV Data Tools (Export & Import)
     - 📜 Immutable Audit Logs & Status Trail
     - 🤖 AI News Scraper Bot Controller
     - ⚙️ Dynamic Site Settings & Metadata
   - All multi-step review and update mutations wrapped in atomic SQLite transactions (`BEGIN IMMEDIATE` / `COMMIT` / `ROLLBACK`).

10. **CSV Data Engine (`csv-helper.js`)**
    - 1-click export of Promises, Indicators, Projects, and Districts in RFC 4180 CSV format.
    - Bulk CSV import with row-level validation and error reporting.

---

## 🔐 Role-Based Access Control (RBAC)

The platform enforces multi-tier server-side authorization:

| Role | Access Level | Permissions | Pre-configured Development Account |
|------|--------------|-------------|------------------------------------|
| **Public User** | Level 0 | Browse published dashboards, view evidence, submit evidence | No login required |
| **Researcher** | Level 10 | Create candidate updates, draft indicator observations, manage projects | `researcher1` / `researcher123` |
| **Reviewer** | Level 20 | Approve/reject evidence submissions, publish updates, review status changes | `reviewer1` / `reviewer123` |
| **Administrator** | Level 30 | Manage users, configure system settings, view audit logs, bulk CSV data tools | `admin` / `admin123` |

*Passwords are securely hashed using `crypto.scryptSync` with unique 16-byte cryptographic salts.*

---

## 🛠️ Technology Stack

- **Runtime**: Node.js v22+
- **Database**: Native `DatabaseSync` (`node:sqlite`) in Write-Ahead Logging (WAL) mode with ACID atomic transactions
- **Cloud Database (Optional)**: Google Firebase Cloud Firestore (`firebase-admin`)
- **Frontend**: HTML5, Vanilla CSS3 (Design Tokens, Glassmorphism, Responsive Grid), Vanilla JavaScript (ES6+)
- **Visualizations**: Pure responsive SVG sparkline trendlines and interactive 23-district SVG vector map
- **Search Engine**: `Fuse.js` (Fuzzy client-side search)
- **Math Engine**: `js/calculator.js` (CAGR, trajectory projections, and scenarios)
- **Data Exchange**: `csv-helper.js` (RFC 4180 CSV serializer and parser)
- **Automated Testing**: Node.js native test runner (`node:test`, `node:assert/strict`)

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have **Node.js >= 22.0.0** installed:
```bash
node -v
```

### 2. Installation
Clone or navigate to the workspace directory and install dependencies:
```bash
npm install
```

### 3. Run Automated Tests
Execute the 23 automated unit, integration, and end-to-end tests:
```bash
npm test
```

### 4. Start the Application
Start the civic development server:
```bash
npm start
```

### 5. Access the Platform
- **Public Website (English)**: [http://localhost:3000/](http://localhost:3000/)
- **Public Website (Bengali)**: [http://localhost:3000/bn/](http://localhost:3000/bn/)
- **Economic Dashboard & Calculator**: [http://localhost:3000/economy.html](http://localhost:3000/economy.html)
- **Social Development Dashboard**: [http://localhost:3000/society.html](http://localhost:3000/society.html)
- **23 Districts Explorer**: [http://localhost:3000/districts.html](http://localhost:3000/districts.html)
- **Projects Registry**: [http://localhost:3000/projects.html](http://localhost:3000/projects.html)
- **Public Evidence Submission**: [http://localhost:3000/submit.html](http://localhost:3000/submit.html)
- **Methodology & Standards**: [http://localhost:3000/methodology.html](http://localhost:3000/methodology.html)
- **Admin Command Center**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **System Health Diagnostics**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 📡 REST API Reference

### Public Endpoints
- `GET /api/health` — Returns system diagnostics, server uptime, database mode, and record counts.
- `GET /api/stats` — Overall statistics for commitments, indicators, projects, and queue items.
- `GET /api/meta` — Dynamic platform metadata, state titles, and categories.
- `GET /api/districts` — All 23 West Bengal districts.
- `GET /api/districts/:id` — District profile with linked projects and observations.
- `GET /api/indicators?pillar=economy|society` — Filtered indicators and time-series.
- `GET /api/indicators/:id` — Specific indicator and observations.
- `GET /api/projects?sector=...&stage=...` — Infrastructure projects registry.
- `GET /api/promises?status=...&category=...` — 140 commitments list.
- `GET /api/promises/:id` — Commitment detail with status history and updates.
- `GET /api/updates?limit=...` — Verified timeline updates feed.
- `POST /api/evidence/submit` — Citizen evidence submission.
- `POST /api/login` — Authenticate user and receive session token.

### Protected Endpoints (Bearer Token Required)
- `GET /api/session` — Verify current session and active role.
- `POST /api/logout` — Terminate session.
- `GET /api/evidence/submissions` — Retrieve evidence review queue (`researcher`).
- `POST /api/evidence/review` — Approve, reject, or publish evidence (`reviewer`).
- `POST /api/indicators` — Create indicator (`researcher`).
- `POST /api/indicators/observations` — Record time-series data point (`researcher`).
- `POST /api/projects` — Create or update infrastructure project (`researcher`).
- `DELETE /api/projects/:id` — Delete project (`admin`).
- `POST /api/promises` — Save commitment (`researcher`).
- `DELETE /api/promises/:id` — Delete commitment (`admin`).
- `GET /api/audit-logs` — Administrative audit records (`admin`).
- `GET /api/export/csv?type=promises|indicators|projects|districts` — Download CSV snapshot (`reviewer`).
- `POST /api/import/csv?type=promises|projects` — Ingest bulk CSV batch (`reviewer`).

---

## 🧪 Testing Architecture

The test suite is structured into three distinct layers in `tests/`:

1. **Unit Tests (`tests/unit.test.js`)**:
   - CAGR formula precision: `calculateRequiredCAGR(207, 1000, 9)` = 19.12%.
   - Trajectory generator and yearly compounding.
   - 3-scenario projections (Conservative, Base, Ambitious).
   - Scrypt password hashing and verification.
   - RBAC hierarchy and permission levels.
   - RFC 4180 CSV serializer, quote escaping, and parser.
   - Civic status model and evidence confidence grades.

2. **Integration Tests (`tests/integration.test.js`)**:
   - Database initial state, WAL mode, and seeded entities.
   - District lookup and relationship queries.
   - Indicator and observation time-series persistence.
   - Infrastructure projects CRUD and milestone tracking.
   - Citizen evidence submission, review, and automated timeline publication.
   - Status transition recording and immutable audit logs.

3. **End-to-End Tests (`tests/e2e.test.js`)**:
   - System health check endpoint.
   - Availability of all English and Bengali web pages.
   - Core REST APIs.
   - Citizen submission validation with invalid and valid URLs.
   - Authentication, unauthenticated access denials (401), and token validation.
   - CSV export and bulk CSV import.

---

## 💾 Database Backup & Disaster Recovery Procedures

The project utilizes Node.js native SQLite (`node:sqlite`) in Write-Ahead Logging (`WAL`) mode. Follow these standard procedures for safe backups and restoration:

### 1. Creating a Consistent Database Backup
Because SQLite operates in WAL mode, active transactions may reside in `database.sqlite-wal`. Always checkpoint before backing up:

```bash
# Flush and truncate WAL frames into main database file
node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('database.sqlite'); db.exec('PRAGMA wal_checkpoint(TRUNCATE);'); db.close();"

# Copy consistent database file to a timestamped backup destination
# PowerShell:
Copy-Item database.sqlite "database_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sqlite"
# Linux/macOS:
# cp database.sqlite "database_backup_$(date +%Y%m%d_%H%M%S).sqlite"
```

### 2. Restoring from a Backup
```bash
# 1. Stop the application server process
# 2. Delete stale WAL and shared memory files (if present)
Remove-Item database.sqlite-wal, database.sqlite-shm -ErrorAction SilentlyContinue

# 3. Restore the target backup file
Copy-Item "database_backup_baseline.sqlite" database.sqlite -Force

# 4. Verify database integrity
node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('database.sqlite'); console.log(db.prepare('PRAGMA integrity_check').all());"

# 5. Restart application
npm start
```

---

## 📄 License & Attribution

Developed as an independent, transparent civic data project for West Bengal.  
Open-source under ISC License. All government statistics, budget numbers, and census metrics are cited directly to original publishing agencies (MOSPI, RBI, Census of India, NHM, and Government of West Bengal).

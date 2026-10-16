/**
 * Viksit Bengal Dashboard - Authoritative In-Memory Specification Dispatcher
 * Provides an authoritative reference model matching PROJECT.md interface contracts.
 * Used for offline verification and behavioral contract validation.
 */

import { DISTRICTS_23, USERS, ENUMS, SAMPLE_PROMISE, SAMPLE_EVIDENCE } from './fixtures.js';

export class MockDispatcher {
  constructor() {
    this.reset();
  }

  reset() {
    this.districts = DISTRICTS_23.map((d, index) => ({
      id: `dist-${index + 1}`,
      code: d.code,
      nameEn: d.nameEn,
      nameBn: d.nameBn,
      population: 4000000 + index * 200000,
      gsdpShare: +(2.5 + (index % 5) * 1.5).toFixed(2),
      promiseCount: 2 + (index % 4)
    }));

    this.promises = [
      {
        id: 'prom-1',
        ...SAMPLE_PROMISE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [
          { status: 'ANNOUNCED', timestamp: '2026-01-01T00:00:00Z', comment: 'Official manifesto commitment' },
          { status: 'UNDER_IMPLEMENTATION', timestamp: '2026-03-01T00:00:00Z', comment: 'Work commenced' }
        ],
        evidenceItems: [],
        updates: []
      }
    ];

    this.evidence = [
      {
        id: 'ev-1',
        promiseId: 'prom-1',
        ...SAMPLE_EVIDENCE,
        status: 'PENDING',
        uploadedBy: 'researcher@viksitbengal.gov.in',
        createdAt: new Date().toISOString()
      }
    ];

    this.indicators = [
      {
        id: 'ind-1',
        code: 'GSDP_GROWTH',
        nameEn: 'GSDP Annual Growth Rate',
        nameBn: 'রাজ্যের জিএসডিপি বার্ষিক বৃদ্ধির হার',
        unit: '%',
        currentValue: 8.4,
        targetValue: 12.5,
        values: [
          { year: 2024, value: 7.8 },
          { year: 2025, value: 8.4 }
        ]
      },
      {
        id: 'ind-2',
        code: 'TRILLION_USD_PROGRESS',
        nameEn: '$1T GSDP Economy Target Milestone',
        nameBn: '$১ ট্রিলিয়ন অর্থনীতি রূপান্তর অগ্রগতি',
        unit: 'Billion USD',
        currentValue: 240,
        targetValue: 1000,
        values: [
          { year: 2026, scenario: 'CONSERVATIVE', value: 230 },
          { year: 2026, scenario: 'BASE_CASE', value: 240 },
          { year: 2026, scenario: 'AMBITIOUS', value: 260 }
        ]
      }
    ];

    this.users = { ...USERS };
  }

  generateJwt(user) {
    const payload = {
      sub: user.email,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${b64}.mock_valid_signature`;
  }

  verifyJwt(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    if (token.includes('tampered_signature')) return null;

    const parts = token.split('.');
    let payloadB64 = null;

    if (parts.length === 3) {
      if (parts[2] !== 'mock_valid_signature') return null;
      payloadB64 = parts[1];
    } else if (parts.length === 4 && parts[0] === 'mock' && parts[1] === 'header') {
      payloadB64 = parts[2];
    } else {
      return null;
    }

    try {
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
      return payload;
    } catch {
      return null;
    }
  }

  // --- Handlers ---

  handleLogin({ email, password }) {
    if (!email || !password) {
      return { status: 400, data: { message: 'Email and password required' } };
    }
    const found = Object.values(this.users).find(u => u.email === email && u.password === password);
    if (!found) {
      return { status: 401, data: { message: 'Invalid credentials' } };
    }
    const token = this.generateJwt(found);
    return {
      status: 200,
      data: {
        accessToken: token,
        user: { id: found.email, email: found.email, name: found.name, role: found.role }
      }
    };
  }

  handleGetMe(authHeader) {
    const user = this.verifyJwt(authHeader);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    return { status: 200, data: user };
  }

  handleGetDistricts() {
    return { status: 200, data: this.districts };
  }

  handleGetDistrictByCode(code) {
    if (!code || typeof code !== 'string') return { status: 400, data: { message: 'Invalid code' } };
    const found = this.districts.find(d => d.code.toUpperCase() === code.toUpperCase());
    if (!found) return { status: 404, data: { message: 'District not found' } };
    return {
      status: 200,
      data: {
        ...found,
        promises: this.promises,
        indicators: this.indicators
      }
    };
  }

  handleGetPromises(query = {}) {
    let result = [...this.promises];
    if (query.status) {
      result = result.filter(p => p.status === query.status);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      result = result.filter(p => p.titleEn.toLowerCase().includes(s) || (p.titleBn && p.titleBn.includes(s)));
    }
    return { status: 200, data: result };
  }

  handleGetPromiseByCode(code) {
    const found = this.promises.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (!found) return { status: 404, data: { message: 'Promise not found' } };
    return { status: 200, data: found };
  }

  handleCreatePromise(dto, authHeader) {
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
      return { status: 400, data: { message: 'Object DTO payload required' } };
    }
    const user = this.verifyJwt(authHeader);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    if (user.role !== 'ADMIN' && user.role !== 'RESEARCHER') {
      return { status: 403, data: { message: 'Forbidden: Requires ADMIN or RESEARCHER role' } };
    }

    if (!dto.code || !dto.titleEn || !dto.titleBn) {
      return { status: 400, data: { message: 'Validation failed: code, titleEn, titleBn required' } };
    }
    if (dto.status && !ENUMS.PromiseStatus.includes(dto.status)) {
      return { status: 400, data: { message: `Invalid status enum: ${dto.status}` } };
    }

    // Whitelist sanitization to strip non-whitelisted injection properties
    const allowedKeys = ['code', 'titleEn', 'titleBn', 'descriptionEn', 'descriptionBn', 'status', 'confidence', 'isKeyPromise', 'categoryId', 'districtId'];
    const sanitized = {};
    for (const key of allowedKeys) {
      if (dto[key] !== undefined) sanitized[key] = dto[key];
    }

    const newPromise = {
      id: `prom-${Date.now()}`,
      ...sanitized,
      status: sanitized.status || 'NOT_STARTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [{ status: sanitized.status || 'NOT_STARTED', timestamp: new Date().toISOString() }],
      evidenceItems: [],
      updates: []
    };
    this.promises.push(newPromise);
    return { status: 201, data: newPromise };
  }

  handleUpdatePromiseStatus(code, { status, comment }, authHeader) {
    const user = this.verifyJwt(authHeader);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    if (user.role !== 'ADMIN') {
      return { status: 403, data: { message: 'Forbidden: Requires ADMIN role' } };
    }
    if (!ENUMS.PromiseStatus.includes(status)) {
      return { status: 400, data: { message: `Invalid PromiseStatus enum: ${status}` } };
    }
    const found = this.promises.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (!found) return { status: 404, data: { message: 'Promise not found' } };

    found.status = status;
    found.updatedAt = new Date().toISOString();
    found.statusHistory.push({ status, comment, timestamp: new Date().toISOString() });
    return { status: 200, data: found };
  }

  handleGetEvidence(query = {}) {
    let result = [...this.evidence];
    if (query.promiseId) result = result.filter(e => e.promiseId === query.promiseId);
    if (query.status) result = result.filter(e => e.status === query.status);
    return { status: 200, data: result };
  }

  handleCreateEvidence(dto, authHeader) {
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
      return { status: 400, data: { message: 'Object DTO payload required' } };
    }
    const user = this.verifyJwt(authHeader);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    if (user.role !== 'ADMIN' && user.role !== 'RESEARCHER') {
      return { status: 403, data: { message: 'Forbidden' } };
    }
    if (!dto.title || !dto.url || !dto.sourceType || !dto.sourceTier) {
      return { status: 400, data: { message: 'Validation failed: title, url, sourceType, sourceTier are required' } };
    }
    if (!ENUMS.SourceTier.includes(dto.sourceTier)) {
      return { status: 400, data: { message: `Invalid source tier: ${dto.sourceTier}` } };
    }
    try {
      new URL(dto.url);
    } catch {
      return { status: 400, data: { message: 'Invalid URL format' } };
    }

    const newEvidence = {
      id: `ev-${Date.now()}`,
      ...dto,
      status: 'PENDING',
      uploadedBy: user.email,
      createdAt: new Date().toISOString()
    };
    this.evidence.push(newEvidence);
    return { status: 201, data: newEvidence };
  }

  handleReviewEvidence(id, { status, reviewComment }, authHeader) {
    const user = this.verifyJwt(authHeader);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    if (user.role !== 'ADMIN') {
      return { status: 403, data: { message: 'Forbidden: Requires ADMIN role' } };
    }
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return { status: 400, data: { message: 'Invalid review status' } };
    }
    const found = this.evidence.find(e => e.id === id);
    if (!found) return { status: 404, data: { message: 'Evidence item not found' } };

    found.status = status;
    found.reviewComment = reviewComment;
    found.reviewedAt = new Date().toISOString();
    return { status: 200, data: found };
  }

  handleGetIndicators() {
    return { status: 200, data: this.indicators };
  }

  handleCreateIndicatorValue(code, dto, authHeader) {
    if (!dto || typeof dto !== 'object' || Array.isArray(dto)) {
      return { status: 400, data: { message: 'Object payload required' } };
    }
    const user = this.verifyJwt(authHeader);
    if (!user) return { status: 401, data: { message: 'Unauthorized' } };
    if (user.role !== 'ADMIN' && user.role !== 'RESEARCHER') {
      return { status: 403, data: { message: 'Forbidden' } };
    }
    if (typeof dto.year !== 'number' || typeof dto.value !== 'number') {
      return { status: 400, data: { message: 'Validation failed: year and value must be numbers' } };
    }
    const found = this.indicators.find(i => i.code === code);
    if (!found) return { status: 404, data: { message: 'Indicator not found' } };

    found.values.push(dto);
    found.currentValue = dto.value;
    return { status: 201, data: dto };
  }
}

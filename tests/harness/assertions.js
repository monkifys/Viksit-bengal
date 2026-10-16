/**
 * Viksit Bengal Dashboard - E2E Test Suite Assertions Harness
 * Standardized assertion utilities for Tiers 1-4
 */

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const msg = message || `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

export function assertNotEqual(actual, expected, message) {
  if (actual === expected) {
    const msg = message || `Expected ${JSON.stringify(actual)} to not equal ${JSON.stringify(expected)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

export function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message || `Deep equality mismatch:\nActual:   ${actualStr}\nExpected: ${expectedStr}`;
    throw new AssertionError(msg, actual, expected);
  }
}

export function assertMatches(str, regex, message) {
  if (typeof str !== 'string' || !regex.test(str)) {
    const msg = message || `Expected "${str}" to match pattern ${regex}`;
    throw new AssertionError(msg, str, regex.toString());
  }
}

export function assertIncludes(container, item, message) {
  if (!container || (typeof container.includes !== 'function')) {
    throw new AssertionError(`Container does not support includes: ${container}`);
  }
  if (!container.includes(item)) {
    const msg = message || `Expected ${JSON.stringify(container)} to include ${JSON.stringify(item)}`;
    throw new AssertionError(msg, container, item);
  }
}

export function assertStatusCode(response, expectedCode, message) {
  const status = response && (response.status || response.statusCode);
  if (status !== expectedCode) {
    const msg = message || `Expected HTTP status ${expectedCode}, received ${status}`;
    throw new AssertionError(msg, status, expectedCode);
  }
}

export function assertProperties(obj, requiredProps, message) {
  if (!obj || typeof obj !== 'object') {
    throw new AssertionError(`Expected an object, got ${typeof obj}`, obj, 'object');
  }
  for (const prop of requiredProps) {
    if (!(prop in obj)) {
      const msg = message || `Missing required property "${prop}" in object keys [${Object.keys(obj).join(', ')}]`;
      throw new AssertionError(msg, Object.keys(obj), prop);
    }
  }
}

export function assertArrayLength(arr, minLength, message) {
  if (!Array.isArray(arr)) {
    throw new AssertionError(`Expected an array, received ${typeof arr}`, arr, 'Array');
  }
  if (arr.length < minLength) {
    const msg = message || `Expected array length >= ${minLength}, got ${arr.length}`;
    throw new AssertionError(msg, arr.length, minLength);
  }
}

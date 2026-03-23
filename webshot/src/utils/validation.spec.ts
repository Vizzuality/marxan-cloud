import {
  validateRequiredParams,
  validateBaseUrl,
  validateRequest,
} from './validation';

describe('validateRequiredParams', () => {
  it('returns valid when all params are present', () => {
    const result = validateRequiredParams({
      projectId: 'abc',
      scenarioId: 'def',
    });
    expect(result).toEqual({ valid: true });
  });

  it('returns invalid when a single param is missing', () => {
    const result = validateRequiredParams({
      projectId: 'abc',
      scenarioId: undefined,
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.status).toBe(400);
      expect(result.error).toContain('scenarioId');
    }
  });

  it('returns invalid when multiple params are missing', () => {
    const result = validateRequiredParams({
      projectId: undefined,
      scenarioId: undefined,
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('projectId');
      expect(result.error).toContain('scenarioId');
    }
  });

  it('returns invalid when a param is an empty string', () => {
    const result = validateRequiredParams({
      projectId: 'abc',
      scenarioId: '',
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('scenarioId');
    }
  });

  it('returns valid with three params all present', () => {
    const result = validateRequiredParams({
      projectId: 'abc',
      scenarioIdA: 'def',
      scenarioIdB: 'ghi',
    });
    expect(result).toEqual({ valid: true });
  });
});

describe('validateBaseUrl', () => {
  it('returns valid for a well-formed URL', () => {
    const result = validateBaseUrl('https://app.marxancloud.org');
    expect(result).toEqual({ valid: true });
  });

  it('returns invalid when baseUrl is undefined', () => {
    const result = validateBaseUrl(undefined);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.status).toBe(400);
      expect(result.error).toContain('No baseUrl');
    }
  });

  it('returns invalid when baseUrl is an empty string', () => {
    const result = validateBaseUrl('');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('No baseUrl');
    }
  });

  it('returns invalid for a malformed URL', () => {
    const result = validateBaseUrl('not-a-url');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.status).toBe(400);
      expect(result.error).toContain('not a valid URL');
    }
  });
});

describe('validateRequest', () => {
  it('returns valid when params and baseUrl are both valid', () => {
    const result = validateRequest(
      { projectId: 'abc', scenarioId: 'def' },
      'https://example.com',
    );
    expect(result).toEqual({ valid: true });
  });

  it('fails on missing params before checking baseUrl', () => {
    const result = validateRequest(
      { projectId: undefined },
      'https://example.com',
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('projectId');
    }
  });

  it('fails on invalid baseUrl when params are valid', () => {
    const result = validateRequest(
      { projectId: 'abc' },
      'not-a-url',
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain('not a valid URL');
    }
  });
});

/**
 * Tests for Client Validation Schema
 */

import { describe, it, expect } from 'vitest';
import { clientCreateSchema } from '../../lib/validations/client';

describe('Client Validation Schema', () => {
  it('should validate required client fields', () => {
    const result = clientCreateSchema.safeParse({
      client_status: 'Cold',
      possibility: 'Medium',
      client_name: 'Acme Corp',
    });

    expect(result.success).toBe(true);
  });

  it('should reject invalid possibility', () => {
    const result = clientCreateSchema.safeParse({
      client_status: 'Cold',
      possibility: 'Extreme',
      client_name: 'Acme Corp',
    });

    expect(result.success).toBe(false);
  });

  it('should validate social links', () => {
    const result = clientCreateSchema.safeParse({
      client_status: 'Cold',
      possibility: 'High',
      client_name: 'Acme Corp',
      social_links: [{ platform: 'LinkedIn', url: 'https://linkedin.com/company/acme' }],
    });

    expect(result.success).toBe(true);
  });
});

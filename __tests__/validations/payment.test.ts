/**
 * Tests for Payment Validation Schema
 */

import { describe, it, expect } from 'vitest';
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
} from '@/lib/validations/payment';

describe('Payment Validation Schemas', () => {
  describe('createPaymentSchema', () => {
    it('should validate correct payment data', () => {
      const validData = {
        amount: 1000,
        currency: 'USD',
        payment_method: 'card',
        description: 'Test payment for services',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createPaymentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative amount', () => {
      const invalidData = {
        amount: -100,
        currency: 'USD',
        payment_method: 'card',
        description: 'Test payment',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero amount', () => {
      const invalidData = {
        amount: 0,
        currency: 'USD',
        payment_method: 'card',
        description: 'Test payment',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid payment method', () => {
      const invalidData = {
        amount: 1000,
        currency: 'USD',
        payment_method: 'invalid_method' as 'card',
        description: 'Test payment',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short description', () => {
      const invalidData = {
        amount: 1000,
        currency: 'USD',
        payment_method: 'card',
        description: 'Test',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = createPaymentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updatePaymentStatusSchema', () => {
    it('should validate correct status update', () => {
      const validData = {
        status: 'approved' as const,
        admin_notes: 'Payment verified and approved',
      };

      const result = updatePaymentStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow status update without notes', () => {
      const validData = {
        status: 'rejected' as const,
      };

      const result = updatePaymentStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        status: 'invalid_status',
      };

      const result = updatePaymentStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject notes longer than 500 characters', () => {
      const invalidData = {
        status: 'approved' as const,
        admin_notes: 'a'.repeat(501),
      };

      const result = updatePaymentStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

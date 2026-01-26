/**
 * Tests for User Validation Schema
 */

import { describe, it, expect } from 'vitest';
import {
  createUserSchema,
  updateUserSchema,
  updatePasswordSchema,
  loginSchema,
} from '@/lib/validations/user';

describe('User Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate correct user data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123',
        full_name: 'Test User',
        role_id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'SecurePass123!',
        full_name: 'Test User',
        role_id: 1,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'short',
        full_name: 'Test User',
        role_id: 1,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });

    it('should reject username with spaces', () => {
      const invalidData = {
        username: 'test user',
        email: 'test@example.com',
        password: 'SecurePass123!',
        full_name: 'Test User',
        role_id: 1,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('username');
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateUserSchema', () => {
    it('should validate correct update data', () => {
      const validData = {
        full_name: 'Updated Name',
        bio: 'Updated bio',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const validData = {
        full_name: 'Updated Name',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email in update', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updatePasswordSchema', () => {
    it('should validate correct password update', () => {
      const validData = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
      };

      const result = updatePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short new password', () => {
      const invalidData = {
        currentPassword: 'OldPass123',
        newPassword: 'short',
      };

      const result = updatePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing current password', () => {
      const invalidData = {
        newPassword: 'NewPass123',
      };

      const result = updatePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty username', () => {
      const invalidData = {
        email: '',
        password: 'SecurePass123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

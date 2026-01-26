/**
 * Tests for HTTP Cache Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  HTTP_CACHE_DURATION,
  getCacheControlHeader,
  CACHE_PRESETS,
} from '@/lib/http-cache';

describe('HTTP Cache Utilities', () => {
  describe('HTTP_CACHE_DURATION', () => {
    it('should have correct duration values', () => {
      expect(HTTP_CACHE_DURATION.NO_CACHE).toBe(0);
      expect(HTTP_CACHE_DURATION.REALTIME).toBe(60);
      expect(HTTP_CACHE_DURATION.SHORT).toBe(300);
      expect(HTTP_CACHE_DURATION.MEDIUM).toBe(900);
      expect(HTTP_CACHE_DURATION.LONG).toBe(3600);
      expect(HTTP_CACHE_DURATION.VERY_LONG).toBe(86400);
    });
  });

  describe('getCacheControlHeader', () => {
    it('should generate no-cache header', () => {
      const header = getCacheControlHeader('no-cache');
      expect(header).toBe('no-store, no-cache, must-revalidate, proxy-revalidate');
    });

    it('should generate public cache header with max-age', () => {
      const header = getCacheControlHeader('public', 3600);
      expect(header).toContain('public');
      expect(header).toContain('max-age=3600');
      expect(header).toContain('must-revalidate');
    });

    it('should generate private cache header', () => {
      const header = getCacheControlHeader('private', 300);
      expect(header).toContain('private');
      expect(header).toContain('max-age=300');
      expect(header).toContain('must-revalidate');
    });

    it('should include stale-while-revalidate when provided', () => {
      const header = getCacheControlHeader('public', 3600, 60);
      expect(header).toContain('public');
      expect(header).toContain('max-age=3600');
      expect(header).toContain('stale-while-revalidate=60');
      expect(header).toContain('must-revalidate');
    });

    it('should not include max-age when 0', () => {
      const header = getCacheControlHeader('public', 0);
      expect(header).toContain('public');
      expect(header).not.toContain('max-age');
      expect(header).toContain('must-revalidate');
    });
  });

  describe('CACHE_PRESETS', () => {
    it('should have STATIC preset with long duration', () => {
      expect(CACHE_PRESETS.STATIC.strategy).toBe('public');
      expect(CACHE_PRESETS.STATIC.maxAge).toBe(HTTP_CACHE_DURATION.VERY_LONG);
      expect(CACHE_PRESETS.STATIC.swr).toBe(HTTP_CACHE_DURATION.LONG);
    });

    it('should have SEMI_STATIC preset', () => {
      expect(CACHE_PRESETS.SEMI_STATIC.strategy).toBe('public');
      expect(CACHE_PRESETS.SEMI_STATIC.maxAge).toBe(HTTP_CACHE_DURATION.LONG);
      expect(CACHE_PRESETS.SEMI_STATIC.swr).toBe(HTTP_CACHE_DURATION.MEDIUM);
    });

    it('should have DYNAMIC preset with shorter duration', () => {
      expect(CACHE_PRESETS.DYNAMIC.strategy).toBe('public');
      expect(CACHE_PRESETS.DYNAMIC.maxAge).toBe(HTTP_CACHE_DURATION.MEDIUM);
      expect(CACHE_PRESETS.DYNAMIC.swr).toBe(HTTP_CACHE_DURATION.SHORT);
    });

    it('should have PRIVATE preset', () => {
      expect(CACHE_PRESETS.PRIVATE.strategy).toBe('private');
      expect(CACHE_PRESETS.PRIVATE.maxAge).toBe(HTTP_CACHE_DURATION.SHORT);
    });

    it('should have REALTIME preset with very short duration', () => {
      expect(CACHE_PRESETS.REALTIME.strategy).toBe('private');
      expect(CACHE_PRESETS.REALTIME.maxAge).toBe(HTTP_CACHE_DURATION.REALTIME);
    });

    it('should have NO_CACHE preset', () => {
      expect(CACHE_PRESETS.NO_CACHE.strategy).toBe('no-cache');
      expect(CACHE_PRESETS.NO_CACHE.maxAge).toBe(0);
    });
  });
});

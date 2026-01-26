/**
 * Tests for Cache Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  CACHE_TAGS,
  CACHE_DURATION,
  generateCacheKey,
  buildCacheTags,
} from '@/lib/cache';

describe('Cache Utilities', () => {
  describe('CACHE_TAGS', () => {
    it('should have all expected cache tag constants', () => {
      expect(CACHE_TAGS.SERVICES).toBe('services');
      expect(CACHE_TAGS.PORTFOLIO).toBe('portfolio');
      expect(CACHE_TAGS.TEAM).toBe('team');
      expect(CACHE_TAGS.BLOG).toBe('blog');
      expect(CACHE_TAGS.COURSES).toBe('courses');
      expect(CACHE_TAGS.SITE_SETTINGS).toBe('site-settings');
    });
  });

  describe('CACHE_DURATION', () => {
    it('should have correct duration values in seconds', () => {
      expect(CACHE_DURATION.STATIC).toBe(3600); // 1 hour
      expect(CACHE_DURATION.SEMI_STATIC).toBe(1800); // 30 minutes
      expect(CACHE_DURATION.DYNAMIC).toBe(300); // 5 minutes
      expect(CACHE_DURATION.REALTIME).toBe(60); // 1 minute
      expect(CACHE_DURATION.NO_CACHE).toBe(0);
    });
  });

  describe('generateCacheKey', () => {
    it('should generate cache key from prefix and params', () => {
      const key = generateCacheKey('test', { id: '123', type: 'service' });
      expect(key).toContain('test:');
      expect(key).toContain('id=123');
      expect(key).toContain('type=service');
    });

    it('should sort params consistently', () => {
      const key1 = generateCacheKey('test', { b: '2', a: '1' });
      const key2 = generateCacheKey('test', { a: '1', b: '2' });
      expect(key1).toBe(key2);
    });

    it('should handle empty params', () => {
      const key = generateCacheKey('test', {});
      expect(key).toBe('test:');
    });

    it('should handle numeric values', () => {
      const key = generateCacheKey('test', { page: 1, limit: 10 });
      expect(key).toContain('page=1');
      expect(key).toContain('limit=10');
    });

    it('should handle boolean values', () => {
      const key = generateCacheKey('test', { active: true, featured: false });
      expect(key).toContain('active=true');
      expect(key).toContain('featured=false');
    });
  });

  describe('buildCacheTags', () => {
    it('should build array of cache tag values', () => {
      const tags = buildCacheTags('SERVICES', 'PORTFOLIO');
      expect(tags).toEqual(['services', 'portfolio']);
    });

    it('should handle single tag', () => {
      const tags = buildCacheTags('SERVICES');
      expect(tags).toEqual(['services']);
    });

    it('should handle multiple tags', () => {
      const tags = buildCacheTags('SERVICES', 'PORTFOLIO', 'TEAM', 'BLOG');
      expect(tags).toEqual(['services', 'portfolio', 'team', 'blog']);
    });
  });
});

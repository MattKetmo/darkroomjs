import { describe, expect, it } from 'vitest';
import { boundingBoxForRotatedRect } from '../../lib/js/math-viewport.js';

describe('boundingBoxForRotatedRect', () => {
  it('returns same width and height at 0°', () => {
    expect(boundingBoxForRotatedRect(100, 50, 0)).toEqual({ width: 100, height: 50 });
  });

  it('swaps dimensions at 90°', () => {
    const box = boundingBoxForRotatedRect(100, 50, 90);
    expect(box.width).toBeCloseTo(50, 10);
    expect(box.height).toBeCloseTo(100, 10);
  });

  it('matches 45° axis-aligned box for a square', () => {
    const { width, height } = boundingBoxForRotatedRect(100, 100, 45);
    expect(width).toBeCloseTo(100 * Math.SQRT2, 5);
    expect(height).toBeCloseTo(100 * Math.SQRT2, 5);
  });
});

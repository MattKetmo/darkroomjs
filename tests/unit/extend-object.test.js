import { describe, expect, it } from 'vitest';
import { extendObject } from '../../lib/js/extend-object.js';

describe('extendObject', () => {
  it('returns source when target is undefined', () => {
    const source = { a: 1 };
    expect(extendObject(undefined, source)).toBe(source);
  });

  it('copies missing keys only', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 99, c: 3 };
    extendObject(target, source);
    expect(target).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('ignores inherited keys on source', () => {
    const target = {};
    const source = Object.create({ inherited: 1 });
    source.own = 2;
    extendObject(target, source);
    expect(target).toEqual({ own: 2 });
  });
});

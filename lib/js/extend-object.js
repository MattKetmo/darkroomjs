/**
 * Merge enumerable own keys from `source` onto `target` when `target` does not
 * already have the key. Mirrors legacy Darkroom.Utils.extend behavior.
 * @param {Record<string, unknown> | undefined} target
 * @param {Record<string, unknown>} source
 */
export function extendObject(target, source) {
  if (target === undefined) {
    return source;
  }
  for (const prop in source) {
    if (
      Object.prototype.hasOwnProperty.call(source, prop) &&
      Object.prototype.hasOwnProperty.call(target, prop) === false
    ) {
      target[prop] = source[prop];
    }
  }
  return target;
}

/**
 * Converts an object or an array of objects into a Map using a specified key.
 * The key field is used as the Map key, and the rest of the object fields are used as the Map value.
 *
 * @template T The type of the objects being converted.
 * @param key The key of the object to be used as the Map key.
 * @param obj The object or array of objects to be converted.
 * @returns A Map where each entry corresponds to an object from the input, keyed by the specified field.
 *
 * @example
 * const obj = { id: '123', name: 'Alice', age: 30 };
 * const map = objToMap<typeof obj, 'id'>('id', obj);
 * // Result: Map { '123' => { id: '123', name: 'Alice', age: 30 } }
 *
 * const arr = [
 *   { id: '123', name: 'Alice', age: 30 },
 *   { id: '456', name: 'Bob', age: 25 },
 * ];
 * const mapFromArray = objToMap('id', arr);
 * // Result: Map {
 * //   '123' => { id: '123', name: 'Alice', age: 30 },
 * //   '456' => { id: '456', name: 'Bob', age: 25 }
 * // }
 */
export function objToMap<T, K extends keyof T>(key: K, obj: T | T[]): Map<T[K], T> {
  const map = new Map<T[K], T>()
  const entries = Array.isArray(obj) ? obj : [obj]
  for (const entry of entries) {
    map.set(entry[key], entry)
  }
  return map
}

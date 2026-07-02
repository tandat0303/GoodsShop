import type { StorageSchema } from "../types/common/storage";

const storage = {
  set: <K extends keyof StorageSchema>(key: K, value: StorageSchema[K]) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  get: <K extends keyof StorageSchema>(
    key: K,
    defaultValue: StorageSchema[K] | null = null,
  ): StorageSchema[K] | null => {
    const value = localStorage.getItem(key);

    if (!value) return defaultValue;

    try {
      return JSON.parse(value) as StorageSchema[K];
    } catch {
      localStorage.removeItem(key);
      return defaultValue;
    }
  },

  remove: (key: keyof StorageSchema) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  },
};

export default storage;

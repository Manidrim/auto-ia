const STORAGE_KEY = "quizPoints";

export function createLocalStorageProgress(storage = localStorage) {
  return {
    getPoints() {
      const saved = storage.getItem(STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    },
    savePoints(points) {
      storage.setItem(STORAGE_KEY, String(points));
    },
  };
}

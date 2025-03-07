export async function runWithConcurrencyLimit(tasks, limit) {
  async function worker() {
    while (tasks.length > 0) {
      const task = tasks.shift();
      try {
        await task();
      } catch (error) {
        throw error;
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
}

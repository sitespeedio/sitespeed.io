export async function runWithConcurrencyLimit(tasks, limit) {
  const running = new Set();

  async function runNext() {
    if (tasks.length === 0) {
      return;
    }

    const task = tasks.shift();
    const promise = task()
      .catch(error => {
        throw error;
      })
      .finally(() => {
        running.delete(promise);
        void runNext();
      });

    running.add(promise);
    if (running.size < limit) {
      void runNext();
    }
  }

  const starters = [];
  for (let index = 0; index < limit && tasks.length > 0; index++) {
    starters.push(runNext());
  }

  await Promise.allSettled(starters);
  if (running.size > 0) {
    await Promise.allSettled(Array.from(running));
  }
}

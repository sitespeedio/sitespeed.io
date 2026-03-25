import dayjs from 'dayjs';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function buildRun(result, resultIndex, runIndex) {
  let run = {};
  Object.assign(run, result[resultIndex].browserScripts[runIndex]);

  if (result[resultIndex].visualMetrics) {
    run.visualMetrics = result[resultIndex].visualMetrics[runIndex];
  }

  if (result[resultIndex].googleWebVitals) {
    run.googleWebVitals = result[resultIndex].googleWebVitals[runIndex];
  }

  if (result[resultIndex].cpu) {
    run.cpu = result[resultIndex].cpu[runIndex];
  }

  if (result[resultIndex].powerConsumption) {
    run.powerConsumption = result[resultIndex].powerConsumption[runIndex];
  }

  if (result[resultIndex].memory) {
    run.memory = result[resultIndex].memory[runIndex];
  }

  if (result[resultIndex].powerConsumption) {
    run.powerConsumption = result[resultIndex].powerConsumption[runIndex];
  }

  if (result[resultIndex].extras) {
    run.extras = result[resultIndex].extras[runIndex];
  }

  run.markedAsFailure = result[resultIndex].markedAsFailure;

  if (result[resultIndex].cdp && result[resultIndex].cdp.performance) {
    run.cdp = {
      performance: result[resultIndex].cdp.performance[runIndex]
    };
  }

  if (result[resultIndex].fullyLoaded) {
    run.fullyLoaded = result[resultIndex].fullyLoaded[runIndex];
  }

  if (result[resultIndex].renderBlocking) {
    run.renderBlocking = result[resultIndex].renderBlocking[runIndex];
  }

  if (result[resultIndex].info.title) {
    run.title = result[resultIndex].info.title;
  }

  if (result[resultIndex].info.description) {
    run.description = result[resultIndex].info.description;
  }

  if (result[resultIndex].info.android) {
    run.android = result[resultIndex].info.android;
    run.android.batteryTemperature =
      result[resultIndex].android.batteryTemperature[runIndex];
  }

  if (result[resultIndex].info.ios) {
    run.ios = result[resultIndex].info.ios;
  }

  run.timestamp = dayjs(result[resultIndex].timestamps[runIndex]).format(
    TIME_FORMAT
  );

  run.errors = result[resultIndex].errors[runIndex];

  return run;
}

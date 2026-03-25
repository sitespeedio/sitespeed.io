import coach from 'coach-core';
const { pickAPage, analyseHar, merge, getThirdPartyWebVersion, getWappalyzerCoreVersion } =
  coach;
import { getLogger } from '@sitespeed.io/log';
import { isEmpty } from '../../support/util.js';

const log = getLogger('plugin.browsertime');

export async function processCoach(
  browserScriptsData,
  result,
  harIndex,
  options,
  url,
  group,
  runIndex,
  sendMessage
) {
  try {
    const coachAdvice = browserScriptsData.coach.coachAdvice;
    // check if the coach has error(s)
    if (!isEmpty(coachAdvice.errors)) {
      log.error(
        '%s generated the following errors in the coach %:2j',
        url,
        coachAdvice.errors
      );
      sendMessage(
        'error',
        'The coach got the following errors: ' +
          JSON.stringify(coachAdvice.errors),
        {
          url,
          runIndex,
          iteration: runIndex + 1
        }
      );
    }

    let advice = coachAdvice;
    // If we run without HAR
    if (result.har) {
      // make sure to get the right run in the HAR
      const myHar = pickAPage(result.har, harIndex);

      const harResult = await analyseHar(myHar, undefined, coachAdvice, options);
      advice = merge(coachAdvice, harResult);
    }
    const thirdPartyWebVersion = getThirdPartyWebVersion();
    const wappalyzerVersion = getWappalyzerCoreVersion();
    advice.thirdPartyWebVersion = thirdPartyWebVersion;
    advice.wappalyzerVersion = wappalyzerVersion;

    sendMessage('coach.run', advice, {
      url,
      group,
      runIndex,
      iteration: runIndex + 1
    });
  } catch (error) {
    log.error('Could not generate coach data', error);
  }
}

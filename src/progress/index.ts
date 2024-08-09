import { checkIfChallengeComplete, getActiveChallenges } from './challenge'
import { getProgress, upsertProgress } from './progress'

async function init() {
  try {
    const challenges = await getActiveChallenges()
    console.log('init. active challenges:', challenges)
  } catch (e) {
    console.log('progress init error', e)
  }
}
export * from './types'
export { init, checkIfChallengeComplete, upsertProgress, getProgress }

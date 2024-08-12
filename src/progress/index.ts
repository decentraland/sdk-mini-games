import { getSDK } from '../sdk'
import { checkIfChallengeComplete, getActiveChallenges, getActiveChallengesSystem } from './challenge'
import { getProgress, upsertProgress } from './progress'

async function init() {
  try {
    const { engine } = getSDK()
    engine.addSystem(getActiveChallengesSystem)

    console.log('progress init. success')
  } catch (e) {
    console.log('progress init error', e)
  }
}
export * from './types'
export { init, checkIfChallengeComplete, upsertProgress, getProgress }

import { getSDK } from '../sdk'
import { completeChallenge, getActiveChallenges } from './challenge'
import { getProgress, upsertProgress } from './progress'
import { isScoreMetCondition } from './scoreCheck'
import { IChallenge, IScore } from './types'

// ideally on PROD we only have 1 active challenge for 1 game.
let activeChallenges: IChallenge[] | undefined

async function init() {
  try {
    activeChallenges = await getActiveChallenges()
    console.log('init. active challenges:', activeChallenges)
  } catch (e) {
    console.log('progress init error', e)
  }
}

// check score with all active challenges.
function checkIfChallengeComplete(score: IScore) {
  if (!activeChallenges) {
    console.log('checkScoreWithActiveChallenges. active challenges undefined. check progress initialization. return.')
    return
  }

  if (activeChallenges.length === 0) {
    console.log('checkScoreWithActiveChallenges. no active challenge. return.')
    return
  }

  let isChallengeConditionMet = false

  for (let i = 0; i < activeChallenges.length; i++) {
    const challengeData = activeChallenges[i].data
    const challengeId = activeChallenges[i].id
    isChallengeConditionMet = isScoreMetCondition(score, challengeData)

    if (isChallengeConditionMet) {
      console.log(
        'checkScoreWithActiveChallenges. score met challenge condition. ID:',
        challengeId,
        'data:',
        challengeData
      )

      completeChallenge(challengeId)
    }
  }
}

export { init, checkIfChallengeComplete, upsertProgress, getProgress, IScore }

import { IChallenge, IScore } from './types'
import { isScoreMetCondition } from './scoreCheck'
import * as api from './api'
import { upsertProgress } from './progress'

export let activeChallenges: IChallenge[]

const fetchInterval = 10 //second
let intervalCount = 0
export function getActiveChallengesSystem(dt: number) {
  intervalCount -= dt
  if (intervalCount > 0) return

  intervalCount = fetchInterval
  void getActiveChallenges()
}

export async function getActiveChallenges() {
  try {
    intervalCount = fetchInterval

    const completedChallengesId: string[] = ((await api.getCompletedChallenges()) ?? []).map(($) => $.id)
    const gameChallenges = await api.getGameChallenges()
    const _activeChallenges: IChallenge[] = []

    for (const gameChallenge of gameChallenges ?? []) {
      if (completedChallengesId.includes(gameChallenge.id)) {
        // game challenge completed, continue to the next one
        continue
      }
      _activeChallenges.push(gameChallenge)
    }

    activeChallenges = _activeChallenges
    return activeChallenges
  } catch (e) {
    console.log('getActiveChallenges. error:', e)
    return undefined
  }
}

// check score with all active challenges.
export function checkIfChallengeComplete(score: IScore): string[] {
  if (!activeChallenges) {
    console.log('checkScoreWithActiveChallenges. active challenges undefined. check progress initialization. return.')
    return []
  }

  if (!activeChallenges.length) {
    console.log('checkScoreWithActiveChallenges. no active challenge. return.')
    return []
  }

  const challengeIdCompleted: string[] = []

  for (const challenge of activeChallenges) {
    const challengeData = challenge.data
    const challengeId = challenge.id
    const conditionMet = isScoreMetCondition(score, challengeData)
    if (conditionMet) {
      console.log(
        'checkScoreWithActiveChallenges. score met challenge condition. ID:',
        challengeId,
        'data:',
        challengeData
      )

      void upsertProgress(score)
      void getActiveChallenges()

      challengeIdCompleted.push(challengeId)
      break
    }
  }
  return challengeIdCompleted
}

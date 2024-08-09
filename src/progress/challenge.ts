import { IChallenge, IScore } from './types'
import { isScoreMetCondition } from './scoreCheck'
import * as api from './api'

export let activeChallenges: IChallenge[]

/**
 * TODO: Should we refetch this in an interval ?
 * or just when we are updating the progress we are ok ?
 */
export async function getActiveChallenges() {
  try {
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

export async function completeChallenge(challengeId: string) {
  try {
    await api.postCompleteChallenge(challengeId)
    await getActiveChallenges()
  } catch (e) {
    console.log('completeChallenge. error:', e)
  }
}

// check score with all active challenges.
export function checkIfChallengeComplete(score: IScore): boolean {
  if (!activeChallenges) {
    console.log('checkScoreWithActiveChallenges. active challenges undefined. check progress initialization. return.')
    return false
  }

  if (!activeChallenges.length) {
    console.log('checkScoreWithActiveChallenges. no active challenge. return.')
    return false
  }

  let isSomeChallengeConditionMet = false

  for (const challenge of activeChallenges) {
    const challengeData = challenge.data
    const challengeId = challenge.id
    const conditionMet = isScoreMetCondition(score, challengeData)
    if (conditionMet) {
      isSomeChallengeConditionMet = true
      console.log(
        'checkScoreWithActiveChallenges. score met challenge condition. ID:',
        challengeId,
        'data:',
        challengeData
      )

      // TODO: maybe we need to wait for this ?
      // If we met a challenge should we return here ? Or we need to check for every challenge ?
      void completeChallenge(challengeId)
    }
  }
  return isSomeChallengeConditionMet
}

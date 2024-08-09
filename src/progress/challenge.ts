import { signedFetch } from '~system/SignedFetch'
import { IChallenge } from './types'
import { GAME_SERVER } from '../config'
import { getSDK } from '../sdk'

export async function getActiveChallenges() {
  const { config } = getSDK()

  // {{host}}/api/missions/in_progress
  const url = `${GAME_SERVER}/api/missions/in_progress`
  try {
    const allChallengeRes = await signedFetch({
      url: url,
      init: {
        method: 'GET',
        headers: {}
      }
    })
    const allActiveChallenges = (await JSON.parse(allChallengeRes.body).data.challenges) as IChallenge[]
    const gameChallenges: IChallenge[] = []
    for (let i = 0; i < allActiveChallenges.length; i++) {
      if (allActiveChallenges[i].game_id === config.gameId && allActiveChallenges[i].active) {
        gameChallenges.push(allActiveChallenges[i])
      }
    }

    // check for completed challenge.
    // {{host}}/api/missions/in_progress
    const completedChallengesurl = `${GAME_SERVER}/api/games/${config.gameId}/challenges/completed`
    const completedChallengeRes = await signedFetch({
      url: completedChallengesurl,
      init: {
        method: 'GET',
        headers: {}
      }
    })
    const completedChallenges = (await JSON.parse(completedChallengeRes.body).data) as IChallenge[]
    const validGameChallenges: IChallenge[] = []
    for (let i = 0; i < gameChallenges.length; i++) {
      let isFound = false
      for (let j = 0; j < completedChallenges.length; j++) {
        if (completedChallenges[j].id === gameChallenges[i].id) {
          isFound = true
          break
        }
      }
      if (!isFound) validGameChallenges.push(gameChallenges[i])
    }

    return validGameChallenges
  } catch (e) {
    console.log('getActiveChallenges. error:', e)
    return undefined
  }
}

export async function completeChallenge(challengeId: string) {
  //{{host}}/api/challenges/:id
  const url = `${GAME_SERVER}/api/challenges/${challengeId}`
  try {
    const response = await signedFetch({
      url: url,
      init: {
        method: 'POST',
        headers: {}
      }
    })

    getActiveChallenges()
  } catch (e) {
    console.log('completeChallenge. error:', e)
    return undefined
  }
}

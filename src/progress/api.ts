import { signedFetch } from '~system/SignedFetch'
import { GAME_SERVER } from '../config'
import { IChallenge, IProgress, IScore } from './types'
import { getSDK } from '../sdk'

/**
 * Get completed challenges filtered by GAME_ID.
 */
export async function getCompletedChallenges(): Promise<IChallenge[] | undefined> {
  const { config } = getSDK()
  try {
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
    return completedChallenges.filter(($) => $.game_id === config.gameId)
  } catch (e: any) {
    console.log('Failed to fetch getCompletedChallenges', e.message)
    return undefined
  }
}

/**
 * Get all the GAME_ID challenges
 */
export async function getGameChallenges(): Promise<IChallenge[] | undefined> {
  try {
    const { config } = getSDK()
    // {{host}}/api/missions/in_progress
    const url = `${GAME_SERVER}/api/missions/in_progress`
    const allChallengeRes = await signedFetch({
      url: url,
      init: {
        method: 'GET',
        headers: {}
      }
    })
    const challenges = ((await JSON.parse(allChallengeRes.body).data.challenges) as IChallenge[]).filter(
      (challenge) => {
        return challenge.game_id === config.gameId && challenge.active
      }
    )
    return challenges
  } catch (e: any) {
    console.log('Failed to fetch getGameChallenges', e.message)
    return undefined
  }
}

export async function postCompleteChallenge(challengeId: string) {
  //{{host}}/api/challenges/:id
  const url = `${GAME_SERVER}/api/challenges/${challengeId}`
  await signedFetch({
    url: url,
    init: {
      method: 'POST',
      headers: {}
    }
  })
}

// TODO: i think that we shouldn't be passing the name.
// we can pass the user_id and then grab the name from the PlyerIdentityData
export async function updateProgress(score: IScore, name: string) {
  const { config } = getSDK()

  // TODO: i think the sort, limit, direction are not necessary here.
  const url = `${GAME_SERVER}/api/games/${config.gameId}/progress?sort=level&limit=10&direction=DESC`
  console.log('upsert progress url:', url)
  try {
    const response = await signedFetch({
      url: url,
      init: {
        method: 'POST',
        body: JSON.stringify({
          // TODO: why the name ?
          user_name: name,
          ...score
        }),
        headers: {}
      }
    })
    const progress = await JSON.parse(response.body)
    return progress
  } catch (e: any) {
    console.log('failed updating progress', e.message)
  }
}

export async function getProgress(): Promise<IProgress[] | undefined> {
  const { config } = getSDK()

  // {{host}}/api/games/:id/progress?sort=level&limit=10&direction=DESC
  const url = `${GAME_SERVER}/api/games/${config.gameId}/progress?sort=level&limit=10&direction=DESC`
  console.log('get progress url:', url)
  try {
    const response = await signedFetch({
      url: url,
      init: {
        method: 'GET',
        headers: {}
      }
    })
    const progress = (await JSON.parse(response.body).data) as IProgress[]
    console.log('get progress response:', progress)

    return progress
  } catch (e) {
    console.log('error get progress', e)
  }
}

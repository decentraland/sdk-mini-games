import { IScore } from './types'
import { signedFetch } from '~system/SignedFetch'
import { GAME_SERVER } from '../config'
import { getSDK } from '../sdk'
import { checkIfChallengeComplete } from '.'

export async function upsertProgress(score: IScore) {
  const { config, players } = getSDK()

  // {{host}}/api/games/:id/progress?sort=level&limit=10&direction=DESC
  const url = `${GAME_SERVER}/api/games/${config.gameId}/progress?sort=level&limit=10&direction=DESC`
  console.log('upsert progress url:', url)
  try {
    const response = await signedFetch({
      url: url,
      init: {
        method: 'POST',
        body: JSON.stringify({
          user_name: players.getPlayer()?.name,
          ...score
        }),
        headers: {}
      }
    })
    const progress = await JSON.parse(response.body)
    console.log('upsert progress response:', progress)

    checkIfChallengeComplete(score)
  } catch (e) {
    console.log('error upsert progress', e)
  }
}

export async function getProgress() {
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
    const progress = await JSON.parse(response.body).data
    console.log('get progress response:', progress)

    return progress
  } catch (e) {
    console.log('error get progress', e)
  }
}

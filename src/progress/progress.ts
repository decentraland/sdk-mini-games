import { IScore } from './types'
import { getSDK } from '../sdk'
import { checkIfChallengeComplete } from '.'
import * as api from './api'

export async function upsertProgress(score: IScore) {
  const { players } = getSDK()
  try {
    const _progress = await api.updateProgress(score, players.getPlayer()?.userId ?? '')
    checkIfChallengeComplete(score)
  } catch (e) {
    console.log('error upsert progress', e)
  }
}

export async function getProgress() {
  return api.getProgress()
}

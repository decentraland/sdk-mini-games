import { IEngine } from '@dcl/sdk/ecs'
import type playersType from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType } from '@dcl/sdk/network'

import { startPlayersQueue } from './queue'
import * as gameConfig from './config'
import { setSDK } from './sdk'
import { addEnvironment } from './environment'

export type IOptions = {
  gameId: string
  environment: string
  gameTimeoutMs?: number
  sceneRotation?: number
}

export let engine: IEngine
export function initLibrary(
  engine: IEngine,
  syncEntity: typeof SyncEntityType,
  players: typeof playersType,
  options: IOptions
) {
  setSDK({ engine, syncEntity, players, config: options })
  addEnvironment()
  startPlayersQueue()
  gameConfig.init()
}

export * as ui from './ui'
export * as queue from './queue'
export { sceneParentEntity } from './config'
export * as utilities from './utilities'

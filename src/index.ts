import { IEngine, TransformType } from '@dcl/sdk/ecs'
import type playersType from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType, isStateSyncronized as IsStateSyncronizedType } from '@dcl/sdk/network'

import { startPlayersQueue } from './queue'
import * as gameConfig from './config'
import * as progress from './progress'
import { setSDK } from './sdk'
import { gameAreaCheck } from './environment/game-area-check'

export type IOptions = {
  gameId: string
  environment: string
  gameTimeoutMs?: number
  inactiveTimeoutMs?: number
  sceneRotation?: number
  gameArea?: {
    topLeft: TransformType['position']
    bottomRight: TransformType['position']
    exitSpawnPoint: TransformType['position']
  }
}

export let engine: IEngine
export function initLibrary(
  engine: IEngine,
  syncEntity: typeof SyncEntityType,
  players: typeof playersType,
  isStateSyncronized: typeof IsStateSyncronizedType,
  options: IOptions
) {
  setSDK({ engine, syncEntity, players, config: options, isStateSyncronized })
  startPlayersQueue()
  gameConfig.init()
  void progress.init()

  if (options.gameArea) {
    engine.addSystem(gameAreaCheck())
  }
}

export * as ui from './ui'
export * as queue from './queue'
export { sceneParentEntity } from './config'
export * as utilities from './utilities'
export * as progress from './progress'

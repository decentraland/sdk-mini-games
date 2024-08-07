import { IEngine } from '@dcl/sdk/ecs'
import type playersType from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType } from '@dcl/sdk/network'

import * as queue from './queue'
import * as gameConfig from './gameConfig'
import { setSDK } from './sdk'
import { initEnvironment } from './environment'

export type IConfig = {
  gameId: string
  environment: string
  gameTimeoutMs?: number,
  sceneRotation?: number
}

export let engine: IEngine
export function initLibrary(
  engine: IEngine,
  syncEntity: typeof SyncEntityType,
  players: typeof playersType,
  config: IConfig
) {
  setSDK({ engine, syncEntity, players, config })
  initEnvironment()
  queue.initPlayersQueue()
  gameConfig.init()
}
export * from './sdk'
export * as queueDisplay from './queueDisplay'
export * as ui from './ui'
export { queue }
export { SCENE_PARENT } from './gameConfig'
export * as utilities from './utilities'

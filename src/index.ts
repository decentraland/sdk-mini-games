import { IEngine } from '@dcl/sdk/ecs'
import type playersType from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType } from '@dcl/sdk/network'

import * as queue from './queue'
import * as test from './test'
import * as queueDisplay from './queueDisplay'
import { setSDK } from './sdk'

export type IConfig = {
  gameId: string
}

export let engine: IEngine
export function initLibrary(
  engine: IEngine,
  syncEntity: typeof SyncEntityType,
  players: typeof playersType,
  config: IConfig
) {
  setSDK({ engine, syncEntity, players, config })
  queue.initPlayersQueue()
}
export * from './sdk'
export { queue, test, queueDisplay }

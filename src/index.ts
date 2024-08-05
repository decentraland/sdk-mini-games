import { IEngine } from "@dcl/sdk/ecs";
import type players from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType } from '@dcl/sdk/network'

import { initPlayersQueue } from './queue'

export type IConfig = {
  gameId: string
}

export function initLibrary(_engine: IEngine, _syncEntity: typeof SyncEntityType, _playersApi: typeof players, _config: IConfig) {
  initPlayersQueue(_engine, _syncEntity, _playersApi)
}

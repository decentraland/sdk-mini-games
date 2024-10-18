import { IEngine, TransformType } from '@dcl/sdk/ecs'
import type playersType from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType, isStateSyncronized as IsStateSyncronizedType } from '@dcl/sdk/network'

import { startPlayersQueue } from './queue'
import * as gameConfig from './config'
import * as progress from './progress'
import { getSDK, setSDK } from './sdk'
import { gameAreaCheck } from './environment/game-area-check'
import { MenuButton } from './ui'

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

export function StartGameButtonCheck(button: MenuButton) {
  const {
    isStateSyncronized,
    engine,
    components: { RealmInfo }
  } = getSDK()

  // Disable the start game button till the user is connected to comms.
  button.disable()

  // Enable start game button after we are connected to comms.
  // Maybe I can create a custom component to detect when the initial state has been syncronized and await for that component.
  // But for the moment I'll go this way to debug if this works.
  engine.addSystem(() => {
    const realmInfo = RealmInfo.getOrNull(engine.RootEntity)
    if (!realmInfo) return

    if (isStateSyncronized() && realmInfo.isConnectedSceneRoom && !button.enabled) {
      console.log('Enable Start Game')
      button.enable()
    }

    if ((!realmInfo.isConnectedSceneRoom || !isStateSyncronized()) && button.enabled) {
      console.log(
        `Disable Start Game. { isConnectedSceneRoom: ${realmInfo.isConnectedSceneRoom}, isStateSyncronized: ${isStateSyncronized()} }`
      )
      button.disable()
    }
  })
}

export * as ui from './ui'
export * as queue from './queue'
export { sceneParentEntity } from './config'
export * as utilities from './utilities'
export * as progress from './progress'

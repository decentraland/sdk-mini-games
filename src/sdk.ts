import { IEngine, ISchema, MapComponentDefinition, MapResult } from '@dcl/sdk/ecs'
import * as components from '@dcl/ecs/dist/components'
import type players from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType } from '@dcl/sdk/network'
import { IConfig } from '.'

const cache: {
  engine: IEngine
  syncEntity: typeof SyncEntityType
  players: typeof players
  config: IConfig
} = {} as typeof cache

/**
 * @internal
 */
export function setSDK(value: typeof cache) {
  for (const key in value) {
    ;(cache as any)[key] = (value as any)[key]
  }
}

/**
 * @internal
 */
export function getSDK() {
  if (!cache.engine) throw new Error('Call init library first.')
  return {
    ...cache,
    Transform: components.Transform(cache.engine),
    GltfContainer: components.GltfContainer(cache.engine)
    // TODO: add all the components that we use here to reuse them
  }
}

/**
 * @public
 * SDK methods that the library receives on the initPlayersQueue
 */
export let Player: MapComponentDefinition<
  MapResult<{
    address: ISchema<string>
    joinedAt: ISchema<number>
    startPlayingAt: ISchema<number>
    active: ISchema<boolean>
  }>
>
/**
 * @internal
 */
export function setPlayerComponent(playerComponent: typeof Player) {
  Player = playerComponent
}

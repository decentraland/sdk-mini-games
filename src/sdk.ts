import { createInputSystem, IEngine, IInputSystem, ISchema, MapComponentDefinition, MapResult } from '@dcl/sdk/ecs'
import * as components from '@dcl/ecs/dist/components'
import type players from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType } from '@dcl/sdk/network'
import { IConfig } from '.'

type ICache = {
  engine: IEngine
  syncEntity: typeof SyncEntityType
  players: typeof players
  config: IConfig
  inputSystem: IInputSystem
}

const cache: ICache = {} as ICache

/**
 * @internal
 */
export function setSDK(value: Omit<ICache, 'inputSystem'>) {
  for (const key in value) {
    ;(cache as any)[key] = (value as any)[key]
  }
  cache.inputSystem = createInputSystem(value.engine)
}

/**
 * @internal
 */
export function getSDK() {
  if (!cache.engine) throw new Error('Call init library first.')
  return {
    ...cache,
    Transform: components.Transform(cache.engine),
    GltfContainer: components.GltfContainer(cache.engine),
    AudioSource: components.AudioSource(cache.engine),
    Material: components.Material(cache.engine),
    MeshRenderer: components.MeshRenderer(cache.engine),
    VisibilityComponent: components.VisibilityComponent(cache.engine),
    TextShape: components.TextShape(cache.engine),
    PointerEvents: components.PointerEvents(cache.engine),
    Billboard: components.Billboard(cache.engine),
    Tween: components.Tween(cache.engine)
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

import { createInputSystem, IEngine, IInputSystem, Schemas, createTweenSystem, TweenSystem } from '@dcl/sdk/ecs'
import * as components from '@dcl/ecs/dist/components'
import type players from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType } from '@dcl/sdk/network'
import { IOptions } from '.'
import { Player as PlayerComponent, setPlayerComponent } from './components/Player'

type ICache = {
  engine: IEngine
  syncEntity: typeof SyncEntityType
  players: typeof players
  config: IOptions
  inputSystem: IInputSystem
  tweenSystem: TweenSystem
  components: {
    Transform: ReturnType<typeof components.Transform>
    GltfContainer: ReturnType<typeof components.GltfContainer>
    AudioSource: ReturnType<typeof components.AudioSource>
    Material: ReturnType<typeof components.Material>
    MeshRenderer: ReturnType<typeof components.MeshRenderer>
    VisibilityComponent: ReturnType<typeof components.VisibilityComponent>
    TextShape: ReturnType<typeof components.TextShape>
    PointerEvents: ReturnType<typeof components.PointerEvents>
    Billboard: ReturnType<typeof components.Billboard>
    Tween: ReturnType<typeof components.Tween>
    TweenSequence: ReturnType<typeof components.TweenSequence>
    TweenState: ReturnType<typeof components.TweenState>
    PlayerIdentityData: ReturnType<typeof components.PlayerIdentityData>
    Player: typeof PlayerComponent
  }
}

const cache: ICache = {} as ICache

/**
 * @internal
 */
export function setSDK(value: Omit<ICache, 'inputSystem' | 'components' | 'tweenSystem'>) {
  for (const key in value) {
    ;(cache as any)[key] = (value as any)[key]
  }

  cache.inputSystem = createInputSystem(value.engine)
  cache.tweenSystem = createTweenSystem(value.engine)

  cache.components = {
    Transform: components.Transform(cache.engine),
    GltfContainer: components.GltfContainer(cache.engine),
    AudioSource: components.AudioSource(cache.engine),
    Material: components.Material(cache.engine),
    MeshRenderer: components.MeshRenderer(cache.engine),
    VisibilityComponent: components.VisibilityComponent(cache.engine),
    TextShape: components.TextShape(cache.engine),
    PointerEvents: components.PointerEvents(cache.engine),
    Billboard: components.Billboard(cache.engine),
    Tween: components.Tween(cache.engine),
    TweenSequence: components.TweenSequence(cache.engine),
    TweenState: components.TweenState(cache.engine),
    PlayerIdentityData: components.PlayerIdentityData(cache.engine),
    Player: value.engine.defineComponent('sdk-utils/player:player', {
      address: Schemas.String,
      joinedAt: Schemas.Int64,
      active: Schemas.Boolean,
      startPlayingAt: Schemas.Int64
    })
  }

  setPlayerComponent(cache.components.Player)
}

/**
 * @internal
 */
export function getSDK() {
  if (!cache.engine) throw new Error('Call init library first.')
  return { ...cache }
}

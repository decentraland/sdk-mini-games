import { MapComponentDefinition, MapResult, ISchema } from '@dcl/sdk/ecs'

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

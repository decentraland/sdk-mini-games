import { getSDK } from '../sdk'

/**
 * Cache the client userId
 */
let userId: string | undefined
function getUserId() {
  if (userId) return userId

  const { players } = getSDK()
  return (userId = players.getPlayer()?.userId)
}
function forceSelfPlayerSync() {
  const {
    engine,
    syncEntity,
    components: { Player }
  } = getSDK()

  for (const [entity, player] of engine.getEntitiesWith(Player)) {
    if (player.address === getUserId()) {
      Player.getMutable(entity)
    }
  }
}

let count = 0
export function ForceSelfPlayerSyncSystem(dt: number) {
  count += dt
  if (count < 1) return

  count = 0
  forceSelfPlayerSync()
}

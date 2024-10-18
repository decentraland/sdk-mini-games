import { Player } from "@dcl-sdk/mini-games/src/components/Player"
import { getSDK } from "@dcl-sdk/mini-games/src/sdk"
import { engine } from "@dcl/sdk/ecs"

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

    for (const [entity, player] of engine.getEntitiesWith(Player)) {
        if (player.address === getUserId()) {
          Player.getMutable(entity)
        }
      }
}

let count = 0
export function ForceSelfPlayerSyncSystem(dt: number){
    count += dt
    if(count < 1) return
    
    count = 0
    forceSelfPlayerSync()
}
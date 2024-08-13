import { Vector3 } from '@dcl/sdk/math'
import { getSDK } from '../sdk'
import { utilities, queue } from '..'
import { sceneParentEntity } from '../config'
import { rotateVectorAroundCenter } from '../utilities'
import { movePlayerTo } from '~system/RestrictedActions'
import { getQueue, setNextPlayer } from '../queue'

export function gameAreaCheck() {
  let areaCheckTimer = 0
  return function gameAreaCheck(dt: number) {
    const {
      engine,
      components: { Transform },
      config
    } = getSDK()
    if (!config.gameArea) return
    areaCheckTimer += dt

    if (areaCheckTimer >= 1) {
      areaCheckTimer = 0

      const playerTransform = Transform.get(engine.PlayerEntity)

      // TODO: center should be a config ?
      const center = Vector3.create(8, 0, 8)
      const sceneRotation = Transform.get(sceneParentEntity).rotation
      const areaPt1 = rotateVectorAroundCenter(config.gameArea.topLeft, center, sceneRotation)
      const areaPt2 = rotateVectorAroundCenter(config.gameArea.bottomRight, center, sceneRotation)

      // If the player is inside the game-area but its not the active player.
      if (utilities.isVectorInsideArea(playerTransform.position, areaPt1, areaPt2)) {
        if (!queue.isActive()) {
          void movePlayerTo({
            newRelativePosition: rotateVectorAroundCenter(config.gameArea.exitSpawnPoint, center, sceneRotation)
          })
        }
        // Active player left game area
        // (we put a 2s grace period because the movePlayer takes time)
      } else if (queue.isActive() && Date.now() - getQueue()[0]!.player.startPlayingAt > 2000) {
        setNextPlayer()
      }
    }
  }
}

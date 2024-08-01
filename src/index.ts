import { Entity, ISchema, MapComponentDefinition, MapResult, PlayerIdentityData, Schemas } from '@dcl/sdk/ecs'
import { type IEngine } from '@dcl/ecs'
import players from '@dcl/sdk/players'
import type { syncEntity as SyncEntityType } from '@dcl/sdk/network'

export type PlayerType = {
  address: string;
  joinedAt: number;
  startPlayingAt: number
  active: boolean
}

/**
 * SDK methods that the library receives on the initLibrary
 */
let engine: IEngine
export let Player: MapComponentDefinition<MapResult<{
  address: ISchema<string>
  joinedAt: ISchema<number>
  startPlayingAt: ISchema<number>
  active: ISchema<boolean>
}>>
let syncEntityApi: typeof SyncEntityType
let playersApi: typeof players

/**
 * Internal queue that checks if the user has left the scene for more than $TIMER seconds
 */
const queueLeaveScene: Map<string, number> = new Map()

/**
 * Return listeners so they can be override with callbacks
 * const listeners = initLibrary()
 * listeners.onActivePlayerChange = (player) => player.address
 */
export const listeners: { onActivePlayerChange: (player: PlayerType) => void } = {
  onActivePlayerChange: () => {}
}
/**
 * We need the engine as a param to avoid references to different engines
 * when working on development environments.
 */
export function initLibrary(_engine: IEngine, _syncEntity: typeof SyncEntityType, _playersApi: typeof players) {
  engine = _engine
  Player = engine.defineComponent('sdk-utils/player:player', {
    address: Schemas.String,
    joinedAt: Schemas.Int64,
    active: Schemas.Boolean,
    startPlayingAt: Schemas.Int64
  })
  syncEntityApi = _syncEntity
  playersApi = _playersApi

  playersApi.onLeaveScene((userId: string) => {
    queueLeaveScene.set(userId, Date.now())
  })

  engine.addSystem(internalPlayerSystem())
  return listeners
}
/**
 * Set current player as inactive, and grab the first of the queue
 */
export function setNextPlayer() {
  _setNextPlayer(false)
}
/**
 * Add current player to the queue
 */
export function addPlayer() {
  const userId = getUserId()
  if (!userId || isPlayerInQueue(userId)) {
    return
  }
  const timestamp = Date.now()
  const entity = engine.addEntity()
  Player.create(entity, { address: userId, joinedAt: timestamp })
  syncEntityApi(entity, [Player.componentId])
}

/**
 * Check's if the current user is active.
 */
export function isActive(): boolean {
  const [entity, player] = getActivePlayer()
  if (player) {
    return player.address === getUserId()
  }
  return false
}

/**
 * Get queue of players ordered
 */
export function getQueue() {
  const queue = new Map<string, { player: PlayerType, entity: Entity }>()

  for (const [entity, player] of engine.getEntitiesWith(Player)) {
    if (!queue.has(player.address)) {
      queue.set(player.address, { player, entity })
      continue
    }
    queue.set(player.address, { player, entity })
  }

  return [...queue.values()].sort((a, b) => a.player.joinedAt < b.player.joinedAt ? -1 : 1)
}


/**
 * ======== INTERNAL HELPERS ========
 */

/**
 * Cache the client userId
 */
let userId: string | undefined
function getUserId() {
  if (userId) return userId
  return userId = playersApi.getPlayer()?.userId
}

function _setNextPlayer(force?: boolean) {
  const [_, activePlayer] = getActivePlayer()

  if (!force && activePlayer?.address !== getUserId()) {
    return
  }

  for (const [_, player] of engine.getEntitiesWith(Player)) {
    if (player.active) {
      removePlayer(player.address)
    }
  }
  const nextPlayer = getQueue()[0]
  if (nextPlayer && nextPlayer.player.address === getUserId()) {
    lastActivePlayer = nextPlayer.player.address
    Player.getMutable(nextPlayer.entity).active = true
    Player.getMutable(nextPlayer.entity).startPlayingAt = Date.now()
    if (listeners.onActivePlayerChange) {
      listeners.onActivePlayerChange(Player.get(nextPlayer.entity))
    }
  }
}


/**
 * Run a system every 4s that checks if a user has been disconnected
 * from the scene and removes it from the Queue.
*/
let lastActivePlayer: string
function internalPlayerSystem() {
  let timer = 0
  return function(dt: number) {
    timer += dt
    if (timer < 1) {
      return
    }
    timer = 0
    // Listen to disconnected players
    const TIMER = 2000
    for (const [userId, leaveSceneAt] of queueLeaveScene) {
      if (Date.now() - leaveSceneAt >= TIMER) {
        if (!isPlayerConnected(userId)) {
          removePlayer(userId)
        }
        queueLeaveScene.delete(userId)
      }
    }

    const [_, activePlayer] = getActivePlayer()

    // Emit onActivePlayerChange if the last player has changed
    if (activePlayer && activePlayer.address !== lastActivePlayer) {
      lastActivePlayer = activePlayer.address
      listeners.onActivePlayerChange(activePlayer)
    }

    // Listen to changes in the queue and if there is no active player set it.
    if (!activePlayer) {
      const nextPlayer = getQueue()[0]
      if (nextPlayer && nextPlayer.player.address === getUserId()) {
        _setNextPlayer(true)
      }
    }
  }
}


/**
 * Check if player is still connected to the scene
 */
function isPlayerConnected(userId: string) {
  for (const [_, player] of engine.getEntitiesWith(PlayerIdentityData)) {
    if (player.address === userId) {
      return true
    }
  }
  return false
}

/**
 * Check if the player is already in the Queue
 */
function isPlayerInQueue(userId: string) {
  for (const [_, player] of engine.getEntitiesWith(Player)) {
    if (player.address === userId) {
      return true
    }
  }
  return false
}

/**
 * Remove Player from queue
 */
function removePlayer(_userId?: string) {
  const userId = _userId ?? getUserId()

  if (!userId) {
    return
  }

  for (const [entity, player] of engine.getEntitiesWith(Player)) {
    if (player.address === userId) {
      engine.removeEntity(entity)
    }
  }
}

/**
 * Get active player
 */
function getActivePlayer(): [Entity, PlayerType] | [] {
  for (const [entity, player] of engine.getEntitiesWith(Player)) {
    if (player.active) {
      return [entity, player]
    }
  }
  return []
}
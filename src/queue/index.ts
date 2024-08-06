import { Entity, Schemas } from '@dcl/sdk/ecs'
import { getSDK, Player, setPlayerComponent } from '../sdk'

export type PlayerType = {
  address: string
  joinedAt: number
  startPlayingAt: number
  active: boolean
}

/**
 * listeners.onActivePlayerChange = (player) => player.address
 */
export const listeners: { onActivePlayerChange: (player: PlayerType) => void } = {
  onActivePlayerChange: () => {}
}
/**
 * We need the engine, syncEntity and playerApi as params to avoid references to different engines
 * when working on development environments.
 */
export function initPlayersQueue() {
  const { engine, players } = getSDK()
  const playerComponent = engine.defineComponent('sdk-utils/player:player', {
    address: Schemas.String,
    joinedAt: Schemas.Int64,
    active: Schemas.Boolean,
    startPlayingAt: Schemas.Int64
  })

  setPlayerComponent(playerComponent)

  players.onLeaveScene((userId: string) => {
    console.log('Player leave scene', userId)
    removePlayer(userId)
  })

  engine.addSystem(internalPlayerSystem())

  // TODO: TIME LIMIT PER GAME (startPlayingAt - TIME_LIMIT)
}
/**
 * Add current player to the queue
 */
export function addPlayer() {
  const { engine, syncEntity } = getSDK()
  const userId = getUserId()
  if (!userId || isPlayerInQueue(userId)) {
    return
  }
  const timestamp = Date.now()
  const entity = engine.addEntity()
  Player.create(entity, { address: userId, joinedAt: timestamp })
  syncEntity(entity, [Player.componentId])
}

/**
 * Check's if the current user is active.
 */
export function isActive(): boolean {
  const [_entity, player] = getActivePlayer()
  if (player) {
    return player.address === getUserId()
  }
  return false
}

/**
 * Get queue of players ordered
 */
export function getQueue() {
  const { engine } = getSDK()
  const queue = new Map<string, { player: PlayerType; entity: Entity }>()
  for (const [entity, player] of engine.getEntitiesWith(Player)) {
    if (!queue.has(player.address)) {
      queue.set(player.address, { player, entity })
      continue
    }
    queue.set(player.address, { player, entity })
  }

  return [...queue.values()].sort((a, b) => (a.player.joinedAt < b.player.joinedAt ? -1 : 1))
}

/**
 * ======== INTERNAL HELPERS ========
 */

/**
 * Cache the client userId
 */
let userId: string | undefined
function getUserId() {
  const { players } = getSDK()

  if (userId) return userId
  return (userId = players.getPlayer()?.userId)
}

export function setNextPlayer() {
  const { engine } = getSDK()
  const [_, activePlayer] = getActivePlayer()

  // Only run this if you are the active player, or there is no one assigned
  if (activePlayer && activePlayer.address !== getUserId()) {
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
  return function (dt: number) {
    timer += dt
    if (timer < 1) {
      return
    }
    timer = 0

    const [_, activePlayer] = getActivePlayer()

    // Emit onActivePlayerChange if the last player has changed
    if (activePlayer && activePlayer.address !== lastActivePlayer) {
      lastActivePlayer = activePlayer.address
      listeners.onActivePlayerChange(activePlayer)
    }

    // Listen to changes in the queue and if there is no active player set it.
    if (!activePlayer) {
      setNextPlayer()
    }

    // TIMER for active player
    const { config } = getSDK()
    if (config.gameTimeoutMs && activePlayer && isActive()) {
      if (Date.now() - activePlayer.startPlayingAt >= config.gameTimeoutMs) {
        setNextPlayer()
      }
    }
  }
}

/**
 * Check if the player is already in the Queue
 */
function isPlayerInQueue(userId: string) {
  const { engine } = getSDK()

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
  const { engine } = getSDK()

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
  const { engine } = getSDK()

  for (const [entity, player] of engine.getEntitiesWith(Player)) {
    if (player.active) {
      return [entity, player]
    }
  }
  return []
}

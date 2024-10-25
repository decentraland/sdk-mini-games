import { Entity, InputAction, PointerEventType } from '@dcl/sdk/ecs'
import { initQueueDisplay } from './display'
import { getSDK } from '../sdk'

export type PlayerType = {
  address: string
  joinedAt: number
  startPlayingAt: number
  active: boolean
}

export { initQueueDisplay }
/**
 * listeners.onActivePlayerChange = (player) => player.address
 */
export const listeners: { onActivePlayerChange: (player: PlayerType | null) => void } = {
  onActivePlayerChange: () => {}
}
let initializedQueue = false
let addPlayerRequested = false
/**
 * We need the engine, syncEntity and playerApi as params to avoid references to different engines
 * when working on development environments.
 */
export function startPlayersQueue() {
  if (initializedQueue) return
  initializedQueue = true
  const { engine, players } = getSDK()
  players.onLeaveScene((userId: string) => {
    addPlayerRequested = false
    removePlayer(userId)
  })

  engine.addSystem(internalPlayerSystem())
  engine.addSystem(inputsCheckTimer())
}
/**
 * Add current player to the queue
 */
export function addPlayer() {
  const userId = getUserId()
  if (!userId || isPlayerInQueue(userId) || addPlayerRequested) {
    return
  }

  addPlayerRequested = true
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

export function isAwaiting( ) {
  return addPlayerRequested
}

/**
 * Get queue of players ordered
 */
export function getQueue() {
  const {
    engine,
    components: { Player }
  } = getSDK()
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
  const {
    engine,
    components: { Player }
  } = getSDK()
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
    inactiveSince = Date.now()
  }

  if (listeners.onActivePlayerChange && activePlayer?.address !== nextPlayer?.player.address) {
    listeners.onActivePlayerChange(Player.getOrNull(nextPlayer?.entity))
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

    const {
      engine,
      config,
      syncEntity,
      components: { Player, RealmInfo },
      isStateSyncronized
    } = getSDK()

    const realmInfo = RealmInfo.getOrNull(engine.RootEntity)
    if (addPlayerRequested && realmInfo?.isConnectedSceneRoom && isStateSyncronized()) {
      const timestamp = Date.now()
      const entity = engine.addEntity()
      Player.create(entity, { address: userId, joinedAt: timestamp })
      syncEntity(entity, [Player.componentId])
      addPlayerRequested = false
    }

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

    // TIMER for active player and inactivity detection
    if (
      activePlayer &&
      //
      // I'm the player playnig
      isActive() &&
      //
      // If you are the only player connected, keep playing.
      getQueue().length > 1 &&
      ((config.gameTimeoutMs && Date.now() - activePlayer.startPlayingAt >= config.gameTimeoutMs) ||
        (config.inactiveTimeoutMs && Date.now() > inactiveSince + config.inactiveTimeoutMs))
    ) {
      setNextPlayer()
    }
  }
}

let inactiveSince = 0
function inputsCheckTimer() {
  return function () {
    const { inputSystem } = getSDK()

    if (!isActive()) return

    //update player inactivty timer
    if (inputSystem.isTriggered(InputAction.IA_ANY, PointerEventType.PET_DOWN)) {
      inactiveSince = Date.now()
    }
  }
}

/**
 * Check if the player is already in the Queue
 */
function isPlayerInQueue(userId: string) {
  const {
    engine,
    components: { Player }
  } = getSDK()

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
  const {
    engine,
    components: { Player }
  } = getSDK()

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
  const {
    engine,
    components: { Player }
  } = getSDK()

  for (const [entity, player] of engine.getEntitiesWith(Player)) {
    if (player.active) {
      return [entity, player]
    }
  }
  return []
}

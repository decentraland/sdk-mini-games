// We define the empty imports so the auto-complete feature works as expected.
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { AudioSource, engine, Entity, GltfContainer, pointerEventsSystem, Schemas, Transform } from '@dcl/sdk/ecs'

import { changeColorSystem, circularSystem } from './systems'

import { initLibrary, queue, sceneParentEntity, ui, progress } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { createCube } from './factory'
import { movePlayerTo } from '~system/RestrictedActions'

const _1_SEC = 1000
const _1_MIN = _1_SEC * 60

// make sure to put this line outside the main function.
initLibrary(engine, syncEntity, players, {
  environment: 'dev',
  gameId: 'game-id-here',
  gameTimeoutMs: _1_MIN,
  gameArea: {
    topLeft: Vector3.create(5.15, 0, 2.23),
    bottomRight: Vector3.create(13.77, 0, 13.77),
    exitSpawnPoint: Vector3.create(0, 0, 7)
  }
})
let gameDataEntity: Entity
enum SyncEntityEnums {
  GameData = 1
}

export function main() {
  gameDataEntity = engine.addEntity()
  // Syncronize GameData so every user can see in which level, time, etc the current player is at.
  syncEntity(gameDataEntity, [GameData.componentId], SyncEntityEnums.GameData)
  const finishCube = createCube(2, 4, 2, Color4.Red())

  const fence = engine.addEntity()
  GltfContainer.create(fence, {
    src: 'assets/fence.glb'
  })
  Transform.create(fence, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 0, 0),
    scale: Vector3.create(1, 1, 1),
    rotation: Quaternion.fromEulerDegrees(0, -90, 0)
  })

  // Add the Play Button to the fence instead of the old start game cube.
  new ui.MenuButton(
    {
      parent: sceneParentEntity,
      position: Vector3.create(-3.74, 1.03, 0),
      rotation: Quaternion.fromEulerDegrees(-45, 90, 0),
      scale: Vector3.create(1.2, 1.2, 1.2)
    },
    ui.uiAssets.shapes.RECT_GREEN,
    ui.uiAssets.icons.playText,
    'PLAY GAME',
    () => {
      queue.addPlayer()
      console.log('Current queue', queue.getQueue())
    }
  )

  // End Game.
  pointerEventsSystem.onPointerDown({ entity: finishCube, opts: { hoverText: 'Finish game' } }, () => {
    void onFinishLevel()
    queue.setNextPlayer()
    console.log('Current queue', queue.getQueue())
  })

  queue.listeners.onActivePlayerChange = (player) => {
    // If the user is the active player, move it to the game area
    if (queue.isActive()) {
      startGame()
      void movePlayerTo({ newRelativePosition: Vector3.create(6.5, 2, 8), cameraTarget: Vector3.create(13, 2, 8) })
    }
    console.log('active player changed', player)
    console.log('Current queue', queue.getQueue())
    // here you can set the logic to start the new game
    // such as reset the old state, move the player inside the area, set a coutner to start the game, etc.
    // game.startNewGame()
  }
}

function startGame() {
  // reset the game logic, and prepare the game.
  GameData.createOrReplace(gameDataEntity, {
    levelFinishedAt: undefined,
    moves: 0,
    levelStartedAt: Date.now(),
    currentLevel: 0
  })
}

const GameData = engine.defineComponent('game-data', {
  moves: Schemas.Number,
  levelStartedAt: Schemas.Int64,
  levelFinishedAt: Schemas.Int64,
  currentLevel: Schemas.Number
})

async function onFinishLevel() {
  try {
    const gameData = GameData.getMutable(gameDataEntity)
    gameData.levelFinishedAt = Date.now()
    const sounds = engine.addEntity()
    AudioSource.createOrReplace(sounds, {
      audioClipUrl: 'sounds/win.mp3',
      playing: true,
      volume: 2
    })

    await progress.upsertProgress({
      level: gameData.currentLevel,
      time: gameData.levelFinishedAt - gameData.levelStartedAt,
      moves: gameData.moves
    })
  } catch (e) {
    console.log('Error', e)
  }
}

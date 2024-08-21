// We define the empty imports so the auto-complete feature works as expected.
import { Color4 } from '@dcl/sdk/math'
import { engine, pointerEventsSystem } from '@dcl/sdk/ecs'

import { changeColorSystem, circularSystem } from './systems'

import { initLibrary, queue } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'
import { createCube } from './factory'

// make sure to put this line outside the main function.
initLibrary(engine, syncEntity, players, {
  environment: 'dev',
  gameId: 'game-id-here'
})

export function main() {
  // Defining behavior. See `src/systems.ts` file.
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)

  const playGameCube = createCube(2, 1, 2, Color4.Green())
  const finishCube = createCube(2, 4, 2, Color4.Red())

  // Add player to the qeue.
  pointerEventsSystem.onPointerDown({ entity: playGameCube, opts: { hoverText: 'Start game' } }, () => {
    queue.addPlayer()
    console.log('Current queue', queue.getQueue())
  })

  // End Game.
  pointerEventsSystem.onPointerDown({ entity: finishCube, opts: { hoverText: 'Finish game' } }, () => {
    queue.setNextPlayer()
    console.log('Current queue', queue.getQueue())
  })

  queue.listeners.onActivePlayerChange = (player) => {
    console.log('active player changed', player)
    console.log('Current queue', queue.getQueue())
    // here you can set the logic to start the new game
    // such as reset the old state, move the player inside the area, set a coutner to start the game, etc.
    // game.startNewGame()
  }
}

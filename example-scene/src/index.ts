// We define the empty imports so the auto-complete feature works as expected.
import {} from '@dcl/sdk/math'
import { engine } from '@dcl/sdk/ecs'

import { changeColorSystem, circularSystem } from './systems'
import { setupUi } from './ui'

import { initLibrary } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'

// make sure to put this line outside the main function.
initLibrary(engine, syncEntity, players, {
  environment: 'dev',
  gameId: 'game-id-here'
})

export function main() {
  // Defining behavior. See `src/systems.ts` file.
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)

  // draw UI. Here is the logic to spawn cubes.
  setupUi()
}

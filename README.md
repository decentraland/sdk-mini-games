# SDK Utils Player Library

This library provides utilities for managing player queues and active players in a scene.

## Exported Functions

### initLibrary(_engine: IEngine, syncEntity: typeof syncEntity, playersApi: typeof players)`

Initializes the library with the necessary dependencies. Returns listeners that can be overridden with callbacks.

### setNextPlayer()

Sets the next player in the queue as active and removes the current active player.

### addPlayer()

Adds the current player to the queue if they're not already in it.

### isActive(): boolean

Checks if the current user is the active player.

### getQueue()

Returns an array of players in the queue, sorted by join time.

## Exported Types

### PlayerType

```typescript
type PlayerType = {
  address: string;
  joinedAt: number;
  startPlayingAt: number;
  active: boolean;
}
```

## Exported Listeners
### onActivePlayerChange: (player: PlayerType) => void

You can override this listener to perform custom actions when the active player changes.

## Example
```typescript
import { engine } from '@dcl/sdk/ecs'
import { syncEntity } from '@dcl/sdk/network'
import playersApi from '@dcl/sdk/players'
import { initLibrary, listeners, addPlayer, isActive, getQueue, setNextPlayer } from './sdk-utils-player'

// Initialize the library
initLibrary(engine, syncEntity, playersApi)

// Override the onActivePlayerChange listener
listeners.onActivePlayerChange = (player) => {
  console.log(`New active player: ${player.address}`)
}
const startCube = createCube(2, 1, 2)
const finishCube = createCube(2, 4, 2)

// Listen to changes on the queue
listeners.onActivePlayerChange = (player) => {
  console.log('active player changed', player)
}

// Add player to the queue
pointerEventsSystem.onPointerDown({ entity: startCube, opts: { hoverText: 'Start game' } }, () => {
  addPlayer()
})

// Finish game and set the next player
pointerEventsSystem.onPointerDown({ entity: finishCube, opts: { hoverText: 'Finish game'} }, () => {
  setNextPlayer()
})

// Check if current player is active
console.log(`Is current player active? ${isActive()}`);

// Get the current Queue
const queue = getQueue();
console.log('Current queue:', queue);
```
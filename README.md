# SDK Mini Games Library


## [Step 1: Install & Init Library](https://github.com/decentraland/sdk-mini-games/pull/19/files)

#### Install @dcl-sdk/mini-games Library in your scene
```ts
// Run the following command in the scene terminal
npm install @dcl-sdk/mini-games@next
```
#### Copy all the assets needed for the UI, Scoreboard and other models inside your scene.
```ts
// Run the following command in the scene terminal
node ./node_modules/@dcl-sdk/mini-games/scripts/postinstall.js
// This will create the `mini-games-assets` folder inside your scene with all the models that the library uses.
```

### Import Mini Games library in your scene
```ts
// game.ts file
import { initLibrary } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'

// make sure to put this line outside the main function.
initLibrary(engine, syncEntity, players, {
  environment: 'dev',
  gameId: 'game-id-here'
})

function main() {
  // code scene here
}
```

## [Step 2: Players queue](https://github.com/decentraland/sdk-mini-games/pull/20/files)

The library provides all the logic behind to handle the multiplayers queue.


### Queue Players Functions
```ts
import { queue } from '@dcl-sdk/mini-games/src'
```

#### queue.addPlayer(): void
Adds the current player to the queue if they're not already in it.

#### queue.setNextPlayer(): void
Removes current player from the queue (if its the active one), and set the next player in the queue as active.

#### queue.isActive(): boolean
Checks if the current user is the active player.

#### queue.getQueue(): Player[]
Returns an array of players in the queue, sorted by the ime they join the queue.

#### queue.initQueueDisplay(displayTransform: TransformType): void
Create a display on the scene that informs the player the current status of the queue.
After installing the library needs to place display glb model in `mini-game-assets/models/queueDisplay/workstation_display.glb`

### Listener for active player updates
#### listeners.onActivePlayerChange

### Player Type

```typescript
type PlayerType = {
  address: string;
  joinedAt: number;
  startPlayingAt: number;
  active: boolean;
}
```

## [Step 3: Scene Rotation + Game Area Checker + Timeout](https://github.com/decentraland/sdk-mini-games/pull/21/files)

### Scene Rotation
Set the orientation of the scene. You can set any number but ideally you want to set 0, 90, 180 or 270.
This would add a RootEntity and then you can parent all the entities to this root entity so they all point to the same orientation.


### Game Area Check
You can define your play game area. So if the active player decides to leave the area, it switches automatically to the next player.
Also if a player finds a way to enter the game area and is not the active player, it will be kicked out.

### Timeout check
Set a max amout of time that a player can play the game without being kicked.
If the player is alone in the game, it will continue playing till a new user arrives.


This can be done by passing extra params to the initLibrary
```ts
import { initLibrary, sceneParentEntity } from '@dcl-sdk/mini-games/src'
const _1_SEC = 1000
const _1_MIN = _1_SEC * 60

miniGames.initLibrary(engine as any, syncEntity, playersApi, {
    gameId: "4ee1d308-5e1e-4b2b-9e91-9091878a7e3d",
    environment: "dev",
    // time in ms
    gameTimeoutMs: _1_MIN,
    // game area rectangle
    gameArea: {
      // top left point
      topLeft: Vector3.create(5.15, 0, 2.23),
      // bottom right point
      bottomRight: Vector3.create(13.77, 0, 13.77),
      // point outside the game area to exit players
      exitSpawnPoint: Vector3.create(0,0,7)
    }
})
function main() {
  const gameArea = engine.addEntity()
  Transform.create(gameArea, { parent: sceneParentEntity, position, ...etc })
}
```

## [Step 4: UI](https://github.com/decentraland/sdk-mini-games/pull/22/files)

We already implement the generic UI to use inside the mini-games. Like the Play Game sign, Music On/Off, Levels, etc.

#### Menu Button UI

```ts
// MenuButton(position: TransformType, assetShape, assetIcon, hoverText, callback)
import { ui } from '@dcl-sdk/mini-games/src'

// All the available icons
const icons = ui.uiAssets.icons
// All the available Shapes & Colors
const shapes = ui.uiAssets.shapes


new ui.MenuButton(
  {
    parent: sceneParentEntity,
    position: Vector3.create(-3.74, 1.03, 0),
    rotation: Quaternion.fromEulerDegrees(-45, 90, 0),
    scale: Vector3.create(1.2, 1.2, 1.2)
  },
  ui.uiAssets.shapes.RECT_GREEN,
  ui.uiAssets.icons.playText,
  "PLAY GAME",
  () => {
    queue.addPlayer()
  }
)
```

## [Step 5: Progress API](https://github.com/decentraland/sdk-mini-games/pull/23/files)
We manage all the Progress API for you. We use the gameId set on the initLibrary, so be sure to update this value !

### Get last user progress of the game
```ts
type ProgressKey = 'level' | 'score' | 'moves' | 'time'
const userProgress = await progress.getProgress('level', progress.SortDirection.DESC, 1)
```

### Upsert the user progress based on the game.
```ts
import { progress } from '@dcl-sdk/mini-games/src'

await progress.upsertProgress({
  level: gameData.currentLevel,
  time: gameData.levelFinishedAt - gameData.levelStartedAt,
  moves: gameData.moves
})
```

## [Step 6: ScoreBoard](https://github.com/decentraland/sdk-mini-games/pull/24/files)
Initialize the scoreboard and that's it !
```ts
// Add scoreboard
  const width = 2.5
  const height = 2.8
  const scale = 1.2
  new ui.ScoreBoard(
    {
      // parent: sideSignB,
      position: Vector3.create(1.3, 4, 0.15),
      rotation: Quaternion.fromEulerDegrees(0, 180, 0)
    },
    width,
    height,
    scale,
    ui.TIME_LEVEL
  )

```
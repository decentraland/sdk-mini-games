import { EasingFunction, Entity, TextAlignMode, TransformType } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { getSDK } from '../../sdk'
import { queue } from '../..'

export enum SCREENS {
  addToQueue,
  playNext,
  queueList
}

let frameEntity: Entity
let positionActive: TransformType
let positionDisabled: TransformType
let displayEntity: Entity
let waitingListEntity: Entity
let myPosEntity: Entity
let active = false
let currentScreen: number
const screensAtlas = 'mini-game-assets/images/GameSigns.png'
const frameModel = 'mini-game-assets/models/queueDisplay/workstation_display.glb'
let enterScreenShown = false
let initialized = false

export function initQueueDisplay(displayTransform: TransformType) {
  if (initialized) return
  initialized = true
  const {
    engine,
    components: { Transform, GltfContainer, Material, MeshRenderer, VisibilityComponent }
  } = getSDK()

  currentScreen = SCREENS.addToQueue
  positionActive = displayTransform
  positionDisabled = {
    ...displayTransform,
    position: { ...displayTransform.position, y: displayTransform.position.y - 1 }
  }
  //FRAME
  frameEntity = engine.addEntity()
  Transform.createOrReplace(frameEntity, positionDisabled)
  GltfContainer.create(frameEntity, { src: frameModel })

  //screen
  displayEntity = engine.addEntity()
  Transform.create(displayEntity, { parent: frameEntity, scale: Vector3.create(0.85, 0.55, 1) })
  Material.setPbrMaterial(displayEntity, {
    texture: Material.Texture.Common({ src: screensAtlas }),
    emissiveTexture: Material.Texture.Common({ src: screensAtlas }),
    roughness: 1.0,
    specularIntensity: 0,
    emissiveIntensity: 0.5,
    emissiveColor: Color4.create(1, 1, 2, 1),
    metallic: 0
  })
  MeshRenderer.setPlane(displayEntity, getScreenUVs(currentScreen))

  //name list
  waitingListEntity = engine.addEntity()
  Transform.create(waitingListEntity, {
    parent: displayEntity,
    position: Vector3.create(0, 0.48, 0.01),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  VisibilityComponent.create(waitingListEntity, { visible: false })

  myPosEntity = engine.addEntity()
  Transform.create(myPosEntity, {
    parent: displayEntity,
    position: Vector3.create(-0.3, -0.2, 0.01),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  VisibilityComponent.create(myPosEntity, { visible: false })

  let queueDisplayTimer = 0
  engine.addSystem((dt: number) => {
    queueDisplayTimer += dt

    if (queueDisplayTimer < 0.25) return
    queueDisplayTimer = 0

    updateScreenSystem()
  })
}

function getScreenUVs(screen: number): number[] {
  const blockSize = 1 / 16
  const width = 7
  const height = 5
  const row = Math.floor(screen / 2) * height
  const col = (screen % 2) * width

  return [
    col * blockSize,
    1 - blockSize * (row + height),
    col * blockSize,
    1 - blockSize * row,
    (col + width) * blockSize,
    1 - blockSize * row,
    (col + width) * blockSize,
    1 - blockSize * (row + height),

    col * blockSize,
    1 - blockSize * (row + height),
    col * blockSize,
    1 - blockSize * row,
    (col + width) * blockSize,
    1 - blockSize * row,
    (col + width) * blockSize,
    1 - blockSize * (row + height)
  ]
}

function enable() {
  if (active) return
  const {
    components: { Transform, Tween }
  } = getSDK()

  active = true
  const { position } = Transform.get(frameEntity)

  Tween.createOrReplace(frameEntity, {
    mode: Tween.Mode.Move({
      start: position,
      end: positionActive.position
    }),
    duration: 1000,
    easingFunction: EasingFunction.EF_EASEOUTEXPO
  })
}

function disable() {
  if (!active) return
  const {
    components: { Transform, Tween, VisibilityComponent }
  } = getSDK()

  VisibilityComponent.getMutable(waitingListEntity).visible = false
  VisibilityComponent.getMutable(myPosEntity).visible = false

  active = false

  const { position } = Transform.get(frameEntity)
  Tween.createOrReplace(frameEntity, {
    mode: Tween.Mode.Move({
      start: position,
      end: positionDisabled.position
    }),
    duration: 1000,
    easingFunction: EasingFunction.EF_EASEOUTEXPO
  })
}

function setScreen(screenIndex: number) {
  const {
    components: { VisibilityComponent, MeshRenderer }
  } = getSDK()

  if (screenIndex === SCREENS.queueList) {
    VisibilityComponent.getMutable(waitingListEntity).visible = true
    VisibilityComponent.getMutable(myPosEntity).visible = true
  } else {
    VisibilityComponent.getMutable(waitingListEntity).visible = false
    VisibilityComponent.getMutable(myPosEntity).visible = false
  }

  currentScreen = screenIndex
  MeshRenderer.setPlane(displayEntity, getScreenUVs(screenIndex))
}

function updateScreenSystem() {
  const {
    players,
    components: { TextShape }
  } = getSDK()

  const playerQueue = queue.getQueue()
  const myPos = playerQueue.findIndex((item) => item.player.address === players.getPlayer()?.userId)

  if (myPos !== -1) {
    if (myPos !== 0) {
      if (currentScreen === SCREENS.queueList) {
        //in waiting list, finished enter queue screen
        enable()
        const playerNames = playerQueue
          .map((item) => players.getPlayer({ userId: item.player.address })?.name)
          .slice(1, 5)

        TextShape.createOrReplace(waitingListEntity, {
          text: playerNames.join('\n'),
          fontSize: 1.1,
          textAlign: TextAlignMode.TAM_TOP_CENTER,
          textColor: Color4.Black()
        })

        TextShape.createOrReplace(myPosEntity, {
          text: `${myPos}`,
          fontSize: 2,
          textAlign: TextAlignMode.TAM_TOP_CENTER
        })
      } else {
        //in waiting list, show enter queue screen
        setScreen(SCREENS.addToQueue)
        enable()
        delayedFunction(() => setScreen(SCREENS.queueList))
      }
    } else if (!enterScreenShown) {
      //active player, show about to enter screen
      enterScreenShown = true

      enable()

      setScreen(SCREENS.playNext)
      delayedFunction(() => disable())
    }
  } else {
    //player not in queue
    disable()
    enterScreenShown = false
    setScreen(SCREENS.addToQueue)
  }
}

function delayedFunction(cb: () => void) {
  console.log('enter screen delay')
  const { engine } = getSDK()

  let closeTimer = 4
  engine.addSystem(
    (dt: number) => {
      closeTimer -= dt
      if (closeTimer > 0) return

      cb && cb()

      engine.removeSystem('delayDisable')
    },
    undefined,
    'delayDisable'
  )
}

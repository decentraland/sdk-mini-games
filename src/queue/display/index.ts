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
// TODO: use for now for moving the player outside the game area.
// it should use the config.queueDisplay once we move this logic there
export let positionActive: TransformType
let positionDisabled: TransformType
let displayEntity: Entity
let waitingListEntity: Entity
let myPosEntity: Entity
let active = false
let currentScreen: number
const screensAtlas = 'mini-game-assets/images/GameSigns.png'
const frameModel = 'mini-game-assets/models/queueDisplay/workstation_display.glb'
let timer = 0
let timer2 = 0
let showEnterScreen = true
let initialized = false

export function initQueueDisplay(transform: TransformType) {
  if (initialized) return
  initialized = true
  const {
    engine,
    components: { Transform, GltfContainer, Material, MeshRenderer, VisibilityComponent },
    players
  } = getSDK()

  currentScreen = SCREENS.addToQueue
  positionActive = transform
  positionDisabled = {
    ...transform,
    position: { ...transform.position, y: transform.position.y - 1 }
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
  engine.addSystem(
    (dt: number) => {
      queueDisplayTimer += dt

      if (queueDisplayTimer < 0.25) return
      queueDisplayTimer = 0

      const playerInQueue = queue.getQueue().find((item) => item.player.address === players.getPlayer()?.userId)
      if (playerInQueue) {
        if (!queue.isActive()) {
          enable()
        } else if (showEnterScreen) {
          showEnterScreen = false
          setScreen(SCREENS.playNext)

          //wait 2 sec and disable
          let closeTimer = 2
          engine.addSystem(
            (dt: number) => {
              closeTimer -= dt
              if (closeTimer > 0) return
              closeTimer = 2
              disable()
              engine.removeSystem('delayDisable')
            },
            undefined,
            'delayDisable'
          )
        }
      } else {
        disable()
      }
    },
    undefined,
    'queueDisplaySystem'
  )
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
    engine,
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

  engine.addSystem(
    (dt: number) => {
      timer2 += dt

      if (timer2 < 2) return
      timer2 = 0
      setScreen(SCREENS.queueList)
      engine.removeSystem('delay2')
    },
    undefined,
    'delay2'
  )
}

function disable() {
  if (!active) return
  const {
    engine,
    components: { Transform, Tween }
  } = getSDK()

  active = false
  showEnterScreen = true
  const { position } = Transform.get(frameEntity)
  Tween.createOrReplace(frameEntity, {
    mode: Tween.Mode.Move({
      start: position,
      end: positionDisabled.position
    }),
    duration: 1000,
    easingFunction: EasingFunction.EF_EASEOUTEXPO
  })

  engine.removeSystem(updateListSystem)
}

function setScreen(screenIndex: number) {
  const {
    engine,
    components: { VisibilityComponent, MeshRenderer }
  } = getSDK()

  if (screenIndex === SCREENS.queueList) {
    engine.addSystem(updateListSystem)
  } else {
    engine.removeSystem(updateListSystem)
    VisibilityComponent.getMutable(waitingListEntity).visible = false
    VisibilityComponent.getMutable(myPosEntity).visible = false
  }

  currentScreen = screenIndex
  MeshRenderer.setPlane(displayEntity, getScreenUVs(screenIndex))
}

function updateListSystem(dt: number) {
  const {
    players,
    components: { VisibilityComponent, TextShape }
  } = getSDK()

  timer += dt
  if (timer < 1) {
    return
  }
  timer = 0

  const playerQueue = queue.getQueue()
  const playerNames = playerQueue.map((item) => players.getPlayer({ userId: item.player.address })?.name).slice(1)
  const myPos = playerQueue.findIndex((item) => item.player.address === players.getPlayer()?.userId)

  if (myPos === -1) disable()

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

  VisibilityComponent.getMutable(waitingListEntity).visible = true
  VisibilityComponent.getMutable(myPosEntity).visible = true
}

import { EasingFunction, Entity, TextAlignMode, TransformType } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import * as playersQueue from '../queue/index'
import { getSDK } from '../sdk'

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
const frameModel = 'mini-game-assets/models/workstation_display.glb'
let timer = 0
let timer2 = 0

export function init(transform: TransformType) {
  const { engine, Transform, GltfContainer, Material, MeshRenderer, VisibilityComponent } = getSDK()

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

export function enable() {
  if (active) return
  const { engine, Transform, Tween } = getSDK()

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

export function disable() {
  if (!active) return
  const { engine, Transform, Tween } = getSDK()

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

  engine.removeSystem(updateListSystem)
}

export function setScreen(screenIndex: number) {
  const { engine, VisibilityComponent, MeshRenderer } = getSDK()

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
  const { players, VisibilityComponent, TextShape } = getSDK()

  timer += dt
  if (timer < 1) {
    return
  }
  timer = 0

  const playerQueue = playersQueue.getQueue()
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

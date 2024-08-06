import {
  Entity,
  InputAction,
  MaterialTransparencyMode,
  PBMaterial_PbrMaterial,
  PointerEventType,
  TransformTypeWithOptionals
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { IconData, ButtonShapeData, uiAtlas, uiAssets } from './resources'
import * as utils from '@dcl-sdk/utils'
import { getSDK } from '../sdk'

export class MenuButton {
  staticFrame: Entity
  button: Entity
  icon: Entity
  glowPlane: Entity
  enabled: boolean
  buttonShapeEnabled: ButtonShapeData
  buttonShapeDisabled: ButtonShapeData
  iconGlowMat: PBMaterial_PbrMaterial
  iconDisabledMat: PBMaterial_PbrMaterial

  constructor(
    transform: TransformTypeWithOptionals,
    buttonShapeData: ButtonShapeData,
    icon: IconData,
    _hoverText: string,
    callback: () => void,
    enabledByDefault?: boolean
  ) {
    const {
      Material,
      MeshRenderer,
      engine,
      Transform,
      GltfContainer,
      PointerEvents,
      inputSystem,
      VisibilityComponent
    } = getSDK()

    this.enabled = true
    if (enabledByDefault) {
      this.enabled = enabledByDefault
    }

    this.buttonShapeEnabled = buttonShapeData
    this.buttonShapeDisabled = uiAssets.shapes.RECT_BLACK
    if (!buttonShapeData.isRect) {
      this.buttonShapeDisabled = uiAssets.shapes.SQUARE_BLACK
    }
    this.iconGlowMat = {
      texture: Material.Texture.Common({ src: uiAtlas }),
      albedoColor: Color4.White(),
      emissiveColor: Color4.White(),
      emissiveIntensity: 2,
      alphaTexture: Material.Texture.Common({ src: uiAtlas }),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
    }

    this.iconDisabledMat = {
      texture: Material.Texture.Common({ src: uiAtlas }),
      albedoColor: Color4.Gray(),
      //emissiveColor: Color4.Gray(),
      alphaTexture: Material.Texture.Common({ src: uiAtlas }),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
    }

    //FRAME
    this.staticFrame = engine.addEntity()
    Transform.createOrReplace(this.staticFrame, transform)
    GltfContainer.create(this.staticFrame, { src: buttonShapeData.base })

    //BUTTON
    this.button = engine.addEntity()
    Transform.createOrReplace(this.button, {
      parent: this.staticFrame
    })
    GltfContainer.create(this.button, { src: buttonShapeData.shape })

    PointerEvents.create(this.button, {
      pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            showFeedback: true,
            hoverText: _hoverText,
            maxDistance: 18
          }
        }
      ]
    })

    engine.addSystem(() => {
      if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, this.button)) {
        if (this.enabled) {
          callback()
          this.playSound('mini-game-models/sounds/button_click.mp3')
          //flash the emissive of the icon
          Material.setPbrMaterial(this.icon, {
            texture: Material.Texture.Common({ src: uiAtlas }),
            albedoColor: Color4.White(),
            emissiveColor: Color4.White(),
            emissiveIntensity: 4,
            alphaTexture: Material.Texture.Common({ src: uiAtlas }),
            transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
          })

          utils.tweens.stopTranslation(this.button)
          VisibilityComponent.getMutable(this.glowPlane).visible = true
          //tween button inward
          utils.tweens.startTranslation(
            this.button,
            Vector3.create(0, 0, 0),
            Vector3.create(0, -0.03, 0),
            0.05,
            utils.InterpolationType.EASEOUTSINE,
            () => {
              //when finished tween button outward

              utils.tweens.startTranslation(
                this.button,
                Vector3.create(0, -0.03, 0),
                Vector3.create(0, 0, 0),
                0.3,
                utils.InterpolationType.EASEOUTSINE,
                () => {
                  VisibilityComponent.getMutable(this.glowPlane).visible = false
                  //reset the emissive of the icon
                  if (this.enabled) {
                    Material.setPbrMaterial(this.icon, this.iconGlowMat)
                  } else {
                    Material.setPbrMaterial(this.icon, this.iconDisabledMat)
                  }
                }
              )
            }
          )
        } else {
          this.playSound('mini-game-models/sounds/wrong.mp3')
        }
      }
    })

    //ICON
    this.icon = engine.addEntity()
    Transform.createOrReplace(this.icon, {
      rotation: Quaternion.fromEulerDegrees(90, 0, 0),
      position: Vector3.create(0, 0.076, 0),
      scale:
        icon.blockWidth !== 1 ? Vector3.create(0.35, 0.35 / icon.blockWidth, 0.12) : Vector3.create(0.15, 0.15, 0.15),
      parent: this.button
    })
    MeshRenderer.setPlane(this.icon, icon.uvs)
    Material.setPbrMaterial(this.icon, {
      texture: Material.Texture.Common({ src: uiAtlas }),
      albedoColor: Color4.White(),
      emissiveColor: Color4.White(),
      alphaTexture: Material.Texture.Common({ src: uiAtlas }),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
    })

    //GLOW BACKGROUND
    this.glowPlane = engine.addEntity()
    Transform.createOrReplace(this.glowPlane, {
      rotation: Quaternion.fromEulerDegrees(90, 0, 0),
      position: Vector3.create(0, 0.03, 0),
      scale: buttonShapeData.isRect ? Vector3.create(0.45, 0.2, 0.22) : Vector3.create(0.24, 0.24, 0.24),
      parent: this.staticFrame
    })
    MeshRenderer.setPlane(this.glowPlane, icon.uvs)
    Material.setPbrMaterial(this.glowPlane, {
      albedoColor: Color4.White(),
      emissiveColor: Color4.White(),
      emissiveIntensity: 4
    })
    VisibilityComponent.create(this.glowPlane, { visible: false })
  }

  changeIcon(iconData: IconData) {
    const { MeshRenderer, Material, Transform } = getSDK()
    MeshRenderer.setPlane(this.icon, iconData.uvs)
    Material.setPbrMaterial(this.icon, {
      texture: Material.Texture.Common({ src: uiAtlas }),
      albedoColor: Color4.White(),
      emissiveColor: Color4.White(),
      alphaTexture: Material.Texture.Common({ src: uiAtlas }),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
    })
    Transform.createOrReplace(this.icon, {
      rotation: Quaternion.fromEulerDegrees(90, 0, 0),
      position: Vector3.create(0, 0.076, 0),
      scale:
        iconData.blockWidth !== 1
          ? Vector3.create(0.35, 0.35 / iconData.blockWidth, 0.12)
          : Vector3.create(0.15, 0.15, 0.15),
      parent: this.button
    })
  }

  playSound(sound: string) {
    const { AudioSource } = getSDK()
    AudioSource.createOrReplace(this.button, {
      audioClipUrl: sound,
      loop: false,
      playing: true,
      volume: 2
    })
  }

  enable() {
    const { GltfContainer, Material } = getSDK()
    this.enabled = true
    GltfContainer.createOrReplace(this.button, { src: this.buttonShapeEnabled.shape })
    Material.setPbrMaterial(this.icon, this.iconGlowMat)
  }

  disable() {
    const { GltfContainer, Material } = getSDK()

    this.enabled = false
    GltfContainer.createOrReplace(this.button, { src: this.buttonShapeDisabled.shape })
    Material.setPbrMaterial(this.icon, this.iconDisabledMat)
  }
}

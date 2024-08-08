import { Entity, MaterialTransparencyMode, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { IconData, ButtonShapeData, uiAtlas } from './resources'
import { getSDK } from '../sdk'

export class BoxIcon {
  box: Entity
  icon: Entity
  enabled: boolean

  constructor(
    transform: TransformTypeWithOptionals,
    buttonShapeData: ButtonShapeData,
    icon: IconData,
    enabledByDefault?: boolean
  ) {
    this.enabled = true
    if (enabledByDefault) {
      this.enabled = enabledByDefault
    }

    const {
      engine,
      components: { Transform, GltfContainer, MeshRenderer, Material, VisibilityComponent }
    } = getSDK()
    //BUTTON
    this.box = engine.addEntity()
    Transform.createOrReplace(this.box, transform)
    GltfContainer.create(this.box, { src: buttonShapeData.shape })
    //ICON
    this.icon = engine.addEntity()
    Transform.createOrReplace(this.icon, {
      rotation: Quaternion.fromEulerDegrees(90, 0, 0),
      position: Vector3.create(0, 0.076, 0),
      scale:
        icon.blockWidth !== 1 ? Vector3.create(0.35, 0.35 / icon.blockWidth, 0.12) : Vector3.create(0.15, 0.15, 0.15),
      parent: this.box
    })
    MeshRenderer.setPlane(this.icon, icon.uvs)
    Material.setPbrMaterial(this.icon, {
      texture: Material.Texture.Common({ src: uiAtlas }),
      albedoColor: Color4.White(),
      emissiveColor: Color4.White(),
      alphaTexture: Material.Texture.Common({ src: uiAtlas }),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
    })

    VisibilityComponent.createOrReplace(this.box, { visible: true })
    VisibilityComponent.createOrReplace(this.icon, { visible: true })
  }

  changeIcon(iconData: IconData) {
    const {
      components: { Transform, MeshRenderer, Material }
    } = getSDK()
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
      parent: this.box
    })
  }
  changeShape(shapeData: ButtonShapeData) {
    const {
      components: { GltfContainer }
    } = getSDK()
    GltfContainer.createOrReplace(this.box, { src: shapeData.shape })
  }

  playSound(sound: string) {
    const {
      components: { AudioSource }
    } = getSDK()
    AudioSource.createOrReplace(this.box, {
      audioClipUrl: sound,
      loop: false,
      playing: true,
      volume: 2
    })
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }

  show() {
    const {
      components: { VisibilityComponent }
    } = getSDK()
    VisibilityComponent.getMutable(this.box).visible = true
    VisibilityComponent.getMutable(this.icon).visible = true
  }

  hide() {
    const {
      components: { VisibilityComponent }
    } = getSDK()

    VisibilityComponent.getMutable(this.box).visible = false
    VisibilityComponent.getMutable(this.icon).visible = false
  }
}

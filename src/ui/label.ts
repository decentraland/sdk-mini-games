import { Entity, MaterialTransparencyMode, PBMaterial_PbrMaterial, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { IconData, uiAtlas } from './resources'
import { getSDK } from '../sdk'

export class MenuLabel {
  root: Entity
  icon: Entity
  iconGlowMat: PBMaterial_PbrMaterial

  constructor(transform: TransformTypeWithOptionals, icon: IconData) {
    const {
      engine,
      components: { Transform, MeshRenderer, Material, VisibilityComponent }
    } = getSDK()
    this.root = engine.addEntity()
    Transform.create(this.root, transform)

    this.iconGlowMat = {
      texture: Material.Texture.Common({ src: uiAtlas }),
      albedoColor: Color4.White(),
      emissiveColor: Color4.White(),
      emissiveIntensity: 2,
      alphaTexture: Material.Texture.Common({ src: uiAtlas }),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
    }

    //ICON
    this.icon = engine.addEntity()
    Transform.createOrReplace(this.icon, {
      rotation: Quaternion.fromEulerDegrees(90, 0, 0),
      position: Vector3.create(0, 0, 0),
      scale:
        icon.blockWidth !== 1 ? Vector3.create(0.35, 0.35 / icon.blockWidth, 0.12) : Vector3.create(0.15, 0.15, 0.15),
      parent: this.root
    })
    MeshRenderer.setPlane(this.icon, icon.uvs)
    Material.setPbrMaterial(this.icon, {
      texture: Material.Texture.Common({ src: uiAtlas }),
      albedoColor: Color4.White(),
      emissiveColor: Color4.White(),
      alphaTexture: Material.Texture.Common({ src: uiAtlas }),
      transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST
    })

    VisibilityComponent.create(this.icon, { visible: true })
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
      parent: this.root
    })
  }

  show() {
    const {
      components: { VisibilityComponent }
    } = getSDK()
    VisibilityComponent.getMutable(this.icon).visible = true
  }

  hide() {
    const {
      components: { VisibilityComponent }
    } = getSDK()
    VisibilityComponent.getMutable(this.icon).visible = false
  }
}

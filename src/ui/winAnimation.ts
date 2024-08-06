import { Entity } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { getSDK } from '../sdk'

export class WinAnimationHandler {
  winAnimRoot: Entity
  winAnimA: Entity
  winAnimB: Entity
  winAnimC: Entity
  winAnimFollow: Entity
  winAnimText: Entity

  constructor(pos: Vector3) {
    const { engine, Transform, Billboard, VisibilityComponent, GltfContainer } = getSDK()
    this.winAnimRoot = engine.addEntity()
    Transform.create(this.winAnimRoot, {
      position: pos,
      scale: Vector3.create(1, 1, 1)
    })
    this.winAnimA = engine.addEntity()
    Transform.create(this.winAnimA, {
      position: Vector3.create(4, -pos.y + 0.8, 2),
      scale: Vector3.create(1, 1, 1),
      rotation: Quaternion.fromEulerDegrees(0, 45, 0),
      parent: this.winAnimRoot
    })
    VisibilityComponent.create(this.winAnimA, { visible: false })

    this.winAnimB = engine.addEntity()

    GltfContainer.create(this.winAnimB, {
      src: 'mini-game-models/assets/scene/winAnim.glb'
    })
    VisibilityComponent.create(this.winAnimB, { visible: false })

    Transform.create(this.winAnimB, {
      position: Vector3.create(4, -pos.y + 0.8, 8),
      scale: Vector3.create(1, 1, 1),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      parent: this.winAnimRoot
    })

    this.winAnimC = engine.addEntity()

    GltfContainer.create(this.winAnimC, {
      src: 'mini-game-models/assets/scene/winAnim.glb'
    })

    Transform.create(this.winAnimC, {
      position: Vector3.create(4, -pos.y + 0.8, 14),
      scale: Vector3.create(1, 1, 1),
      rotation: Quaternion.fromEulerDegrees(0, -45, 0),
      parent: this.winAnimRoot
    })
    VisibilityComponent.create(this.winAnimC, { visible: false })

    this.winAnimFollow = engine.addEntity()

    GltfContainer.create(this.winAnimFollow, {
      src: 'mini-game-models/assets/scene/winAnimFollow.glb'
    })

    Transform.create(this.winAnimFollow, {
      position: Vector3.create(0, 0, 8),
      scale: Vector3.create(0.2, 0.2, 0.2),
      rotation: Quaternion.fromEulerDegrees(0, -90, 0),
      parent: this.winAnimRoot
    })
    Billboard.create(this.winAnimFollow, {})
    VisibilityComponent.create(this.winAnimFollow, { visible: false })

    this.winAnimText = engine.addEntity()

    GltfContainer.create(this.winAnimText, {
      src: 'mini-game-models/assets/scene/winAnimText.glb'
    })

    Transform.create(this.winAnimText, {
      position: Vector3.create(0, 0, 8),
      scale: Vector3.create(0.5, 0.5, 0.5),
      rotation: Quaternion.fromEulerDegrees(0, -90, 0),
      parent: this.winAnimRoot
    })
    Billboard.create(this.winAnimText, {})
    VisibilityComponent.create(this.winAnimText, { visible: false })
  }

  playWinAnimation() {
    const { VisibilityComponent } = getSDK()
    VisibilityComponent.getMutable(this.winAnimA).visible = true
    VisibilityComponent.getMutable(this.winAnimB).visible = true
    VisibilityComponent.getMutable(this.winAnimC).visible = true
    VisibilityComponent.getMutable(this.winAnimFollow).visible = true
    VisibilityComponent.getMutable(this.winAnimText).visible = true
  }

  hide() {
    const { VisibilityComponent } = getSDK()
    VisibilityComponent.getMutable(this.winAnimA).visible = false
    VisibilityComponent.getMutable(this.winAnimB).visible = false
    VisibilityComponent.getMutable(this.winAnimC).visible = false
    VisibilityComponent.getMutable(this.winAnimFollow).visible = false
    VisibilityComponent.getMutable(this.winAnimText).visible = false
  }
}

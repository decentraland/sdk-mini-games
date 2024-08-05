import { GltfContainer as _GltfContainer, Transform as _Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

import { getSDK } from '../sdk'

export function initEnvironment() {
  const { engine } = getSDK()
  const Transform = engine.getComponent(_Transform.componentId) as typeof _Transform
  const GltfContainer = engine.getComponent(_GltfContainer.componentId) as typeof _GltfContainer
  const environment = engine.addEntity()
  Transform.create(environment, {
    position: Vector3.create(8, 0, 8),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  GltfContainer.create(environment, { src: 'mini-games-models/environment.glb' })
}

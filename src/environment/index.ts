import { Quaternion, Vector3 } from '@dcl/sdk/math'

import { getSDK } from '../sdk'

export function addEnvironment(environmentGlb: string) {
  const {
    engine,
    components: { Transform, GltfContainer }
  } = getSDK()
  const environment = engine.addEntity()
  Transform.create(environment, {
    position: Vector3.create(8, 0, 8),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })
  GltfContainer.create(environment, { src: environmentGlb ?? 'mini-games-assets/models/environment.glb' })
}

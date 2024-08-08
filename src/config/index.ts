import { Entity } from '@dcl/sdk/ecs'
import { getSDK } from '../sdk'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

export enum ENV {
  DEV = 'dev',
  PRD = 'prd'
}

const GAME_SERVER_CONFIG: Record<string, string> = {
  dev: 'https://exploration-games.decentraland.zone', //for local testing if you need different value
  prd: 'https://exploration-games.decentraland.org' //PROD/live use this for launch
}

export let GAME_SERVER: string
export let sceneParentEntity: Entity

export function init() {
  const {
    config,
    engine,
    components: { Transform }
  } = getSDK()

  let _env = config.environment

  if (_env !== ENV.PRD) _env = ENV.DEV

  GAME_SERVER = GAME_SERVER_CONFIG[_env]

  sceneParentEntity = engine.addEntity()
  Transform.create(sceneParentEntity, {
    position: Vector3.create(8, 0, 8),
    rotation: Quaternion.fromEulerDegrees(0, config.sceneRotation ?? 0, 0),
    scale: Vector3.One()
  })
}

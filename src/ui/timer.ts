import { Entity, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { Counter3D } from './counter'
import { Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { getSDK } from '../sdk'

export class Timer3D {
  root: Entity
  seconds: Counter3D
  minutes?: Counter3D

  constructor(
    transform: TransformTypeWithOptionals,
    sections: number,
    spacing: number,
    paddingWithZeroes: boolean,
    id: number
  ) {
    const {
      engine,
      components: { Transform }
    } = getSDK()
    this.root = engine.addEntity()
    Transform.create(this.root, transform)

    this.seconds = new Counter3D(
      {
        position: Vector3.create(0, 0, 0),
        parent: this.root
      },
      2,
      spacing,
      paddingWithZeroes,
      id * 100
    )
    this.seconds.setNumber(0)

    if (sections > 1) {
      this.minutes = new Counter3D(
        {
          position: Vector3.create(2 * spacing + 0.5, 0, 0),
          parent: this.root
        },
        2,
        spacing,
        paddingWithZeroes,
        id * 100 + 1
      )
      this.minutes.setNumber(0)
    }
  }

  setTimeSeconds(_seconds: number) {
    const minutes = Math.floor(_seconds / 60)
    const remainingSeconds = _seconds % 60
    const seconds = Math.floor(remainingSeconds)

    if (this.minutes) this.minutes.setNumber(minutes)
    this.seconds.setNumber(seconds)
  }

  setTimeAnimated(_seconds: number, interpolation: utils.InterpolationType) {
    const {
      components: { Transform }
    } = getSDK()
    const minutes = Math.floor(_seconds / 60)
    const remainingSeconds = _seconds % 60
    const seconds = Math.floor(remainingSeconds)

    let secondsChanged = false

    if (this.minutes) this.minutes.setNumber(minutes)

    if (this.seconds.currentNumber !== seconds) {
      secondsChanged = true
    }
    this.seconds.setNumber(seconds)

    if (secondsChanged) {
      utils.tweens.startScaling(this.root, Vector3.Zero(), Transform.get(this.root).scale, 0.4, interpolation)
    }
  }
  hide() {
    this.seconds.hide()
    if (this.minutes) {
      this.minutes.hide()
    }
  }
  show() {
    this.seconds.show()
    if (this.minutes) {
      this.minutes.show()
    }
  }
}

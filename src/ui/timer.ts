import { EasingFunction, Entity, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { Counter3D } from './counter'
import { Vector3 } from '@dcl/sdk/math'

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
      tweenSystem,
      components: { Transform, Tween }
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

    engine.addSystem(() => {
      if (tweenSystem.tweenCompleted(this.root)) {
        Tween.deleteFrom(this.root)
      }
    })
  }

  setTimeSeconds(_seconds: number) {
    const minutes = Math.floor(_seconds / 60)
    const remainingSeconds = _seconds % 60
    const seconds = Math.floor(remainingSeconds)

    if (this.minutes) this.minutes.setNumber(minutes)
    this.seconds.setNumber(seconds)
  }

  setTimeAnimated(_seconds: number, interpolation: EasingFunction) {
    const {
      components: { Transform, Tween }
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
      Tween.createOrReplace(this.root, {
        duration: 400,
        currentTime: 0,
        easingFunction: interpolation,
        mode: Tween.Mode.Scale({ start: Vector3.Zero(), end: Transform.get(this.root).scale })
      })
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

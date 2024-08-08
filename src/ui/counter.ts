import { Entity, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { syncEntity } from '@dcl/sdk/network'
import { getSDK } from '../sdk'

function separateDigits(value: number): number[] {
  const arr: number[] = []
  let lastDigit: number
  let num = toInt32(value)

  do {
    lastDigit = num % 10
    arr.push(lastDigit)
    // Updating num to num/10 cuts off the last digit:
    num = toInt32(num / 10)
  } while (num !== 0)

  return arr
}

function toInt32(f: number): number {
  return f >> 0
}

export class Counter3D {
  id: number
  root: Entity
  digits: Entity[]
  maxDigits: number = 3
  spacing: number = 1
  currentNumber: number = 0
  zeroPadding: boolean

  constructor(
    transform: TransformTypeWithOptionals,
    maxDigits: number,
    digitSpacing: number,
    zeroPadding: boolean,
    id: number
  ) {
    const {
      engine,
      components: { Transform }
    } = getSDK()
    this.root = engine.addEntity()
    Transform.create(this.root, transform)
    this.spacing = digitSpacing
    this.digits = []
    this.maxDigits = maxDigits
    this.zeroPadding = zeroPadding
    this.id = id

    this.addDigits()
  }
  addDigits() {
    const {
      engine,
      components: { Transform, GltfContainer, VisibilityComponent }
    } = getSDK()
    for (let i = 0; i < this.maxDigits; i++) {
      const numberEntity = engine.addEntity()
      Transform.createOrReplace(numberEntity, {
        parent: this.root,
        position: Vector3.create(i * this.spacing, 0, 0)
      })
      VisibilityComponent.createOrReplace(numberEntity)
      this.digits.push(numberEntity)

      syncEntity(numberEntity, [GltfContainer.componentId], this.id * 20000 + i)
    }
  }

  setNumber(_number: number) {
    const {
      components: { GltfContainer }
    } = getSDK()

    this.currentNumber = _number

    let numberArr = separateDigits(_number)

    if (numberArr.length > this.digits.length) {
      numberArr = numberArr.slice(numberArr.length - this.digits.length)
    }

    for (let i = 0; i < this.digits.length; i++) {
      if (i < numberArr.length) {
        GltfContainer.createOrReplace(this.digits[i], { src: this.getDigitMesh(numberArr[i]) })
      } else {
        if (this.zeroPadding) {
          GltfContainer.createOrReplace(this.digits[i], { src: this.getDigitMesh(0) })
        } else {
          GltfContainer.deleteFrom(this.digits[i])
        }
      }
    }
  }

  reduceNumberBy(_decrement: number) {
    if (this.currentNumber - _decrement < 0) {
      this.setNumber(0)
    } else {
      this.setNumber(this.currentNumber - _decrement)
    }
  }
  increaseNumberBy(_increment: number) {
    if (this.currentNumber + _increment < 0) {
      this.setNumber(0)
    } else {
      this.setNumber(this.currentNumber + _increment)
    }
  }

  getDigitMesh(digit: number): string {
    switch (digit) {
      case 0: {
        return 'mini-game-assets/models/ui/numbers/number_0.glb'
      }
      case 1: {
        return 'mini-game-assets/models/ui/numbers/number_1.glb'
      }
      case 2: {
        return 'mini-game-assets/models/ui/numbers/number_2.glb'
      }
      case 3: {
        return 'mini-game-assets/models/ui/numbers/number_3.glb'
      }
      case 4: {
        return 'mini-game-assets/models/ui/numbers/number_4.glb'
      }
      case 5: {
        return 'mini-game-assets/models/ui/numbers/number_5.glb'
      }
      case 6: {
        return 'mini-game-assets/models/ui/numbers/number_6.glb'
      }
      case 7: {
        return 'mini-game-assets/models/ui/numbers/number_7.glb'
      }
      case 8: {
        return 'mini-game-assets/models/ui/numbers/number_8.glb'
      }
      case 9: {
        return 'mini-game-assets/models/ui/numbers/number_9.glb'
      }
    }

    return 'mini-game-assets/models/ui/numbers/number_0.glb'
  }

  show() {
    const {
      components: { VisibilityComponent }
    } = getSDK()
    for (const digit of this.digits) {
      VisibilityComponent.getMutable(digit).visible = true
    }
  }
  hide() {
    const {
      components: { VisibilityComponent }
    } = getSDK()
    for (const digit of this.digits) {
      VisibilityComponent.getMutable(digit).visible = false
    }
  }
}

import { Entity, Font, TextAlignMode } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { getSDK } from '../../sdk'

export type ColumnData = {
  placementStart: number
  nameStart: number
  nameHeader: string
  scoreHeader?: string
  timeHeader?: string
  movesHeader?: string
  levelHeader?: string
  scoreStart?: number
  timeStart?: number
  movesStart?: number
  levelStart?: number
}

export const TIME_LEVEL_MOVES: ColumnData = {
  placementStart: 0.075,
  nameStart: 0.09,
  timeStart: 0.6,
  levelStart: 0.78,
  movesStart: 0.96,
  nameHeader: 'PLAYER',
  timeHeader: 'TIME',
  movesHeader: 'MOVES',
  levelHeader: 'LEVEL'
}
export const TIME_LEVEL: ColumnData = {
  placementStart: 0.06,
  nameStart: 0.08,
  timeStart: 0.7,
  levelStart: 0.96,
  nameHeader: 'PLAYER',
  timeHeader: 'TIME',
  levelHeader: 'LEVEL'
}

export const POINTS_TIME: ColumnData = {
  placementStart: 0.06,
  nameStart: 0.08,
  scoreStart: 0.65,
  timeStart: 0.96,
  nameHeader: 'PLAYER',
  scoreHeader: 'POINTS',
  timeHeader: 'TIME'
}

export function addHeaderText(entity: Entity, text: string, fontSize: number, align: TextAlignMode) {
  const {
    components: { TextShape }
  } = getSDK()

  TextShape.createOrReplace(entity, {
    text: text,
    fontSize: fontSize,
    textAlign: align,
    textColor: Color4.fromHexString('#ff2d55ff'),
    outlineColor: Color4.fromHexString('#ff2d55ff'),
    outlineWidth: 0.3,
    font: Font.F_SANS_SERIF
  })
}

export class HeaderRow {
  nameHeader: Entity
  scoreHeader?: Entity
  timeHeader?: Entity
  movesHeader?: Entity
  levelHeader?: Entity

  constructor(columnData: ColumnData, width: number, height: number, parent: Entity, fontSize: number) {
    const {
      engine,
      components: { Transform }
    } = getSDK()

    this.nameHeader = engine.addEntity()
    Transform.create(this.nameHeader, {
      position: Vector3.create(columnData.nameStart * width, height, 0),
      parent: parent
    })
    addHeaderText(this.nameHeader, columnData.nameHeader, fontSize, TextAlignMode.TAM_MIDDLE_LEFT)

    //score
    if (columnData.scoreHeader && columnData.scoreStart) {
      this.scoreHeader = engine.addEntity()
      Transform.create(this.scoreHeader, {
        position: Vector3.create(columnData.scoreStart * width, height, 0),
        parent: parent
      })
      addHeaderText(this.scoreHeader, columnData.scoreHeader, fontSize, TextAlignMode.TAM_MIDDLE_RIGHT)
    }

    //time
    if (columnData.timeStart && columnData.timeHeader) {
      this.timeHeader = engine.addEntity()
      Transform.create(this.timeHeader, {
        position: Vector3.create(columnData.timeStart * width, height, 0),
        parent: parent
      })
      addHeaderText(this.timeHeader, columnData.timeHeader, fontSize, TextAlignMode.TAM_MIDDLE_RIGHT)
    }

    //moves
    if (columnData.movesStart && columnData.movesHeader) {
      this.movesHeader = engine.addEntity()
      Transform.create(this.movesHeader, {
        position: Vector3.create(columnData.movesStart * width, height, 0),
        parent: parent
      })
      addHeaderText(this.movesHeader, columnData.movesHeader, fontSize, TextAlignMode.TAM_MIDDLE_RIGHT)
    }

    //level
    if (columnData.levelStart && columnData.levelHeader) {
      this.levelHeader = engine.addEntity()
      Transform.create(this.levelHeader, {
        position: Vector3.create(columnData.levelStart * width, height, 0),
        parent: parent
      })
      addHeaderText(this.levelHeader, columnData.levelHeader, fontSize, TextAlignMode.TAM_MIDDLE_RIGHT)
    }
  }

  removeHeaders() {
    const { engine } = getSDK()
    if (this.levelHeader) {
      engine.removeEntity(this.levelHeader)
    }
    if (this.scoreHeader) {
      engine.removeEntity(this.scoreHeader)
    }
    if (this.nameHeader) {
      engine.removeEntity(this.nameHeader)
    }
    if (this.timeHeader) {
      engine.removeEntity(this.timeHeader)
    }
    if (this.movesHeader) {
      engine.removeEntity(this.movesHeader)
    }
  }
}

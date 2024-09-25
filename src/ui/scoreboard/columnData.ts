import { Entity, Font, TextAlignMode } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { getSDK } from '../../sdk'

export const NAME_START = 0.065
export const PLACEMENT_START = 0.05

export enum SCOREBOARD_VALUE_TYPE {
  LEVEL,
  TIME,
  SCORE,
  MOVES
}

export type Column = {
  headerText: string
  type: SCOREBOARD_VALUE_TYPE
  valueFieldWidth: number
}

export const SCORE: Column = {
  headerText: 'POINTS',
  type: SCOREBOARD_VALUE_TYPE.SCORE,
  valueFieldWidth: 0.2
}

export const TIME: Column = {
  headerText: 'TIME',
  type: SCOREBOARD_VALUE_TYPE.TIME,
  valueFieldWidth: 0.2
}

export const LEVEL: Column = {
  headerText: 'LEVEL',
  type: SCOREBOARD_VALUE_TYPE.LEVEL,
  valueFieldWidth: 0.18
}

export const MOVES: Column = {
  headerText: 'MOVES',
  type: SCOREBOARD_VALUE_TYPE.MOVES,
  valueFieldWidth: 0.18
}

export const TIME_LEVEL_MOVES: Column[] = [TIME, LEVEL, MOVES]
export const TIME_LEVEL: Column[] = [TIME, LEVEL]
export const POINTS_TIME: Column[] = [SCORE, TIME]

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
  currentColumnStart: number = 0.98
  headers: Entity[] = []

  constructor(columnData: Column[], width: number, height: number, parent: Entity, fontSize: number) {
    const {
      engine,
      components: { Transform }
    } = getSDK()

    this.nameHeader = engine.addEntity()
    Transform.create(this.nameHeader, {
      position: Vector3.create(NAME_START * width, height, 0),
      parent: parent
    })
    addHeaderText(this.nameHeader, 'PLAYER', fontSize, TextAlignMode.TAM_MIDDLE_LEFT)
    // add all columns listed in columndata
    for (let i = columnData.length - 1; i >= 0; i--) {
      const currentHeader = engine.addEntity()
      Transform.create(currentHeader, {
        position: Vector3.create(this.currentColumnStart * width, height, 0),
        parent: parent
      })
      addHeaderText(currentHeader, columnData[i].headerText ?? '-', fontSize, TextAlignMode.TAM_MIDDLE_RIGHT)

      this.currentColumnStart -= columnData[i].valueFieldWidth
    }
  }

  removeHeaders() {
    const { engine } = getSDK()

    for (let i = 0; i < this.headers.length; i++) {
      engine.removeEntity(this.headers[i])
    }
  }
}

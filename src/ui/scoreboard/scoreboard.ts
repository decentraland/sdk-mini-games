import { Entity, Font, TextAlignMode, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'

import { MenuButton } from '../button'
import { uiAssets } from '../resources'
import { timeStringFromMs } from '../utilities'
import { ColumnData, HeaderRow } from './columnData'
import { getSDK } from '../../sdk'

class ScoreRow {
  place: number
  name: string
  score: number
  time: number
  moves: number
  level: number

  placeEntity: Entity
  nameEntity: Entity
  scoreEntity?: Entity
  timeEntity?: Entity
  movesEntity?: Entity
  levelEntity?: Entity

  constructor(
    place: number,
    scoreData: any,
    columnData: ColumnData,
    width: number,
    height: number,
    parent: Entity,
    fontSize: number
  ) {
    this.place = place
    this.name = scoreData.user_name

    this.score = scoreData.score ? scoreData.score : -1
    this.time = scoreData.time ? scoreData.time : 0
    this.moves = scoreData.moves ? scoreData.moves : -1
    this.level = scoreData.level ? scoreData.level : -1
    const {
      engine,
      components: { Transform, TextShape }
    } = getSDK()
    //placement number
    this.placeEntity = engine.addEntity()
    Transform.create(this.placeEntity, {
      position: Vector3.create(columnData.placementStart * width, height, 0),
      parent: parent
    })
    TextShape.createOrReplace(this.placeEntity, {
      text: place.toString(),
      fontSize: fontSize,
      textAlign: TextAlignMode.TAM_MIDDLE_RIGHT,
      textColor: Color4.fromHexString('#ff2d55ff'),
      outlineColor: Color4.fromHexString('#ff2d55ff'),
      outlineWidth: 0.3,
      font: Font.F_SANS_SERIF
    })

    //player name
    this.nameEntity = engine.addEntity()
    Transform.create(this.nameEntity, {
      position: Vector3.create(columnData.nameStart * width, height, 0),
      parent: parent
    })
    TextShape.createOrReplace(this.nameEntity, {
      text:
        (scoreData.user_name as string).length > 15
          ? (scoreData.user_name as string).substring(0, 15) + '...'
          : scoreData.user_name,
      fontSize: fontSize,
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
      font: Font.F_SANS_SERIF,
      textColor: Color4.Black(),
      outlineColor: Color4.Black(),
      outlineWidth: 0.2
    })

    //score
    if (columnData.scoreStart && scoreData.score) {
      this.scoreEntity = engine.addEntity()
      Transform.create(this.scoreEntity, {
        position: Vector3.create(columnData.scoreStart * width, height, 0),
        parent: parent
      })
      TextShape.createOrReplace(this.scoreEntity, {
        text: scoreData.score.toString(),
        fontSize: fontSize,
        textAlign: TextAlignMode.TAM_MIDDLE_RIGHT,
        textColor: Color4.fromHexString('#ff2d55ff'),
        outlineColor: Color4.fromHexString('#ff2d55ff'),
        outlineWidth: 0.2,
        font: Font.F_SANS_SERIF
      })
    }

    //time
    if (columnData.timeStart && scoreData.time) {
      this.timeEntity = engine.addEntity()
      Transform.create(this.timeEntity, {
        position: Vector3.create(columnData.timeStart * width, height, 0),
        parent: parent
      })
      TextShape.createOrReplace(this.timeEntity, {
        text: timeStringFromMs(scoreData.time),
        fontSize: fontSize,
        textAlign: TextAlignMode.TAM_MIDDLE_RIGHT,
        textColor: Color4.fromHexString('#ff2d55ff'),
        outlineColor: Color4.fromHexString('#ff2d55ff'),
        outlineWidth: 0.2,
        font: Font.F_SANS_SERIF
      })
    }

    //moves
    if (columnData.movesStart && scoreData.moves) {
      this.movesEntity = engine.addEntity()
      Transform.create(this.movesEntity, {
        position: Vector3.create(columnData.movesStart * width, height, 0),
        parent: parent
      })
      TextShape.createOrReplace(this.movesEntity, {
        text: scoreData.moves.toString(),
        fontSize: fontSize,
        textAlign: TextAlignMode.TAM_MIDDLE_RIGHT,
        font: Font.F_SANS_SERIF,
        textColor: Color4.Black(),
        outlineColor: Color4.Black(),
        outlineWidth: 0.2
      })
    }

    //level
    if (columnData.levelStart && scoreData.level) {
      this.levelEntity = engine.addEntity()
      Transform.create(this.levelEntity, {
        position: Vector3.create(columnData.levelStart * width, height, 0),
        parent: parent
      })
      TextShape.createOrReplace(this.levelEntity, {
        text: 'Level ' + scoreData.level.toString(),
        fontSize: fontSize,
        textAlign: TextAlignMode.TAM_MIDDLE_RIGHT,
        font: Font.F_SANS_SERIF,
        textColor: Color4.Black(),
        outlineColor: Color4.Black(),
        outlineWidth: 0.2
      })
    }
  }

  removeRow() {
    const { engine } = getSDK()
    if (this.levelEntity) {
      engine.removeEntity(this.levelEntity)
    }
    if (this.scoreEntity) {
      engine.removeEntity(this.scoreEntity)
    }
    if (this.nameEntity) {
      engine.removeEntity(this.nameEntity)
    }
    if (this.timeEntity) {
      engine.removeEntity(this.timeEntity)
    }
    if (this.placeEntity) {
      engine.removeEntity(this.placeEntity)
    }
    if (this.movesEntity) {
      engine.removeEntity(this.movesEntity)
    }
  }
}

export class ScoreBoard {
  uiRoot: Entity
  frame: Entity
  buttonLeft: MenuButton
  buttonRight: MenuButton
  width: number
  height: number
  rowsVisible: number = 10
  scores: ScoreRow[]
  header: HeaderRow
  rowHeight: number
  fontScale: number
  columnData: ColumnData

  constructor(
    rootTransform: TransformTypeWithOptionals,
    boardWidth: number,
    boardHeight: number,
    fontScale: number,
    _columnData: ColumnData
  ) {
    const { engine } = getSDK()

    this.width = boardWidth
    this.height = boardHeight

    this.rowHeight = this.height / 11
    const buttonSize = this.height * 0.55

    this.fontScale = fontScale

    this.columnData = _columnData
    this.scores = []
    this.uiRoot = engine.addEntity()

    //https://exploration-games.decentraland.zone/api/games/4ee1d308-5e1e-4b2b-9e91-9091878a7e3d/leaderboard?sort=time

    this.header = new HeaderRow(_columnData, this.width, -this.rowHeight / 2, this.uiRoot, fontScale)
    const {
      components: { Transform, GltfContainer }
    } = getSDK()

    Transform.create(this.uiRoot, rootTransform)
    this.frame = engine.addEntity()
    Transform.create(this.frame, {
      position: Vector3.create(0, 0, 0.02),
      scale: Vector3.create(this.width, this.height, 1),
      parent: this.uiRoot
    })
    GltfContainer.create(this.frame, { src: uiAssets.scoreboard.scoreboardBackgroundLight })

    this.buttonLeft = new MenuButton(
      {
        position: Vector3.create(-buttonSize / 4, -this.height * 0.5, 0),
        rotation: Quaternion.fromEulerDegrees(-90, 0, 0),
        scale: Vector3.create(buttonSize, buttonSize, buttonSize),
        parent: this.uiRoot
      },
      uiAssets.shapes.SQUARE_RED,
      uiAssets.icons.leftArrow,
      'PREVIOUS PAGE',
      () => {
        console.log('PREV PAGE PRESSED')
        //this.loadScores(scoreData, POINTS_TIME )
      }
    )

    this.buttonRight = new MenuButton(
      {
        position: Vector3.create(this.width + buttonSize / 4 - 0.05, -this.height * 0.5, 0),
        rotation: Quaternion.fromEulerDegrees(-90, 0, 0),
        scale: Vector3.create(buttonSize, buttonSize, buttonSize),
        parent: this.uiRoot
      },
      uiAssets.shapes.SQUARE_RED,
      uiAssets.icons.rightArrow,
      'NEXT PAGE',
      () => {
        console.log('NEXT PAGE PRESSED')
        //  this.loadScores(scoreData, TIME_LEVEL )
      }
    )

    //this.loadScores(scoreData, TIME_LEVEL_MOVES)
    void this.getScores()
  }

  async getScores() {
    const { config } = getSDK()
    const GAME_ID = config.gameId ?? '5728b531-4760-4647-a843-d164283dae6d'
    // https://exploration-games.decentraland.zone/api/games/4ee1d308-5e1e-4b2b-9e91-9091878a7e3d/leaderboard?sort=time
    //let scores: any[] = []
    const url =
      'https://exploration-games.decentraland.zone/api/games/' + GAME_ID + '/leaderboard?sort=time&direction=ASC'

    try {
      const response = await fetch(url)
      const json = await response.json()

      let rowIndex = 0

      this.header.removeHeaders()
      for (let i = 0; i < this.scores.length; i++) {
        this.scores[i].removeRow()
      }

      this.scores = []

      for (let i = 0; i < json.data.length; i++) {
        console.log('updating data: ' + json.data[i].user_address)
        rowIndex++
        this.scores.push(
          new ScoreRow(
            rowIndex,
            json.data[i],
            this.columnData,
            this.width,
            -this.rowHeight / 2 + this.rowHeight * -rowIndex,
            this.uiRoot,
            this.fontScale
          )
        )
      }

      this.header = new HeaderRow(this.columnData, this.width, -this.rowHeight / 2, this.uiRoot, this.fontScale)

      console.log(json)
      return this.scores
    } catch (e) {
      console.log('error getting trending scene data ', e)
    }
  }
}

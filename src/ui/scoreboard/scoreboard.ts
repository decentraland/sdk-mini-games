import { Entity, Font, TextAlignMode, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'

import { MenuButton } from '../button'
import { uiAssets } from '../resources'
import { timeStringFromMs } from '../utilities'
import { Column, HeaderRow, NAME_START, PLACEMENT_START, SCOREBOARD_VALUE_TYPE } from './columnData'
import { getSDK } from '../../sdk'
import { queue } from '../..'
import { GAME_SERVER } from '../../config'

type sortOrder = 'asc' | 'desc'

type scoreboardConfig = {
  showButtons: boolean
  backgroundImage?: string
  showBackground?: boolean
  backgroundEmissiveIntensity?: number
  sortBy?: SCOREBOARD_VALUE_TYPE
  sortDirection?: sortOrder
  textColorMain?: Color4
  textColorSecondary?: Color4
}

class ScoreRow {
  place: number
  name: string
  score: number
  time: number
  moves: number
  level: number

  placeEntity: Entity
  nameEntity: Entity
  valueEntities: Entity[]

  constructor(
    place: number,
    scoreData: any,
    columnData: Column[],
    width: number,
    height: number,
    parent: Entity,
    fontSize: number,
    textColorMain: Color4,
    textColorSecondary: Color4
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
      position: Vector3.create(PLACEMENT_START * width, height, 0),
      parent: parent
    })
    TextShape.createOrReplace(this.placeEntity, {
      text: place.toString(),
      fontSize: fontSize,
      textAlign: TextAlignMode.TAM_MIDDLE_RIGHT,
      textColor: textColorSecondary,
      outlineColor: textColorSecondary,
      outlineWidth: 0.3,
      font: Font.F_SANS_SERIF
    })

    //player name
    this.nameEntity = engine.addEntity()
    Transform.create(this.nameEntity, {
      position: Vector3.create(NAME_START * width, height, 0),
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
      textColor: textColorMain,
      outlineColor: textColorMain,
      outlineWidth: 0.2
    })

    this.valueEntities = []
    let currentColumnStart = 0.98

    for (let i = columnData.length - 1; i >= 0; i--) {
      const valueEntity = engine.addEntity()
      Transform.create(valueEntity, {
        position: Vector3.create(currentColumnStart * width, height, 0),
        parent: parent
      })

      let valueText = 'NaN'

      switch (columnData[i].type) {
        case SCOREBOARD_VALUE_TYPE.LEVEL: {
          valueText = 'Level ' + scoreData.level.toString()
          break
        }
        case SCOREBOARD_VALUE_TYPE.SCORE: {
          valueText = scoreData.score.toString()
          break
        }
        case SCOREBOARD_VALUE_TYPE.TIME: {
          valueText = timeStringFromMs(scoreData.time)
          break
        }
        case SCOREBOARD_VALUE_TYPE.MOVES: {
          valueText = scoreData.moves.toString()
          break
        }
      }

      TextShape.createOrReplace(valueEntity, {
        text: valueText,
        fontSize: fontSize,
        textAlign: TextAlignMode.TAM_MIDDLE_RIGHT,
        textColor: textColorSecondary,
        outlineColor: textColorSecondary,
        outlineWidth: 0.2,
        font: Font.F_SANS_SERIF
      })

      currentColumnStart -= columnData[i].valueFieldWidth
      this.valueEntities.push(valueEntity)
    }
  }

  removeRow() {
    const { engine } = getSDK()

    for (let i = 0; i < this.valueEntities.length; i++) {
      engine.removeEntity(this.valueEntities[i])
    }
    if (this.nameEntity) {
      engine.removeEntity(this.nameEntity)
    }
    if (this.placeEntity) {
      engine.removeEntity(this.placeEntity)
    }
  }
}

export class ScoreBoard {
  uiRoot: Entity
  frame: Entity
  buttonLeft?: MenuButton
  buttonRight?: MenuButton
  width: number
  height: number
  rowsVisible: number = 10
  scores: ScoreRow[]
  header: HeaderRow
  rowHeight: number
  fontScale: number
  columnData: Column[]
  sortDirection: sortOrder = 'desc'
  sortBy: SCOREBOARD_VALUE_TYPE = SCOREBOARD_VALUE_TYPE.LEVEL
  showButtons: boolean = false
  showBackground: boolean = true
  emissiveIntensity: number = 0.5
  frameBG: string = uiAssets.scoreboard.scoreBoardBackgroudDefault
  textColorMain: Color4 = Color4.Black()
  textColorSecondary: Color4 = Color4.fromHexString('#ff2d55ff')
  lastQueue = queue.getQueue()
  scoreboardUpdateTimer = 0

  constructor(
    rootTransform: TransformTypeWithOptionals,
    boardWidth: number,
    boardHeight: number,
    fontScale: number,
    _columnData: Column[],
    config?: scoreboardConfig
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

    if (config) {
      this.sortBy = config.sortBy ? config.sortBy : SCOREBOARD_VALUE_TYPE.LEVEL
      this.sortDirection = config.sortDirection ? config.sortDirection : 'desc'
      this.showButtons = config.showButtons ? config.showButtons : false
      this.frameBG = config.backgroundImage ? config.backgroundImage : uiAssets.scoreboard.scoreBoardBackgroudDefault

      if (config.showBackground !== undefined) {
        this.showBackground = config.showBackground ? config.showBackground : false
      } else {
        this.showBackground = true
      }
      if (config.backgroundEmissiveIntensity !== undefined) {
        this.emissiveIntensity = config.backgroundEmissiveIntensity
      } else {
        this.emissiveIntensity = 0.5
      }
      this.textColorMain = config.textColorMain ? config.textColorMain : Color4.Black()
      this.textColorSecondary = config.textColorSecondary
        ? config.textColorSecondary
        : Color4.fromHexString('#ff2d55ff')
    }

    //https://exploration-games.decentraland.zone/api/games/4ee1d308-5e1e-4b2b-9e91-9091878a7e3d/leaderboard?sort=time

    this.header = new HeaderRow(
      _columnData,
      this.width,
      -this.rowHeight / 2,
      this.uiRoot,
      fontScale,
      this.textColorSecondary
    )
    const {
      components: { Transform, Material, MeshRenderer }
    } = getSDK()

    Transform.create(this.uiRoot, rootTransform)
    this.frame = engine.addEntity()

    if (this.showBackground) {
      if (config?.backgroundImage) {
        Transform.create(this.frame, {
          position: Vector3.create(this.width / 2, -this.height / 2, 0.02),
          scale: Vector3.create(this.width, this.height, 1),
          parent: this.uiRoot
        })
        MeshRenderer.setPlane(this.frame)
        Material.setPbrMaterial(this.frame, {
          texture: Material.Texture.Common({ src: this.frameBG }),
          emissiveTexture: Material.Texture.Common({ src: this.frameBG }),
          emissiveIntensity: this.emissiveIntensity,
          roughness: 1,
          metallic: 0,
          specularIntensity: 0
        })
      } else {
        Transform.create(this.frame, {
          position: Vector3.create(this.width / 2, -this.height / 2, 0.02),
          scale: Vector3.create(this.width, this.height, 1),
          parent: this.uiRoot
        })
        MeshRenderer.setPlane(this.frame)
        Material.setPbrMaterial(this.frame, {
          texture: Material.Texture.Common({ src: this.frameBG }),
          emissiveTexture: Material.Texture.Common({ src: this.frameBG }),
          emissiveIntensity: this.emissiveIntensity,
          emissiveColor: Color4.White(),
          roughness: 1,
          metallic: 0,
          specularIntensity: 0
        })
      }
    }

    if (this.showButtons) {
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
        }
      )
    }

    //this.loadScores(scoreData, TIME_LEVEL_MOVES)
    void this.getScores()

    //auto update scoreboard on queue length change

    engine.addSystem((dt: number) => {
      this.scoreboardUpdateTimer += dt
      if (this.scoreboardUpdateTimer < 0.25) return
      this.scoreboardUpdateTimer = 0

      const newQueue = queue.getQueue()
      if (newQueue.length !== this.lastQueue.length) {
        console.log('updating scoreboard')
        this.lastQueue = newQueue
        void this.getScores()
      }
    })
  }

  async getScores() {
    const { config } = getSDK()
    const GAME_ID = config.gameId

    // empty string will sort by level (default server setting)
    let sortString = ''

    switch (this.sortBy) {
      case SCOREBOARD_VALUE_TYPE.LEVEL: {
        sortString = ''
        break
      }
      case SCOREBOARD_VALUE_TYPE.TIME: {
        sortString = 'time'
        break
      }
      case SCOREBOARD_VALUE_TYPE.SCORE: {
        sortString = 'score'
        break
      }
      case SCOREBOARD_VALUE_TYPE.MOVES: {
        sortString = 'moves'
        break
      }
    }

    let sorDirString = 'DESC'

    switch (this.sortDirection) {
      case 'asc': {
        sorDirString = 'ASC'
        break
      }
      case 'desc': {
        sorDirString = 'DESC'
        break
      }
    }

    const url = GAME_SERVER + '/api/games/' + GAME_ID + '/leaderboard?sort=' + sortString + '&direction=' + sorDirString

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
            this.fontScale,
            this.textColorMain,
            this.textColorSecondary
          )
        )
      }

      this.header = new HeaderRow(
        this.columnData,
        this.width,
        -this.rowHeight / 2,
        this.uiRoot,
        this.fontScale,
        this.textColorSecondary
      )

      console.log(json)
      return this.scores
    } catch (e) {
      console.log('error getting score data ', e)
    }
  }
}

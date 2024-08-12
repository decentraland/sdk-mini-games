export type ValidCondition = '=' | '>' | '<' | '>=' | '<='
export type ScoreKeys = keyof IScore
export type CustomDataKeys = keyof { [key: string]: number }

export type IScore = {
  level: number
  score?: number | null
  moves?: number | null
  time?: number | null
  data?: { [key: string]: number | null }
}

export type IMissions = {
  missions: {
    id: string
    description: string
    active: string
  }[]
  challenges: IChallenge[]
}

// type for single challenge
export type IChallenge = {
  id: string
  description: string
  game_id: string
  mission_id: string
  target_level: number
  data: IChallengeData
  active: boolean
}

export type IChallengeData = {
  [key in ScoreKeys]: {
    customDataType?: CustomDataKeys
    condition: ValidCondition
    target: number
  }
}

export type IProgress = IScore & {
  id: string
  game_id: string
  user_address: string
  user_name: string
  data: Record<string, unknown>
  updated_at: string
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

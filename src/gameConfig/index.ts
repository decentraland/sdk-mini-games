import { getSDK } from "../sdk"

export enum ENV{
    DEV = "dev",
    PRD = "prd"
}

const GAME_SERVER_CONFIG: Record<string, string> = {
    "dev": "https://exploration-games.decentraland.zone", //for local testing if you need different value
    "prd": "https://exploration-games.decentraland.org", //PROD/live use this for launch
}


export let GAME_ID: string
export let GAME_SERVER: string

export function init() {
    const { config } = getSDK()
    
    GAME_ID = config.gameId
    let _env = config.environment

    if(_env !== ENV.PRD) _env = ENV.DEV

    GAME_SERVER = GAME_SERVER_CONFIG[_env]
}
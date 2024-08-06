

export enum GameIds {
    TOWER_OF_HANOI = "4ee1d308-5e1e-4b2b-9e91-9091878a7e3d",
    MINESWEEPER = "00c03b95-6948-48d7-acf2-94f447f7d992",
    TILE_TALLY = "0e15a408-6d3a-42ab-9873-0dc0a00535cc", // 2048
    RECALL_RUSH = "", // Simon,
    MEMORY_GRID = "",
    COLOR_POP = "" // Bubble Shooter
}
export enum DefaultEnv {
    LOCAL = "local",
    PRD = "prd"
}

const GAME_SERVER_CONFIG: Record<string, string> = {
    "local": "https://exploration-games.decentraland.zone", //for local testing if you need different value
    "prd": "https://exploration-games.decentraland.org", //PROD/live use this for launch
}



export let gameId: GameIds
export let gameServer: string

export function init(_gameId: GameIds, env?: DefaultEnv) {
    gameId = _gameId

    if(!env) env = DefaultEnv.LOCAL

    gameServer = GAME_SERVER_CONFIG[env]
}
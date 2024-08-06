

export enum GameIds {
    TOWER_OF_HANOI = "4ee1d308-5e1e-4b2b-9e91-9091878a7e3d",
    MINESWEEPER = "00c03b95-6948-48d7-acf2-94f447f7d992",
    TILE_TALLY = "0e15a408-6d3a-42ab-9873-0dc0a00535cc", // 2048
    RECALL_RUSH = "", // Simon,
    MEMORY_GRID = "",
    COLOR_POP = "" // Bubble Shooter
}

export let gameId: GameIds

export function init(_gameId: GameIds) {
    gameId = _gameId
}
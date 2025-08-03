import { IGameState } from "../types/game.types";

export const INITIAL_GAME_STATE: IGameState = {
  playerName: "CEO Novato",
  money: 10000,
  date: new Date(2025, 0, 1),
  companyValue: 10000,
  inventory: {
    base_iron_ore: 50,
    base_copper_ore: 30,
    base_crude_oil: 20,
    base_sand: 40,
    base_wood: 100,
  },
  buildings: [],
  events: ["¡Has fundado tu nueva empresa! ¡El futuro es tuyo!"],
};
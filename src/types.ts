
export interface GameState {
  score: number;
  coins: number;
  gems: number;
  health: number;
  stage: string;
  lives: number;
  objective: string;
  objectiveCompleted: boolean;
}

export const INITIAL_STATE: GameState = {
  score: 0,
  coins: 0,
  gems: 0,
  health: 5,
  stage: "7-4",
  lives: 5,
  objective: "Find the Beacon of Brightness",
  objectiveCompleted: false
};

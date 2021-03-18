import { GameStates } from "./../enums/GameStates.enum"
import { IPlayer } from "./IPlayer"
import { IPoint } from "./Point"

interface GameState {
    state: GameStates
    players?: IPlayer[]
    fruits?: IPoint[]
    id?: string,
    remaining?: number
}


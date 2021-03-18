import { GameState } from "./types/GameState"
import { GameLoop } from "./GameLoop"
import { Player } from "./Player"
import { IPoint } from "./types/Point"
import { GameStates } from './enums/GameStates.enum'

enum GridObjectTypes {
    SNAKE_BODY = "SNAKE_BODY"
}

export interface GridObject {
    type: GridObjectTypes
}

interface Options {
    width?: number
    height?: number
    id: string
}
export const GameGrids: { [key: string]: GameGrid } = {}

export const addGameGrid = (id: string, options?: Options) => {
    if (!GameGrids[id]) {
        GameGrid[id] = new GameGrid(options!)
    }
}

export const deleteGameGrid = (id: string) => {
    if (GameGrids[id]) {
        delete GameGrids[id]
    }
}

export const availableGame = () => {
    return Object.values(GameGrids).find(g => g.players.length < 2)
}

export const inGame = (id: string) => Object.keys(GameGrids).some(k => GameGrids[k].players.some(p => p.id === id))

export default class GameGrid {
    width: number
    height: number
    players: Player[] = []
    fruits: IPoint[] = []
    channel?: string
    gameloop?: GameLoop
    id: string

    constructor({ width, height, id }: Options) {
        this.width = width ?? 16
        this.height = height ?? 16
        this.id = id
    }

    public addPlayer = (player: Player) => {
        if (this.players.length > 1) return
        if (!this.players.length) {
            player.head = { x: this.width / 4, y: this.height / 2 }
            player.direction = { x: 1, y: 0 }
        }
        else {
            player.head = { x: 3 * this.width / 4, y: this.height / 2 }
            player.direction = { x: -1, y: 0 }
        }
        this.players.push(player)
        if (this.players.length > 1) {
            this.startGame()
        }
    }

    private newFruit = () => {
        var x: number, y: number
        do {
            x = Math.floor(Math.random() * this.width)
            y = Math.floor(Math.random() * this.height)

        } while (this.fruits.some(f => f.x === x && f.y === y)
            || this.players.some(p => ((p.head!.x === x) && (p.head!.y === y))
                || p.body.some(b => b.x === x && b.y === y)))
        console.log({ x, y })
        this.fruits.push({ x, y })
    }

    private startLoop = () => {
        this.newFruit()
        this.gameloop = new GameLoop(() => {
            this.players.forEach(p => p.step())
            const removeFruits: IPoint[] = []
            const playerLoss: Player[] = []
            this.players.forEach(p => this.fruits.forEach((f) => {
                if (f.x === p.head!.x && f.y === p.head!.y) {
                    p.grow = true
                    if (!removeFruits.includes(f)) removeFruits.push(f)
                    do {
                        var x = Math.floor(Math.random() * this.width)
                        var y = Math.floor(Math.random() * this.height)

                    } while (this.fruits.some(f => f.x === x && f.y === y)
                        || this.players.some(p => ((p.head!.x === x) && (p.head!.y === y))
                            || p.body.some(b => b.x === x && b.y === y)))
                }
                if (this.players.some((player => (p.id !== player.id && (p.head!.x === player.head?.x) && (p.head!.y === player.head?.y)) || player.body.some(b => (b.x === p.head!.x) && (b.y === p.head!.y))))) {
                    playerLoss.push(p)
                }
            }))
            removeFruits.forEach(f => {
                this.fruits = this.fruits.filter(fr => !(fr.x === f.x && fr.y === f.y))
                this.newFruit()
            })
            if (playerLoss.length) {
                if (playerLoss.length === this.players.length) {
                    this.players.forEach(p => p.socket.emit('step', { state: GameStates.Tie } as GameState))
                }
                else {
                    this.players.forEach(p => p.socket.emit('step', { state: playerLoss.some(player => player.id === p.id) ? GameStates.Loss : GameStates.Win } as GameState))
                }
                this.players.forEach(p => p.socket.disconnect(true))
                deleteGameGrid(this.id)
                this.gameloop?.stop()
                return
            }
            const state: GameState = {
                state: GameStates.Playing,
                players: this.players.map(p => ({ head: p.head, body: p.body, direction: p.direction, id: p.id, number: p.number })),
                fruits: this.fruits

            }
            this.players.forEach(p => p.socket.emit('step', state))
        }, 30)
    }

    private startGame = () => {
        var seconds = 3
        this.players.forEach(p => { p.socket.emit('step', { state: GameStates.Preparing, remaining: seconds }) })
        const intervalId = setInterval(() => {
            seconds -= 1
            if (seconds) this.players.forEach(p => p.socket.emit('step', { state: GameStates.Preparing, remaining: seconds }))
            else {
                this.startLoop()
                clearInterval(intervalId)
            }


        }, 1000)
    }

}






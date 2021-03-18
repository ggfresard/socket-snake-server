import { Socket } from "socket.io";
import { IPlayer } from "./types/IPlayer"
import { IPoint } from "./types/Point"
import { Input } from "./types/Input"

interface Options {
    socket: Socket
    channel?: string
    speed?: number
    direction?: IPoint
    number?: 1 | 2,
    id: string
}

export class Player implements IPlayer {
    id: string
    channel?: string
    socket: Socket
    head?: IPoint
    body: IPoint[] = []
    speed: number
    counter: number
    direction: IPoint
    input?: Input
    grow = false
    number: 1 | 2
    forbiddenDirection
    constructor({ socket, channel, speed, direction, number, id }: Options) {
        this.socket = socket
        this.channel = channel
        this.id = id
        this.speed = speed ?? 3
        this.counter = 0
        this.direction = direction ?? { x: 1, y: 0 }
        this.forbiddenDirection = { x: this.direction?.x, y: -this.direction.y }
        this.number = number ?? 1

    }
    public step = () => {
        const arrowInput = this.input ? {
            x: this.input.keys.ArrowRight.down - this.input.keys.ArrowLeft.down,
            y: this.input.keys.ArrowDown.down - this.input.keys.ArrowUp.down,
        } : { x: 0, y: 0 }
        if (!!arrowInput.x ? !arrowInput.y : !!arrowInput.y) {
            if (!(arrowInput.x === this.forbiddenDirection.x && arrowInput.y === this.forbiddenDirection.y)) {
                this.direction = arrowInput
            }

        }




        this.counter += 1
        if (this.counter === this.speed) {
            this.counter = 0
            this.body.unshift(this.head!)
            !this.grow && this.body.pop()
            if (this.grow) this.grow = false
            this.head = {
                x: Math.abs(16 + this.head!.x + this.direction.x) % 16,
                y: Math.abs(16 + this.head!.y + this.direction.y) % 16
            }
            this.forbiddenDirection = { x: -this.direction.x, y: -this.direction.y }


        }
    }


}
export interface Input {
    keys: { [key in Keys]: { pressed: 1 | 0, down: 1 | 0, up: 1 | 0 } }
    mouseIn: boolean
    mouseX: number
    mouseY: number
}
export class GameLoop {
    loopFunction: (delta: number) => void
    interval: number
    start: number
    then: number
    nextTick = false
    playing = true

    constructor(loop: (delta: number) => void, fps = 30) {
        this.loopFunction = loop
        this.interval = 1000 / fps
        this.start = this.then = Date.now()
        this.loop()
    }

    public stop = () => {
        this.playing = false
    }


    public loop = () => {
        if (this.playing) {

            if (!this.nextTick) {
                this.nextTick = true
                setTimeout(() => {
                    this.nextTick = false
                    this.loop()
                }, 10)
            }
            const now = Date.now()
            const step = now - this.then
            if (step >= this.interval) {
                this.then = now - (step % this.interval)
                this.loopFunction(step)
            }
        }
    }
}
import express from 'express'
import * as SocketIO from 'socket.io'
import { Player } from './Player'
import GameGrid, { availableGame, GameGrids, inGame } from './GameGrid'
import { GameStates } from './enums/GameStates.enum'
import { GameState } from './types/GameState'

declare global {
    interface Array<T> {
        search(objective: number | string, param?: string): T;
    }
}

Array.prototype.search = function (o, p) {
    return this.find(el => el[p ?? 'id'] === o)
}

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: { methods: ["GET", "POST"] },
    origins: [
        "http://127.0.0.1:5000",
        "http://localhost:5000",
        "http://192.168.1.185:5000",
        "http://*"
    ]
}) as SocketIO.Namespace

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Example app listening on port ${port}!`));

var playerQ: null | Player = null

io.on('connection', (socket) => {
    const id = socket.handshake.query.user as string
    console.log(id)
    const room = socket.handshake.query.room as string
    const newGame = socket.handshake.query.newGame === 'true'


    const player = new Player({ socket, id })
    if (!inGame(id)) {
        if (room && GameGrids[room]) {
            GameGrids[room].addPlayer(player)
        }
        else {
            if (newGame) {
                GameGrids[id] = new GameGrid({ id })
                GameGrids[id].addPlayer(player)
                socket.emit('step', {
                    state: GameStates.Waiting,
                    id
                } as GameState)
            }
            else {
                var game = availableGame()
                if (!game) {
                    GameGrids[id] = new GameGrid({ id })
                    GameGrids[id].addPlayer(player)
                    socket.emit('step', {
                        state: GameStates.Waiting,
                        id
                    } as GameState)
                }
                else {
                    player.number = 2
                    game.addPlayer(player)
                }
            }
        }



    }

    socket.on('input', (input) => {

        player.input = input
    })
});






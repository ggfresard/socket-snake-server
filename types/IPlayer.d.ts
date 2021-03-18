import { Socket } from "socket.io";
import { IPoint } from "./Point";

interface IPlayer {
    id?: string
    channel?: string
    socket?: Socket
    head?: IPoint
    body?: IPoint[]
    direction?: IPoint
    number: 1 | 2
}
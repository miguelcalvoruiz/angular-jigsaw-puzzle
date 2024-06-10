import { Canvas } from "./canvas";
import { Coordinates } from "./coordinates";
import { Jigsaw } from "./jigsaw";
import { Piece } from "./piece";

export class Game {
    private _canvas: Canvas;
    private _jigsaw: Jigsaw;
    private _activePiece: Piece | null;
    private _canvasDragging: Coordinates | null;
    private _started: boolean;

    constructor(canvas: Canvas, jigsaw: Jigsaw) {
        this._canvas = canvas;
        this._jigsaw = jigsaw;
        this._activePiece = null;
        this._canvasDragging = null;
        this._started = false;
    }

    public get canvas() {
        return this._canvas;
    }

    public get jigsaw() {
        return this._jigsaw;
    }

    public get activePiece() {
        return this._activePiece;
    }

    public set activePiece(value: Piece | null) {
        this._activePiece = value;
    }

    public get canvasDragging() {
        return this._canvasDragging;
    }

    public set canvasDragging(value: Coordinates | null) {
        this._canvasDragging = value;
    }

    public get started() {
        return this._started;
    }

    public start() {
        this._started = true;
    }
}
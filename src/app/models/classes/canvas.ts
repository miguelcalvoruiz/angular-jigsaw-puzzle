import { Coordinates } from "./coordinates";
import { Size } from "./size";

export class Canvas {
    private _size: Size;
    private _position: Coordinates;
    private _context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this._size = new Size(innerWidth - 60, innerHeight);
        this._position = new Coordinates(0, 0);
        this._context = context;
    }

    public get position() {
        return this._position;
    }

    public get size() {
        return this._size;
    }

    public get context() {
        return this._context;
    }
}
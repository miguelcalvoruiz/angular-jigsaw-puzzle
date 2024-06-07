export class Size {
    private _width: number;
    private _height: number;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    public get width() {
        return this._width;
    }

    public get height() {
        return this._height;
    }
}
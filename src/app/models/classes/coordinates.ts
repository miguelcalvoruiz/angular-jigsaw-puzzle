export class Coordinates {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public addVector(vector: Coordinates) {
        this._x += vector.x;
        this._y += vector.y;
    }

    public getVerticalReflection(axisOfSymmetry: number) {
        const diff = axisOfSymmetry - this._x;
        return new Coordinates(axisOfSymmetry + diff, this._y);
    }

    public getHorizontalReflection(axisOfSymmetry: number) {
        const diff = axisOfSymmetry - this._y;
        return new Coordinates(this._x, axisOfSymmetry + diff);
    }
}
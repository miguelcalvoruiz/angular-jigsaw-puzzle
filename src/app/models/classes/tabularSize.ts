import { Size } from "./size";

export class TabularSize extends Size {
    private _rows: number;
    private _cols: number;

    constructor(width: number, height: number, rows: number, cols: number) {
        super(width, height);
        this._rows = rows;
        this._cols = cols;
    }

    public get rows() {
        return this._rows;
    }

    public get cols() {
        return this._cols;
    }
}
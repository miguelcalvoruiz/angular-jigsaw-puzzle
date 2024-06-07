export class Connection {
    private _direction: string;
    private _row: number;
    private _col: number;
    private _connected: boolean;

    constructor(direction: string, row: number, col: number) {
        this._direction = direction;
        this._row = row;
        this._col = col;
        this._connected = false;
    }

    public get direction() {
        return this._direction;
    }

    public get row() {
        return this._row;
    }

    public get col() {
        return this._col;
    }

    public get connected() {
        return this._connected;
    }

    public connect() {
        this._connected = true;
    }
}
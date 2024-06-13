export enum Direction {
    Left = 'left',
    Right = 'right',
    Top = 'top',
    Bottom = 'bottom'
};

export class Connection {
    private _direction: Direction;
    private _row: number;
    private _col: number;
    private _connected: boolean;
    private _type: number;

    constructor(direction: Direction, row: number, col: number) {
        this._direction = direction;
        this._row = row;
        this._col = col;
        this._connected = false;
        this._type = 0;
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

    public get type() {
        return this._type;
    }

    public set type(value: number) {
        this._type = value;
    }

    public connect() {
        this._connected = true;
    }
}
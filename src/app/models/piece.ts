import { Connection } from "./connection";
import { Coordinates } from "./coordinates";

export class Piece {
    private _row: number;
    private _col: number;
    private _sourcePosition: Coordinates;
    private _destPosition: Coordinates;
    private _targetPosition: Coordinates;
    private _locked = false;
    private _connections: Connection[] = [];

    constructor(
        row: number, col: number,
        sourceX: number, sourceY: number,
        destX: number, destY: number,
        targetX: number, targetY: number
    ) {
        this._row = row;
        this._col = col;

        this._sourcePosition = new Coordinates(sourceX, sourceY);
        this._destPosition = new Coordinates(destX, destY);
        this._targetPosition = new Coordinates(targetX, targetY);

        this.initializeConnections();
    }

    public get row() {
        return this._row;
    }

    public get col() {
        return this._col;
    }

    public get sourcePosition() {
        return this._sourcePosition;
    }

    public get destPosition() {
        return this._destPosition;
    }

    public get targetPosition() {
        return this._targetPosition;
    }

    public get locked() {
        return this._locked;
    }

    public get connections() {
        return this._connections;
    }

    private initializeConnections() {
        this._connections.push(
            new Connection('left', this.row, this.col - 1),
            new Connection('right', this.row, this.col + 1),
            new Connection('top', this.row - 1, this.col),
            new Connection('bottom', this.row + 1, this.col)
        );
    }

    public setDestPosition(coordinates: Coordinates) {
        this._destPosition = coordinates;
    }

    public setTargetPosition(coordinates: Coordinates) {
        this._targetPosition = coordinates;
      }

    public setPositionBasedOnVector(vector: Coordinates) {
        this._destPosition.addVector(vector);
    }

    public setPositionBasedOnReferencePiece(referencePiece: Piece) {
        const referencePieceTargetPosition = new Coordinates(
            referencePiece.targetPosition.x,
            referencePiece.targetPosition.y
        );

        const referencePieceDestPosition = new Coordinates(
            referencePiece.destPosition.x,
            referencePiece.destPosition.y
        );

        const vector = new Coordinates(
            referencePieceDestPosition.x - referencePieceTargetPosition.x,
            referencePieceDestPosition.y - referencePieceTargetPosition.y
        );

        const relativePosition = new Coordinates(
            this.targetPosition.x,
            this.targetPosition.y
        );

        relativePosition.addVector(vector);
        this.setDestPosition(relativePosition);
    }

    public setPositionToTarget() {
        this._destPosition = this.targetPosition;
    }

    public setConnection(direction: string) {
        this._connections.map(connection => {
            if (connection.direction == direction) {
                connection.connect();
            }
        });
    }

    public lock() {
        this._locked = true;
    }
}
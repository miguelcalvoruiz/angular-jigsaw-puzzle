import { Connection } from "./connection";
import { Coordinates } from "./coordinates";
import { Jigsaw } from "./jigsaw";

export class Piece {
    private _jigsaw: Jigsaw;

    private _row: number;
    private _col: number;
    private _sourcePosition: Coordinates;
    private _destPosition: Coordinates;
    private _targetPosition: Coordinates;
    private _locked: boolean;
    private _connections: Connection[] = [];

    constructor(
        jigsaw: Jigsaw,
        row: number, col: number,
        sourceX: number, sourceY: number,
        destX: number, destY: number,
        targetX: number, targetY: number
    ) {
        this._jigsaw = jigsaw;

        this._row = row;
        this._col = col;

        this._sourcePosition = new Coordinates(sourceX, sourceY);
        this._destPosition = new Coordinates(destX, destY);
        this._targetPosition = new Coordinates(targetX, targetY);

        this._locked = false;

        this._connections.push(
            new Connection('left', row, col - 1),
            new Connection('right', row, col + 1),
            new Connection('top', row - 1, col),
            new Connection('bottom', row + 1, col)
        );
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

    public set destPosition(value: Coordinates) {
        this._destPosition = value;
    }

    public get targetPosition() {
        return this._targetPosition;
    }

    public set targetPosition(value: Coordinates) {
        this._targetPosition = value;
    }

    public get locked() {
        return this._locked;
    }

    public get connections() {
        return this._connections;
    }

    public lock() {
        this._locked = true;
    }

    public moveByVector(vector: Coordinates) {
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
        this._destPosition = relativePosition;
    }

    public setPositionToTarget() {
        this._destPosition = this.targetPosition;
    }

    public connect() {
        let connector: Piece | null = null;

        for (let i = 0; i < this.connections.length && !connector; i++) {
            const connection = this.connections[i];
            const adjacentPiece = this._jigsaw.getPiece(connection.row, connection.col);

            if (!adjacentPiece || connection.connected) continue;

            switch (connection.direction) {
                case 'left':
                    if (this.canBeConnectedOnLeft(adjacentPiece)) {
                        this.setConnection('left');
                        adjacentPiece.setConnection('right');
                        connector = adjacentPiece;
                    }
                    break;

                case 'right':
                    if (this.canBeConnectedOnRight(adjacentPiece)) {
                        this.setConnection('right');
                        adjacentPiece.setConnection('left');
                        connector = adjacentPiece;
                    }
                    break;

                case 'top':
                    if (this.canBeConnectedOnTop(adjacentPiece)) {
                        this.setConnection('top');
                        adjacentPiece.setConnection('bottom');
                        connector = adjacentPiece;
                    }
                    break;

                case 'bottom':
                    if (this.canBeConnectedOnBottom(adjacentPiece)) {
                        this.setConnection('bottom');
                        adjacentPiece.setConnection('top');
                        connector = adjacentPiece;
                    }
                    break;

                default:
                    break;
            }
        }

        return connector;
    }

    private setConnection(direction: string) {
        this._connections.map(connection => {
            if (connection.direction == direction) {
                connection.connect();
            }
        });
    }

    private canBeConnectedOnLeft(adjacentPiece: Piece) {
        if (Math.abs(adjacentPiece.destPosition.x + this._jigsaw.destPieceSize.width - this.destPosition.x) <= this._jigsaw.offset.x
            && Math.abs(adjacentPiece.destPosition.y - this.destPosition.y) <= this._jigsaw.offset.y) {
            return true;
        } else {
            return false;
        }
    }

    private canBeConnectedOnRight(adjacentPiece: Piece) {
        if (Math.abs(this.destPosition.x + this._jigsaw.destPieceSize.width - adjacentPiece.destPosition.x) <= this._jigsaw.offset.x
            && Math.abs(adjacentPiece.destPosition.y - this.destPosition.y) <= this._jigsaw.offset.y) {
            return true;
        } else {
            return false;
        }
    }

    private canBeConnectedOnTop(adjacentPiece: Piece) {
        if (Math.abs(adjacentPiece.destPosition.y + this._jigsaw.destPieceSize.height - this.destPosition.y) <= this._jigsaw.offset.y
            && Math.abs(adjacentPiece.destPosition.x - this.destPosition.x) <= this._jigsaw.offset.x) {
            return true;
        } else {
            return false;
        }
    }

    private canBeConnectedOnBottom(adjacentPiece: Piece) {
        if (Math.abs(this.destPosition.y + this._jigsaw.destPieceSize.height - adjacentPiece.destPosition.y) <= this._jigsaw.offset.y
            && Math.abs(adjacentPiece.destPosition.x - this.destPosition.x) <= this._jigsaw.offset.x) {
            return true;
        } else {
            return false;
        }
    }
}
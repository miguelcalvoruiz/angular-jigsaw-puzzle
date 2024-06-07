import { TabularSize } from "./tabularSize";
import { Piece } from "./piece";
import { Size } from "./size";
import { Coordinates } from "./coordinates";

export class Jigsaw {
    private _size: TabularSize;
    private _position: Coordinates;
    private _offset: Coordinates;
    private _scale: number;
    private _ratio: number;

    private _pieces: Piece[] = [];
    private _sourcePieceSize: Size;
    private _destPieceSize: Size;

    constructor(
        rows: number, cols: number,
        imageWidth: number, imageHeight: number,
        canvasWidth: number, canvasHeight: number,
        scale: number
    ) {
        this._scale = scale;
        this._ratio = scale * Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);

        this._size = new TabularSize(
            imageWidth * this._ratio,
            imageHeight * this._ratio,
            rows, cols
        );

        this._position = new Coordinates(
            (canvasWidth - this._size.width) / 2,
            (canvasHeight - this._size.height) / 2
        );

        this._sourcePieceSize = new Size(imageWidth / cols, imageHeight / rows);
        this._destPieceSize = new Size(this._size.width / cols, this._size.height / rows);

        this._offset = new Coordinates(
            this._destPieceSize.width / 4,
            this._destPieceSize.height / 4
        );
    }

    public get position() {
        return this._position;
    }

    public get size() {
        return this._size;
    }

    public get pieces() {
        return this._pieces;
    }

    public get sourcePieceSize() {
        return this._sourcePieceSize;
    }

    public get destPieceSize() {
        return this._destPieceSize;
    }

    public get offset() {
        return this._offset;
    }

    public addPiece(piece: Piece) {
        this._pieces.push(piece);
    }

    public movePieceToTop(piece: Piece) {
        const index = this.pieces.indexOf(piece);

        if (index >= 0) {
            this._pieces.splice(index, 1);
            this._pieces.push(piece);
        }
    }

    public movePieceToBottom(piece: Piece) {
        const index = this.pieces.indexOf(piece);

        if (index >= 0) {
            this._pieces.splice(index, 1);
            this._pieces.unshift(piece);
        }
    }

    public getPiece(row: number, col: number) {
        return this.pieces.filter(piece => piece.row == row && piece.col == col)[0];
    }
}
import { Canvas } from "./canvas";
import { Coordinates } from "./coordinates";
import { Piece } from "./piece";
import { Size } from "./size";
import { TabularSize } from "./tabularSize";

export class Jigsaw {
    private _canvas: Canvas;

    private _size: TabularSize;
    private _imageSize: Size;
    private _position: Coordinates;
    private _offset: Coordinates;
    private _ratio: number;

    private _pieces: Piece[] = [];
    private _sourcePieceSize: Size;
    private _destPieceSize: Size;

    constructor(
        canvas: Canvas,
        rows: number, cols: number,
        imageWidth: number, imageHeight: number
    ) {
        this._canvas = canvas;

        this._ratio = 0.6 * Math.min(canvas.size.width / imageWidth, canvas.size.height / imageHeight);

        this._size = new TabularSize(
            imageWidth * this._ratio,
            imageHeight * this._ratio,
            rows, cols
        );

        this._imageSize = new Size(imageWidth, imageHeight);

        this._position = new Coordinates(
            (canvas.size.width - this._size.width) / 2,
            (canvas.size.height - this._size.height) / 2
        );

        this._sourcePieceSize = new Size(imageWidth / cols, imageHeight / rows);
        this._destPieceSize = new Size(this._size.width / cols, this._size.height / rows);

        this._offset = new Coordinates(
            Math.round(this._destPieceSize.width / 4),
            Math.round(this._destPieceSize.height / 4)
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

    public createPieces() {
        for (let row = 0; row < this.size.rows; row++) {
            for (let col = 0; col < this.size.cols; col++) {
                this.createPiece(row, col);
            }
        }
    }

    private createPiece(row: number, col: number) {
        const sourceX = this.sourcePieceSize.width * col;
        const sourceY = this.sourcePieceSize.height * row;

        let max = innerWidth - 3 * this.destPieceSize.width;
        let min = this.destPieceSize.width;
        const destX = Math.floor(Math.random() * (max - min) + min);

        max = innerHeight - 2 * this.destPieceSize.height;
        min = this.destPieceSize.height;
        const destY = Math.floor(Math.random() * (max - min) + min);

        const targetX = this.position.x + col * this.destPieceSize.width;
        const targetY = this.position.y + row * this.destPieceSize.height;

        const piece = new Piece(
            this,
            row, col,
            this.size.rows, this.size.cols,
            sourceX, sourceY,
            destX, destY,
            targetX, targetY
        );

        this._pieces.push(piece);
    }

    public getPiece(row: number, col: number) {
        return this.pieces.find(piece => piece.row == row && piece.col == col);
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

    public getGroupOfAdjacentPieces(piece: Piece, allAdjacentPieces: Piece[] = []) {
        const adjacentPieces = piece.connections
            .filter(connection => connection.connected)
            .map(connection => this.getPiece(connection.row, connection.col));

        allAdjacentPieces.push(piece);

        adjacentPieces.forEach(adjacentPiece => {
            if (adjacentPiece && !allAdjacentPieces.includes(adjacentPiece)) {
                this.getGroupOfAdjacentPieces(adjacentPiece, allAdjacentPieces);
            }
        });

        return allAdjacentPieces;
    }

    public findConnectionsBetweenPieces(adjacentPieces: Piece[]) {
        let connector: Piece | null = null;

        adjacentPieces.forEach(piece => {
            let result = piece.connect();
            if (!connector && result) {
                connector = result;
            }
        });

        return connector;
    }

    public move(vector: Coordinates) {
        this._position.addVector(vector);

        this._pieces.forEach(piece => {
            piece.moveByVector(vector);
            this.calculatePieceTargetPosition(piece);
        });
    }

    public zoom(zoom: number) {
        this.calculateRatio(zoom);
        this.setSize();
        this.calculatePosition(zoom);
        this.setDestPieceSize();
        this.setOffset();

        this._pieces.forEach(piece => {
            this.zoomPiece(piece, zoom);
        });
    }

    public defaultSizeAndPosition() {
        this.calculateDefaultRatio();
        this.setSize();
        this.centerPosition();
    }

    private calculateRatio(zoom: number) {
        this._ratio *= zoom;
    }

    private calculateDefaultRatio() {
        this._ratio = 0.6 * Math.min(this._canvas.size.width / this._imageSize.width, this._canvas.size.height / this._imageSize.height);
    }

    private setSize() {
        this._size = new TabularSize(
            this._imageSize.width * this._ratio,
            this._imageSize.height * this._ratio,
            this._size.rows, this._size.cols
        );
    }

    private calculatePosition(zoom: number) {
        const vectorX = this._position.x - innerWidth / 2;
        const vectorXScaled = vectorX * zoom;
        const positionX = vectorXScaled + innerWidth / 2;

        const vectorY = this._position.y - innerHeight / 2;
        const vectorYScaled = vectorY * zoom;
        const positionY = vectorYScaled + innerHeight / 2;

        this._position = new Coordinates(positionX, positionY);
    }

    private centerPosition() {
        this._position = new Coordinates(
            (this._canvas.size.width - this._size.width) / 2,
            (this._canvas.size.height - this._size.height) / 2
        );
    }

    private setDestPieceSize() {
        this._destPieceSize = new Size(
            this._size.width / this._size.cols,
            this._size.height / this._size.rows
        );
    }

    private setOffset() {
        this._offset = new Coordinates(
            Math.round(this._destPieceSize.width / 4),
            Math.round(this._destPieceSize.height / 4)
        );
    }

    private zoomPiece(piece: Piece, zoom: number) {
        this.calculatePieceDestPosition(piece, zoom);
        this.calculatePieceTargetPosition(piece);
    }

    private calculatePieceDestPosition(piece: Piece, zoom: number) {
        const vectorX = piece.destPosition.x - innerWidth / 2;
        const vectorXScaled = vectorX * zoom;
        const destX = vectorXScaled + innerWidth / 2;

        const vectorY = piece.destPosition.y - innerHeight / 2;
        const vectorYScaled = vectorY * zoom;
        const destY = vectorYScaled + innerHeight / 2;

        piece.destPosition = new Coordinates(destX, destY);
    }

    private calculatePieceTargetPosition(piece: Piece) {
        const targetX = this._position.x + piece.col * this._destPieceSize.width;
        const targetY = this._position.y + piece.row * this._destPieceSize.height;

        piece.targetPosition = new Coordinates(targetX, targetY);
    }
}
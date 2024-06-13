import { Canvas } from "./canvas";
import { Coordinates } from "./coordinates";
import { Jigsaw } from "./jigsaw";
import { Piece } from "./piece";

export class Game {
    private _canvas: Canvas;
    private _jigsaw: Jigsaw;
    private _image: HTMLImageElement;
    private _activePiece: Piece | null;
    private _canvasDragging: Coordinates | null;
    private _started: boolean;
    private _previewEnabled: boolean;

    constructor(canvas: Canvas, jigsaw: Jigsaw, image: HTMLImageElement) {
        this._canvas = canvas;
        this._jigsaw = jigsaw;
        this._image = image;
        this._activePiece = null;
        this._canvasDragging = null;
        this._started = false;
        this._previewEnabled = false;
    }

    public get canvas() {
        return this._canvas;
    }

    public get jigsaw() {
        return this._jigsaw;
    }

    public get activePiece() {
        return this._activePiece;
    }

    public set activePiece(value: Piece | null) {
        this._activePiece = value;
    }

    public get canvasDragging() {
        return this._canvasDragging;
    }

    public set canvasDragging(value: Coordinates | null) {
        this._canvasDragging = value;
    }

    public get started() {
        return this._started;
    }

    public get previewEnabled() {
        return this._previewEnabled;
    }

    public start() {
        this._started = true;
    }

    public togglePreview() {
        this._previewEnabled = !this._previewEnabled;
    }

    public resetCanvasState() {
        this.clearCanvas();
        this.displayBoundaries();
        if (this._previewEnabled) {
            this.displayBackground();
        }
    }

    public summaryCanvasState() {
        this.clearCanvas();
        this.displayBoundaries();
        this.displayBackground(1);
    }

    public drawJigsaw() {
        this.resetCanvasState();

        this.jigsaw.pieces.forEach(piece => {
            this.drawCutPiece(piece);
        });
    }

    private clearCanvas() {
        this.canvas.context.clearRect(
            this.canvas.position.x, this.canvas.position.y,
            this.canvas.size.width, this.canvas.size.height
        );
    }

    private displayBoundaries() {
        this.canvas.context.beginPath();
        this.canvas.context.rect(
            this.jigsaw.position.x, this.jigsaw.position.y,
            this.jigsaw.size.width, this.jigsaw.size.height
        );
        this.canvas.context.stroke();
    }

    private displayBackground(alpha = 0.4) {
        this.canvas.context.save();
        this.canvas.context.globalAlpha = alpha;
        this.canvas.context.drawImage(
            this._image,
            this.jigsaw.position.x, this.jigsaw.position.y,
            this.jigsaw.size.width, this.jigsaw.size.height
        );
        this.canvas.context.restore();
    }

    private drawPiece(piece: Piece) {
        this.canvas.context.drawImage(
            this._image,
            piece.sourcePosition.x, piece.sourcePosition.y,
            this.jigsaw.sourcePieceSize.width, this.jigsaw.sourcePieceSize.height,
            piece.destPosition.x, piece.destPosition.y,
            this.jigsaw.destPieceSize.width, this.jigsaw.destPieceSize.height
        );

        this.canvas.context.strokeRect(
            piece.destPosition.x, piece.destPosition.y,
            this.jigsaw.destPieceSize.width, this.jigsaw.destPieceSize.height
        );
    }

    private drawCutPiece(piece: Piece) {
        this.canvas.context.save();
        this.canvas.context.beginPath();
        this.canvas.context.moveTo(piece.destPosition.x, piece.destPosition.y);

        let startingPoint = new Coordinates(piece.destPosition.x, piece.destPosition.y);

        const horizontalOffsetBefore = Math.round(this.jigsaw.destPieceSize.width * 3 / 8);
        const horizontalOffsetAfter = Math.round(this.jigsaw.destPieceSize.width * 5 / 8);

        const verticalOffsetBefore = Math.round(this.jigsaw.destPieceSize.height * 3 / 8);
        const verticalOffsetAfter = Math.round(this.jigsaw.destPieceSize.height * 5 / 8);

        const curveConvexityDest = Math.round(this.jigsaw.destPieceSize.width * 1 / 5);
        const curveConvexitySource = Math.round(this.jigsaw.sourcePieceSize.width * 1 / 5);

        if (piece.connections.find(x => x.direction == "top")) {
            this.drawHorizontalEdge(startingPoint, horizontalOffsetBefore, horizontalOffsetAfter, curveConvexityDest);
        }

        startingPoint.addVector(new Coordinates(this.jigsaw.destPieceSize.width, 0));
        this.canvas.context.lineTo(startingPoint.x, startingPoint.y);

        if (piece.connections.find(x => x.direction == "right")) {
            this.drawVerticalEdge(startingPoint, verticalOffsetBefore, verticalOffsetAfter, curveConvexityDest);
        }

        startingPoint.addVector(new Coordinates(0, this.jigsaw.destPieceSize.height));
        this.canvas.context.lineTo(startingPoint.x, startingPoint.y);

        if (piece.connections.find(x => x.direction == "bottom")) {
            this.drawHorizontalEdge(startingPoint, -horizontalOffsetBefore, -horizontalOffsetAfter, curveConvexityDest);
        }

        startingPoint.addVector(new Coordinates(-this.jigsaw.destPieceSize.width, 0));
        this.canvas.context.lineTo(startingPoint.x, startingPoint.y);

        if (piece.connections.find(x => x.direction == "left")) {
            this.drawVerticalEdge(startingPoint, -verticalOffsetBefore, -verticalOffsetAfter, curveConvexityDest);
        }

        this.canvas.context.lineTo(piece.destPosition.x, piece.destPosition.y);

        this.canvas.context.stroke();
        this.canvas.context.clip();

        this.canvas.context.drawImage(
            this._image,
            piece.sourcePosition.x, piece.sourcePosition.y,
            this.jigsaw.sourcePieceSize.width + curveConvexitySource, this.jigsaw.sourcePieceSize.height + curveConvexitySource,
            piece.destPosition.x, piece.destPosition.y,
            this.jigsaw.destPieceSize.width + curveConvexityDest, this.jigsaw.destPieceSize.height + curveConvexityDest
        );

        this.canvas.context.restore();
    }

    private drawHorizontalEdge(startingPoint: Coordinates, offsetBefore: number, offsetAfter: number, curveConvexity: number) {
        this.canvas.context.lineTo(startingPoint.x + offsetBefore, startingPoint.y);
        this.canvas.context.bezierCurveTo(
            startingPoint.x + offsetBefore, startingPoint.y + curveConvexity,
            startingPoint.x + offsetAfter, startingPoint.y + curveConvexity,
            startingPoint.x + offsetAfter, startingPoint.y
        );
    }

    private drawVerticalEdge(startingPoint: Coordinates, offsetBefore: number, offsetAfter: number, curveConvexity: number) {
        this.canvas.context.lineTo(startingPoint.x, startingPoint.y + offsetBefore);
        this.canvas.context.bezierCurveTo(
            startingPoint.x + curveConvexity, startingPoint.y + offsetBefore,
            startingPoint.x + curveConvexity, startingPoint.y + offsetAfter,
            startingPoint.x, startingPoint.y + offsetAfter
        );
    }
}
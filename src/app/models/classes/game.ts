import { Canvas } from "./canvas";
import { Direction } from "./connection";
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

    public drawJigsaw() {
        this.resetCanvasState();

        this.jigsaw.pieces.forEach(piece => {
            this.drawCutPiece(piece);
        });
    }

    public drawFinishedJigsaw() {
        this.clearCanvas();
        this.displayBoundaries();
        this.displayBackground(1);
    }

    private resetCanvasState() {
        this.clearCanvas();
        this.displayBoundaries();
        if (this._previewEnabled) {
            this.displayBackground();
        }
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
        let connection;

        if (connection = piece.connections.find(x => x.direction == Direction.Top)) {
            this.drawHorizontalBezierEdge(startingPoint, Direction.Top, connection.type);
            startingPoint.addVector(new Coordinates(this.jigsaw.destPieceSize.width, 0));
        } else {
            startingPoint.addVector(new Coordinates(this.jigsaw.destPieceSize.width, 0));
            this.canvas.context.lineTo(startingPoint.x, startingPoint.y);
        }

        if (connection = piece.connections.find(x => x.direction == Direction.Right)) {
            this.drawVerticalBezierEdge(startingPoint, Direction.Right, connection.type);
            startingPoint.addVector(new Coordinates(0, this.jigsaw.destPieceSize.height));
        } else {
            startingPoint.addVector(new Coordinates(0, this.jigsaw.destPieceSize.height));
            this.canvas.context.lineTo(startingPoint.x, startingPoint.y);
        }

        if (connection = piece.connections.find(x => x.direction == Direction.Bottom)) {
            this.drawHorizontalBezierEdge(startingPoint, Direction.Bottom, connection.type);
            startingPoint.addVector(new Coordinates(-this.jigsaw.destPieceSize.width, 0));
        } else {
            startingPoint.addVector(new Coordinates(-this.jigsaw.destPieceSize.width, 0));
            this.canvas.context.lineTo(startingPoint.x, startingPoint.y);
        }

        if (connection = piece.connections.find(x => x.direction == Direction.Left)) {
            this.drawVerticalBezierEdge(startingPoint, Direction.Left, connection.type);
        } else {
            this.canvas.context.lineTo(piece.destPosition.x, piece.destPosition.y);
        }

        this.canvas.context.stroke();
        this.canvas.context.clip();

        const curveConvexitySource = Math.round(Math.max(this.jigsaw.sourcePieceSize.width, this.jigsaw.sourcePieceSize.height) * 0.1);
        const curveConvexityDest = Math.round(Math.max(this.jigsaw.destPieceSize.width, this.jigsaw.destPieceSize.height) * 0.1);

        this.canvas.context.drawImage(
            this._image,
            piece.sourcePosition.x - curveConvexitySource, piece.sourcePosition.y - curveConvexitySource,
            this.jigsaw.sourcePieceSize.width + 2 * curveConvexitySource, this.jigsaw.sourcePieceSize.height + 2 * curveConvexitySource,
            piece.destPosition.x - curveConvexityDest, piece.destPosition.y - curveConvexityDest,
            this.jigsaw.destPieceSize.width + 2 * curveConvexityDest, this.jigsaw.destPieceSize.height + 2 * curveConvexityDest
        );

        this.canvas.context.restore();
    }

    private drawHorizontalBezierEdge(start: Coordinates, direction: Direction, type: number) {
        let controlPoints: Coordinates[][] = [];
        const unit = this.jigsaw.destPieceSize.width;
        const sign = direction == Direction.Top ? 1 : -1;

        let cp1 = new Coordinates(start.x, start.y);
        let cp2 = new Coordinates(start.x + sign * Math.round(unit * 0.4), start.y + type * Math.round(unit * 0.1));
        let ep = new Coordinates(start.x + sign * Math.round(unit * 0.4), start.y + type * Math.round(unit * 0.075));
        controlPoints.push([cp1, cp2, ep]);

        cp1 = new Coordinates(ep.x, ep.y);
        cp2 = new Coordinates(start.x + sign * Math.round(unit * 0.45), start.y + type * Math.round(unit * 0.05));
        ep = new Coordinates(start.x + sign * Math.round(unit * 0.4), start.y);
        controlPoints.push([cp1, cp2, ep]);

        cp1 = new Coordinates(ep.x, ep.y);
        cp2 = new Coordinates(start.x + sign * Math.round(unit * 0.25), start.y - type * Math.round(unit * 0.1));
        ep = new Coordinates(start.x + sign * Math.round(unit * 0.5), start.y - type * Math.round(unit * 0.1));
        controlPoints.push([cp1, cp2, ep]);

        for (let i = controlPoints.length - 1; i >= 0; i--) {
            const bezierSet = controlPoints[i];
            let bezierSetReflection: Coordinates[] = [];

            bezierSet.forEach(point => {
                const pointReflection = point.getVerticalReflection(start.x + sign * (unit / 2));
                bezierSetReflection.push(pointReflection);
            });

            controlPoints.push(bezierSetReflection.slice().reverse());
        }

        controlPoints.forEach(bezierSet => this.drawBezierCurve(bezierSet));
    }

    private drawVerticalBezierEdge(start: Coordinates, direction: Direction, type: number) {
        let controlPoints: Coordinates[][] = [];
        const unit = this.jigsaw.destPieceSize.height;
        const sign = direction == Direction.Right ? 1 : -1;

        let cp1 = new Coordinates(start.x, start.y);
        let cp2 = new Coordinates(start.x + type * Math.round(unit * 0.1), start.y + sign * Math.round(unit * 0.4));
        let ep = new Coordinates(start.x + type * Math.round(unit * 0.075), start.y + sign * Math.round(unit * 0.4));
        controlPoints.push([cp1, cp2, ep]);

        cp1 = new Coordinates(ep.x, ep.y);
        cp2 = new Coordinates(start.x + type * Math.round(unit * 0.05), start.y + sign * Math.round(unit * 0.45));
        ep = new Coordinates(start.x, start.y + sign * Math.round(unit * 0.4));
        controlPoints.push([cp1, cp2, ep]);

        cp1 = new Coordinates(ep.x, ep.y);
        cp2 = new Coordinates(start.x - type * Math.round(unit * 0.1), start.y + sign * Math.round(unit * 0.25));
        ep = new Coordinates(start.x - type * Math.round(unit * 0.1), start.y + sign * Math.round(unit * 0.5));
        controlPoints.push([cp1, cp2, ep]);

        for (let i = controlPoints.length - 1; i >= 0; i--) {
            const bezierSet = controlPoints[i];
            let bezierSetReflection: Coordinates[] = [];

            bezierSet.forEach(point => {
                const pointReflection = point.getHorizontalReflection(start.y + sign * (unit / 2));
                bezierSetReflection.push(pointReflection);
            });

            controlPoints.push(bezierSetReflection.slice().reverse());
        }

        controlPoints.forEach(bezierSet => this.drawBezierCurve(bezierSet));
    }

    private drawBezierCurve(bezierSet: Coordinates[]) {
        this.canvas.context.bezierCurveTo(
            bezierSet[0].x, bezierSet[0].y,
            bezierSet[1].x, bezierSet[1].y,
            bezierSet[2].x, bezierSet[2].y,
        );
    }
}
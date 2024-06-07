import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Piece } from '../../models/piece';
import { Canvas } from '../../models/canvas';
import { Jigsaw } from '../../models/jigsaw';
import { Coordinates } from '../../models/coordinates';

@Component({
  selector: 'app-jigsaw-canvas',
  templateUrl: './jigsaw-canvas.component.html',
  styleUrls: ['./jigsaw-canvas.component.scss']
})
export class JigsawCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;

  context!: CanvasRenderingContext2D;

  canvas!: Canvas;
  jigsaw!: Jigsaw;

  activePiece: Piece | null = null;

  size = { rows: 7, cols: 10 };
  scale = { canvas: 1.5, jigsaw: 0.75 };
  alpha = 0.4;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeContext();

      this.adjustCanvas();
      this.resetCanvasState();

      this.prepareJigsaw();
    }, 1000);
  }

  initializeContext() {
    this.context = this.canvasElement.nativeElement.getContext('2d')!;
  }

  adjustCanvas() {
    this.initializeCanvas();
    this.setCanvasElementSize();
    this.initializeJigsaw();
  }

  resetCanvasState() {
    this.clearCanvas();
    this.displayBoundaries();
    this.displayBackground();
  }

  initializeCanvas() {
    this.canvas = new Canvas(
      innerWidth, innerHeight,
      0, 0,
      this.scale.canvas
    );
  }

  setCanvasElementSize() {
    this.canvasElement.nativeElement.width = this.canvas.size.width;
    this.canvasElement.nativeElement.height = this.canvas.size.height;
  }

  initializeJigsaw() {
    this.jigsaw = new Jigsaw(
      this.size.rows, this.size.cols,
      this.imageElement.nativeElement.width,
      this.imageElement.nativeElement.height,
      innerWidth, innerHeight, this.scale.jigsaw
    );
  }

  clearCanvas() {
    this.context.clearRect(
      this.canvas.position.x, this.canvas.position.y,
      this.canvas.size.width, this.canvas.size.height
    );
  }

  displayBoundaries() {
    this.context.beginPath();
    this.context.rect(
      this.jigsaw.position.x, this.jigsaw.position.y,
      this.jigsaw.size.width, this.jigsaw.size.height
    );
    this.context.stroke();
    this.context.save();
  }

  displayBackground() {
    this.context.save();
    this.context.globalAlpha = this.alpha;
    this.context.drawImage(
      this.imageElement.nativeElement,
      this.jigsaw.position.x, this.jigsaw.position.y,
      this.jigsaw.size.width, this.jigsaw.size.height
    );
    this.context.restore();
  }

  prepareJigsaw() {
    for (let row = 0; row < this.jigsaw.size.rows; row++) {
      for (let col = 0; col < this.jigsaw.size.cols; col++) {
        const piece = this.createPiece(row, col);
        this.drawPiece(piece);
      }
    }
  }

  createPiece(row: number, col: number) {
    const sourceX = this.jigsaw.sourcePieceSize.width * col;
    const sourceY = this.jigsaw.sourcePieceSize.height * row;
    const destX = Math.random() * (innerWidth - this.jigsaw.destPieceSize.width);
    const destY = Math.random() * (innerHeight - this.jigsaw.destPieceSize.height);
    const targetX = this.jigsaw.position.x + col * this.jigsaw.destPieceSize.width;
    const targetY = this.jigsaw.position.y + row * this.jigsaw.destPieceSize.height;

    const piece = new Piece(
      row, col,
      sourceX, sourceY,
      destX, destY,
      targetX, targetY
    );

    this.jigsaw.addPiece(piece);

    return piece;
  }

  drawPiece(piece: Piece) {
    this.context.drawImage(
      this.imageElement.nativeElement,
      piece.sourcePosition.x, piece.sourcePosition.y,
      this.jigsaw.sourcePieceSize.width, this.jigsaw.sourcePieceSize.height,
      piece.destPosition.x, piece.destPosition.y,
      this.jigsaw.destPieceSize.width, this.jigsaw.destPieceSize.height
    );
  }

  drawJigsaw() {
    this.resetCanvasState();

    this.jigsaw.pieces.forEach(piece => {
      this.drawPiece(piece);
    });
  }

  pickUpPiece(event: MouseEvent) {
    for (let i = this.jigsaw.pieces.length - 1; i >= 0 && !this.activePiece; i--) {
      const piece = this.jigsaw.pieces[i];

      if (!piece.locked && this.isMouseOverPiece(piece, event.pageX, event.pageY)) {
        this.activePiece = piece;
      }
    }
  }

  dragPiece(event: MouseEvent) {
    if (!this.activePiece) return;

    const adjacentPieces = this.getGroupOfAdjacentPieces(this.activePiece)
    const newPosition = this.calculateActivePiecePosition(event);
    const vector = this.calculateVector(event, this.activePiece.destPosition);

    adjacentPieces.forEach(piece => {
      this.jigsaw.movePieceToTop(piece);

      if (piece != this.activePiece) {
        piece.setPositionBasedOnVector(vector);
      } else {
        piece.setPosition(newPosition);
      }
    });

    this.drawJigsaw();
  }

  dropPiece(event: MouseEvent) {
    if (!this.activePiece) return;

    const adjacentPieces = this.getGroupOfAdjacentPieces(this.activePiece);

    if (this.isPieceInTargetPosition(this.activePiece, event.pageX, event.pageY)) {
      adjacentPieces.forEach(piece => {
        this.jigsaw.movePieceToBottom(piece);
        piece.setPositionToTarget();
        piece.lock();
      });

      this.drawJigsaw();
    } else {
      const connector = this.findConnectionsBetweenPieces(adjacentPieces);

      if (connector) {
        adjacentPieces.forEach(piece => {
          this.jigsaw.movePieceToTop(piece);
          piece.setPositionBasedOnReferencePiece(connector);
        });

        this.drawJigsaw();
      }
    }

    this.activePiece = null;
  }

  getGroupOfAdjacentPieces(piece: Piece, allAdjacentPieces: Piece[] = []) {
    const adjacentPieces = piece.connections
      .filter(connection => connection.connected)
      .map(connection => this.jigsaw.getPiece(connection.row, connection.col));

    allAdjacentPieces.push(piece);

    adjacentPieces.forEach(adjacentPiece => {
      if (!allAdjacentPieces.includes(adjacentPiece)) {
        this.getGroupOfAdjacentPieces(adjacentPiece, allAdjacentPieces);
      }
    });

    return allAdjacentPieces;
  }

  calculateActivePiecePosition(event: MouseEvent) {
    return new Coordinates(
      event.pageX - this.jigsaw.destPieceSize.width / 2,
      event.pageY - this.jigsaw.destPieceSize.height / 2
    );
  }

  calculateVector(event: MouseEvent, currentPosition: Coordinates) {
    return new Coordinates(
      event.pageX - this.jigsaw.destPieceSize.width / 2 - currentPosition.x,
      event.pageY - this.jigsaw.destPieceSize.height / 2 - currentPosition.y
    );
  }

  isMouseOverPiece(piece: Piece, x: number, y: number) {
    if (x >= piece.destPosition.x && x <= piece.destPosition.x + this.jigsaw.destPieceSize.width
      && y >= piece.destPosition.y && y <= piece.destPosition.y + this.jigsaw.destPieceSize.height) {
      return true;
    } else {
      return false;
    }
  }

  isPieceInTargetPosition(piece: Piece, x: number, y: number) {
    if (x >= piece.targetPosition.x + this.jigsaw.offset.x
      && x <= piece.targetPosition.x + this.jigsaw.destPieceSize.width - this.jigsaw.offset.x
      && y >= piece.targetPosition.y + this.jigsaw.offset.x
      && y <= piece.targetPosition.y + this.jigsaw.destPieceSize.height - this.jigsaw.offset.y) {
      return true;
    } else {
      return false;
    }
  }

  findConnectionsBetweenPieces(adjacentPieces: Piece[]) {
    let connector: Piece | null = null;

    adjacentPieces.forEach(piece => {
      let result = this.connectPiece(piece);
      if (result) {
        connector = result;
      }
    });

    return connector;
  }

  connectPiece(piece: Piece) {
    let connector: Piece | null = null;

    for (let i = 0; i < piece.connections.length && !connector; i++) {
      const connection = piece.connections[i];
      const adjacentPiece = this.jigsaw.getPiece(connection.row, connection.col);

      if (!adjacentPiece || connection.connected) continue;

      switch (connection.direction) {
        case 'left':
          if (this.canBeConnectedOnLeft(piece, adjacentPiece)) {
            piece.setConnection('left');
            adjacentPiece.setConnection('right');
            connector = adjacentPiece;
          }
          break;

        case 'right':
          if (this.canBeConnectedOnRight(piece, adjacentPiece)) {
            piece.setConnection('right');
            adjacentPiece.setConnection('left');
            connector = adjacentPiece;
          }
          break;

        case 'top':
          if (this.canBeConnectedOnTop(piece, adjacentPiece)) {
            piece.setConnection('top');
            adjacentPiece.setConnection('bottom');
            connector = adjacentPiece;
          }
          break;

        case 'bottom':
          if (this.canBeConnectedOnBottom(piece, adjacentPiece)) {
            piece.setConnection('bottom');
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

  canBeConnectedOnLeft(piece: Piece, adjacentPiece: Piece) {
    if (Math.abs(adjacentPiece.destPosition.x + this.jigsaw.destPieceSize.width - piece.destPosition.x)
      <= this.jigsaw.offset.x
      && Math.abs(adjacentPiece.destPosition.y - piece.destPosition.y) <= this.jigsaw.offset.y) {
      return true;
    } else {
      return false;
    }
  }

  canBeConnectedOnRight(piece: Piece, adjacentPiece: Piece) {
    if (Math.abs(piece.destPosition.x + this.jigsaw.destPieceSize.width - adjacentPiece.destPosition.x)
      <= this.jigsaw.offset.x
      && Math.abs(adjacentPiece.destPosition.y - piece.destPosition.y) <= this.jigsaw.offset.y) {
      return true;
    } else {
      return false;
    }
  }

  canBeConnectedOnTop(piece: Piece, adjacentPiece: Piece) {
    if (Math.abs(adjacentPiece.destPosition.y + this.jigsaw.destPieceSize.height - piece.destPosition.y)
      <= this.jigsaw.offset.y
      && Math.abs(adjacentPiece.destPosition.x - piece.destPosition.x) <= this.jigsaw.offset.x) {
      return true;
    } else {
      return false;
    }
  }

  canBeConnectedOnBottom(piece: Piece, adjacentPiece: Piece) {
    if (Math.abs(piece.destPosition.y + this.jigsaw.destPieceSize.height - adjacentPiece.destPosition.y)
      <= this.jigsaw.offset.y
      && Math.abs(adjacentPiece.destPosition.x - piece.destPosition.x) <= this.jigsaw.offset.x) {
      return true;
    } else {
      return false;
    }
  }
}
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Piece } from '../../models/piece';
import { Canvas } from '../../models/canvas';
import { Jigsaw } from '../../models/jigsaw';
import { Coordinates } from '../../models/coordinates';
import { GameSettings } from '../../models/gameSettings';
import { GameService } from '../../services/game.service';
import { Subscription } from 'rxjs';
import { BoardSettings } from '../../models/boardSettiings';

@Component({
  selector: 'app-jigsaw-canvas',
  templateUrl: './jigsaw-canvas.component.html',
  styleUrls: ['./jigsaw-canvas.component.scss']
})
export class JigsawCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;
  @Input() gameSettings!: GameSettings;
  boardSettings!: BoardSettings;
  boardSettingsSubscription!: Subscription;

  context!: CanvasRenderingContext2D;

  canvas!: Canvas;
  jigsaw!: Jigsaw;

  activePiece: Piece | null = null;

  scale = { canvas: 1.5, jigsaw: 0.6 };
  alpha = 0.4;

  jigsawInitialized = false;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;

        if (this.jigsawInitialized) {
          if (boardSettings.zoomChange != 0) {
            const pieces = this.jigsaw.pieces;

            this.initializeJigsaw();

            pieces.forEach(piece => {
              this.transformPiece(piece);
            });
          }

          this.drawJigsaw();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeContext();
    this.initializeImageElement();

    setTimeout(() => {
      this.adjustCanvas();
      this.resetCanvasState();

      this.prepareJigsaw();
    }, 500);
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
  }

  initializeImageElement() {
    this.imageElement.nativeElement.src = URL.createObjectURL(this.gameSettings.image);
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
    this.manageFullscreen();
    this.clearCanvas();
    this.displayBoundaries();
    if (this.boardSettings.preview) {
      this.displayBackground();
    }
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
      this.gameSettings.rows, this.gameSettings.cols,
      this.imageElement.nativeElement.width,
      this.imageElement.nativeElement.height,
      innerWidth, innerHeight, this.scale.jigsaw * this.boardSettings.zoom
    );
  }

  manageFullscreen() {
    if (this.boardSettings.fullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  clearCanvas() {
    this.context.clearRect(
      this.canvas.position.x, this.canvas.position.y,
      this.canvas.size.width, this.canvas.size.height
    );
    const gradient = this.context.createLinearGradient(
      this.canvas.position.x, this.canvas.position.y, 
      this.canvas.position.x, this.canvas.position.y + this.canvas.size.height
    );

    gradient.addColorStop(0, 'rgba(207, 128, 48, 0.5)');
    gradient.addColorStop(1, 'rgba(26, 28, 39, 0.8)');

    this.context.fillStyle = gradient;
    this.context.fillRect(
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
        this.createPiece(row, col);
      }
    }

    this.drawJigsaw();
    this.jigsawInitialized = true;
  }

  createPiece(row: number, col: number) {
    const sourceX = this.jigsaw.sourcePieceSize.width * col;
    const sourceY = this.jigsaw.sourcePieceSize.height * row;

    let max = innerWidth - 3 * this.jigsaw.destPieceSize.width;
    let min = this.jigsaw.destPieceSize.width;
    const destX = Math.floor(Math.random() * (max - min) + min);

    max = innerHeight - 2 * this.jigsaw.destPieceSize.height;
    min = this.jigsaw.destPieceSize.height;
    const destY = Math.floor(Math.random() * (max - min) + min);

    const targetX = this.jigsaw.position.x + col * this.jigsaw.destPieceSize.width;
    const targetY = this.jigsaw.position.y + row * this.jigsaw.destPieceSize.height;

    const piece = new Piece(
      row, col,
      sourceX, sourceY,
      destX, destY,
      targetX, targetY
    );

    this.jigsaw.addPiece(piece);
  }

  transformPiece(piece: Piece) {
    const vectorX = piece.destPosition.x - innerWidth / 2;
    const vectorXScaled = vectorX * this.boardSettings.zoomChange;
    const destX = vectorXScaled + innerWidth / 2;

    const vectorY = piece.destPosition.y - innerHeight / 2;
    const vectorYScaled = vectorY * this.boardSettings.zoomChange;
    const destY = vectorYScaled + innerHeight / 2;

    const targetX = this.jigsaw.position.x + piece.col * this.jigsaw.destPieceSize.width;
    const targetY = this.jigsaw.position.y + piece.row * this.jigsaw.destPieceSize.height;

    piece.setDestPosition(new Coordinates(destX, destY));
    piece.setTargetPosition(new Coordinates(targetX, targetY));

    this.jigsaw.addPiece(piece);
  }

  drawPiece(piece: Piece) {
    this.context.drawImage(
      this.imageElement.nativeElement,
      piece.sourcePosition.x, piece.sourcePosition.y,
      this.jigsaw.sourcePieceSize.width, this.jigsaw.sourcePieceSize.height,
      piece.destPosition.x, piece.destPosition.y,
      this.jigsaw.destPieceSize.width, this.jigsaw.destPieceSize.height
    );

    this.context.strokeRect(
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

      if (!piece.locked && this.isMouseOverPiece(piece, event)) {
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
        piece.setDestPosition(newPosition);
      }
    });

    this.drawJigsaw();
  }

  dropPiece(event: MouseEvent) {
    if (!this.activePiece) return;

    const adjacentPieces = this.getGroupOfAdjacentPieces(this.activePiece);

    if (this.isPieceInTargetPosition(this.activePiece, event)) {
      adjacentPieces.forEach(piece => {
        this.jigsaw.movePieceToBottom(piece);
        piece.setPositionToTarget();
        piece.lock();
      });

      this.drawJigsaw();
    } else {
      const connector = this.findConnectionsBetweenPieces(adjacentPieces);

      if (connector) {
        this.jigsaw.movePieceToTop(connector);

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

  getMousePosition(event: MouseEvent) {
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  calculateActivePiecePosition(event: MouseEvent) {
    const position = this.getMousePosition(event);

    return new Coordinates(
      position.x - this.jigsaw.destPieceSize.width / 2,
      position.y - this.jigsaw.destPieceSize.height / 2
    );
  }

  calculateVector(event: MouseEvent, currentPosition: Coordinates) {
    const position = this.getMousePosition(event);

    return new Coordinates(
      position.x - this.jigsaw.destPieceSize.width / 2 - currentPosition.x,
      position.y - this.jigsaw.destPieceSize.height / 2 - currentPosition.y
    );
  }

  isMouseOverPiece(piece: Piece, event: MouseEvent) {
    const position = this.getMousePosition(event);

    if (position.x >= piece.destPosition.x && position.x <= piece.destPosition.x + this.jigsaw.destPieceSize.width
      && position.y >= piece.destPosition.y && position.y <= piece.destPosition.y + this.jigsaw.destPieceSize.height) {
      return true;
    } else {
      return false;
    }
  }

  isPieceInTargetPosition(piece: Piece, event: MouseEvent) {
    const position = this.getMousePosition(event);

    if (position.x >= piece.targetPosition.x + this.jigsaw.offset.x
      && position.x <= piece.targetPosition.x + this.jigsaw.destPieceSize.width - this.jigsaw.offset.x
      && position.y >= piece.targetPosition.y + this.jigsaw.offset.x
      && position.y <= piece.targetPosition.y + this.jigsaw.destPieceSize.height - this.jigsaw.offset.y) {
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
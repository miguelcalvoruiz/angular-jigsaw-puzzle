import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Piece } from '../../models/classes/piece';
import { Canvas } from '../../models/classes/canvas';
import { Jigsaw } from '../../models/classes/jigsaw';
import { Coordinates } from '../../models/classes/coordinates';
import { GameSettings } from '../../models/interfaces/gameSettings';
import { GameService } from '../../services/game/game.service';
import { Subscription } from 'rxjs';
import { BoardSettings } from '../../models/interfaces/boardSettiings';
import { ProgressBar } from '../../models/interfaces/progressBar';
import { Game } from '../../models/classes/game';
import { GameProgress } from '../../models/interfaces/game-progress';

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
  gameProgress!: GameProgress;
  gameProgressSubscription!: Subscription;

  game!: Game;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;

        if (this.game && this.game.started) {
          if (boardSettings.zoomChange != 0) {
            this.game.jigsaw.zoom(this.boardSettings.zoomChange);
          }

          if (boardSettings.preview != this.game.previewEnabled) {
            this.game.togglePreview();
          }
          this.toggleFullImage();
          this.game.drawJigsaw();
        }
      }
    });

    this.gameProgressSubscription = this.gameService.gameProgress$.subscribe(gameProgress => {
      if (gameProgress) {
        this.gameProgress = gameProgress;
      }
    });
  }

  ngAfterViewInit(): void {
    this.setImageElementSrc();

    setTimeout(() => {
      this.initializeGame();
      this.setCanvasElementSize();
      this.prepareJigsaw();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
    this.gameProgressSubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.game.canvas.resetSize();
    this.setCanvasElementSize();

    if (this.gameProgress.progressBar.value == 100) {
      this.game.jigsaw.defaultSizeAndPosition();
      this.game.drawFinishedJigsaw();
    } else {
      this.game.drawJigsaw();
    }
  }

  setImageElementSrc() {
    this.imageElement.nativeElement.src = URL.createObjectURL(this.gameSettings.image);
  }

  setCanvasElementSize() {
    this.canvasElement.nativeElement.width = this.game.canvas.size.width;
    this.canvasElement.nativeElement.height = this.game.canvas.size.height;
  }

  toggleFullImage() {
    if (this.boardSettings.fullImage) {
      this.imageElement.nativeElement.style.display = 'initial';
    } else {
      this.imageElement.nativeElement.style.display = 'none';
    }
  }

  initializeGame() {
    const canvas = new Canvas(
      this.canvasElement.nativeElement.getContext('2d')!
    );
    const jigsaw = new Jigsaw(
      canvas,
      this.gameSettings.rows, this.gameSettings.cols,
      this.imageElement.nativeElement.width,
      this.imageElement.nativeElement.height
    );
    this.game = new Game(canvas, jigsaw, this.imageElement.nativeElement);
  }

  prepareJigsaw() {
    this.game.jigsaw.createPieces();
    this.game.drawJigsaw();
    this.game.start();
  }

  pickUpPiece(event: MouseEvent) {
    for (let i = this.game.jigsaw.pieces.length - 1; i >= 0 && !this.game.activePiece; i--) {
      const piece = this.game.jigsaw.pieces[i];

      if (!piece.locked && this.isMouseOverPiece(piece, event)) {
        this.game.activePiece = piece;
      }
    }

    if (!this.game.activePiece) {
      this.game.canvasDragging = new Coordinates(event.clientX, event.clientY);
    }
  }

  dragPiece(event: MouseEvent) {
    if (this.game.activePiece) {
      const adjacentPieces = this.game.jigsaw.getGroupOfAdjacentPieces(this.game.activePiece)
      const vector = this.calculateActivePieceVector(event);

      this.game.activePiece.destPosition = this.calculateActivePiecePosition(event);

      adjacentPieces.forEach(piece => {
        this.game.jigsaw.movePieceToTop(piece);

        if (piece != this.game.activePiece) {
          piece.moveByVector(vector);
        }
      });

    } else if (this.game.canvasDragging) {
      const vector = new Coordinates(
        event.clientX - this.game.canvasDragging.x,
        event.clientY - this.game.canvasDragging.y
      );

      this.game.jigsaw.move(vector);

      this.game.canvasDragging = new Coordinates(event.clientX, event.clientY);
    }

    this.game.drawJigsaw();
  }

  dropPiece(event: MouseEvent) {
    if (this.game.canvasDragging) {
      this.game.canvasDragging = null;
    } else if (this.game.activePiece) {
      const adjacentPieces = this.game.jigsaw.getGroupOfAdjacentPieces(this.game.activePiece);

      if (this.isMouseOverTargetPosition(this.game.activePiece, event)) {
        adjacentPieces.forEach(piece => {
          this.game.jigsaw.movePieceToBottom(piece);
          piece.setPositionToTarget();
          piece.lock();
          this.gameService.updateProgressBar();
        });
      } else {
        const connector = this.game.jigsaw.findConnectionsBetweenPieces(adjacentPieces);

        if (connector) {
          this.game.jigsaw.movePieceToTop(connector);

          adjacentPieces.forEach(piece => {
            this.game.jigsaw.movePieceToTop(piece);
            piece.setPositionBasedOnReferencePiece(connector);
          });
        }
      }

      this.game.activePiece = null;

      if (this.gameProgress.progressBar.value == 100) {
        this.game.jigsaw.defaultSizeAndPosition();
        this.imageElement.nativeElement.style.display = 'none';
        this.game.drawFinishedJigsaw();
      } else {
        this.game.drawJigsaw();
      }
      this.game.activePiece = null;
    }
  }

  getMousePosition(event: MouseEvent) {
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  isMouseOverPiece(piece: Piece, event: MouseEvent) {
    const position = this.getMousePosition(event);

    if (position.x >= piece.destPosition.x && position.x <= piece.destPosition.x + this.game.jigsaw.destPieceSize.width
      && position.y >= piece.destPosition.y && position.y <= piece.destPosition.y + this.game.jigsaw.destPieceSize.height) {
      return true;
    } else {
      return false;
    }
  }

  isMouseOverTargetPosition(piece: Piece, event: MouseEvent) {
    const position = this.getMousePosition(event);

    if (position.x >= piece.targetPosition.x + this.game.jigsaw.offset.x
      && position.x <= piece.targetPosition.x + this.game.jigsaw.destPieceSize.width - this.game.jigsaw.offset.x
      && position.y >= piece.targetPosition.y + this.game.jigsaw.offset.x
      && position.y <= piece.targetPosition.y + this.game.jigsaw.destPieceSize.height - this.game.jigsaw.offset.y) {
      return true;
    } else {
      return false;
    }
  }

  calculateActivePiecePosition(event: MouseEvent) {
    const position = this.getMousePosition(event);

    return new Coordinates(
      position.x - Math.round(this.game.jigsaw.destPieceSize.width / 2),
      position.y - Math.round(this.game.jigsaw.destPieceSize.height / 2)
    );
  }

  calculateActivePieceVector(event: MouseEvent) {
    const position = this.getMousePosition(event);

    return new Coordinates(
      position.x - Math.round(this.game.jigsaw.destPieceSize.width / 2) - this.game.activePiece!.destPosition.x,
      position.y - Math.round(this.game.jigsaw.destPieceSize.height / 2) - this.game.activePiece!.destPosition.y
    );
  }
}
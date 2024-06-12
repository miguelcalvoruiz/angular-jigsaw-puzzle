import { Injectable } from '@angular/core';
import { GameSettings } from '../../models/interfaces/gameSettings';
import { BehaviorSubject, take } from 'rxjs';
import { BoardSettings } from '../../models/interfaces/boardSettiings';
import { GameProgress } from '../../models/interfaces/game-progress';
import { Stopwatch } from '../../models/interfaces/stopWatch';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameSettings = new BehaviorSubject<GameSettings | null>(null);
  public gameSettings$ = this.gameSettings.asObservable();
  private boardSettings = new BehaviorSubject<BoardSettings | null>(null);
  public boardSettings$ = this.boardSettings.asObservable();
  private gameProgress = new BehaviorSubject<GameProgress | null>(null);
  public gameProgress$ = this.gameProgress.asObservable();

  constructor() { }

  setGameSettings(gameSettings: GameSettings) {
    this.gameSettings.next(gameSettings);
  }

  setBoardSettings(boardSettings: BoardSettings) {
    this.boardSettings.next(boardSettings);
  }

  setGameProgress(gameProgress: GameProgress) {
    this.gameProgress.next(gameProgress);
  }

  zoomIn() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings && settings.zoomLevel < 10) {
        settings.zoom *= 10 / 9;
        settings.zoomChange = 10 / 9;
        settings.zoomLevel++;
        this.boardSettings.next(settings);
      }
    });
  }


  zoomOut() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings && settings.zoomLevel > -5) {
        settings.zoom *= 9 / 10;
        settings.zoomChange = 9 / 10;
        settings.zoomLevel--;
        this.boardSettings.next(settings);
      }
    });
  }

  toggleFullImage() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings) {
        settings.fullImage = !settings.fullImage;
        settings.zoomChange = 0;
        this.boardSettings.next(settings);
      }
    });
  }

  togglePreview() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings) {
        settings.preview = !settings.preview;
        settings.zoomChange = 0;
        this.boardSettings.next(settings);
      }
    });
  }

  toggleTimer() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings) {
        settings.timer = !settings.timer;
        settings.zoomChange = 0;
        this.boardSettings.next(settings);
      }
    });
  }

  toggleFullscreen() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings) {
        settings.fullscreen = !settings.fullscreen;
        settings.zoomChange = 0;
        this.boardSettings.next(settings);
      }
    });
  }

  updateProgressBar() {
    this.gameProgress$.pipe(take(1)).subscribe(progress => {
      if (progress) {
        progress.progressBar.currentPieces++;
        progress.progressBar.value = (progress.progressBar.currentPieces / progress.progressBar.allPieces) * 100;
        this.gameProgress.next(progress);
      }
    });
  }

  recordTime(stopwatch: Stopwatch) {
    this.gameProgress$.pipe(take(1)).subscribe(progress => {
      if (progress) {
        progress.time = stopwatch;
        this.gameProgress.next(progress);
      }
    });
  }
}

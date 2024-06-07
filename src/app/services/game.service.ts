import { Injectable } from '@angular/core';
import { GameSettings } from '../models/gameSettings';
import { BehaviorSubject, take } from 'rxjs';
import { BoardSettings } from '../models/boardSettiings';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameSettings = new BehaviorSubject<GameSettings | null>(null);
  public gameSettings$ = this.gameSettings.asObservable();
  private boardSettings = new BehaviorSubject<BoardSettings | null>(null);
  public boardSettings$ = this.boardSettings.asObservable();

  constructor() { }

  setGameSettings(gameSettings: GameSettings) {
    this.gameSettings.next(gameSettings);
  }

  setBoardSettings(boardSettings: BoardSettings) {
    this.boardSettings.next(boardSettings);
  }

  zoomIn() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings && settings.zoomLevel < 5) {
        settings.zoom *= 10/9;
        settings.zoomChange = 10/9;
        settings.zoomLevel++;
        this.boardSettings.next(settings);
      }
    });
  }


  zoomOut() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings && settings.zoomLevel > -5) {
        settings.zoom *= 9/10;
        settings.zoomChange = 9/10;
        settings.zoomLevel--;
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

  toggleFullscreen() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings) {
        settings.fullscreen = !settings.fullscreen;
        settings.zoomChange = 0;
        this.boardSettings.next(settings);
      }
    });
  }
}

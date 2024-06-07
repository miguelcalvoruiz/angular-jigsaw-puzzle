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

  togglePreview() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings) {
        settings.preview = !settings.preview;
        this.boardSettings.next(settings);
      }
    });
  }

  toggleFullscreen() {
    this.boardSettings$.pipe(take(1)).subscribe(settings => {
      if (settings) {
        settings.fullscreen = !settings.fullscreen;
        this.boardSettings.next(settings);
      }
    });
  }
}

import { TranslateService } from './../../services/translate/translate.service';
import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BoardSettings } from '../../models/interfaces/boardSettiings';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game/game.service';
import { GameProgress } from '../../models/interfaces/game-progress';

@Component({
  selector: 'app-board-management',
  templateUrl: './board-management.component.html',
  styleUrl: './board-management.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BoardManagementComponent implements OnInit, OnDestroy {

  boardSettings!: BoardSettings;
  boardSettingsSubscription!: Subscription;

  gameProgress!: GameProgress;
  gameProgressSubscription!: Subscription;

  constructor(private gameService: GameService, private translateService: TranslateService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;
      }
    });
    this.gameProgressSubscription = this.gameService.gameProgress$.subscribe(gameProgress => {
      if (gameProgress) {
        this.gameProgress = gameProgress;
      }
    });
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
    this.gameProgressSubscription.unsubscribe();
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.gameProgress.progressBar.value != 100) {
      event.deltaY < 0 ? this.gameService.zoomIn() : this.gameService.zoomOut();
    }
  }

  zoomIn() {
    this.gameService.zoomIn();
  }

  zoomOut() {
    this.gameService.zoomOut();
  }

  toggleFullImage() {
    this.gameService.toggleFullImage();
  }

  togglePreview() {
    this.gameService.togglePreview();
  }

  toggleTimer() {
    this.gameService.toggleTimer();
  }

  toggleFullscreen() {
    this.gameService.toggleFullscreen();
    this.manageFullscreen();
  }

  manageFullscreen() {
    if (this.boardSettings.fullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  getTranslation(key: string): string {
    return this.translateService.getTranslate(key);
  }
}

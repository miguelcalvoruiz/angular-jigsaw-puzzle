import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { BoardSettings } from '../../models/interfaces/boardSettiings';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-board-management',
  templateUrl: './board-management.component.html',
  styleUrl: './board-management.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class BoardManagementComponent implements OnInit, OnDestroy {

  boardSettings!: BoardSettings;
  boardSettingsSubscription!: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;
      }
    });
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
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
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BoardSettings } from '../../models/boardSettiings';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-board-management',
  templateUrl: './board-management.component.html',
  styleUrl: './board-management.component.scss'
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

  togglePreview() {
    this.gameService.togglePreview();
  }

  toggleFullscreen() {
    this.gameService.toggleFullscreen();
  }
}

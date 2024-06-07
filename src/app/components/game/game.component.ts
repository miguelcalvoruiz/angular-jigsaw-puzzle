import { Component, OnInit } from '@angular/core';
import { GameSettings } from '../../models/gameSettings';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
  gameSettings!: GameSettings;

  constructor(private gameService: GameService, private router: Router) { }

  ngOnInit(): void {
    this.gameService.gameSettings$.pipe(take(1)).subscribe(gameSettings => {
      if (gameSettings) {
        this.gameSettings = gameSettings;
      } else {
        this.router.navigateByUrl('new-game');
      }
    });
  }
}

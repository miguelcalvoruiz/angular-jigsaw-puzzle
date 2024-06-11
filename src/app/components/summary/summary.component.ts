import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameProgress } from '../../models/interfaces/game-progress';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { fadeEnterAnimation } from '../../shared/animation';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-summary',
  animations: [fadeEnterAnimation],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit, OnDestroy {
  gameProgress!: GameProgress;
  gameProgressSubscription!: Subscription;

  faPuzzlePiece = faPuzzlePiece;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameProgressSubscription = this.gameService.gameProgress$.subscribe(progress => {
      if (progress) {
        this.gameProgress = progress;
      }
    });
  }

  ngOnDestroy(): void {
    this.gameProgressSubscription.unsubscribe();
  }

  zeroPad(number: number) {
    return number.toString().padStart(2, '0');
  }
}

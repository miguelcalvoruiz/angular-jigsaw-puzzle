import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameProgress } from '../../models/interfaces/game-progress';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game/game.service';
import { fadeEnterAnimation } from '../../shared/animation';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '../../services/translate/translate.service';

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

  tooltipPlayAgainText: string = '';

  constructor(private gameService: GameService, private translateService: TranslateService) { }

  ngOnInit(): void {
    this.gameProgressSubscription = this.gameService.gameProgress$.subscribe(progress => {
      if (progress) {
        this.gameProgress = progress;
      }
    });
    this.translateService.getData().then(() => {
      this.tooltipPlayAgainText = this.translateService.getTranslate('label.summary.tooltip.play.again');
    });
  }

  ngOnDestroy(): void {
    this.gameProgressSubscription.unsubscribe();
  }

  zeroPad(number: number) {
    return number.toString().padStart(2, '0');
  }
}

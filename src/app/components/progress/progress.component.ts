import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeEnterAnimation, fadeLeaveAnimation } from '../../shared/animation';
import { GameService } from '../../services/game.service';
import { Subscription } from 'rxjs';
import { ProgressBar } from '../../models/interfaces/progressBar';

@Component({
  selector: 'app-progress',
  animations: [fadeEnterAnimation, fadeLeaveAnimation],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss'
})
export class ProgressComponent implements OnInit, OnDestroy {
  progressBar!: ProgressBar;
  progressBarSubscription!: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.progressBarSubscription = this.gameService.gameProgress$.subscribe(progress => {
      if (progress) {
        this.progressBar = progress.progressBar;
      }
    });
  }

  ngOnDestroy(): void {
    this.progressBarSubscription.unsubscribe();
  }
}

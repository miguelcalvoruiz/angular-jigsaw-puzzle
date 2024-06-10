import { Component, OnDestroy, OnInit } from '@angular/core';
import { fadeEnterAnimation, fadeLeaveAnimation } from '../../shared/animation';
import { BoardSettings } from '../../models/interfaces/boardSettiings';
import { Subscription } from 'rxjs';
import { Stopwatch } from '../../models/interfaces/stopWatch';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-timer',
  animations: [fadeEnterAnimation, fadeLeaveAnimation],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss'
})
export class TimerComponent implements OnInit, OnDestroy {
  boardSettings!: BoardSettings;
  boardSettingsSubscription!: Subscription;

  stopwatch: Stopwatch = { seconds: 0, minutes: 0, hours: 0 };

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;
      }
    });

    this.startStopwatch();
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
  }

  startStopwatch() {
    setInterval(() => {
      this.stopwatch.seconds++;

      if (this.stopwatch.seconds == 60) {
        this.stopwatch.seconds = 0;
        this.stopwatch.minutes++;
      }

      if (this.stopwatch.minutes == 60) {
        this.stopwatch.minutes = 0;
        this.stopwatch.hours++;
      }
    }, 1000);
  }

  zeroPad(number: number) {
    return number.toString().padStart(2, '0');
  }
}
